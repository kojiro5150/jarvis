import type { MorningExecutiveOrientationBrief, MorningExecutiveOrientationLimitation } from "../governed-conversation/morning-executive-orientation-contract";
import { assembleMorningExecutiveOrientationBrief } from "../governed-conversation/morning-executive-orientation-assembler";
import { renderGovernedWeeklyCalendarAllocation } from "./calendar-weekly-allocation-renderer";

const MELBOURNE_ZONE = "Australia/Melbourne";

const timeFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: MELBOURNE_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const LIMITATION_LABELS: Readonly<Record<MorningExecutiveOrientationLimitation, string>> = Object.freeze({
  supported_change_comparison_not_included: "supported change comparison not included",
  priority_not_assessed: "priority not assessed",
  schedule_adequacy_not_assessed: "schedule adequacy not assessed",
  recommendation_not_produced: "recommendation not produced",
  continuity_not_included: "remembered context not included",
  cross_source_synthesis_not_included: "cross-source information not included",
});

const upperMeridiem = (value: string): string =>
  value.replace(/\b(am|pm)\b/gi, match => match.toUpperCase());

function formatTime(value: string): string {
  return upperMeridiem(timeFormatter.format(new Date(value)));
}

function revalidate(brief: MorningExecutiveOrientationBrief): MorningExecutiveOrientationBrief | null {
  return assembleMorningExecutiveOrientationBrief({
    observedAt: brief.observedAt,
    coverage: brief.coverage,
    today: brief.today,
    weeklyAllocation: brief.weeklyCapacity.allocation,
  });
}

/**
 * Fixed deterministic factual rendering for Morning Executive Orientation v1.
 * No model participates and no priority, adequacy, recommendation or change
 * claim is introduced.
 */
export function renderMorningExecutiveOrientationBrief(
  brief: MorningExecutiveOrientationBrief,
): string | null {
  const validated = revalidate(brief);
  if (!validated) return null;

  const weekly = renderGovernedWeeklyCalendarAllocation(validated.weeklyCapacity.allocation);
  if (!weekly) return null;

  const todayRows = validated.today.timedCommitments.length > 0
    ? validated.today.timedCommitments.map(event =>
      `- ${formatTime(event.start)}–${formatTime(event.end)} — ${event.title}`
    )
    : ["- No timed Calendar commitments in this bounded day window."];

  return [
    "Morning brief",
    "",
    "Today:",
    ...todayRows,
    "",
    weekly,
    "",
    "Limitations:",
    ...validated.limitations.map(limitation => `- ${LIMITATION_LABELS[limitation]}.`),
  ].join("\n");
}
