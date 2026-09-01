import type { ScopedCalendarEvidenceResult } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import { assembleMorningExecutiveOrientationBrief } from "../governed-conversation/morning-executive-orientation-assembler";
import type { MorningExecutiveOrientationBrief } from "../governed-conversation/morning-executive-orientation-contract";
import type { CalendarReadWindow } from "./calendar-read-window";

/**
 * Composes the already-governed outputs of one complete weekly Calendar read
 * into the closed Morning Executive Orientation v1 publication.
 *
 * This function performs no acquisition, authority evaluation, model work,
 * attention comparison, continuity retrieval, recommendation or action.
 */
export function composeProductionMorningExecutiveOrientation(input: {
  readonly evidence: ScopedCalendarEvidenceResult;
  readonly weeklyWindow: CalendarReadWindow;
  readonly todayWindow: CalendarReadWindow;
}): MorningExecutiveOrientationBrief | null {
  if (input.weeklyWindow.period !== "this_week") return null;
  if (input.todayWindow.period !== "today") return null;
  if (input.weeklyWindow.timeZone !== "Australia/Melbourne") return null;
  if (input.todayWindow.timeZone !== "Australia/Melbourne") return null;
  if (input.evidence.status !== "available") return null;
  if (input.evidence.coverageState !== "bounded_complete_request") return null;
  if (!input.evidence.observedAt) return null;
  if (!input.evidence.weeklyAllocation) return null;
  if (!input.evidence.factualEvents) return null;

  const timedCommitments = Object.freeze(input.evidence.factualEvents.filter(event =>
    Date.parse(event.end) > Date.parse(input.todayWindow.start)
    && Date.parse(event.start) < Date.parse(input.todayWindow.end)
  ));

  return assembleMorningExecutiveOrientationBrief({
    observedAt: input.evidence.observedAt,
    coverage: {
      sourceId: "google-calendar",
      state: "bounded_complete_request",
      windowStart: input.weeklyWindow.start,
      windowEnd: input.weeklyWindow.end,
      observedAt: input.evidence.observedAt,
    },
    today: {
      period: "today",
      windowStart: input.todayWindow.start,
      windowEnd: input.todayWindow.end,
      timedCommitments,
    },
    weeklyAllocation: input.evidence.weeklyAllocation,
  });
}