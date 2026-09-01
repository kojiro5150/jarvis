import {
  MORNING_EXECUTIVE_ORIENTATION_KIND,
  MORNING_EXECUTIVE_ORIENTATION_SCHEMA_VERSION,
  MORNING_EXECUTIVE_ORIENTATION_SEMANTICS,
  MORNING_EXECUTIVE_ORIENTATION_TIME_ZONE,
  type MorningExecutiveOrientationBrief,
  type MorningExecutiveOrientationCoverage,
  type MorningExecutiveOrientationLimitation,
  type MorningExecutiveOrientationToday,
} from "./morning-executive-orientation-contract";
import {
  GOVERNED_WEEKLY_CALENDAR_ALLOCATION_POLICY,
  type GovernedWeeklyCalendarAllocationPublication,
} from "./calendar-weekly-allocation-publisher";

export const MORNING_EXECUTIVE_ORIENTATION_V1_LIMITATIONS =
  Object.freeze([
    "supported_change_comparison_not_included",
    "priority_not_assessed",
    "schedule_adequacy_not_assessed",
    "recommendation_not_produced",
    "continuity_not_included",
    "cross_source_synthesis_not_included",
  ] as const satisfies readonly MorningExecutiveOrientationLimitation[]);

export type MorningExecutiveOrientationAssemblyInput = Readonly<{
  observedAt: string;
  coverage: MorningExecutiveOrientationCoverage;
  today: MorningExecutiveOrientationToday;
  weeklyAllocation: GovernedWeeklyCalendarAllocationPublication;
}>;

function isTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value))
    && /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
}

function isWindow(start: string, end: string): boolean {
  return isTimestamp(start) && isTimestamp(end) && Date.parse(start) < Date.parse(end);
}

function weeklyArithmeticReconciles(publication: GovernedWeeklyCalendarAllocationPublication): boolean {
  const values = Object.values(publication.minutesByMode);
  if (values.some(minutes => !Number.isFinite(minutes) || minutes < 0)) return false;
  if (!Number.isFinite(publication.semanticUnavailableMinutes) || publication.semanticUnavailableMinutes < 0) return false;
  if (!Number.isFinite(publication.precedenceTieMinutes) || publication.precedenceTieMinutes < 0) return false;
  if (!Number.isFinite(publication.totalTimedMinutes) || publication.totalTimedMinutes < 0) return false;
  if (publication.precedenceTieMinutes > publication.minutesByMode.unclassified) return false;

  const resolved = values.reduce((sum, minutes) => sum + minutes, 0)
    + publication.semanticUnavailableMinutes;
  return Math.abs(resolved - publication.totalTimedMinutes) < 1e-9;
}

function validCount(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

function validWeeklyPublication(
  publication: GovernedWeeklyCalendarAllocationPublication,
  observedAt: string,
  coverage: MorningExecutiveOrientationCoverage,
): publication is GovernedWeeklyCalendarAllocationPublication & Readonly<{ period: "this_week" }> {
  if (publication.publicationType !== "calendar_weekly_time_allocation") return false;
  if (publication.schemaVersion !== "1.0.0") return false;
  if (publication.policyReference !== GOVERNED_WEEKLY_CALENDAR_ALLOCATION_POLICY) return false;
  if (publication.sourceId !== "google-calendar") return false;
  if (publication.period !== "this_week") return false;
  if (publication.coverageState !== "bounded_complete_request") return false;
  if (!isWindow(publication.windowStart, publication.windowEnd)) return false;
  if (!isTimestamp(publication.observedAt) || publication.observedAt !== observedAt) return false;
  if (publication.windowStart !== coverage.windowStart || publication.windowEnd !== coverage.windowEnd) return false;
  if (!weeklyArithmeticReconciles(publication)) return false;
  if (!validCount(publication.timedEventCount)) return false;
  if (!validCount(publication.allDayEventCount)) return false;
  if (!validCount(publication.invalidEventCount)) return false;
  return true;
}

function validCoverage(coverage: MorningExecutiveOrientationCoverage, observedAt: string): boolean {
  return coverage.sourceId === "google-calendar"
    && coverage.state === "bounded_complete_request"
    && isWindow(coverage.windowStart, coverage.windowEnd)
    && isTimestamp(coverage.observedAt)
    && coverage.observedAt === observedAt;
}

function validToday(
  today: MorningExecutiveOrientationToday,
  coverage: MorningExecutiveOrientationCoverage,
): boolean {
  if (today.period !== "today") return false;
  if (!isWindow(today.windowStart, today.windowEnd)) return false;
  if (Date.parse(today.windowStart) < Date.parse(coverage.windowStart)) return false;
  if (Date.parse(today.windowEnd) > Date.parse(coverage.windowEnd)) return false;

  return today.timedCommitments.every(event => {
    if (typeof event.title !== "string" || !event.title.trim()) return false;
    if (typeof event.calendarName !== "string" || !event.calendarName.trim()) return false;
    if (!isWindow(event.start, event.end)) return false;
    return Date.parse(event.end) > Date.parse(today.windowStart)
      && Date.parse(event.start) < Date.parse(today.windowEnd);
  });
}

function chronologicalToday(today: MorningExecutiveOrientationToday): MorningExecutiveOrientationToday {
  const timedCommitments = Object.freeze([...today.timedCommitments]
    .sort((left, right) => {
      const byStart = Date.parse(left.start) - Date.parse(right.start);
      if (byStart !== 0) return byStart;
      const byEnd = Date.parse(left.end) - Date.parse(right.end);
      if (byEnd !== 0) return byEnd;
      return left.title.localeCompare(right.title);
    })
    .map(event => Object.freeze({
      title: event.title,
      start: event.start,
      end: event.end,
      calendarName: event.calendarName,
    })));

  return Object.freeze({
    period: "today",
    windowStart: today.windowStart,
    windowEnd: today.windowEnd,
    timedCommitments,
  });
}

/**
 * Constructs only the closed Morning Executive Orientation v1 publication.
 *
 * Inputs must already be governed factual/weekly publications. This function
 * does no provider acquisition, authority work, model reasoning, continuity
 * retrieval, attention comparison, recommendation or action.
 */
export function assembleMorningExecutiveOrientationBrief(
  input: MorningExecutiveOrientationAssemblyInput,
): MorningExecutiveOrientationBrief | null {
  if (!isTimestamp(input.observedAt)) return null;
  if (!validCoverage(input.coverage, input.observedAt)) return null;
  if (!validToday(input.today, input.coverage)) return null;
  if (!validWeeklyPublication(input.weeklyAllocation, input.observedAt, input.coverage)) return null;

  const today = chronologicalToday(input.today);

  return Object.freeze({
    kind: MORNING_EXECUTIVE_ORIENTATION_KIND,
    schemaVersion: MORNING_EXECUTIVE_ORIENTATION_SCHEMA_VERSION,
    semantics: MORNING_EXECUTIVE_ORIENTATION_SEMANTICS,
    observedAt: input.observedAt,
    timeZone: MORNING_EXECUTIVE_ORIENTATION_TIME_ZONE,
    coverage: Object.freeze({ ...input.coverage }),
    today,
    weeklyCapacity: Object.freeze({
      period: "this_week",
      allocation: input.weeklyAllocation,
    }),
    limitations: MORNING_EXECUTIVE_ORIENTATION_V1_LIMITATIONS,
  });
}
