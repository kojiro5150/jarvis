import { describe, expect, it } from "vitest";
import { commitmentStartTimeChangePolicy } from "../executive-operating-system/attention/policies";
import type { CanonicalAttentionChange } from "../executive-operating-system/attention/types";
import {
  CALENDAR_START_TIME_ATTENTION_POLICY,
  selectCalendarStartTimeAttention,
} from "./calendar-attention-policy-adapter";
import type { CalendarAttentionObservationChangeSet } from "./calendar-attention-observation-comparison";
import type { CanonicalCalendarAttentionObservation } from "./calendar-attention-observation";

const observation = (id: string, startsAt: string, endsAt: string): CanonicalCalendarAttentionObservation => Object.freeze({
  id,
  startsAt,
  endsAt,
  observedAt: "2026-08-28T00:00:00Z",
  timezone: "Z",
  sourceReference: Object.freeze({
    sourceId: "google-calendar",
    resourceId: id.replace("google-calendar:", ""),
    field: "schedule_interval",
    observedAt: "2026-08-28T00:00:00Z",
  }),
  provenanceReference: `${id}#provenance`,
  coverageLimit: "window=2026-08-29T00:00:00Z/2026-08-30T00:00:00Z;max_events=50;scope=visible_non_hidden_calendars;completeness=bounded",
  policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
});

const set = (changes: CalendarAttentionObservationChangeSet["changes"]): CalendarAttentionObservationChangeSet => Object.freeze({
  previousObservedAt: "2026-08-28T00:00:00Z",
  currentObservedAt: "2026-08-28T01:00:00Z",
  coverageLimit: "window=2026-08-29T00:00:00Z/2026-08-30T00:00:00Z;max_events=50;scope=visible_non_hidden_calendars;completeness=bounded",
  policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
  changes: Object.freeze(changes),
});

describe("Calendar attention policy adapter", () => {
  it("selects a same-id start-time change using the existing policy identity and reason semantics", () => {
    const id = "google-calendar:calendar:primary:event:evt-1";
    const previous = observation(id, "2026-08-29T00:00:00Z", "2026-08-29T01:00:00Z");
    const current = observation(id, "2026-08-29T01:00:00Z", "2026-08-29T02:00:00Z");

    const matches = selectCalendarStartTimeAttention(set([
      Object.freeze({ type: "modified", id, previous, current }),
    ]));

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      entityId: id,
      changeType: "modified",
      policy: {
        id: "attention.commitment.start-time-changed",
        version: "1.0.0",
      },
      reason: {
        code: "commitment.start-time.changed",
        message: "The commitment start time changed.",
        evidence: [
          { field: "commitment.id", value: id },
          { field: "previous.startsAt", value: "2026-08-29T00:00:00Z" },
          { field: "current.startsAt", value: "2026-08-29T01:00:00Z" },
        ],
      },
    });
    expect(Object.isFrozen(matches)).toBe(true);
    expect(Object.isFrozen(matches[0])).toBe(true);
    expect(Object.isFrozen(matches[0].reason)).toBe(true);
    expect(Object.isFrozen(matches[0].reason.evidence)).toBe(true);
  });

  it("stays in parity with the existing EOS start-time policy contract", () => {
    expect(CALENDAR_START_TIME_ATTENTION_POLICY.id).toBe(commitmentStartTimeChangePolicy.id);
    expect(CALENDAR_START_TIME_ATTENTION_POLICY.version).toBe(commitmentStartTimeChangePolicy.version);

    const id = "google-calendar:calendar:primary:event:evt-1";
    const canonical = {
      domain: "commitments",
      changeType: "modified",
      entityId: id,
      previousSnapshotId: "previous",
      currentSnapshotId: "current",
      previous: {
        id,
        title: "Not disclosed to governed adapter",
        kind: "meeting",
        status: "scheduled",
        roleIds: [],
        projectIds: [],
        startsAt: "2026-08-29T00:00:00Z",
        dueAt: "2026-08-29T01:00:00Z",
      },
      current: {
        id,
        title: "Not disclosed to governed adapter",
        kind: "meeting",
        status: "scheduled",
        roleIds: [],
        projectIds: [],
        startsAt: "2026-08-29T01:00:00Z",
        dueAt: "2026-08-29T02:00:00Z",
      },
    } satisfies CanonicalAttentionChange;

    const result = commitmentStartTimeChangePolicy.evaluate(canonical, {
      previousSnapshotId: "previous",
      currentSnapshotId: "current",
    });

    expect(result.matched).toBe(true);
    if (result.matched) {
      expect(result.reason.code).toBe(CALENDAR_START_TIME_ATTENTION_POLICY.reasonCode);
      expect(result.reason.message).toBe(CALENDAR_START_TIME_ATTENTION_POLICY.reasonMessage);
      expect(result.reason.evidence).toEqual([
        { field: "commitment.id", value: id },
        { field: "previous.startsAt", value: "2026-08-29T00:00:00Z" },
        { field: "current.startsAt", value: "2026-08-29T01:00:00Z" },
      ]);
    }
  });

  it("does not elevate end-time-only or timezone-only modifications", () => {
    const id = "google-calendar:calendar:primary:event:evt-1";
    const previous = observation(id, "2026-08-29T00:00:00Z", "2026-08-29T01:00:00Z");
    const endChanged = observation(id, "2026-08-29T00:00:00Z", "2026-08-29T02:00:00Z");
    const timezoneChanged = Object.freeze({ ...previous, timezone: "+10:00" });

    expect(selectCalendarStartTimeAttention(set([
      Object.freeze({ type: "modified", id, previous, current: endChanged }),
      Object.freeze({ type: "modified", id, previous, current: timezoneChanged }),
    ]))).toEqual([]);
  });

  it("does not elevate added or removed changes because those policy semantics have not earned this adapter yet", () => {
    const id = "google-calendar:calendar:primary:event:evt-1";
    const value = observation(id, "2026-08-29T00:00:00Z", "2026-08-29T01:00:00Z");

    expect(selectCalendarStartTimeAttention(set([
      Object.freeze({ type: "added", id, current: value }),
      Object.freeze({ type: "removed", id, previous: value }),
    ]))).toEqual([]);
  });

  it("orders matches deterministically by governed entity identity", () => {
    const make = (id: string) => Object.freeze({
      type: "modified" as const,
      id,
      previous: observation(id, "2026-08-29T00:00:00Z", "2026-08-29T01:00:00Z"),
      current: observation(id, "2026-08-29T01:00:00Z", "2026-08-29T02:00:00Z"),
    });

    expect(selectCalendarStartTimeAttention(set([
      make("google-calendar:calendar:primary:event:z"),
      make("google-calendar:calendar:primary:event:a"),
    ])).map(match => match.entityId)).toEqual([
      "google-calendar:calendar:primary:event:a",
      "google-calendar:calendar:primary:event:z",
    ]);
  });
});
