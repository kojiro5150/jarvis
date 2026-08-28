import { describe, it, expect } from "vitest";
import { normalizeGoogleEvent, normalizeLocalRecord, dateOfMonth } from "../calendar-event";
import { getOpeningBrief, describeCommitment } from "../../briefing";
import type { OperationalState } from "../../operational-state";

/**
 * Regression coverage for the crash reported after connecting Google
 * Calendar: lib/briefing.ts assumed every calendar event had the same
 * shape regardless of source, and crashed on `next.title` when the
 * calendar was empty (state.calendar[0] === undefined). The fix has two
 * parts, both covered here: (1) both connectors normalize into one
 * canonical CalendarEvent shape before anything downstream sees them,
 * and (2) briefing.ts never assumes a next event exists.
 */

function baseState(overrides: Partial<OperationalState> = {}): OperationalState {
  return {
    priorities: [
      { rank: 1, title: "Governance reasoning review", detail: "Final pass.", due: "Today", urgent: true },
    ],
    projects: [{ name: "Governance Reasoning Framework", tag: "In review", progress: 78, tagColor: "cyan" }],
    signals: [],
    blockers: [],
    calendar: [],
    calendarStatus: "unavailable",
    gmailThreads: [],
    gmailStatus: "unavailable",
    driveFiles: [],
    driveStatus: "unavailable",
    connectorStatuses: [
      { name: "calendar", source: "local", connected: false },
      { name: "gmail", source: "local", connected: false },
      { name: "drive", source: "local", connected: false },
    ],
    updatedAt: new Date(0).toISOString(),
    ...overrides,
  };
}

describe("normalizeGoogleEvent", () => {
  it("maps a real Google-style timed event onto the canonical shape", () => {
    const raw = {
      id: "abc123",
      summary: "Board catch-up",
      start: { dateTime: "2026-07-08T09:00:00-04:00" },
      end: { dateTime: "2026-07-08T09:30:00-04:00" },
    };
    const event = normalizeGoogleEvent(raw, 0);

    expect(event.id).toBe("abc123");
    expect(event.title).toBe("Board catch-up");
    expect(event.start).toBe("2026-07-08T09:00:00-04:00");
    expect(event.end).toBe("2026-07-08T09:30:00-04:00");
    expect(event.source).toBe("google");
    // Display time is derived in the running machine's local timezone (by
    // design — this is a single-user, local-first app), so assert format
    // rather than a specific wall-clock value the test environment's own
    // timezone would make brittle.
    expect(event.time).toMatch(/^\d{2}:\d{2}$/);
    expect(event.day).toMatch(/^[A-Z]{3}$/);
  });

  it("carries a provider eventLabelId through normalization without interpretation", () => {
    const event = normalizeGoogleEvent({
      id: "labeled-1",
      summary: "JARVIS Testing",
      eventLabelId: "label-opaque-123",
      start: { dateTime: "2026-08-28T14:00:00+10:00" },
      end: { dateTime: "2026-08-28T15:00:00+10:00" },
    }, 0);

    expect(event.eventLabelId).toBe("label-opaque-123");
  });

  it("maps an all-day Google event without a dateTime field", () => {
    const raw = {
      id: "allday-1",
      summary: "Offsite",
      start: { date: "2026-07-08" },
      end: { date: "2026-07-09" },
    };
    const event = normalizeGoogleEvent(raw, 0);

    expect(event.time).toBe("All day");
    expect(event.source).toBe("google");
    expect(dateOfMonth(event.start)).toBe("8");
  });

  it("falls back to a placeholder title when summary is missing", () => {
    const event = normalizeGoogleEvent({ start: { dateTime: "2026-07-08T09:00:00Z" } }, 2);
    expect(event.title).toBe("(No title)");
    expect(event.id).toBe("google-primary-2");
  });

  it("carries per-calendar metadata (id, name, color) for multi-calendar attribution", () => {
    const event = normalizeGoogleEvent(
      { id: "evt-1", summary: "jarvis test", start: { dateTime: "2026-07-08T16:15:00-04:00" } },
      0,
      { calendarId: "governance-eng@group.calendar.google.com", calendarName: "Governance Engineering", calendarColor: "#f4bd00" }
    );
    expect(event.calendarId).toBe("governance-eng@group.calendar.google.com");
    expect(event.calendarName).toBe("Governance Engineering");
    expect(event.calendarColor).toBe("#f4bd00");
    expect(event.id).toBe("evt-1");
  });
});

