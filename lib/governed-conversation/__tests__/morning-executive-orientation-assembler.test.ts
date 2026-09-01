import { describe, expect, it } from "vitest";
import { assembleMorningExecutiveOrientationBrief } from "../morning-executive-orientation-assembler";
import type { GovernedWeeklyCalendarAllocationPublication } from "../calendar-weekly-allocation-publisher";

const weekly: GovernedWeeklyCalendarAllocationPublication = Object.freeze({
  publicationType: "calendar_weekly_time_allocation",
  schemaVersion: "1.0.0",
  policyReference: "governed-calendar-weekly-allocation-publication.v1",
  sourceId: "google-calendar",
  windowStart: "2026-08-30T14:00:00.000Z",
  windowEnd: "2026-09-06T14:00:00.000Z",
  period: "this_week",
  coverageState: "bounded_complete_request",
  observedAt: "2026-09-01T08:30:00.000Z",
  minutesByMode: Object.freeze({
    routine: 360,
    deep_work: 120,
    reflection: 60,
    development: 0,
    self_care: 60,
    unclassified: 30,
  }),
  semanticUnavailableMinutes: 30,
  precedenceTieMinutes: 30,
  totalTimedMinutes: 660,
  timedEventCount: 8,
  allDayEventCount: 1,
  invalidEventCount: 0,
});

function input() {
  return {
    observedAt: "2026-09-01T08:30:00.000Z",
    coverage: {
      sourceId: "google-calendar" as const,
      state: "bounded_complete_request" as const,
      windowStart: "2026-08-30T14:00:00.000Z",
      windowEnd: "2026-09-06T14:00:00.000Z",
      observedAt: "2026-09-01T08:30:00.000Z",
    },
    today: {
      period: "today" as const,
      windowStart: "2026-08-31T14:00:00.000Z",
      windowEnd: "2026-09-01T14:00:00.000Z",
      timedCommitments: [
        {
          title: "Afternoon review",
          start: "2026-09-01T05:00:00.000Z",
          end: "2026-09-01T06:00:00.000Z",
          calendarName: "primary",
        },
        {
          title: "Morning review",
          start: "2026-08-31T23:00:00.000Z",
          end: "2026-09-01T00:00:00.000Z",
          calendarName: "primary",
        },
      ],
    },
    weeklyAllocation: weekly,
  };
}

describe("assembleMorningExecutiveOrientationBrief", () => {
  it("constructs the exact factual v1 publication and sorts today chronologically", () => {
    const brief = assembleMorningExecutiveOrientationBrief(input());

    expect(brief).toMatchObject({
      kind: "morning_executive_orientation_brief",
      schemaVersion: "1.0.0",
      semantics: "factual_orientation_not_priority_or_advice",
      timeZone: "Australia/Melbourne",
      weeklyCapacity: { period: "this_week" },
    });
    expect(brief?.today.timedCommitments.map(event => event.title))
      .toEqual(["Morning review", "Afternoon review"]);
    expect(brief?.limitations).toEqual([
      "supported_change_comparison_not_included",
      "priority_not_assessed",
      "schedule_adequacy_not_assessed",
      "recommendation_not_produced",
      "continuity_not_included",
      "cross_source_synthesis_not_included",
    ]);
  });

  it("fails closed when observations are mixed", () => {
    expect(assembleMorningExecutiveOrientationBrief({
      ...input(),
      weeklyAllocation: { ...weekly, observedAt: "2026-09-01T08:31:00.000Z" },
    })).toBeNull();
  });

  it("fails closed when the weekly artefact is not this week", () => {
    expect(assembleMorningExecutiveOrientationBrief({
      ...input(),
      weeklyAllocation: { ...weekly, period: "next_week" },
    })).toBeNull();
  });

  it("fails closed when weekly arithmetic no longer reconciles", () => {
    expect(assembleMorningExecutiveOrientationBrief({
      ...input(),
      weeklyAllocation: { ...weekly, totalTimedMinutes: 661 },
    })).toBeNull();
  });

  it("fails closed when today's window lies outside the complete weekly coverage", () => {
    expect(assembleMorningExecutiveOrientationBrief({
      ...input(),
      today: {
        ...input().today,
        windowStart: "2026-09-06T14:00:00.000Z",
        windowEnd: "2026-09-07T14:00:00.000Z",
      },
    })).toBeNull();
  });

  it("fails closed on malformed or out-of-window factual events", () => {
    expect(assembleMorningExecutiveOrientationBrief({
      ...input(),
      today: {
        ...input().today,
        timedCommitments: [{
          title: "Outside",
          start: "2026-09-02T00:00:00.000Z",
          end: "2026-09-02T01:00:00.000Z",
          calendarName: "primary",
        }],
      },
    })).toBeNull();

    expect(assembleMorningExecutiveOrientationBrief({
      ...input(),
      observedAt: "not-a-timestamp",
    })).toBeNull();
  });
});
