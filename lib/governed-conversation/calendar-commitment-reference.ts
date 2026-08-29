import type { CalendarEvent } from "../connectors/calendar-event";

export type CalendarCommitmentIdentity = Readonly<{
  commitmentReference: string;
  resourceId: string;
  provenanceReference: string;
}>;

function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSyntheticGoogleEventId(event: CalendarEvent): boolean {
  if (event.id.startsWith("local-")) return true;
  return event.id === `google-${event.calendarId}-${event.id.split("-").at(-1)}`
    && /^google-.+-\d+$/.test(event.id);
}

/**
 * Returns the canonical governed Calendar commitment identity for a real
 * provider-backed Google event. Synthetic/local identities are rejected.
 */
export function calendarCommitmentIdentity(event: CalendarEvent): CalendarCommitmentIdentity | null {
  if (event.source !== "google"
    || !nonempty(event.id)
    || !nonempty(event.calendarId)
    || isSyntheticGoogleEventId(event)) return null;

  const commitmentReference = `google-calendar:calendar:${event.calendarId}:event:${event.id}`;
  const resourceId = `calendar:${event.calendarId}:event:${event.id}`;
  return Object.freeze({
    commitmentReference,
    resourceId,
    provenanceReference: `${commitmentReference}#provenance`,
  });
}
