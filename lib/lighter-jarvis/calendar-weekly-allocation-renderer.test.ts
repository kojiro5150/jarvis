import { describe, expect, it } from "vitest";
import { renderGovernedWeeklyCalendarAllocation } from "./calendar-weekly-allocation-renderer";
import type { GovernedWeeklyCalendarAllocationPublication } from "../governed-conversation/calendar-weekly-allocation-publisher";

const publication: GovernedWeeklyCalendarAllocationPublication = Object.freeze({
  publicationType: "calendar_weekly_time_allocation",
  schemaVersion: "1.0.0",
  policyReference: "governed-calendar-weekly-allocation-publication.v1",
  sourceId: "google-calendar",
  windowStart: "2026-08-24T00:00:00.000Z",
  windowEnd: "2026-08-31T00:00:00.000Z",
  period: "this_week",
  coverageState: "bounded_complete_request",
  observedAt: "2026-08-28T07:30:00.000Z",
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
  invalidEventCount: 1,
});

describe("renderGovernedWeeklyCalendarAllocation", () => {
  it("renders the governed allocation deterministically without judgment", () => {
    expect(renderGovernedWeeklyCalendarAllocation(publication)).toBe(
      [
        "This week's resolved Calendar allocation:",
        "- Routine / Transactional: 6h",
        "- Deep Work / Discovery: 2h",
        "- Reflection: 1h",
        "- Development: 0m",
        "- Self-Care: 1h",
        "- Unclassified: 30m",
        "- Semantic classification unavailable: 30m",
        "Resolved occupied timed-event total: 11h.",
        "Coverage: complete for this bounded weekly Calendar read.",
        "30m of Unclassified time comes from equal-duration overlap ties.",
        "1 all-day event excluded from timed allocation.",
        "1 timed event could not be allocated safely.",
      ].join("\n")
    );
  });

  it("renders a next-week heading from the governed period", () => {
    const rendered = renderGovernedWeeklyCalendarAllocation({
      ...publication,
      period: "next_week",
      windowStart: "2026-08-31T00:00:00.000Z",
      windowEnd: "2026-09-07T00:00:00.000Z",
    });

    expect(rendered).toMatch(/^Next week's resolved Calendar allocation:/);
  });

  it("does not double-count precedence tie minutes in the displayed total", () => {
    const rendered = renderGovernedWeeklyCalendarAllocation(publication)!;
    expect(rendered).toContain("Unclassified: 30m");
    expect(rendered).toContain("30m of Unclassified time comes from equal-duration overlap ties.");
    expect(rendered).toContain("Resolved occupied timed-event total: 11h.");
  });

  it("fails closed when the artefact no longer reconciles", () => {
    expect(renderGovernedWeeklyCalendarAllocation({
      ...publication,
      totalTimedMinutes: 661,
    })).toBeNull();
  });

  it("does not introduce adequacy, targets, recommendations, or write language", () => {
    const rendered = renderGovernedWeeklyCalendarAllocation(publication)!;
    expect(rendered).not.toMatch(/good|bad|enough|should|ideal|target|recommend|reschedul|move|change/i);
  });
});
