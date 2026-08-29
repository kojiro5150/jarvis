import { describe, expect, it } from "vitest";
import { sourceResult } from "../governed-conversation/source-adapter-result";
import type { GovernedCalendarEvidenceInput } from "../governed-conversation/projection-composer";
import {
  createCalendarAttentionObservationReference,
} from "./calendar-attention-observation-reference";
import { projectGovernedCalendarAttentionObservationSet } from "../governed-conversation/calendar-attention-observation";
import { resolveLiveCalendarAttention } from "./live-calendar-attention";
import type { CalendarReadWindow } from "./calendar-read-window";

const window: CalendarReadWindow = Object.freeze({
  start: "2026-08-27T14:00:00.000Z",
  end: "2026-08-28T14:00:00.000Z",
  timeZone: "Australia/Melbourne",
  period: "today",
});

const coverageLimit = "window=2026-08-27T14:00:00.000Z/2026-08-28T14:00:00.000Z;max_events=5;scope=visible_non_hidden_calendars;completeness=bounded";
const completeCoverageLimit = "window=2026-08-27T14:00:00.000Z/2026-08-28T14:00:00.000Z;max_events=5;scope=visible_non_hidden_calendars;completeness=bounded_complete_request";

const evidence = (
  observedAt: string,
  startsAt: string,
  id = "evt-1",
  itemCoverageLimit = coverageLimit,
): GovernedCalendarEvidenceInput => Object.freeze({
  commitmentReference: `google-calendar:calendar:primary:event:${id}`,
  sourceReference: Object.freeze({
    sourceId: "google-calendar",
    resourceId: `calendar:primary:event:${id}`,
    field: "schedule_interval",
    observedAt,
  }),
  start: startsAt,
  end: "2026-08-28T04:00:00.000Z",
  timezone: "Z",
  provenanceReference: `google-calendar:calendar:primary:event:${id}#provenance`,
  available: true,
  coverageLimit: itemCoverageLimit,
  policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
});

