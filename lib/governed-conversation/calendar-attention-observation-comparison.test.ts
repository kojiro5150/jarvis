import { describe, expect, it } from "vitest";
import { publishCalendarEvidence, type GovernedCalendarPublicationInput, CALENDAR_CONVERSATIONAL_DISCLOSURE_POLICY } from "./calendar-evidence-publisher";
import { projectGovernedCalendarAttentionObservationSet } from "./calendar-attention-observation";
import { compareCalendarAttentionObservationSets } from "./calendar-attention-observation-comparison";
import type { CalendarEvent } from "../connectors/calendar-event";

const event = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: "evt-1", title: "Hidden", start: "2026-08-29T00:00:00Z", end: "2026-08-29T01:00:00Z",
  day: "SAT", time: "10:00", source: "google", calendarId: "primary", calendarName: "Primary",
  selfAttendeeResponse: "accepted", ...overrides,
});
const bundle = (events: readonly CalendarEvent[], overrides: Partial<GovernedCalendarPublicationInput> = {}): GovernedCalendarPublicationInput => ({
  sourceId: "google-calendar", availability: "available", retrievedAt: "2026-08-28T00:00:00Z",
  windowStart: "2026-08-29T00:00:00Z", windowEnd: "2026-08-30T00:00:00Z",
  requestedLimit: 50, coverageState: "bounded", events, ...overrides,
});
const set = (events: readonly CalendarEvent[], overrides: Partial<GovernedCalendarPublicationInput> = {}) => {
  const input = bundle(events, overrides);
  const evidence = publishCalendarEvidence(input);
  const coverageLimit = `window=${input.windowStart}/${input.windowEnd};max_events=${input.requestedLimit};scope=visible_non_hidden_calendars;completeness=${input.coverageState}`;
  return projectGovernedCalendarAttentionObservationSet({
    sourceId: "google-calendar",
    available: true,
    observedAt: input.retrievedAt,
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    requestedLimit: input.requestedLimit,
    coverageState: input.coverageState,
    coverageLimit,
    policyReference: CALENDAR_CONVERSATIONAL_DISCLOSURE_POLICY,
    evidence,
  });
};

describe("Calendar attention observation comparison", () => {
  it("detects a start-time change for the same stable governed identity", () => {
    const previous = set([event()]);
    const current = set([event({ start: "2026-08-29T01:00:00Z", end: "2026-08-29T02:00:00Z" })], { retrievedAt: "2026-08-28T01:00:00Z" });
    expect(compareCalendarAttentionObservationSets(previous, current).changes).toEqual([
      expect.objectContaining({ type: "modified", id: "google-calendar:calendar:primary:event:evt-1" }),
    ]);
  });

  it("does not treat observation time alone as a schedule change", () => {
    const previous = set([event()]);
    const current = set([event()], { retrievedAt: "2026-08-28T01:00:00Z" });
    expect(compareCalendarAttentionObservationSets(previous, current).changes).toEqual([]);
  });

  it("rejects different coverage windows or disclosure policies", () => {
    const previous = set([event()]);
    const changedWindow = set([event()], { retrievedAt: "2026-08-28T01:00:00Z", windowEnd: "2026-08-31T00:00:00Z" });
    expect(() => compareCalendarAttentionObservationSets(previous, changedWindow)).toThrow("incompatible coverage");
  });

  it("rejects reversed observation order", () => {
    const previous = set([event()], { retrievedAt: "2026-08-28T01:00:00Z" });
    const current = set([event()], { retrievedAt: "2026-08-28T00:00:00Z" });
    expect(() => compareCalendarAttentionObservationSets(previous, current)).toThrow("must not precede");
  });

  it("fails closed on membership changes when coverage is not complete", () => {
    const previous = set([event()]);
    const current = set([], { retrievedAt: "2026-08-28T01:00:00Z" });
    expect(() => compareCalendarAttentionObservationSets(previous, current))
      .toThrow("membership comparison requires bounded_complete_request coverage");
  });

  it("permits bounded membership changes only under complete coverage", () => {
    const previous = set([event()], { coverageState: "bounded_complete_request" });
    const current = set([], { retrievedAt: "2026-08-28T01:00:00Z", coverageState: "bounded_complete_request" });
    expect(compareCalendarAttentionObservationSets(previous, current).changes).toEqual([
      expect.objectContaining({ type: "removed", id: "google-calendar:calendar:primary:event:evt-1" }),
    ]);
  });

  it("preserves an authoritative empty observation set when the caller supplies the acquisition envelope", () => {
    const projected = set([], { coverageState: "bounded_complete_request" });
    expect(projected.observations).toEqual([]);
    expect(projected.coverageState).toBe("bounded_complete_request");
    expect(projected.coverageLimit).toContain("window=");
  });
});
