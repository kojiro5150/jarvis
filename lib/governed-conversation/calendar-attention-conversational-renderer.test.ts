import { describe, expect, it } from "vitest";
import { renderCalendarAttentionBrief } from "./calendar-attention-conversational-renderer";
import type { CalendarAttentionBrief } from "./calendar-attention-brief-publisher";

const brief = (overrides: Partial<CalendarAttentionBrief> = {}): CalendarAttentionBrief => Object.freeze({
  kind: "calendar_attention_brief",
  semantics: "deterministic_policy_match_not_priority",
  previousObservedAt: "2026-08-28T00:00:00Z",
  currentObservedAt: "2026-08-28T01:00:00Z",
  items: Object.freeze([
    Object.freeze({
      matchId: "match-1",
      entityId: "google-calendar:calendar:primary:event:evt-1",
      changeType: "modified" as const,
      policy: Object.freeze({
        id: "attention.commitment.start-time-changed",
        version: "1.0.0",
      }),
      reason: Object.freeze({
        code: "commitment.start-time.changed",
        message: "The commitment start time changed.",
        evidence: Object.freeze([
          Object.freeze({ field: "commitment.id", value: "google-calendar:calendar:primary:event:evt-1" }),
          Object.freeze({ field: "previous.startsAt", value: "2026-08-29T10:00:00+10:00" }),
          Object.freeze({ field: "current.startsAt", value: "2026-08-29T11:00:00+10:00" }),
        ]),
      }),
    }),
  ]),
  ...overrides,
});

