import { describe, expect, it, vi } from "vitest";
import type { CalendarEvent } from "../connectors/calendar-event";
import { publishCalendarEvidence, type GovernedCalendarPublicationInput } from "./calendar-evidence-publisher";
const event = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({ id: "evt-1", title: "Secret title", start: "2026-01-03T09:00:00+05:30", end: "2026-01-03T10:00:00+05:30", day: "SAT", time: "09:00", source: "google", calendarId: "cal@example.com", calendarName: "Secret calendar", selfAttendeeResponse: "accepted", ...overrides });
const bundle = (events: readonly CalendarEvent[]): GovernedCalendarPublicationInput => ({ sourceId: "google-calendar", availability: "available", retrievedAt: "2026-01-02T00:00:00Z", windowStart: "2026-01-01T00:00:00Z", windowEnd: "2026-01-31T00:00:00Z", requestedLimit: 25, coverageState: "bounded_complete_request", events });
describe("Calendar evidence publisher", () => {
  it("maps timed and all-day events exactly without disclosed content or a clock", () => {
    const spy = vi.spyOn(Date, "now"); const input = bundle([event(), event({ id: "all-day", start: "2026-01-04", end: "2026-01-05" })]); const before = structuredClone(input); const result = publishCalendarEvidence(input);
    expect(result[0]).toEqual({ commitmentReference: "google-calendar:calendar:cal@example.com:event:evt-1", sourceReference: { sourceId: "google-calendar", resourceId: "calendar:cal@example.com:event:evt-1", field: "schedule_interval", observedAt: "2026-01-02T00:00:00Z" }, start: "2026-01-03T09:00:00+05:30", end: "2026-01-03T10:00:00+05:30", timezone: "+05:30", provenanceReference: "google-calendar:calendar:cal@example.com:event:evt-1#provenance", available: true, coverageLimit: "window=2026-01-01T00:00:00Z/2026-01-31T00:00:00Z;max_events=25;scope=visible_non_hidden_calendars;completeness=bounded_complete_request", policyReference: "governed-calendar-conversational-metadata-disclosure.v1" });
    expect(result[1].timezone).toBe("floating-date"); expect(Object.keys(result[0])).toHaveLength(9); expect(JSON.stringify(result)).not.toContain("Secret"); expect(spy).not.toHaveBeenCalled(); expect(input).toEqual(before); expect(Object.isFrozen(result) && Object.isFrozen(result[0]) && Object.isFrozen(result[0].sourceReference)).toBe(true); expect(publishCalendarEvidence(structuredClone(input))).toEqual(result); spy.mockRestore();
  });
  it("fails closed for unavailable, local, synthetic, incomplete, and offset-free events", () => {
    expect(publishCalendarEvidence({ ...bundle([event()]), availability: "unavailable" })).toEqual([]);
    for (const bad of [event({ source: "local" }), event({ id: "google-cal@example.com-0" }), event({ calendarId: "" }), event({ start: "" }), event({ end: "" }), event({ start: "2026-01-03T09:00:00" })]) expect(publishCalendarEvidence(bundle([bad]))).toEqual([]);
  });
});
