import type { GovernedCalendarFactualEvent } from "./calendar-factual-evidence";
import type { GovernedWeeklyCalendarAllocationPublication } from "./calendar-weekly-allocation-publisher";

export const MORNING_EXECUTIVE_ORIENTATION_KIND = "morning_executive_orientation_brief" as const;
export const MORNING_EXECUTIVE_ORIENTATION_SCHEMA_VERSION = "1.0.0" as const;
export const MORNING_EXECUTIVE_ORIENTATION_SEMANTICS = "factual_orientation_not_priority_or_advice" as const;
export const MORNING_EXECUTIVE_ORIENTATION_TIME_ZONE = "Australia/Melbourne" as const;

export type MorningExecutiveOrientationCoverage = Readonly<{
  sourceId: "google-calendar";
  state: "bounded_complete_request";
  windowStart: string;
  windowEnd: string;
  observedAt: string;
}>;

export type MorningExecutiveOrientationToday = Readonly<{
  period: "today";
  windowStart: string;
  windowEnd: string;
  timedCommitments: readonly GovernedCalendarFactualEvent[];
}>;

export type MorningExecutiveOrientationWeeklyCapacity = Readonly<{
  period: "this_week";
  allocation: GovernedWeeklyCalendarAllocationPublication & Readonly<{ period: "this_week" }>;
}>;

/**
 * Closed Level-1 publication contract for the first Morning Executive Orientation capability.
 *
 * This type intentionally contains factual Calendar orientation only. It has no
 * priority, urgency, adequacy, recommendation, advice, continuity, Gmail, Drive,
 * action, or model-authored narrative slot.
 *
 * Construction/validation belongs to Sprint 3.186B. Production acquisition,
 * authority and chat wiring belong to later bounded milestones.
 */
export type MorningExecutiveOrientationBrief = Readonly<{
  kind: typeof MORNING_EXECUTIVE_ORIENTATION_KIND;
  schemaVersion: typeof MORNING_EXECUTIVE_ORIENTATION_SCHEMA_VERSION;
  semantics: typeof MORNING_EXECUTIVE_ORIENTATION_SEMANTICS;
  observedAt: string;
  timeZone: typeof MORNING_EXECUTIVE_ORIENTATION_TIME_ZONE;
  coverage: MorningExecutiveOrientationCoverage;
  today: MorningExecutiveOrientationToday;
  weeklyCapacity: MorningExecutiveOrientationWeeklyCapacity;
  limitations: readonly MorningExecutiveOrientationLimitation[];
}>;

export type MorningExecutiveOrientationLimitation =
  | "supported_change_comparison_not_included"
  | "priority_not_assessed"
  | "schedule_adequacy_not_assessed"
  | "recommendation_not_produced"
  | "continuity_not_included"
  | "cross_source_synthesis_not_included";
