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

const evidence = (observedAt: string, startsAt: string): GovernedCalendarEvidenceInput => Object.freeze({
  commitmentReference: "google-calendar:calendar:primary:event:evt-1",
  sourceReference: Object.freeze({
    sourceId: "google-calendar",
    resourceId: "calendar:primary:event:evt-1",
    field: "schedule_interval",
    observedAt,
  }),
  start: startsAt,
  end: "2026-08-28T02:00:00.000Z",
  timezone: "Z",
  provenanceReference: "google-calendar:calendar:primary:event:evt-1#provenance",
  available: true,
  coverageLimit,
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
      reply: "I have established a bounded Calendar baseline for today. A later authorised check can compare against it for start-time changes.",
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

    expect(result.reply).toBe("No Calendar start-time changes matched this bounded check.");
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
});
