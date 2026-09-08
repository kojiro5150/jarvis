import { describe, expect, it } from "vitest";
import { calculateCalendarFreeTime } from "./calendar-free-time";
import { renderCalendarFreeTime } from "./calendar-free-time-renderer";
import { resolveCalendarReadWindow, resolveMelbourneLocalInterval } from "./calendar-read-window";
import type { ScopedCalendarEvidenceResult } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import type { GovernedCalendarEvidenceInput } from "../governed-conversation/projection-composer";
import type { DiscretionaryAvailabilityPreference } from "../operating-picture/discretionary-availability-preference";

const preference: DiscretionaryAvailabilityPreference = Object.freeze({
  timeZone: "Australia/Melbourne", weekdays: Object.freeze([1, 2, 3, 4, 5]) as readonly [1, 2, 3, 4, 5],
  startHour: 18, endHour: 21, weekendPolicy: "explicit_only",
  weekendStartHour: 8, weekendEndHour: 18,
});

function governedEvent(start: string, end: string, timezone = "+10:00"): GovernedCalendarEvidenceInput {
  return Object.freeze({ commitmentReference: `event:${start}`, sourceReference: Object.freeze({ sourceId: "google-calendar", resourceId: `event:${start}`, field: "schedule_interval", observedAt: "2026-09-07T07:00:00.000Z" }), start, end, timezone, provenanceReference: "proof", available: true, coverageLimit: "complete", policyReference: "policy" });
}

function evidence(events: readonly GovernedCalendarEvidenceInput[], coverageState: ScopedCalendarEvidenceResult["coverageState"] = "bounded_complete_request"): ScopedCalendarEvidenceResult {
  return Object.freeze({ status: "available", evidence: Object.freeze([...events]), observedAt: "2026-09-07T07:00:00.000Z", coverageState });
}

