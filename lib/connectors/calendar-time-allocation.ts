import type { CalendarEvent } from "./calendar-event";
import type { CalendarTimeMode } from "./calendar-time-mode";

export const WEEKLY_ALLOCATION_MODES = Object.freeze([
  "routine",
  "deep_work",
  "reflection",
  "development",
  "self_care",
  "unclassified",
] as const satisfies readonly CalendarTimeMode[]);

export type CalendarTimeAllocation = Readonly<{
  windowStart: string;
  windowEnd: string;
  minutesByMode: Readonly<Record<CalendarTimeMode, number>>;
  semanticUnavailableMinutes: number;
  totalTimedMinutes: number;
  timedEventCount: number;
  allDayEventCount: number;
  invalidEventCount: number;
}>;

function emptyModeMinutes(): Record<CalendarTimeMode, number> {
  return {
    routine: 0,
    deep_work: 0,
    reflection: 0,
    development: 0,
    self_care: 0,
    unclassified: 0,
  };
}

function isAllDay(event: Pick<CalendarEvent, "start" | "end">): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(event.start)
    && /^\d{4}-\d{2}-\d{2}$/.test(event.end);
}

/**
 * Aggregates observed timed-event duration inside one already-authorised
 * bounded window.
 *
 * This is descriptive scheduled event-duration, not unique occupied wall-clock
 * time: overlapping events are each counted. All-day events are reported by
 * count and excluded from minute totals because a date-only event does not
 * evidence a cognitive-capacity duration.
 *
 * A missing timeMode is kept separate from "unclassified". The former means
 * semantic evidence was unavailable; the latter means classification ran and
 * produced the explicit governed fallback.
 */
export function aggregateCalendarTimeAllocation(input: {
  readonly events: readonly Pick<CalendarEvent, "start" | "end" | "timeMode">[];
  readonly windowStart: string;
  readonly windowEnd: string;
}): CalendarTimeAllocation {
  const windowStartMs = Date.parse(input.windowStart);
  const windowEndMs = Date.parse(input.windowEnd);

  if (!Number.isFinite(windowStartMs) || !Number.isFinite(windowEndMs) || windowStartMs >= windowEndMs) {
    throw new Error("calendar allocation window is invalid");
  }

  const minutesByMode = emptyModeMinutes();
  let semanticUnavailableMinutes = 0;
  let totalTimedMinutes = 0;
  let timedEventCount = 0;
  let allDayEventCount = 0;
  let invalidEventCount = 0;

  for (const event of input.events) {
    if (isAllDay(event)) {
      allDayEventCount += 1;
      continue;
    }

    const startMs = Date.parse(event.start);
    const endMs = Date.parse(event.end);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) {
      invalidEventCount += 1;
      continue;
    }

    const clippedStart = Math.max(startMs, windowStartMs);
    const clippedEnd = Math.min(endMs, windowEndMs);
    if (clippedStart >= clippedEnd) continue;

    const minutes = (clippedEnd - clippedStart) / 60_000;
    timedEventCount += 1;
    totalTimedMinutes += minutes;

    if (event.timeMode === undefined) {
      semanticUnavailableMinutes += minutes;
    } else {
      minutesByMode[event.timeMode] += minutes;
    }
  }

  return Object.freeze({
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    minutesByMode: Object.freeze(minutesByMode),
    semanticUnavailableMinutes,
    totalTimedMinutes,
    timedEventCount,
    allDayEventCount,
    invalidEventCount,
  });
}
