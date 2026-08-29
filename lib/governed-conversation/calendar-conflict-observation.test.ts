import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../connectors/calendar-event";
import {
  observeCalendarConflict,
  publishCalendarConflictEvent,
} from "./calendar-conflict-observation";

function event(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "event-a",
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

describe("Golden Scenario 001 Calendar conflict observation", () => {
  it("computes the exact 30-minute overlap deterministically", () => {
    const existing = publishCalendarConflictEvent(event({ timeMode: "deep_work" }))!;
    const invite = publishCalendarConflictEvent(event({
      id: "invite",
      title: "New invitation",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
      timeMode: undefined,
    }))!;

    const observation = observeCalendarConflict({
      first: invite,
      second: existing,
      observedAt: "2026-08-29T05:30:00.000Z",
    });

    expect(observation).toEqual({
      observedAt: "2026-08-29T05:30:00.000Z",
      first: invite,
      second: existing,
      overlapStart: "2026-09-01T03:30:00.000Z",
      overlapEnd: "2026-09-01T04:00:00.000Z",
      overlapMinutes: 30,
    });
    expect(Object.isFrozen(observation)).toBe(true);
  });

  it("preserves only an already-governed timeMode and never infers it from title", () => {
    expect(publishCalendarConflictEvent(event({
      title: "URGENT Deep Work Protected Priority Block",
      timeMode: undefined,
    }))).toMatchObject({ timeMode: null });

    expect(publishCalendarConflictEvent(event({
      title: "Ordinary title",
      timeMode: "deep_work",
    }))).toMatchObject({ timeMode: "deep_work" });
  });

  it("does not label the relation as important, protected, urgent or recommended", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/governed-conversation/calendar-conflict-observation.ts", "utf8"));

    for (const forbidden of [
      "priority:",
      "urgency:",
      "importance:",
      "protected:",
      "recommendation:",
      "callClaude",
      "PendingAuthorization",
      "createConnector",
    ]) expect(source).not.toContain(forbidden);
  });

  it("returns null for touching or non-overlapping intervals", () => {
    const first = publishCalendarConflictEvent(event({
      id: "first",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
    }))!;
    const touching = publishCalendarConflictEvent(event({
      id: "touching",
      start: "2026-09-01T14:00:00+10:00",
      end: "2026-09-01T15:00:00+10:00",
    }))!;
    const later = publishCalendarConflictEvent(event({
      id: "later",
      start: "2026-09-01T15:00:00+10:00",
      end: "2026-09-01T16:00:00+10:00",
    }))!;

    expect(observeCalendarConflict({
      first,
      second: touching,
      observedAt: "2026-08-29T05:30:00.000Z",
    })).toBeNull();
    expect(observeCalendarConflict({
      first,
      second: later,
      observedAt: "2026-08-29T05:30:00.000Z",
    })).toBeNull();
  });

  it("rejects the same event, all-day/bare-date values, invalid intervals and invalid observation time", () => {
    const good = publishCalendarConflictEvent(event())!;
    expect(observeCalendarConflict({
      first: good,
      second: good,
      observedAt: "2026-08-29T05:30:00.000Z",
    })).toBeNull();

    expect(publishCalendarConflictEvent(event({
      start: "2026-09-01",
      end: "2026-09-02",
    }))).toBeNull();

    expect(publishCalendarConflictEvent(event({
      start: "2026-09-01T15:00:00+10:00",
      end: "2026-09-01T13:00:00+10:00",
    }))).toBeNull();

    const other = publishCalendarConflictEvent(event({
      id: "other",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
    }))!;
    expect(observeCalendarConflict({
      first: good,
      second: other,
      observedAt: "not-a-time",
    })).toBeNull();
  });

  it("does not mutate the source Calendar event", () => {
    const source = event({ timeMode: "deep_work" });
    const before = structuredClone(source);
    const published = publishCalendarConflictEvent(source);

    expect(source).toEqual(before);
    expect(published).not.toBe(source);
    expect(Object.isFrozen(published)).toBe(true);
  });
});