describe("governed Calendar free-time calculation", () => {
  it("subtracts and merges overlapping busy intervals inside the explicit weekday envelope", () => {
    const window = resolveCalendarReadWindow("this_week", new Date("2026-09-07T07:00:00.000Z"));
    const result = calculateCalendarFreeTime({ evidence: evidence([
      governedEvent("2026-09-07T18:30:00+10:00", "2026-09-07T19:30:00+10:00"),
      governedEvent("2026-09-07T19:00:00+10:00", "2026-09-07T20:00:00+10:00"),
    ]), window, preference, includeWeekend: false, now: new Date("2026-09-07T07:00:00.000Z") });
    expect(result.status).toBe("available");
    if (result.status !== "available") return;
    expect(result.slots.slice(0, 2)).toEqual([
      { start: "2026-09-07T08:00:00.000Z", end: "2026-09-07T08:30:00.000Z" },
      { start: "2026-09-07T10:00:00.000Z", end: "2026-09-07T11:00:00.000Z" },
    ]);
    expect(result.slots).toHaveLength(6);
  });

  it("clips past time and lets a floating-date event block the whole daily envelope", () => {
    const window = resolveCalendarReadWindow("this_week", new Date("2026-09-07T10:30:00.000Z"));
    const result = calculateCalendarFreeTime({ evidence: evidence([
      governedEvent("2026-09-08", "2026-09-09", "floating-date"),
    ]), window, preference, includeWeekend: false, now: new Date("2026-09-07T10:30:00.000Z") });
    expect(result.status).toBe("available");
    if (result.status !== "available") return;
    expect(result.slots[0]).toEqual({ start: "2026-09-07T10:30:00.000Z", end: "2026-09-07T11:00:00.000Z" });
    expect(result.slots.some(slot => slot.start.startsWith("2026-09-08"))).toBe(false);
  });

  it("fails closed unless the authorised Calendar acquisition is complete", () => {
    const window = resolveCalendarReadWindow("this_week", new Date("2026-09-07T07:00:00.000Z"));
    expect(calculateCalendarFreeTime({ evidence: evidence([], "bounded_partial_request"), window, preference, includeWeekend: false, now: new Date("2026-09-07T07:00:00.000Z") }))
      .toEqual({ status: "rejected", reason: "calendar_incomplete" });
  });

  it("treats an admitted zero-duration Calendar interval as occupying no time", () => {
    const window = resolveCalendarReadWindow("this_week", new Date("2026-09-07T07:00:00.000Z"));
    const result = calculateCalendarFreeTime({ evidence: evidence([
      governedEvent("2026-09-07T19:00:00+10:00", "2026-09-07T19:00:00+10:00"),
    ]), window, preference, includeWeekend: false, now: new Date("2026-09-07T07:00:00.000Z") });
    expect(result.status).toBe("available");
    if (result.status !== "available") return;
    expect(result.slots[0]).toEqual({ start: "2026-09-07T08:00:00.000Z", end: "2026-09-07T11:00:00.000Z" });
  });

  it("keeps reversed Calendar intervals fail-closed and renders the exact reason", () => {
    const window = resolveCalendarReadWindow("this_week", new Date("2026-09-07T07:00:00.000Z"));
    const result = calculateCalendarFreeTime({ evidence: evidence([
      governedEvent("2026-09-07T20:00:00+10:00", "2026-09-07T19:00:00+10:00"),
    ]), window, preference, includeWeekend: false, now: new Date("2026-09-07T07:00:00.000Z") });
    expect(result).toEqual({ status: "rejected", reason: "invalid_input" });
    expect(renderCalendarFreeTime(result)).toBe("I couldn't safely calculate your free time because the governed Calendar evidence contained an invalid interval.");
  });

  it("includes weekend envelopes only on explicit opt-in and renders deterministic clean text", () => {
    const window = resolveCalendarReadWindow("this_week", new Date("2026-09-11T12:00:00.000Z"));
    const result = calculateCalendarFreeTime({ evidence: evidence([]), window, preference, includeWeekend: true, now: new Date("2026-09-11T12:00:00.000Z") });
    expect(result.status).toBe("available");
    if (result.status !== "available") return;
    expect(result.slots).toHaveLength(2);
    expect(result.slots[0]).toEqual({ start: "2026-09-11T22:00:00.000Z", end: "2026-09-12T08:00:00.000Z" });
    expect(result.slots[1]).toEqual({ start: "2026-09-12T22:00:00.000Z", end: "2026-09-13T08:00:00.000Z" });
    expect(renderCalendarFreeTime(result)).toContain("Weekend time uses your remembered 8:00 AM–6:00 PM preference because you explicitly requested it.");
    expect(renderCalendarFreeTime(result)).not.toContain("{\"statement\"");
  });

  it("fails closed for weekend inclusion without the separate weekend preference", () => {
    const window = resolveCalendarReadWindow("this_week", new Date("2026-09-11T12:00:00.000Z"));
    const result = calculateCalendarFreeTime({ evidence: evidence([]), window,
      preference: Object.freeze({ ...preference, weekendStartHour: null, weekendEndHour: null }),
      includeWeekend: true, now: new Date("2026-09-11T12:00:00.000Z") });
    expect(result).toEqual({ status: "rejected", reason: "weekend_preference_missing" });
    expect(renderCalendarFreeTime(result)).toBe("I don't have an explicit current user-authored weekend work-availability preference to use.");
  });

  it("constructs Melbourne intervals across daylight-saving offset changes", () => {
    expect(resolveMelbourneLocalInterval({ date: "2026-10-03", startHour: 18, endHour: 21 }))
      .toEqual({ start: "2026-10-03T08:00:00.000Z", end: "2026-10-03T11:00:00.000Z" });
    expect(resolveMelbourneLocalInterval({ date: "2026-10-05", startHour: 18, endHour: 21 }))
      .toEqual({ start: "2026-10-05T07:00:00.000Z", end: "2026-10-05T10:00:00.000Z" });
  });
});
