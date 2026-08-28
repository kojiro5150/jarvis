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
  precedenceTieMinutes: number;
  totalTimedMinutes: number;
  timedEventCount: number;
  allDayEventCount: number;
  invalidEventCount: number;
}>;

type AllocationCandidate = Readonly<{
  startMs: number;
  endMs: number;
  durationMs: number;
  timeMode?: CalendarTimeMode;
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
 * Resolves observed timed Calendar events into one non-overlapping allocation
 * inside an already-authorised bounded window.
 *
 * "Most specific wins" is a deterministic policy: for every atomic interval
 * created by the event boundaries, the active event with the shortest total
 * event duration receives that slice. Shorter duration is an explicit proxy
 * for specificity, not an inferred universal truth.
 *
 * If two or more active events share the same shortest total duration, the
 * overlapping slice fails closed to "unclassified". A missing timeMode remains
 * semantic unavailability rather than being manufactured into "unclassified".
 *
 * All-day events are reported by count and excluded from minute totals because
 * a date-only event does not evidence a cognitive-capacity duration.
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
  const candidates: AllocationCandidate[] = [];
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

    candidates.push(Object.freeze({
      startMs: clippedStart,
      endMs: clippedEnd,
      durationMs: endMs - startMs,
      timeMode: event.timeMode,
    }));
  }

  const boundaries = [...new Set(candidates.flatMap(candidate => [candidate.startMs, candidate.endMs]))]
    .sort((left, right) => left - right);

  let semanticUnavailableMinutes = 0;
  let precedenceTieMinutes = 0;
  let totalTimedMinutes = 0;

  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const segmentStart = boundaries[index];
    const segmentEnd = boundaries[index + 1];
    if (segmentStart >= segmentEnd) continue;

    const active = candidates.filter(candidate =>
      candidate.startMs < segmentEnd && candidate.endMs > segmentStart
    );
    if (active.length === 0) continue;

    const segmentMinutes = (segmentEnd - segmentStart) / 60_000;
    totalTimedMinutes += segmentMinutes;

    const shortestDuration = Math.min(...active.map(candidate => candidate.durationMs));
    const shortest = active.filter(candidate => candidate.durationMs === shortestDuration);

    if (shortest.length !== 1) {
      minutesByMode.unclassified += segmentMinutes;
      precedenceTieMinutes += segmentMinutes;
      continue;
    }

    const winner = shortest[0];
    if (winner.timeMode === undefined) {
      semanticUnavailableMinutes += segmentMinutes;
    } else {
      minutesByMode[winner.timeMode] += segmentMinutes;
    }
  }

  return Object.freeze({
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    minutesByMode: Object.freeze(minutesByMode),
    semanticUnavailableMinutes,
    precedenceTieMinutes,
    totalTimedMinutes,
    timedEventCount: candidates.length,
    allDayEventCount,
    invalidEventCount,
  });
}
