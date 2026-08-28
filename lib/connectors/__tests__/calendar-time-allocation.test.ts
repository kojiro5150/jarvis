import { describe, expect, it } from "vitest";
import { aggregateCalendarTimeAllocation } from "../calendar-time-allocation";

describe("aggregateCalendarTimeAllocation", () => {
  const windowStart = "2026-08-24T00:00:00.000Z";
  const windowEnd = "2026-08-31T00:00:00.000Z";

  it("aggregates deterministic minutes by governed mode", () => {
    const result = aggregateCalendarTimeAllocation({
      windowStart,
      windowEnd,
      events: [
        { start: "2026-08-25T00:00:00.000Z", end: "2026-08-25T01:30:00.000Z", timeMode: "deep_work" },
        { start: "2026-08-25T02:00:00.000Z", end: "2026-08-25T03:00:00.000Z", timeMode: "routine" },
        { start: "2026-08-26T00:00:00.000Z", end: "2026-08-26T00:30:00.000Z", timeMode: "self_care" },
      ],
    });

    expect(result.minutesByMode).toMatchObject({
      deep_work: 90,
      routine: 60,
      self_care: 30,
      reflection: 0,
      development: 0,
      unclassified: 0,
    });
    expect(result.totalTimedMinutes).toBe(180);
    expect(result.semanticUnavailableMinutes).toBe(0);
    expect(result.timedEventCount).toBe(3);
  });

  it("keeps semantic unavailability separate from explicit unclassified", () => {
    const result = aggregateCalendarTimeAllocation({
      windowStart,
      windowEnd,
      events: [
        { start: "2026-08-25T00:00:00.000Z", end: "2026-08-25T01:00:00.000Z", timeMode: "unclassified" },
        { start: "2026-08-25T02:00:00.000Z", end: "2026-08-25T03:30:00.000Z", timeMode: undefined },
      ],
    });

    expect(result.minutesByMode.unclassified).toBe(60);
    expect(result.semanticUnavailableMinutes).toBe(90);
    expect(result.totalTimedMinutes).toBe(150);
  });

  it("clips event duration to the bounded allocation window", () => {
    const result = aggregateCalendarTimeAllocation({
      windowStart,
      windowEnd,
      events: [
        { start: "2026-08-23T23:30:00.000Z", end: "2026-08-24T00:30:00.000Z", timeMode: "reflection" },
        { start: "2026-08-30T23:30:00.000Z", end: "2026-08-31T00:30:00.000Z", timeMode: "development" },
      ],
    });

    expect(result.minutesByMode.reflection).toBe(30);
    expect(result.minutesByMode.development).toBe(30);
    expect(result.totalTimedMinutes).toBe(60);
  });

  it("counts overlapping events separately as scheduled event-duration", () => {
    const result = aggregateCalendarTimeAllocation({
      windowStart,
      windowEnd,
      events: [
        { start: "2026-08-25T00:00:00.000Z", end: "2026-08-25T01:00:00.000Z", timeMode: "routine" },
        { start: "2026-08-25T00:30:00.000Z", end: "2026-08-25T01:30:00.000Z", timeMode: "deep_work" },
      ],
    });

    expect(result.minutesByMode.routine).toBe(60);
    expect(result.minutesByMode.deep_work).toBe(60);
    expect(result.totalTimedMinutes).toBe(120);
  });

  it("reports all-day events separately and excludes them from minute totals", () => {
    const result = aggregateCalendarTimeAllocation({
      windowStart,
      windowEnd,
      events: [
        { start: "2026-08-25", end: "2026-08-26", timeMode: "routine" },
        { start: "2026-08-25T09:00:00.000Z", end: "2026-08-25T10:00:00.000Z", timeMode: "routine" },
      ],
    });

    expect(result.allDayEventCount).toBe(1);
    expect(result.minutesByMode.routine).toBe(60);
    expect(result.totalTimedMinutes).toBe(60);
  });

  it("excludes malformed or zero-duration timed events without manufacturing duration", () => {
    const result = aggregateCalendarTimeAllocation({
      windowStart,
      windowEnd,
      events: [
        { start: "not-a-date", end: "2026-08-25T10:00:00.000Z", timeMode: "routine" },
        { start: "2026-08-25T10:00:00.000Z", end: "2026-08-25T10:00:00.000Z", timeMode: "deep_work" },
      ],
    });

    expect(result.invalidEventCount).toBe(2);
    expect(result.totalTimedMinutes).toBe(0);
  });

  it("rejects an invalid allocation window", () => {
    expect(() => aggregateCalendarTimeAllocation({
      windowStart: windowEnd,
      windowEnd: windowStart,
      events: [],
    })).toThrow("calendar allocation window is invalid");
  });
});
