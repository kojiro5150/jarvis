import type { CalendarEvent } from "../connectors/calendar-event";

export type GovernedCalendarFactualEvent = Readonly<{
  title: string;
  start: string;
  end: string;
  calendarName: string;
}>;

function isTimedEvent(event: CalendarEvent): boolean {
  return Number.isFinite(Date.parse(event.start)) && Number.isFinite(Date.parse(event.end))
    && /(?:Z|[+-]\d{2}:\d{2})$/.test(event.start)
    && /(?:Z|[+-]\d{2}:\d{2})$/.test(event.end);
}

/**
 * Closed server-owned factual projection. Title is allowed here for deterministic
 * selection/presentation only. No provider object is retained or spread upward.
 */
export function publishCalendarFactualEvidence(events: readonly CalendarEvent[]): readonly GovernedCalendarFactualEvent[] {
  return Object.freeze(events.flatMap(event => {
    if (!isTimedEvent(event) || typeof event.title !== "string" || !event.title.trim()) return [];
    return [Object.freeze({
      title: event.title,
      start: event.start,
      end: event.end,
      calendarName: event.calendarName,
    })];
  }));
}