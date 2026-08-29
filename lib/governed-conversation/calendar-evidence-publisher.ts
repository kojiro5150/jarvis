import type { CalendarEvent } from "../connectors/calendar-event";
import type { GovernedCalendarEvidenceInput } from "./projection-composer";

export const CALENDAR_CONVERSATIONAL_DISCLOSURE_POLICY = "governed-calendar-conversational-metadata-disclosure.v1";
export interface GovernedCalendarPublicationInput {
  readonly sourceId: "google-calendar"; readonly availability: "available" | "unavailable"; readonly retrievedAt: string;
  readonly windowStart: string; readonly windowEnd: string; readonly requestedLimit: number;
  readonly coverageState: "bounded_complete_request" | "bounded_partial_request" | "bounded"; readonly events: readonly CalendarEvent[];
}
const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const timestamp = (value: unknown): value is string => nonempty(value) && Number.isFinite(Date.parse(value));
export function calendarTimezone(start: string): string | undefined {
  if (/^\d{4}-\d{2}-\d{2}$/.test(start)) return "floating-date";
  return start.match(/(Z|[+-]\d{2}:\d{2})$/)?.[1];
}
export function publishCalendarEvidence(input: GovernedCalendarPublicationInput): readonly GovernedCalendarEvidenceInput[] {
  if (input.sourceId !== "google-calendar" || input.availability !== "available" || !timestamp(input.retrievedAt) ||
      !nonempty(input.windowStart) || !nonempty(input.windowEnd) || !Number.isInteger(input.requestedLimit) || input.requestedLimit < 0) return Object.freeze([]);
  const coverageLimit = `window=${input.windowStart}/${input.windowEnd};max_events=${input.requestedLimit};scope=visible_non_hidden_calendars;completeness=${input.coverageState}`;
  return Object.freeze(input.events.flatMap(event => {
    const timezone = nonempty(event.start) ? calendarTimezone(event.start) : undefined;
    const synthetic = event.id.startsWith("local-") || event.id === `google-${event.calendarId}-${event.id.split("-").at(-1)}` && /^google-.+-\d+$/.test(event.id);
    if (event.source !== "google" || !nonempty(event.id) || synthetic || !nonempty(event.calendarId) || !timezone || !nonempty(event.end)) return [];
    const commitmentReference = `google-calendar:calendar:${event.calendarId}:event:${event.id}`;
    return [Object.freeze({ commitmentReference, sourceReference: Object.freeze({ sourceId: "google-calendar", resourceId: `calendar:${event.calendarId}:event:${event.id}`, field: "schedule_interval", observedAt: input.retrievedAt }), start: event.start, end: event.end, timezone, provenanceReference: `${commitmentReference}#provenance`, available: true, coverageLimit, policyReference: CALENDAR_CONVERSATIONAL_DISCLOSURE_POLICY })];
  }));
}
