import type { CalendarEvent } from "../connectors/calendar-event";
import type { CalendarTimeMode } from "../connectors/calendar-time-mode";
import { calendarCommitmentIdentity } from "./calendar-commitment-reference";

export type GovernedCalendarConflictEvent = Readonly<{
  commitmentReference: string;
  title: string;
  start: string;
  end: string;
  calendarName: string;
  timeMode: CalendarTimeMode | null;
  selfAttendeeResponse: CalendarEvent["selfAttendeeResponse"] | null;
  observedAt: string;
  provenanceReference: string;
}>;

export type GovernedCalendarConflictObservation = Readonly<{
  observedAt: string;
  first: GovernedCalendarConflictEvent;
  second: GovernedCalendarConflictEvent;
  overlapStart: string;
  overlapEnd: string;
  overlapMinutes: number;
}>;

function isOffsetTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value)) && /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
}

function publishEvent(event: CalendarEvent, observedAt: string): GovernedCalendarConflictEvent | null {
  const identity = calendarCommitmentIdentity(event);
  if (!identity || !event.title.trim() || !event.calendarName.trim()) return null;
  if (!isOffsetTimestamp(event.start) || !isOffsetTimestamp(event.end) || !isOffsetTimestamp(observedAt)) return null;
  if (Date.parse(event.end) <= Date.parse(event.start)) return null;

  return Object.freeze({
    commitmentReference: identity.commitmentReference,
    title: event.title,
    start: event.start,
    end: event.end,
    calendarName: event.calendarName,
    // Never infer mode from title, calendar or color. Preserve only a mode
    // already established by the existing governed label-to-mode path.
    timeMode: event.timeMode ?? null,
    selfAttendeeResponse: event.selfAttendeeResponse ?? null,
    observedAt: new Date(observedAt).toISOString(),
    provenanceReference: identity.provenanceReference,
  });
}

/**
 * Publishes only the minimum current Calendar fields required by Golden
 * Scenario 001's deterministic overlap proof.
 *
 * This function does not decide that an event is important, protected, new,
 * an invitation, or in conflict. It only creates a closed factual projection.
 */
export function publishCalendarConflictEvent(
  event: CalendarEvent,
  observedAt: string,
): GovernedCalendarConflictEvent | null {
  return publishEvent(event, observedAt);
}

/**
 * Deterministically observes a positive temporal overlap between two governed
 * Calendar events. No title semantics, attention policy, model inference,
 * recommendation or authority is involved.
 */
export function observeCalendarConflict(input: {
  readonly first: GovernedCalendarConflictEvent;
  readonly second: GovernedCalendarConflictEvent;
  readonly observedAt: string;
}): GovernedCalendarConflictObservation | null {
  if (input.first.commitmentReference === input.second.commitmentReference) return null;
  if (!isOffsetTimestamp(input.observedAt)) return null;

  const firstStart = Date.parse(input.first.start);
  const firstEnd = Date.parse(input.first.end);
  const secondStart = Date.parse(input.second.start);
  const secondEnd = Date.parse(input.second.end);

  if (![firstStart, firstEnd, secondStart, secondEnd].every(Number.isFinite)) return null;

  const overlapStartMs = Math.max(firstStart, secondStart);
  const overlapEndMs = Math.min(firstEnd, secondEnd);
  if (overlapEndMs <= overlapStartMs) return null;

  const overlapMinutes = (overlapEndMs - overlapStartMs) / 60_000;
  if (!Number.isFinite(overlapMinutes) || overlapMinutes <= 0) return null;

  return Object.freeze({
    observedAt: new Date(input.observedAt).toISOString(),
    first: input.first,
    second: input.second,
    overlapStart: new Date(overlapStartMs).toISOString(),
    overlapEnd: new Date(overlapEndMs).toISOString(),
    overlapMinutes,
  });
}
