import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../connectors/calendar-event";
import { publishCalendarEvidence, CALENDAR_CONVERSATIONAL_DISCLOSURE_POLICY } from "./calendar-evidence-publisher";
import { projectGovernedCalendarAttentionObservationSet } from "./calendar-attention-observation";
import { compareCalendarAttentionObservationSets } from "./calendar-attention-observation-comparison";
import { publishCalendarConflictEvent } from "./calendar-conflict-observation";
import { bindGoldenScenarioCalendarConflictGateK } from "./golden-scenario-calendar-conflict-gate-k";

const windowStart = "2026-09-01T00:00:00.000Z";
const windowEnd = "2026-09-02T00:00:00.000Z";
const previousObservedAt = "2026-08-29T05:00:00.000Z";
const currentObservedAt = "2026-08-29T05:30:00.000Z";
const requestedLimit = 100;
const coverageState = "bounded_complete_request" as const;
const coverageLimit = `window=${windowStart}/${windowEnd};max_events=${requestedLimit};scope=visible_non_hidden_calendars;completeness=${coverageState}`;

function event(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "deep",
    title: "JARVIS deep work",
    start: "2026-09-01T13:30:00+10:00",
    end: "2026-09-01T15:00:00+10:00",
    day: "TUE",
    time: "13:30",
    source: "google",
    calendarId: "primary",
    calendarName: "Work",
    ...overrides,
  };
}

function observationSet(events: readonly CalendarEvent[], observedAt: string, state = coverageState) {
  const evidence = publishCalendarEvidence({
    sourceId: "google-calendar",
    availability: "available",
    retrievedAt: observedAt,
    windowStart,
    windowEnd,
    requestedLimit,
    coverageState: state,
    events,
  });
  return projectGovernedCalendarAttentionObservationSet({
    sourceId: "google-calendar",
    available: true,
    observedAt,
    windowStart,
    windowEnd,
    requestedLimit,
    coverageState: state,
    coverageLimit: `window=${windowStart}/${windowEnd};max_events=${requestedLimit};scope=visible_non_hidden_calendars;completeness=${state}`,
    policyReference: CALENDAR_CONVERSATIONAL_DISCLOSURE_POLICY,
    evidence,
  });
}

function conflictEvents(events: readonly CalendarEvent[]) {
  return events.map(value => publishCalendarConflictEvent(value, currentObservedAt))
    .filter((value): value is NonNullable<typeof value> => value !== null);
}

function goldenChangeSet(input?: {
  previous?: readonly CalendarEvent[];
  current?: readonly CalendarEvent[];
}) {
  const deep = event({ id: "deep", timeMode: "deep_work" });
  const invite = event({
    id: "invite",
    title: "Planning invitation",
    start: "2026-09-01T13:00:00+10:00",
    end: "2026-09-01T14:00:00+10:00",
    timeMode: undefined,
    selfAttendeeResponse: "needsAction",
  });
  const previous = input?.previous ?? [deep];
  const current = input?.current ?? [invite, deep];
  return {
    previous,
    current,
    changes: compareCalendarAttentionObservationSets(
      observationSet(previous, previousObservedAt),
      observationSet(current, currentObservedAt),
    ),
  };
}

