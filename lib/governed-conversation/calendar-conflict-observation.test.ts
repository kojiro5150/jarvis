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

const observedAt = "2026-08-29T05:30:00.000Z";
const publish = (value: CalendarEvent) => publishCalendarConflictEvent(value, observedAt);

describe("Golden Scenario 001 Calendar conflict observation", () => {
  it("computes the exact 30-minute overlap deterministically", () => {
    const existing = publish(event({ timeMode: "deep_work" }))!;
    const invite = publish(event({
      id: "invite",
      title: "New invitation",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
      timeMode: undefined,
    }))!;

    const observation = observeCalendarConflict({
      first: invite,
      second: existing,
      observedAt,
    });

    expect(observation).toEqual({
      observedAt,
      first: invite,
      second: existing,
      overlapStart: "2026-09-01T03:30:00.000Z",
      overlapEnd: "2026-09-01T04:00:00.000Z",
      overlapMinutes: 30,
    });
    expect(Object.isFrozen(observation)).toBe(true);
  });

  it("preserves only an already-governed timeMode and never infers it from title", () => {
    expect(publish(event({
      title: "URGENT Deep Work Protected Priority Block",
      timeMode: undefined,
    }))).toMatchObject({
      commitmentReference: "google-calendar:calendar:primary:event:event-a",
      timeMode: null,
      observedAt,
      provenanceReference: "google-calendar:calendar:primary:event:event-a#provenance",
    });

    expect(publish(event({
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
    const first = publish(event({
      id: "first",
      start: "2026-09-01T13:00:00+10:00",
      end: "2026-09-01T14:00:00+10:00",
    }))!;
    const touching = publish(event({
      id: "touching",
      start: "2026-09-01T14:00:00+10:00",
      end: "2026-09-01T15:00:00+10:00",
    }))!;
    const later = publish(event({
      id: "later",
      start: "2026-09-01T15:00:00+10:00",
      end: "2026-09-01T16:00:00+10:00",
    }))!;

    expect(observeCalendarConflict({
      first,
      second: touching,
      observedAt,
    })).toBeNull();
    expect(observeCalendarConflict({
      first,
      second: later,
      observedAt,
    })).toBeNull();
  });

  it("rejects the same event, all-day/bare-date values, invalid intervals and invalid observation time", () => {
    const good = publish(event())!;
    expect(observeCalendarConflict({
      first: good,
      second: good,
      observedAt,
    })).toBeNull();

    expect(publish(event({
      start: "2026-09-01",
      end: "2026-09-02",
    }))).toBeNull();

    expect(publish(event({
      start: "2026-09-01T15:00:00+10:00",
      end: "2026-09-01T13:00:00+10:00",
    }))).toBeNull();

    const other = publish(event({
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
    const published = publish(source);

    expect(source).toEqual(before);
    expect(published).not.toBe(source);
    expect(Object.isFrozen(published)).toBe(true);
  });
});
