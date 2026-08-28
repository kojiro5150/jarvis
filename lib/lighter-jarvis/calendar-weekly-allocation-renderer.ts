import type { GovernedWeeklyCalendarAllocationPublication } from "../governed-conversation/calendar-weekly-allocation-publisher";
import type { CalendarTimeMode } from "../connectors/calendar-time-mode";

const MODE_LABELS: Readonly<Record<CalendarTimeMode, string>> = Object.freeze({
  routine: "Routine / Transactional",
  deep_work: "Deep Work / Discovery",
  reflection: "Reflection",
  development: "Development",
  self_care: "Self-Care",
  unclassified: "Unclassified",
});

const MODE_ORDER = Object.freeze([
  "routine",
  "deep_work",
  "reflection",
  "development",
  "self_care",
  "unclassified",
] as const satisfies readonly CalendarTimeMode[]);

function formatMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) throw new Error("weekly allocation minutes are invalid");
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  if (hours === 0) return `${remainder}m`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

function reconciles(publication: GovernedWeeklyCalendarAllocationPublication): boolean {
  const published = Object.values(publication.minutesByMode)
    .reduce((sum, minutes) => sum + minutes, 0)
    + publication.semanticUnavailableMinutes;
  return Math.abs(published - publication.totalTimedMinutes) < 1e-9;
}

/**
 * Deterministically renders only the governed weekly allocation artefact.
 * No model participates and no schedule-quality judgment is introduced.
 */
export function renderGovernedWeeklyCalendarAllocation(
  publication: GovernedWeeklyCalendarAllocationPublication,
): string | null {
  if (publication.publicationType !== "calendar_weekly_time_allocation") return null;
  if (publication.schemaVersion !== "1.0.0") return null;
  if (publication.coverageState !== "bounded_complete_request") return null;
  if (!reconciles(publication)) return null;

  const rows = MODE_ORDER.map(mode =>
    `- ${MODE_LABELS[mode]}: ${formatMinutes(publication.minutesByMode[mode])}`
  );

  if (publication.semanticUnavailableMinutes > 0) {
    rows.push(`- Semantic classification unavailable: ${formatMinutes(publication.semanticUnavailableMinutes)}`);
  }

  const notes: string[] = [];
  if (publication.precedenceTieMinutes > 0) {
    notes.push(
      `${formatMinutes(publication.precedenceTieMinutes)} of Unclassified time comes from equal-duration overlap ties.`
    );
  }
  if (publication.allDayEventCount > 0) {
    notes.push(
      `${publication.allDayEventCount} all-day event${publication.allDayEventCount === 1 ? "" : "s"} excluded from timed allocation.`
    );
  }
  if (publication.invalidEventCount > 0) {
    notes.push(
      `${publication.invalidEventCount} timed event${publication.invalidEventCount === 1 ? "" : "s"} could not be allocated safely.`
    );
  }

  const heading = publication.period === "next_week"
    ? "Next week's resolved Calendar allocation:"
    : "This week's resolved Calendar allocation:";

  return [
    heading,
    ...rows,
    `Resolved occupied timed-event total: ${formatMinutes(publication.totalTimedMinutes)}.`,
    "Coverage: complete for this bounded weekly Calendar read.",
    ...notes,
  ].join("\n");
}