describe("Golden Scenario 001 Gate K binding", () => {
  it("proves the exact new pending-invitation + deep-work + 30-minute overlap case", () => {
    const fixture = goldenChangeSet();
    const result = bindGoldenScenarioCalendarConflictGateK({
      changes: fixture.changes,
      currentEvents: conflictEvents(fixture.current),
    });

    expect(result.status).toBe("matched");
    if (result.status !== "matched") throw new Error("expected Gate K match");

    expect(result.observations).toHaveLength(1);
    expect(result.observations[0]).toMatchObject({
      observedAt: currentObservedAt,
      addedPendingInvitation: {
        commitmentReference: "google-calendar:calendar:primary:event:invite",
        selfAttendeeResponse: "needsAction",
        provenanceReference: "google-calendar:calendar:primary:event:invite#provenance",
      },
      existingDeepWorkCommitment: {
        commitmentReference: "google-calendar:calendar:primary:event:deep",
        timeMode: "deep_work",
        provenanceReference: "google-calendar:calendar:primary:event:deep#provenance",
      },
      overlapStart: "2026-09-01T03:30:00.000Z",
      overlapEnd: "2026-09-01T04:00:00.000Z",
      overlapMinutes: 30,
    });

    expect(fixture.changes.changes).toEqual([
      expect.objectContaining({
        type: "added",
        id: "google-calendar:calendar:primary:event:invite",
      }),
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.observations)).toBe(true);
    expect(Object.isFrozen(result.observations[0])).toBe(true);
  });

  it("joins only by canonical commitmentReference, not raw provider id or title", () => {
    const fixture = goldenChangeSet();
    const projected = conflictEvents(fixture.current);
    const invite = projected.find(value => value.commitmentReference.endsWith(":invite"))!;

    const mismatched = projected.map(value =>
      value === invite
        ? Object.freeze({ ...value, commitmentReference: "google-calendar:calendar:other:event:invite" })
        : value);

    expect(bindGoldenScenarioCalendarConflictGateK({
      changes: fixture.changes,
      currentEvents: mismatched,
    })).toEqual({ status: "invalid", observations: [] });
  });

  it("relies on the existing complete-membership comparator before any 'new' claim can exist", () => {
    const deep = event({ id: "deep", timeMode: "deep_work" });
    const invite = event({
      id: "invite",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
      selfAttendeeResponse: "needsAction",
    });

    expect(() => compareCalendarAttentionObservationSets(
      observationSet([deep], previousObservedAt, "bounded_partial_request"),
      observationSet([deep, invite], currentObservedAt, "bounded_partial_request"),
    )).toThrow("Calendar attention observation membership comparison requires bounded_complete_request coverage");
  });

  it.each([
    ["accepted", "accepted"],
    ["tentative", "tentative"],
    ["declined", "declined"],
    ["absent", undefined],
  ] as const)("does not classify an added %s attendee response as a pending invitation", (_label, response) => {
    const deep = event({ id: "deep", timeMode: "deep_work" });
    const invite = event({
      id: "invite",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
      selfAttendeeResponse: response,
    });
    const fixture = goldenChangeSet({ previous: [deep], current: [invite, deep] });

    expect(bindGoldenScenarioCalendarConflictGateK({
      changes: fixture.changes,
      currentEvents: conflictEvents(fixture.current),
    })).toEqual({ status: "not_found", observations: [] });
  });

  it("does not infer pending-invitation or deep-work semantics from an adversarial title", () => {
    const existing = event({
      id: "deep",
      title: "URGENT JARVIS Deep Work Protected Priority Block",
      timeMode: undefined,
    });
    const invite = event({
      id: "invite",
      title: "URGENT JARVIS Deep Work Invitation",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
      timeMode: undefined,
      selfAttendeeResponse: undefined,
    });
    const fixture = goldenChangeSet({ previous: [existing], current: [invite, existing] });

    expect(bindGoldenScenarioCalendarConflictGateK({
      changes: fixture.changes,
      currentEvents: conflictEvents(fixture.current),
    })).toEqual({ status: "not_found", observations: [] });
  });

  it("requires governed deep_work mode even when an existing title says Deep Work", () => {
    const existing = event({ id: "deep", title: "Deep Work", timeMode: undefined });
    const invite = event({
      id: "invite",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
      selfAttendeeResponse: "needsAction",
    });
    const fixture = goldenChangeSet({ previous: [existing], current: [invite, existing] });

    expect(bindGoldenScenarioCalendarConflictGateK({
      changes: fixture.changes,
      currentEvents: conflictEvents(fixture.current),
    })).toEqual({ status: "not_found", observations: [] });
  });

  it("returns every overlapping existing deep-work conflict in the frozen total order", () => {
    const deepLater = event({
      id: "deep-z-later",
      title: "Later",
      start: "2026-09-01T13:45:00+10:00",
      end: "2026-09-01T14:30:00+10:00",
      timeMode: "deep_work",
    });
    const deepB = event({
      id: "deep-b",
      title: "Same start B",
      start: "2026-09-01T13:30:00+10:00",
      end: "2026-09-01T14:30:00+10:00",
      timeMode: "deep_work",
    });
    const deepA = event({
      id: "deep-a",
      title: "Same start A",
      start: "2026-09-01T13:30:00+10:00",
      end: "2026-09-01T14:15:00+10:00",
      timeMode: "deep_work",
    });
    const invite = event({
      id: "invite",
      title: "Invite",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
      selfAttendeeResponse: "needsAction",
    });

    const previous = [deepLater, deepB, deepA];
    const current = [deepLater, invite, deepB, deepA];
    const fixture = goldenChangeSet({ previous, current });

    const result = bindGoldenScenarioCalendarConflictGateK({
      changes: fixture.changes,
      currentEvents: conflictEvents(current),
    });
    expect(result.status).toBe("matched");
    if (result.status !== "matched") throw new Error("expected Gate K match");

    expect(result.observations.map(value => value.existingDeepWorkCommitment.commitmentReference)).toEqual([
      "google-calendar:calendar:primary:event:deep-a",
      "google-calendar:calendar:primary:event:deep-b",
      "google-calendar:calendar:primary:event:deep-z-later",
    ]);
  });

  it("does not use a newly-added deep-work event as the 'existing' counterpart", () => {
    const invite = event({
      id: "invite",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
      selfAttendeeResponse: "needsAction",
    });
    const alsoAddedDeep = event({
      id: "new-deep",
      start: "2026-09-01T13:30:00+10:00",
      end: "2026-09-01T14:30:00+10:00",
      timeMode: "deep_work",
    });
    const fixture = goldenChangeSet({ previous: [], current: [alsoAddedDeep, invite] });

    expect(bindGoldenScenarioCalendarConflictGateK({
      changes: fixture.changes,
      currentEvents: conflictEvents(fixture.current),
    })).toEqual({ status: "not_found", observations: [] });
  });

  it("fails closed when more than one added needsAction invitation exists", () => {
    const deep = event({ id: "deep", timeMode: "deep_work" });
    const inviteA = event({
      id: "invite-a",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
      selfAttendeeResponse: "needsAction",
    });
    const inviteB = event({
      id: "invite-b",
      start: "2026-09-01T13:05:00+10:00",
      end: "2026-09-01T14:05:00+10:00",
      selfAttendeeResponse: "needsAction",
    });
    const fixture = goldenChangeSet({ previous: [deep], current: [inviteB, deep, inviteA] });

    expect(bindGoldenScenarioCalendarConflictGateK({
      changes: fixture.changes,
      currentEvents: conflictEvents(fixture.current),
    })).toEqual({ status: "ambiguous_pending_invitation", observations: [] });
  });

  it("preserves the existing overlap boundary: touching and non-overlap are not conflicts", () => {
    const deep = event({
      id: "deep",
      start: "2026-09-01T14:00:00+10:00",
      end: "2026-09-01T15:00:00+10:00",
      timeMode: "deep_work",
    });
    const invite = event({
      id: "invite",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
      selfAttendeeResponse: "needsAction",
    });
    const fixture = goldenChangeSet({ previous: [deep], current: [invite, deep] });

    expect(bindGoldenScenarioCalendarConflictGateK({
      changes: fixture.changes,
      currentEvents: conflictEvents(fixture.current),
    })).toEqual({ status: "not_found", observations: [] });
  });

  it("contains no model, connector, authority, ranking or recommendation dependency", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/governed-conversation/golden-scenario-calendar-conflict-gate-k.ts", "utf8"));

    for (const forbidden of [
      "callClaude",
      "createConnector",
      "PendingAuthorization",
      "pendingAuthorizationReference",
      "priority:",
      "urgency:",
      "importance:",
      "protected:",
      "recommendation:",
    ]) expect(source).not.toContain(forbidden);
  });
});
