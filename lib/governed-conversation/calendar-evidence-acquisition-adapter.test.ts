import { describe, expect, it, vi } from "vitest";
import type { CalendarEvent } from "../connectors/calendar-event";
import { acquireGovernedCalendarEvidence } from "./calendar-evidence-acquisition-adapter";
const event: CalendarEvent = { id: "provider-event", title: "private", start: "2026-01-03T09:00:00+05:30", end: "2026-01-03T10:00:00+05:30", day: "SAT", time: "09:00", source: "google", calendarId: "primary", calendarName: "Private" };
const clock = () => { const values = [new Date("2026-01-01T00:00:00Z"), new Date("2026-01-01T00:00:02Z")]; return () => values.shift()!; };
describe("Calendar acquisition adapter", () => {
  it("wraps Google events in explicit bounded acquisition metadata", async () => {
    const listUpcoming = vi.fn().mockResolvedValue([event]); const result = await acquireGovernedCalendarEvidence({ connector: { source: "google", listUpcoming }, clock: clock(), requestedLimit: 5, horizonDays: 7 });
    expect(listUpcoming).toHaveBeenCalledWith(5); expect(result.status).toBe("available"); expect(result.observedAt).toBe("2026-01-01T00:00:02.000Z");
    expect(result.evidence[0]).toMatchObject({ start: event.start, end: event.end, timezone: "+05:30", coverageLimit: "window=2026-01-01T00:00:00.000Z/2026-01-08T00:00:00.000Z;max_events=5;scope=visible_non_hidden_calendars;completeness=bounded" });
  });
  it("never calls local data and contains Google failure", async () => {
    const local = vi.fn().mockResolvedValue([{ ...event, source: "local" }]); const unavailable = await acquireGovernedCalendarEvidence({ connector: { source: "local", listUpcoming: local }, clock: () => new Date("2026-01-01Z"), requestedLimit: 5, horizonDays: 7 });
    expect(local).not.toHaveBeenCalled(); expect(unavailable.evidence).toEqual([]); expect(unavailable.status).toBe("unavailable");
    const failed = await acquireGovernedCalendarEvidence({ connector: { source: "google", listUpcoming: async () => { throw new Error(); } }, clock: clock(), requestedLimit: 5, horizonDays: 7 }); expect(failed.status).toBe("unavailable");
  });
  it("leaves synthetic provider identity rejection to the publisher", async () => {
    const result = await acquireGovernedCalendarEvidence({ connector: { source: "google", listUpcoming: async () => [{ ...event, id: "google-primary-0" }] }, clock: clock(), requestedLimit: 5, horizonDays: 7 }); expect(result.evidence).toEqual([]);
  });
});
