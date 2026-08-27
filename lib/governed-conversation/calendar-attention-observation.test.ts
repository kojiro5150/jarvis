import { describe, expect, it } from "vitest";
import type { GovernedCalendarEvidenceInput } from "./projection-composer";
import { projectGovernedCalendarAttentionObservations } from "./calendar-attention-observation";

const evidence = (overrides: Partial<GovernedCalendarEvidenceInput> = {}): GovernedCalendarEvidenceInput => ({
  commitmentReference: "google-calendar:calendar:primary:event:event-1",
  sourceReference: {
    sourceId: "google-calendar",
    resourceId: "calendar:primary:event:event-1",
    field: "schedule_interval",
    observedAt: "2026-08-28T00:00:00Z",
  },
  start: "2026-08-29T00:00:00Z",
  end: "2026-08-29T01:00:00Z",
  timezone: "Z",
  provenanceReference: "google-calendar:calendar:primary:event:event-1#provenance",
  available: true,
  coverageLimit: "window=2026-08-29T00:00:00Z/2026-08-30T00:00:00Z;max_events=50;scope=visible_non_hidden_calendars;completeness=bounded_complete_request",
  policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
  ...overrides,
});

describe("governed Calendar attention observation boundary", () => {
  it("projects only already-governed schedule evidence into a minimal immutable observation", () => {
    const result = projectGovernedCalendarAttentionObservations([evidence()]);

    expect(result).toEqual([{
      id: "google-calendar:calendar:primary:event:event-1",
      startsAt: "2026-08-29T00:00:00Z",
      endsAt: "2026-08-29T01:00:00Z",
      observedAt: "2026-08-28T00:00:00Z",
      timezone: "Z",
      sourceReference: {
        sourceId: "google-calendar",
        resourceId: "calendar:primary:event:event-1",
        field: "schedule_interval",
        observedAt: "2026-08-28T00:00:00Z",
      },
      provenanceReference: "google-calendar:calendar:primary:event:event-1#provenance",
      coverageLimit: expect.stringContaining("window="),
      policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
    }]);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[0])).toBe(true);
    expect(Object.isFrozen(result[0].sourceReference)).toBe(true);
    expect(result[0]).not.toHaveProperty("title");
    expect(result[0]).not.toHaveProperty("status");
    expect(result[0]).not.toHaveProperty("roleIds");
    expect(result[0]).not.toHaveProperty("projectIds");
  });

  it("uses governed commitment identity directly and orders deterministically", () => {
    const second = evidence({
      commitmentReference: "google-calendar:calendar:primary:event:event-2",
      sourceReference: {
        sourceId: "google-calendar",
        resourceId: "calendar:primary:event:event-2",
        field: "schedule_interval",
        observedAt: "2026-08-28T00:00:00Z",
      },
      provenanceReference: "google-calendar:calendar:primary:event:event-2#provenance",
    });

    expect(projectGovernedCalendarAttentionObservations([second, evidence()]).map(item => item.id)).toEqual([
      "google-calendar:calendar:primary:event:event-1",
      "google-calendar:calendar:primary:event:event-2",
    ]);
  });

  it("rejects duplicate governed identity instead of coalescing observations", () => {
    expect(() => projectGovernedCalendarAttentionObservations([evidence(), evidence()]))
      .toThrow("duplicate governed Calendar commitment reference");
  });

  it("rejects unavailable evidence rather than manufacturing an observation", () => {
    expect(() => projectGovernedCalendarAttentionObservations([evidence({ available: false })]))
      .toThrow("must be available");
  });

  it("rejects malformed or reversed schedule intervals", () => {
    expect(() => projectGovernedCalendarAttentionObservations([evidence({ start: "not-a-time" })]))
      .toThrow("must be an RFC 3339 timestamp");
    expect(() => projectGovernedCalendarAttentionObservations([evidence({
      start: "2026-08-29T02:00:00Z",
      end: "2026-08-29T01:00:00Z",
    })])).toThrow("end must not precede start");
  });
});