describe("live Calendar attention composition", () => {
  it("establishes a server-owned baseline when no previous observation reference exists", () => {
    const result = resolveLiveCalendarAttention({
      evidence: sourceResult("available", [evidence("2026-08-28T00:00:00.000Z", "2026-08-28T01:00:00.000Z")], {
        observedAt: "2026-08-28T00:00:00.000Z",
      }),
      window,
    });

    expect(result).toMatchObject({
      baselineEstablished: true,
      reply: "I have established a bounded Calendar baseline for today. A later authorised check can compare against it for supported attention changes.",
      calendarAttentionObservationReference: {
        calendarAttentionObservationReferenceId: expect.any(String),
      },
    });
  });

  it("compares a later authorised observation and renders a start-time change deterministically", () => {
    const previousSet = projectGovernedCalendarAttentionObservationSet({
      sourceId: "google-calendar",
      available: true,
      observedAt: "2026-08-28T00:00:00.000Z",
      windowStart: window.start,
      windowEnd: window.end,
      requestedLimit: 5,
      coverageState: "bounded",
      coverageLimit,
      policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
      evidence: [evidence("2026-08-28T00:00:00.000Z", "2026-08-28T01:00:00.000Z")],
    });
    const reference = createCalendarAttentionObservationReference(previousSet);

    const result = resolveLiveCalendarAttention({
      evidence: sourceResult("available", [evidence("2026-08-28T01:00:00.000Z", "2026-08-28T01:30:00.000Z")], {
        observedAt: "2026-08-28T01:00:00.000Z",
      }),
      window,
      previousObservationReference: reference,
    });

    expect(result.baselineEstablished).toBe(false);
    expect(result.reply).toBe(
      "A Calendar commitment changed start time from 2026-08-28T01:00:00.000Z to 2026-08-28T01:30:00.000Z.",
    );
    expect(result.calendarAttentionObservationReference.calendarAttentionObservationReferenceId)
      .not.toBe(reference.calendarAttentionObservationReferenceId);
  });

  it("renders a bounded removal after two complete authorised Calendar observations", () => {
    const previousSet = projectGovernedCalendarAttentionObservationSet({
      sourceId: "google-calendar",
      available: true,
      observedAt: "2026-08-28T00:00:00.000Z",
      windowStart: window.start,
      windowEnd: window.end,
      requestedLimit: 5,
      coverageState: "bounded_complete_request",
      coverageLimit: completeCoverageLimit,
      policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
      evidence: [evidence(
        "2026-08-28T00:00:00.000Z",
        "2026-08-28T01:00:00.000Z",
        "evt-1",
        completeCoverageLimit,
      )],
    });
    const reference = createCalendarAttentionObservationReference(previousSet);

    const result = resolveLiveCalendarAttention({
      evidence: Object.freeze({
        ...sourceResult("available", [], {
          observedAt: "2026-08-28T01:00:00.000Z",
        }),
        coverageState: "bounded_complete_request" as const,
      }),
      window,
      previousObservationReference: reference,
    });

    expect(result.baselineEstablished).toBe(false);
    expect(result.reply).toBe(
      "A Calendar commitment previously scheduled for 2026-08-28T01:00:00.000Z is no longer present in this bounded Calendar window.",
    );
    for (const forbidden of ["cancelled", "deleted", "completed", "declined", "resolved"]) {
      expect(result.reply.toLowerCase()).not.toContain(forbidden);
    }
  });

  it("renders mixed start-time and removal attention after complete authorised observations", () => {
    const previousSet = projectGovernedCalendarAttentionObservationSet({
      sourceId: "google-calendar",
      available: true,
      observedAt: "2026-08-28T00:00:00.000Z",
      windowStart: window.start,
      windowEnd: window.end,
      requestedLimit: 5,
      coverageState: "bounded_complete_request",
      coverageLimit: completeCoverageLimit,
      policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
      evidence: [
        evidence("2026-08-28T00:00:00.000Z", "2026-08-28T01:00:00.000Z", "evt-1", completeCoverageLimit),
        evidence("2026-08-28T00:00:00.000Z", "2026-08-28T03:00:00.000Z", "evt-2", completeCoverageLimit),
      ],
    });
    const reference = createCalendarAttentionObservationReference(previousSet);

    const result = resolveLiveCalendarAttention({
      evidence: Object.freeze({
        ...sourceResult("available", [
          evidence("2026-08-28T01:00:00.000Z", "2026-08-28T01:30:00.000Z", "evt-1", completeCoverageLimit),
        ], {
          observedAt: "2026-08-28T01:00:00.000Z",
        }),
        coverageState: "bounded_complete_request" as const,
      }),
      window,
      previousObservationReference: reference,
    });

    expect(result.reply).toBe([
      "2 Calendar attention changes matched this bounded check:",
      "- changed start time from 2026-08-28T01:00:00.000Z to 2026-08-28T01:30:00.000Z.",
      "- previously scheduled for 2026-08-28T03:00:00.000Z is no longer present in this bounded Calendar window.",
    ].join("\n"));
  });

  it("fails closed by rotating the baseline when membership coverage is no longer compatible", () => {
    const previousSet = projectGovernedCalendarAttentionObservationSet({
      sourceId: "google-calendar",
      available: true,
      observedAt: "2026-08-28T00:00:00.000Z",
      windowStart: window.start,
      windowEnd: window.end,
      requestedLimit: 5,
      coverageState: "bounded_complete_request",
      coverageLimit: completeCoverageLimit,
      policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
      evidence: [evidence(
        "2026-08-28T00:00:00.000Z",
        "2026-08-28T01:00:00.000Z",
        "evt-1",
        completeCoverageLimit,
      )],
    });
    const reference = createCalendarAttentionObservationReference(previousSet);

    const result = resolveLiveCalendarAttention({
      evidence: sourceResult("available", [], {
        observedAt: "2026-08-28T01:00:00.000Z",
      }),
      window,
      previousObservationReference: reference,
    });

    expect(result.baselineEstablished).toBe(true);
    expect(result.reply).toBe(
      "I have a current Calendar baseline, but the previous baseline covered a different bounded window, so I cannot compare them.",
    );
  });

  it("renders a bounded zero-match answer rather than inventing priority or action", () => {
    const previousSet = projectGovernedCalendarAttentionObservationSet({
      sourceId: "google-calendar",
      available: true,
      observedAt: "2026-08-28T00:00:00.000Z",
      windowStart: window.start,
      windowEnd: window.end,
      requestedLimit: 5,
      coverageState: "bounded",
      coverageLimit,
      policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
      evidence: [evidence("2026-08-28T00:00:00.000Z", "2026-08-28T01:00:00.000Z")],
    });
    const reference = createCalendarAttentionObservationReference(previousSet);

    const result = resolveLiveCalendarAttention({
      evidence: sourceResult("available", [evidence("2026-08-28T01:00:00.000Z", "2026-08-28T01:00:00.000Z")], {
        observedAt: "2026-08-28T01:00:00.000Z",
      }),
      window,
      previousObservationReference: reference,
    });

    expect(result.reply).toBe("No supported Calendar attention changes matched this bounded check.");
    expect(result.reply.toLowerCase()).not.toContain("priority");
    expect(result.reply.toLowerCase()).not.toContain("action");
  });

  it("rotates rather than compares when the previous bounded window is incompatible", () => {
    const previousWindow: CalendarReadWindow = Object.freeze({
      ...window,
      start: "2026-08-26T14:00:00.000Z",
      end: "2026-08-27T14:00:00.000Z",
    });
    const previousCoverage = "window=2026-08-26T14:00:00.000Z/2026-08-27T14:00:00.000Z;max_events=5;scope=visible_non_hidden_calendars;completeness=bounded";
    const previousSet = projectGovernedCalendarAttentionObservationSet({
      sourceId: "google-calendar",
      available: true,
      observedAt: "2026-08-27T00:00:00.000Z",
      windowStart: previousWindow.start,
      windowEnd: previousWindow.end,
      requestedLimit: 5,
      coverageState: "bounded",
      coverageLimit: previousCoverage,
      policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
      evidence: [],
    });
    const reference = createCalendarAttentionObservationReference(previousSet);

    const result = resolveLiveCalendarAttention({
      evidence: sourceResult("available", [], { observedAt: "2026-08-28T01:00:00.000Z" }),
      window,
      previousObservationReference: reference,
    });

    expect(result.baselineEstablished).toBe(true);
    expect(result.reply).toBe(
      "I have a current Calendar baseline, but the previous baseline covered a different bounded window, so I cannot compare them.",
    );
  });

  it("requires already-authorised available evidence and never acquires", () => {
    expect(() => resolveLiveCalendarAttention({
      evidence: sourceResult("unavailable", [], { observedAt: "2026-08-28T01:00:00.000Z" }),
      window,
    })).toThrow("available governed Calendar evidence");
  });
  it("renders the Golden Scenario Gate K pending-invitation conflict deterministically", () => {
    const previousSet = projectGovernedCalendarAttentionObservationSet({
      sourceId: "google-calendar",
      available: true,
      observedAt: "2026-08-28T00:00:00.000Z",
      windowStart: window.start,
      windowEnd: window.end,
      requestedLimit: 5,
      coverageState: "bounded_complete_request",
      coverageLimit: completeCoverageLimit,
      policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
      evidence: [
        Object.freeze({
          ...evidence(
            "2026-08-28T00:00:00.000Z",
            "2026-08-28T03:30:00.000Z",
            "deep",
            completeCoverageLimit,
          ),
          end: "2026-08-28T05:00:00.000Z",
        }),
      ],
    });
    const reference = createCalendarAttentionObservationReference(previousSet);
    const currentEvidence = [
      Object.freeze({
        ...evidence(
          "2026-08-28T01:00:00.000Z",
          "2026-08-28T03:30:00.000Z",
          "deep",
          completeCoverageLimit,
        ),
        end: "2026-08-28T05:00:00.000Z",
      }),
      Object.freeze({
        ...evidence(
          "2026-08-28T01:00:00.000Z",
          "2026-08-28T03:00:00.000Z",
          "invite",
          completeCoverageLimit,
        ),
        end: "2026-08-28T04:00:00.000Z",
      }),
    ];

    const result = resolveLiveCalendarAttention({
      evidence: Object.freeze({
        ...sourceResult("available", currentEvidence, {
          observedAt: "2026-08-28T01:00:00.000Z",
        }),
        coverageState: "bounded_complete_request" as const,
        conflictEvents: Object.freeze([
          Object.freeze({
            commitmentReference: "google-calendar:calendar:primary:event:invite",
            title: "Gate K Test Invite",
            start: "2026-08-28T03:00:00.000Z",
            end: "2026-08-28T04:00:00.000Z",
            calendarName: "Work",
            timeMode: null,
            selfAttendeeResponse: "needsAction" as const,
            observedAt: "2026-08-28T01:00:00.000Z",
            provenanceReference: "google-calendar:calendar:primary:event:invite#provenance",
          }),
          Object.freeze({
            commitmentReference: "google-calendar:calendar:primary:event:deep",
            title: "JARVIS Deep Work Test",
            start: "2026-08-28T03:30:00.000Z",
            end: "2026-08-28T05:00:00.000Z",
            calendarName: "Work",
            timeMode: "deep_work" as const,
            selfAttendeeResponse: null,
            observedAt: "2026-08-28T01:00:00.000Z",
            provenanceReference: "google-calendar:calendar:primary:event:deep#provenance",
          }),
        ]),
      }),
      window,
      previousObservationReference: reference,
    });

    expect(result).toMatchObject({
      reply: "A pending Calendar invitation from 1:00 PM–2:00 PM overlaps an existing deep-work block from 1:30 PM–3:00 PM by 30 minutes.",
      baselineEstablished: false,
      gateKStatus: "matched",
      calendarAttentionObservationReference: {
        calendarAttentionObservationReferenceId: expect.any(String),
      },
      calendarConflictReasoningReference: {
        calendarConflictReasoningReferenceId: expect.any(String),
      },
    });
    expect(JSON.stringify(result.calendarConflictReasoningReference)).not.toMatch(
      /Gate K Test Invite|JARVIS Deep Work Test|needsAction|deep_work|30/,
    );
  });

});
