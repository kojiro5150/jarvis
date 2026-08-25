import { describe, expect, it } from "vitest";
import { formatCalendarReadResponse } from "./chat-handler";
import type { CalendarReadPeriod, CalendarReadWindow } from "./calendar-read-window";

const available = Object.freeze({ status: "available" as const, evidence: Object.freeze([]) });
const window = (period: CalendarReadPeriod): CalendarReadWindow => Object.freeze({
  start: "2026-08-25T14:00:00.000Z",
  end: "2026-08-26T14:00:00.000Z",
  timeZone: "Australia/Melbourne",
  period,
});

describe("deterministic Calendar period presentation", () => {
  it.each([
    ["today", "Today is clear."],
    ["tomorrow", "Tomorrow is clear."],
    ["this_morning", "This morning is clear."],
    ["this_afternoon", "This afternoon is clear."],
    ["this_evening", "This evening is clear."],
    ["this_week", "This week is clear."],
    ["default", "Your Calendar is clear for the next seven days."],
  ] as const)("presents an empty %s window concisely", (period, expected) => {
    expect(formatCalendarReadResponse(available, window(period))).toBe(expected);
  });
});
