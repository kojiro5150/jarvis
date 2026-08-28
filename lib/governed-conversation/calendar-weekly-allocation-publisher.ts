import type { CalendarTimeAllocation } from "../connectors/calendar-time-allocation";
import type { CalendarTimeMode } from "../connectors/calendar-time-mode";

export const GOVERNED_WEEKLY_CALENDAR_ALLOCATION_POLICY =
  "governed-calendar-weekly-allocation-publication.v1" as const;

export type GovernedWeeklyCalendarAllocationPublication = Readonly<{
  publicationType: "calendar_weekly_time_allocation";
  schemaVersion: "1.0.0";
  policyReference: typeof GOVERNED_WEEKLY_CALENDAR_ALLOCATION_POLICY;
  sourceId: "google-calendar";
  windowStart: string;
  windowEnd: string;
  coverageState: "bounded_complete_request";
  observedAt: string;
  minutesByMode: Readonly<Record<CalendarTimeMode, number>>;
  semanticUnavailableMinutes: number;
  precedenceTieMinutes: number;
  totalTimedMinutes: number;
  timedEventCount: number;
  allDayEventCount: number;
  invalidEventCount: number;
}>;

function publishedResolvedMinutes(allocation: CalendarTimeAllocation): number {
  return Object.values(allocation.minutesByMode)
    .reduce((sum, minutes) => sum + minutes, 0)
    + allocation.semanticUnavailableMinutes;
}

function reconciles(allocation: CalendarTimeAllocation): boolean {
  return Math.abs(publishedResolvedMinutes(allocation) - allocation.totalTimedMinutes) < 1e-9;
}

/**
 * Publishes only a complete bounded weekly allocation.
 *
 * Coverage truth is part of the publication contract: partial, fallback, or
 * unavailable acquisition must never be surfaced as "the week".
 *
 * Arithmetic truth is also enforced here rather than trusted transitively:
 * published mode minutes plus semantic-unavailable minutes must reconcile to
 * Sprint 3.173's resolved occupied timed minutes. precedenceTieMinutes is a
 * diagnostic subset of unclassified minutes and is therefore not added again.
 */
export function publishGovernedWeeklyCalendarAllocation(input: {
  readonly allocation: CalendarTimeAllocation;
  readonly period: "this_week" | string;
  readonly coverageState: "bounded_complete_request" | "bounded_partial_request" | "bounded";
  readonly observedAt: string;
}): GovernedWeeklyCalendarAllocationPublication | null {
  if (input.period !== "this_week") return null;
  if (input.coverageState !== "bounded_complete_request") return null;
  if (!Number.isFinite(Date.parse(input.observedAt))) return null;
  if (!reconciles(input.allocation)) return null;

  return Object.freeze({
    publicationType: "calendar_weekly_time_allocation",
    schemaVersion: "1.0.0",
    policyReference: GOVERNED_WEEKLY_CALENDAR_ALLOCATION_POLICY,
    sourceId: "google-calendar",
    windowStart: input.allocation.windowStart,
    windowEnd: input.allocation.windowEnd,
    coverageState: "bounded_complete_request",
    observedAt: input.observedAt,
    minutesByMode: Object.freeze({ ...input.allocation.minutesByMode }),
    semanticUnavailableMinutes: input.allocation.semanticUnavailableMinutes,
    precedenceTieMinutes: input.allocation.precedenceTieMinutes,
    totalTimedMinutes: input.allocation.totalTimedMinutes,
    timedEventCount: input.allocation.timedEventCount,
    allDayEventCount: input.allocation.allDayEventCount,
    invalidEventCount: input.allocation.invalidEventCount,
  });
}
