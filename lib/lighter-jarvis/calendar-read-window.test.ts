import { describe, expect, it } from "vitest";
import { resolveCalendarReadWindow } from "./calendar-read-window";

describe("Melbourne Calendar read windows", () => {
  const now = new Date("2026-08-25T03:30:00.000Z"); // Tue 25 Aug, 1:30 PM AEST

  it.each([
    ["today", "2026-08-24T14:00:00.000Z", "2026-08-25T14:00:00.000Z"],
    ["tomorrow", "2026-08-25T14:00:00.000Z", "2026-08-26T14:00:00.000Z"],
    ["this_morning", "2026-08-24T14:00:00.000Z", "2026-08-25T02:00:00.000Z"],
    ["this_afternoon", "2026-08-25T02:00:00.000Z", "2026-08-25T07:00:00.000Z"],
    ["this_evening", "2026-08-25T07:00:00.000Z", "2026-08-25T14:00:00.000Z"],
    ["this_week", "2026-08-23T14:00:00.000Z", "2026-08-30T14:00:00.000Z"],
  ] as const)("resolves %s from the injected clock", (period, start, end) => {
    expect(resolveCalendarReadWindow(period, now)).toEqual({ start, end, timeZone: "Australia/Melbourne", period });
  });

  it("uses civil midnights across the spring DST boundary", () => {
    expect(resolveCalendarReadWindow("tomorrow", new Date("2026-10-03T02:00:00Z"))).toMatchObject({
      start: "2026-10-03T14:00:00.000Z", end: "2026-10-04T13:00:00.000Z",
    });
  });

  it("uses civil midnights across the autumn DST boundary", () => {
    expect(resolveCalendarReadWindow("today", new Date("2026-04-04T22:00:00Z"))).toMatchObject({
      start: "2026-04-04T13:00:00.000Z", end: "2026-04-05T14:00:00.000Z",
    });
  });

  it("documents the generic explicit-read default as an exact seven-day interval", () => {
    expect(resolveCalendarReadWindow("default", now)).toMatchObject({
      start: "2026-08-25T03:30:00.000Z", end: "2026-09-01T03:30:00.000Z",
    });
  });
});
