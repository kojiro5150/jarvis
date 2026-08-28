import { describe, expect, it } from "vitest";
import { publishCalendarAttentionBrief } from "./calendar-attention-brief-publisher";
import type { CalendarAttentionPolicyMatch } from "./calendar-attention-policy-adapter";

const match = (overrides: Partial<CalendarAttentionPolicyMatch> = {}): CalendarAttentionPolicyMatch => Object.freeze({
  matchId: "calendar-attention:2026-08-28T01%3A00%3A00Z:google-calendar%3Acalendar%3Aprimary%3Aevent%3Aevt-1:attention.commitment.start-time-changed:1.0.0",
  entityId: "google-calendar:calendar:primary:event:evt-1",
  changeType: "modified",
  previousObservedAt: "2026-08-28T00:00:00Z",
  currentObservedAt: "2026-08-28T01:00:00Z",
  policy: Object.freeze({
    id: "attention.commitment.start-time-changed",
    version: "1.0.0",
  }),
  reason: Object.freeze({
    code: "commitment.start-time.changed",
    message: "The commitment start time changed.",
    evidence: Object.freeze([
      Object.freeze({ field: "commitment.id", value: "google-calendar:calendar:primary:event:evt-1" }),
      Object.freeze({ field: "previous.startsAt", value: "2026-08-29T00:00:00Z" }),
      Object.freeze({ field: "current.startsAt", value: "2026-08-29T01:00:00Z" }),
    ]),
  }),
  ...overrides,
});

describe("Calendar attention brief publisher", () => {
  it("publishes only deterministic policy-match facts", () => {
    const brief = publishCalendarAttentionBrief({
      previousObservedAt: "2026-08-28T00:00:00Z",
      currentObservedAt: "2026-08-28T01:00:00Z",
      matches: [match()],
    });

    expect(brief).toEqual({
      kind: "calendar_attention_brief",
      semantics: "deterministic_policy_match_not_priority",
      previousObservedAt: "2026-08-28T00:00:00Z",
      currentObservedAt: "2026-08-28T01:00:00Z",
      items: [{
        matchId: expect.any(String),
        entityId: "google-calendar:calendar:primary:event:evt-1",
        changeType: "modified",
        policy: {
          id: "attention.commitment.start-time-changed",
          version: "1.0.0",
        },
        reason: {
          code: "commitment.start-time.changed",
          message: "The commitment start time changed.",
          evidence: [
            { field: "commitment.id", value: "google-calendar:calendar:primary:event:evt-1" },
            { field: "previous.startsAt", value: "2026-08-29T00:00:00Z" },
            { field: "current.startsAt", value: "2026-08-29T01:00:00Z" },
          ],
        },
      }],
    });

    expect(Object.isFrozen(brief)).toBe(true);
    expect(Object.isFrozen(brief.items)).toBe(true);
    expect(Object.isFrozen(brief.items[0])).toBe(true);
    expect(Object.isFrozen(brief.items[0].policy)).toBe(true);
    expect(Object.isFrozen(brief.items[0].reason)).toBe(true);
    expect(Object.isFrozen(brief.items[0].reason.evidence)).toBe(true);
  });

  it("does not publish priority, urgency, severity, cause, recommendation, ranking or action semantics", () => {
    const serialized = JSON.stringify(publishCalendarAttentionBrief({
      previousObservedAt: "2026-08-28T00:00:00Z",
      currentObservedAt: "2026-08-28T01:00:00Z",
      matches: [match()],
    }));

    for (const forbidden of [
      '"priority"',
      '"urgency"',
      '"severity"',
      '"cause"',
      '"recommendation"',
      '"ranking"',
      '"rank"',
      '"action"',
    ]) expect(serialized).not.toContain(forbidden);
  });

  it("represents zero policy matches without inventing attention items", () => {
    expect(publishCalendarAttentionBrief({
      previousObservedAt: "2026-08-28T00:00:00Z",
      currentObservedAt: "2026-08-28T01:00:00Z",
      matches: [],
    })).toEqual({
      kind: "calendar_attention_brief",
      semantics: "deterministic_policy_match_not_priority",
      previousObservedAt: "2026-08-28T00:00:00Z",
      currentObservedAt: "2026-08-28T01:00:00Z",
      items: [],
    });
  });

  it("fails closed when a match belongs to a different observation window", () => {
    expect(() => publishCalendarAttentionBrief({
      previousObservedAt: "2026-08-28T00:00:00Z",
      currentObservedAt: "2026-08-28T02:00:00Z",
      matches: [match()],
    })).toThrow("observation window does not match publication input");
  });

  it("fails closed for duplicate match identity", () => {
    expect(() => publishCalendarAttentionBrief({
      previousObservedAt: "2026-08-28T00:00:00Z",
      currentObservedAt: "2026-08-28T01:00:00Z",
      matches: [match(), match()],
    })).toThrow("duplicate Calendar attention match id");
  });

  it("orders replay-equivalent items deterministically by match identity", () => {
    const later = match({
      matchId: "z",
      entityId: "google-calendar:calendar:primary:event:z",
    });
    const earlier = match({
      matchId: "a",
      entityId: "google-calendar:calendar:primary:event:a",
    });

    const first = publishCalendarAttentionBrief({
      previousObservedAt: "2026-08-28T00:00:00Z",
      currentObservedAt: "2026-08-28T01:00:00Z",
      matches: [later, earlier],
    });
    const second = publishCalendarAttentionBrief({
      previousObservedAt: "2026-08-28T00:00:00Z",
      currentObservedAt: "2026-08-28T01:00:00Z",
      matches: [earlier, later],
    });

    expect(first).toEqual(second);
    expect(first.items.map(item => item.matchId)).toEqual(["a", "z"]);
  });

  it("rejects reversed publication observation time", () => {
    expect(() => publishCalendarAttentionBrief({
      previousObservedAt: "2026-08-28T02:00:00Z",
      currentObservedAt: "2026-08-28T01:00:00Z",
      matches: [],
    })).toThrow("must not precede");
  });
});
