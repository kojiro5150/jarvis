import type { OperationalCommitment } from "../../../model";
import type { CalendarProjectionEvent } from "./types";

const rfc3339 = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;

function required(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${path} must be a non-empty string`);
  }
}

function timestamp(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || !rfc3339.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${path} must be an RFC 3339 timestamp`);
  }
}

function segment(value: string): string {
  return encodeURIComponent(value);
}

/** Deterministically translates an observed event without interpreting its purpose. */
export function mapCalendarEvent(
  event: CalendarProjectionEvent,
  index: number
): OperationalCommitment {
  if (!event || typeof event !== "object") throw new Error(`events[${index}] must be an object`);
  required(event.id, `events[${index}].id`);
  required(event.calendarId, `events[${index}].calendarId`);
  required(event.title, `events[${index}].title`);
  if (event.source !== "google") throw new Error(`events[${index}].source must be google`);
  timestamp(event.start, `events[${index}].start`);
  timestamp(event.end, `events[${index}].end`);
  if (Date.parse(event.end) < Date.parse(event.start)) {
    throw new Error(`events[${index}].end must not precede start`);
  }
  if (event.status !== undefined && !["confirmed", "tentative", "cancelled"].includes(event.status)) {
    throw new Error(`events[${index}].status has invalid value: ${String(event.status)}`);
  }

  return {
    id: `google-calendar:${segment(event.calendarId)}:${segment(event.id)}`,
    title: event.title,
    kind: "meeting",
    status: event.status === "cancelled" ? "cancelled" : "scheduled",
    roleIds: [],
    projectIds: [],
    startsAt: event.start,
    // The PR1 canonical model has no endsAt field. dueAt is its only bounded
    // commitment timestamp and carries the objectively observed event end.
    dueAt: event.end,
  };
}

export function mapCalendarEvents(
  events: readonly CalendarProjectionEvent[]
): readonly OperationalCommitment[] {
  if (!Array.isArray(events)) throw new Error("calendar connector must return an array");
  const commitments = events.map(mapCalendarEvent);
  const seen = new Set<string>();
  for (const commitment of commitments) {
    if (seen.has(commitment.id)) throw new Error(`duplicate calendar event identifier: ${commitment.id}`);
    seen.add(commitment.id);
  }
  return commitments.sort((left, right) => left.id.localeCompare(right.id));
}