describe("normalizeLocalRecord", () => {
  it("maps a local seed record onto the canonical shape", () => {
    const event = normalizeLocalRecord({ day: "MON", date: "6", title: "Board catch-up", time: "09:00" }, 0);
    expect(event.source).toBe("local");
    expect(event.id).toBe("local-0");
    expect(event.title).toBe("Board catch-up");
    expect(event.day).toBe("MON");
    expect(event.time).toBe("09:00");
    expect(typeof event.start).toBe("string");
  });
});

describe("briefing.ts defensiveness (the actual reported crash)", () => {
  it("does not throw when the calendar is empty, and uses the required copy", () => {
    const state = baseState({ calendar: [] });
    expect(() => getOpeningBrief("jarvis", state)).not.toThrow();
    expect(getOpeningBrief("jarvis", state)).toContain("No scheduled commitment currently in view.");
    expect(() => getOpeningBrief("dawnwatch", state)).not.toThrow();
    expect(getOpeningBrief("dawnwatch", state)).toContain("No scheduled commitment currently in view.");
  });

  it("renders a real Google-normalized event without throwing", () => {
    const googleEvent = normalizeGoogleEvent(
      { id: "1", summary: "Strategy review", start: { dateTime: "2026-07-08T14:00:00-04:00" } },
      0
    );
    const state = baseState({ calendar: [googleEvent] });
    expect(() => getOpeningBrief("jarvis", state)).not.toThrow();
    expect(getOpeningBrief("jarvis", state)).toContain("Strategy review");
    expect(() => getOpeningBrief("dawnwatch", state)).not.toThrow();
    expect(getOpeningBrief("dawnwatch", state)).toContain("Strategy review");
  });

  it("renders a mixed-source calendar (one local + one google event) without throwing", () => {
    const localEvent = normalizeLocalRecord({ day: "WED", date: "8", title: "Board catch-up", time: "09:00" }, 0);
    const googleEvent = normalizeGoogleEvent(
      { id: "2", summary: "Research readout", start: { date: "2026-07-10" } },
      1
    );
    const state = baseState({ calendar: [localEvent, googleEvent] });
    expect(() => getOpeningBrief("jarvis", state)).not.toThrow();
  });
});

describe("multi-calendar merge (Sam's Gmail calendar + Governance Engineering calendar)", () => {
  it("merges events from two calendars into chronological order, each labeled with its own calendar", () => {
    // Mirrors the connector's own merge step: normalize per-calendar, then
    // sort the combined list by start time — this is what
    // GoogleCalendarConnector.listUpcoming() does across calendarList
    // entries, exercised here without a live network call.
    const governanceMeta = {
      calendarId: "governance-eng@group.calendar.google.com",
      calendarName: "Governance Engineering",
      calendarColor: "#f4bd00", // yellow
    };
    const personalMeta = {
      calendarId: "samdhayward@gmail.com",
      calendarName: "Sam Hayward",
      calendarColor: "#4285f4", // blue
    };

    const laterEvent = normalizeGoogleEvent(
      { id: "1", summary: "jarvis test 1", start: { dateTime: "2026-07-08T16:30:00-04:00" } },
      0,
      personalMeta
    );
    const earlierEvent = normalizeGoogleEvent(
      { id: "2", summary: "jarvis test", start: { dateTime: "2026-07-08T16:15:00-04:00" } },
      0,
      governanceMeta
    );

    // Fetched in an arbitrary per-calendar order — the merge must sort by start time regardless.
    const merged = [laterEvent, earlierEvent].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    expect(merged.map((e) => e.title)).toEqual(["jarvis test", "jarvis test 1"]);
    expect(merged[0].calendarName).toBe("Governance Engineering");
    expect(merged[0].calendarColor).toBe("#f4bd00");
    expect(merged[1].calendarName).toBe("Sam Hayward");
    expect(merged[1].calendarColor).toBe("#4285f4");
  });
});

describe("describeCommitment", () => {
  it("mentions the calendar name for a real Google event", () => {
    const event = normalizeGoogleEvent(
      { id: "1", summary: "jarvis test", start: { dateTime: "2026-07-08T16:15:00-04:00" } },
      0,
      { calendarId: "governance-eng@group.calendar.google.com", calendarName: "Governance Engineering" }
    );
    expect(describeCommitment(event)).toBe(
      `jarvis test, Governance Engineering calendar, ${event.day} at ${event.time}`
    );
  });

  it("omits calendar attribution for local mock data", () => {
    const event = normalizeLocalRecord({ day: "MON", date: "6", title: "Board catch-up", time: "09:00" }, 0);
    expect(describeCommitment(event)).toBe("Board catch-up, MON at 09:00");
  });
});