describe("Calendar attention conversational renderer", () => {
  it("renders one supported start-time policy match with a fixed deterministic template", () => {
    expect(renderCalendarAttentionBrief(brief())).toBe(
      "A Calendar commitment changed start time from 2026-08-29T10:00:00+10:00 to 2026-08-29T11:00:00+10:00.",
    );
  });

  it("renders zero matches without claiming that nothing needs attention or action", () => {
    const result = renderCalendarAttentionBrief(brief({ items: Object.freeze([]) }));
    expect(result).toBe("No supported Calendar attention changes matched this bounded check.");
    expect(result.toLowerCase()).not.toContain("nothing needs");
    expect(result.toLowerCase()).not.toContain("no action");
    expect(result.toLowerCase()).not.toContain("all clear");
  });

  it("renders multiple matches in deterministic brief order without ranking language", () => {
    const first = brief().items[0];
    const second = Object.freeze({
      ...first,
      matchId: "match-2",
      entityId: "google-calendar:calendar:primary:event:evt-2",
      reason: Object.freeze({
        ...first.reason,
        evidence: Object.freeze([
          Object.freeze({ field: "commitment.id", value: "google-calendar:calendar:primary:event:evt-2" }),
          Object.freeze({ field: "previous.startsAt", value: "2026-08-29T15:00:00+10:00" }),
          Object.freeze({ field: "current.startsAt", value: "2026-08-29T16:00:00+10:00" }),
        ]),
      }),
    });

    const result = renderCalendarAttentionBrief(brief({ items: Object.freeze([first, second]) }));
    expect(result).toBe([
      "2 Calendar attention changes matched this bounded check:",
      "- changed start time from 2026-08-29T10:00:00+10:00 to 2026-08-29T11:00:00+10:00.",
      "- changed start time from 2026-08-29T15:00:00+10:00 to 2026-08-29T16:00:00+10:00.",
    ].join("\n"));
    for (const forbidden of ["priority", "urgent", "severity", "recommend", "should", "action", "important"]) {
      expect(result.toLowerCase()).not.toContain(forbidden);
    }
  });

  it("does not disclose entity identifiers or policy metadata in rendered prose", () => {
    const result = renderCalendarAttentionBrief(brief());
    expect(result).not.toContain("google-calendar");
    expect(result).not.toContain("evt-1");
    expect(result).not.toContain("attention.commitment");
    expect(result).not.toContain("commitment.start-time.changed");
  });

  it("fails closed for unsupported policy or reason semantics", () => {
    const item = brief().items[0];
    expect(() => renderCalendarAttentionBrief(brief({
      items: Object.freeze([Object.freeze({
        ...item,
        policy: Object.freeze({ id: "attention.commitment.removed", version: "1.0.0" }),
      })]),
    }))).toThrow("unsupported Calendar attention brief policy");

    expect(() => renderCalendarAttentionBrief(brief({
      items: Object.freeze([Object.freeze({
        ...item,
        reason: Object.freeze({ ...item.reason, code: "some.other.reason" }),
      })]),
    }))).toThrow("unsupported Calendar attention brief reason");
  });

  it("fails closed when evidence identity disagrees with the brief entity identity", () => {
    const item = brief().items[0];
    expect(() => renderCalendarAttentionBrief(brief({
      items: Object.freeze([Object.freeze({
        ...item,
        entityId: "google-calendar:calendar:primary:event:different",
      })]),
    }))).toThrow("commitment identity mismatch");
  });

  it("fails closed for duplicate, missing or non-string required evidence", () => {
    const item = brief().items[0];

    expect(() => renderCalendarAttentionBrief(brief({
      items: Object.freeze([Object.freeze({
        ...item,
        reason: Object.freeze({
          ...item.reason,
          evidence: Object.freeze([
            ...item.reason.evidence,
            Object.freeze({ field: "previous.startsAt", value: "2026-08-29T09:00:00+10:00" }),
          ]),
        }),
      })]),
    }))).toThrow("requires exactly one previous.startsAt");

    expect(() => renderCalendarAttentionBrief(brief({
      items: Object.freeze([Object.freeze({
        ...item,
        reason: Object.freeze({
          ...item.reason,
          evidence: Object.freeze(item.reason.evidence.filter(entry => entry.field !== "current.startsAt")),
        }),
      })]),
    }))).toThrow("requires exactly one current.startsAt");

    expect(() => renderCalendarAttentionBrief(brief({
      items: Object.freeze([Object.freeze({
        ...item,
        reason: Object.freeze({
          ...item.reason,
          evidence: Object.freeze(item.reason.evidence.map(entry =>
            entry.field === "current.startsAt" ? Object.freeze({ ...entry, value: 11 }) : entry)),
        }),
      })]),
    }))).toThrow("must be a non-empty string");
  });

  it("fails closed when timestamps are invalid or unchanged", () => {
    const item = brief().items[0];
    const replaceCurrent = (value: string) => Object.freeze({
      ...item,
      reason: Object.freeze({
        ...item.reason,
        evidence: Object.freeze(item.reason.evidence.map(entry =>
          entry.field === "current.startsAt" ? Object.freeze({ ...entry, value }) : entry)),
      }),
    });

    expect(() => renderCalendarAttentionBrief(brief({
      items: Object.freeze([replaceCurrent("not-a-time")]),
    }))).toThrow("start timestamps must be valid");

    expect(() => renderCalendarAttentionBrief(brief({
      items: Object.freeze([replaceCurrent("2026-08-29T10:00:00+10:00")]),
    }))).toThrow("must contain different timestamps");
  });

  it("renders one removal match without inflating absence into cancellation or deletion", () => {
    const item = Object.freeze({
      matchId: "match-removal",
      entityId: "google-calendar:calendar:primary:event:evt-2",
      changeType: "removed" as const,
      policy: Object.freeze({
        id: "attention.commitment.removed",
        version: "1.0.0",
      }),
      reason: Object.freeze({
        code: "commitment.absent-from-current-snapshot",
        message: "The commitment was present in the previous snapshot and is absent from the current snapshot.",
        evidence: Object.freeze([
          Object.freeze({ field: "commitment.id", value: "google-calendar:calendar:primary:event:evt-2" }),
          Object.freeze({ field: "previous.startsAt", value: "2026-08-29T15:00:00+10:00" }),
        ]),
      }),
    });

    const result = renderCalendarAttentionBrief(brief({ items: Object.freeze([item]) }));
    expect(result).toBe(
      "A Calendar commitment previously scheduled for 2026-08-29T15:00:00+10:00 is no longer present in this bounded Calendar window.",
    );
    for (const forbidden of ["cancelled", "deleted", "completed", "declined", "resolved"]) {
      expect(result.toLowerCase()).not.toContain(forbidden);
    }
  });

  it("renders mixed start-time and removal matches deterministically without ranking language", () => {
    const start = brief().items[0];
    const removal = Object.freeze({
      matchId: "match-2",
      entityId: "google-calendar:calendar:primary:event:evt-2",
      changeType: "removed" as const,
      policy: Object.freeze({
        id: "attention.commitment.removed",
        version: "1.0.0",
      }),
      reason: Object.freeze({
        code: "commitment.absent-from-current-snapshot",
        message: "The commitment was present in the previous snapshot and is absent from the current snapshot.",
        evidence: Object.freeze([
          Object.freeze({ field: "commitment.id", value: "google-calendar:calendar:primary:event:evt-2" }),
          Object.freeze({ field: "previous.startsAt", value: "2026-08-29T15:00:00+10:00" }),
        ]),
      }),
    });

    const result = renderCalendarAttentionBrief(brief({ items: Object.freeze([start, removal]) }));
    expect(result).toBe([
      "2 Calendar attention changes matched this bounded check:",
      "- changed start time from 2026-08-29T10:00:00+10:00 to 2026-08-29T11:00:00+10:00.",
      "- previously scheduled for 2026-08-29T15:00:00+10:00 is no longer present in this bounded Calendar window.",
    ].join("\n"));
    for (const forbidden of ["priority", "urgent", "severity", "recommend", "should", "action", "important"]) {
      expect(result.toLowerCase()).not.toContain(forbidden);
    }
  });

  it("fails closed when removal evidence is missing, duplicated or invalid", () => {
    const makeRemoval = (evidence: readonly Readonly<{ field: string; value: string | number | boolean | null }>[]) => Object.freeze({
      matchId: "match-removal",
      entityId: "google-calendar:calendar:primary:event:evt-2",
      changeType: "removed" as const,
      policy: Object.freeze({
        id: "attention.commitment.removed",
        version: "1.0.0",
      }),
      reason: Object.freeze({
        code: "commitment.absent-from-current-snapshot",
        message: "The commitment was present in the previous snapshot and is absent from the current snapshot.",
        evidence: Object.freeze(evidence),
      }),
    });

    expect(() => renderCalendarAttentionBrief(brief({
      items: Object.freeze([makeRemoval([
        Object.freeze({ field: "commitment.id", value: "google-calendar:calendar:primary:event:evt-2" }),
      ])]),
    }))).toThrow("requires exactly one previous.startsAt");

    expect(() => renderCalendarAttentionBrief(brief({
      items: Object.freeze([makeRemoval([
        Object.freeze({ field: "commitment.id", value: "google-calendar:calendar:primary:event:evt-2" }),
        Object.freeze({ field: "previous.startsAt", value: "not-a-time" }),
      ])]),
    }))).toThrow("previous start timestamp must be valid");
  });

  it("uses no model or runtime-dependent prose source", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/governed-conversation/calendar-attention-conversational-renderer.ts", "utf8"));
    for (const forbidden of ["openai", "anthropic", "generateText", "chat-handler", "Date.now", "new Date("]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
