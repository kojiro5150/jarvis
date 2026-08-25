import { describe, expect, it } from "vitest";
import { formatCalendarReadResponse } from "./chat-handler";
import type { CalendarReadPeriod, CalendarReadWindow } from "./calendar-read-window";

const available = Object.freeze({ status: "available" as const, evidence: Object.freeze([]) });
const populated = Object.freeze({ status: "available" as const, evidence: Object.freeze([
  Object.freeze({
    commitmentReference: "event:one",
    sourceReference: Object.freeze({ sourceId: "google-calendar", resourceId: "event:one", field: "schedule_interval", observedAt: "2026-08-25T00:00:00.000Z" }),
    start: "2026-08-26T09:00:00.000Z",
    end: "2026-08-26T10:00:00.000Z",
    timezone: "Z",
    provenanceReference: "event:one#provenance",
    available: true,
    coverageLimit: "window=2026-08-25T14:00:00.000Z/2026-08-26T14:00:00.000Z;max_events=5",
    policyReference: "calendar-policy",
  }),
]) });
const populatedPlural = Object.freeze({ status: "available" as const, evidence: Object.freeze([
  ...populated.evidence,
  Object.freeze({ ...populated.evidence[0], commitmentReference: "event:two",
    start: "2026-08-26T11:30:00.000Z", end: "2026-08-26T12:00:00.000Z" }),
]) });
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

  it.each([
    ["today", "Today you have 1 commitment:\n- 7:00 PM – 8:00 PM"],
    ["tomorrow", "Tomorrow you have 1 commitment:\n- 7:00 PM – 8:00 PM"],
    ["this_morning", "This morning you have 1 commitment:\n- 7:00 PM – 8:00 PM"],
    ["this_afternoon", "This afternoon you have 1 commitment:\n- 7:00 PM – 8:00 PM"],
    ["this_evening", "This evening you have 1 commitment:\n- 7:00 PM – 8:00 PM"],
  ] as const)("uses a period heading and time-only lines for a populated %s window", (period, expected) => {
    expect(formatCalendarReadResponse(populated, window(period))).toBe(expected);
  });

  it.each([
    ["this_week", "This week you have 1 commitment:\n- Wed, 26 Aug, 7:00 PM – 8:00 PM"],
    ["default", "Next seven days you have 1 commitment:\n- Wed, 26 Aug, 7:00 PM – 8:00 PM"],
  ] as const)("retains concise date context for a populated %s window", (period, expected) => {
    expect(formatCalendarReadResponse(populated, window(period))).toBe(expected);
  });

  it("uses plural grammar for multiple commitments", () => {
    expect(formatCalendarReadResponse(populatedPlural, window("tomorrow"))).toBe(
      "Tomorrow you have 2 commitments:\n- 7:00 PM – 8:00 PM\n- 9:30 PM – 10:00 PM",
    );
  });
});
