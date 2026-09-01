import { describe, expect, it } from "vitest";
import { assembleMorningExecutiveOrientationBrief } from "../governed-conversation/morning-executive-orientation-assembler";
import type {
  GovernedWeeklyCalendarAllocationPublication,
} from "../governed-conversation/calendar-weekly-allocation-publisher";
import type { MorningExecutiveOrientationBrief } from "../governed-conversation/morning-executive-orientation-contract";
import { renderMorningExecutiveOrientationBrief } from "./morning-executive-orientation-renderer";

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

function brief() {
  return assembleMorningExecutiveOrientationBrief({
    observedAt: "2026-09-01T08:30:00.000Z",
    coverage: {
      sourceId: "google-calendar",
      state: "bounded_complete_request",
      windowStart: weekly.windowStart,
      windowEnd: weekly.windowEnd,
      observedAt: weekly.observedAt,
    },
    today: {
      period: "today",
      windowStart: "2026-08-31T14:00:00.000Z",
      windowEnd: "2026-09-01T14:00:00.000Z",
      timedCommitments: [{
        title: "JARVIS review",
        start: "2026-08-31T23:00:00.000Z",
        end: "2026-09-01T00:00:00.000Z",
        calendarName: "primary",
      }],
    },
    weeklyAllocation: weekly,
  })!;
}

describe("renderMorningExecutiveOrientationBrief", () => {
  it("renders fixed factual prose from the validated publication", () => {
    expect(renderMorningExecutiveOrientationBrief(brief())).toBe([
      "Morning brief",
      "",
      "Today:",
      "- 9:00 AM–10:00 AM — JARVIS review",
      "",
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
      "",
      "Limitations:",
      "- supported change comparison not included.",
      "- priority not assessed.",
      "- schedule adequacy not assessed.",
      "- recommendation not produced.",
      "- remembered context not included.",
      "- cross-source information not included.",
    ].join("\n"));
  });

  it("truthfully renders a complete bounded no-event day", () => {
    const empty = assembleMorningExecutiveOrientationBrief({
      observedAt: "2026-09-01T08:30:00.000Z",
      coverage: brief().coverage,
      today: { ...brief().today, timedCommitments: [] },
      weeklyAllocation: weekly,
    })!;

    expect(renderMorningExecutiveOrientationBrief(empty))
      .toContain("- No timed Calendar commitments in this bounded day window.");
  });

  it("does not introduce priority, adequacy judgment, recommendations, changes or model-style advice", () => {
    const rendered = renderMorningExecutiveOrientationBrief(brief())!;
    expect(rendered).not.toMatch(/top priority|important|urgent|busy|light|good|bad|enough|should|recommendation:|you should|nothing changed/i);
    expect(rendered).toContain("priority not assessed");
    expect(rendered).toContain("schedule adequacy not assessed");
    expect(rendered).toContain("recommendation not produced");
    expect(rendered).toContain("supported change comparison not included");
  });

  it("fails closed if the publication is tampered after assembly", () => {
    const tampered: MorningExecutiveOrientationBrief = {
      ...brief(),
      weeklyCapacity: {
        period: "this_week",
        allocation: {
          ...weekly,
          period: "this_week",
          totalTimedMinutes: 661,
        },
      },
    };

    expect(renderMorningExecutiveOrientationBrief(tampered)).toBeNull();
  });
});
