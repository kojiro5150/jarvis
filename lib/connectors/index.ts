export type { CalendarConnector } from "./calendar";
export { LocalCalendarConnector, getCalendarConnector } from "./calendar";
export type { CalendarEvent, GoogleCalendarMeta } from "./calendar-event";
export { normalizeGoogleEvent, normalizeLocalRecord, dateOfMonth } from "./calendar-event";
export type { GmailConnector } from "./gmail";
export { LocalGmailConnector, getGmailConnector } from "./gmail";
export type { EmailMessage } from "./email-message";
export {
  normalizeGmailMessage,
  normalizeLocalEmailRecord,
  relativeTime,
  sortAndPrioritizeEmails,
} from "./email-message";
export type { DriveConnector } from "./drive";
export { LocalDriveConnector, getDriveConnector } from "./drive";
export type {
  ConnectorSource,
  ConnectorStatus,
  CalendarEventRecord,
  EmailThreadRecord,
  DriveFileRecord,
  CalendarIntelligenceStatus,
  GmailIntelligenceStatus,
  DriveIntelligenceStatus,
} from "./types";

import { getCalendarConnector } from "./calendar";
import { getGmailConnector } from "./gmail";
import { getDriveConnector } from "./drive";
import type { ConnectorSource, ConnectorStatus } from "./types";

/**
 * Status of all three connectors, for a future settings/status view.
 * Not meant to surface in JARVIS's own conversational voice — see
 * DESIGN_CONSTITUTION.md Principle 3 — but useful UI chrome, same
 * category as the existing MEMORY / VOICE INTERFACE panels.
 *
 * Every connector's `connected` flag can be overridden by the caller —
 * buildOperationalState() knows whether the last real Google fetch
 * actually succeeded (this function can't; getXConnector().source only
 * reflects which provider is configured, not whether the most recent
 * live call worked). v43: Drive now takes the same override treatment
 * Calendar/Gmail already had, now that it has a real backend too.
 */
export function getConnectorStatuses(overrides?: {
  calendarConnected?: boolean;
  calendarSource?: ConnectorSource;
  gmailConnected?: boolean;
  gmailSource?: ConnectorSource;
  driveConnected?: boolean;
  driveSource?: ConnectorSource;
}): ConnectorStatus[] {
  const calendarSource = overrides?.calendarSource ?? getCalendarConnector().source;
  const calendarConnected = overrides?.calendarConnected ?? calendarSource !== "local";
  const gmailSource = overrides?.gmailSource ?? getGmailConnector().source;
  const gmailConnected = overrides?.gmailConnected ?? gmailSource !== "local";
  const driveSource = overrides?.driveSource ?? getDriveConnector().source;
  const driveConnected = overrides?.driveConnected ?? driveSource !== "local";

  return [
    { name: "calendar", source: calendarSource, connected: calendarConnected },
    { name: "gmail", source: gmailSource, connected: gmailConnected },
    { name: "drive", source: driveSource, connected: driveConnected },
  ];
}
