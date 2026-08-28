import { describe, expect, it } from "vitest";
import { aggregateCalendarTimeAllocation } from "../../connectors/calendar-time-allocation";
import { publishGovernedWeeklyCalendarAllocation } from "../calendar-weekly-allocation-publisher";

describe("publishGovernedWeeklyCalendarAllocation", () => {
  const allocation = aggregateCalendarTimeAllocation({
    windowStart: "2026-08-24T00:00:00.000Z",
    windowEnd: "2026-08-31T00:00:00.000Z",
    events: [
      { start: "2026-08-25T09:00:00.000Z", end: "2026-08-25T16:00:00.000Z", timeMode: "routine" },
      { start: "2026-08-25T12:00:00.000Z", end: "2026-08-25T13:00:00.000Z", timeMode: "self_care" },
    ],
  });

  it("publishes a complete this-week allocation that reconciles to resolved elapsed time", () => {
    const publication = publishGovernedWeeklyCalendarAllocation({
      allocation,
      period: "this_week",
      coverageState: "bounded_complete_request",
      observedAt: "2026-08-28T07:30:00.000Z",
    });

    expect(publication).toMatchObject({
      publicationType: "calendar_weekly_time_allocation",
      schemaVersion: "1.0.0",
      coverageState: "bounded_complete_request",
      minutesByMode: {
        routine: 360,
        self_care: 60,
      },
      totalTimedMinutes: 420,
    });

    const reconciled = Object.values(publication!.minutesByMode)
      .reduce((sum, minutes) => sum + minutes, 0)
      + publication!.semanticUnavailableMinutes;

    expect(reconciled).toBe(publication!.totalTimedMinutes);
  });

  it("publishes a complete next-week allocation under the same truth gates", () => {
    const publication = publishGovernedWeeklyCalendarAllocation({
      allocation,
      period: "next_week",
      coverageState: "bounded_complete_request",
      observedAt: "2026-08-28T07:30:00.000Z",
    });

    expect(publication).toMatchObject({
      publicationType: "calendar_weekly_time_allocation",
      period: "next_week",
      coverageState: "bounded_complete_request",
      totalTimedMinutes: 420,
    });
  });

  it("withholds publication for partial weekly coverage", () => {
    expect(publishGovernedWeeklyCalendarAllocation({
      allocation,
      period: "this_week",
      coverageState: "bounded_partial_request",
      observedAt: "2026-08-28T07:30:00.000Z",
    })).toBeNull();
  });

  it("withholds publication for legacy bounded coverage without completeness proof", () => {
    expect(publishGovernedWeeklyCalendarAllocation({
      allocation,
      period: "this_week",
      coverageState: "bounded",
      observedAt: "2026-08-28T07:30:00.000Z",
    })).toBeNull();
  });

  it("does not publish the allocation for a non-weekly period", () => {
    expect(publishGovernedWeeklyCalendarAllocation({
      allocation,
      period: "tomorrow",
      coverageState: "bounded_complete_request",
      observedAt: "2026-08-28T07:30:00.000Z",
    })).toBeNull();
  });

  it("fails closed if arithmetic no longer reconciles", () => {
    const broken = {
      ...allocation,
      totalTimedMinutes: allocation.totalTimedMinutes + 1,
    };

    expect(publishGovernedWeeklyCalendarAllocation({
      allocation: broken,
      period: "this_week",
      coverageState: "bounded_complete_request",
      observedAt: "2026-08-28T07:30:00.000Z",
    })).toBeNull();
  });

  it("does not double-count precedence tie minutes during reconciliation", () => {
    const tied = aggregateCalendarTimeAllocation({
      windowStart: "2026-08-24T00:00:00.000Z",
      windowEnd: "2026-08-31T00:00:00.000Z",
      events: [
        { start: "2026-08-25T12:00:00.000Z", end: "2026-08-25T13:00:00.000Z", timeMode: "self_care" },
        { start: "2026-08-25T12:30:00.000Z", end: "2026-08-25T13:30:00.000Z", timeMode: "deep_work" },
      ],
    });

    const publication = publishGovernedWeeklyCalendarAllocation({
      allocation: tied,
      period: "this_week",
      coverageState: "bounded_complete_request",
      observedAt: "2026-08-28T07:30:00.000Z",
    });

    expect(publication?.precedenceTieMinutes).toBe(30);
    expect(publication?.minutesByMode.unclassified).toBe(30);
    expect(publication?.totalTimedMinutes).toBe(90);
  });
});
