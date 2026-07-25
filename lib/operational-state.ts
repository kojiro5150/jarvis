import { readMemory } from "./memory/store";
import {
  getCalendarConnector,
  getGmailConnector,
  getDriveConnector,
  getConnectorStatuses,
} from "./connectors";
import { LocalCalendarConnector } from "./connectors/calendar";
import { LocalGmailConnector } from "./connectors/gmail";
import { LocalDriveConnector } from "./connectors/drive";
import { GoogleServiceAuthError } from "./connectors/google/auth-error";
import { hasStoredGoogleTokens } from "./connectors/google/tokens";
import type { Priority, ProjectStatus, Signal } from "./memory/schema";
import type { CalendarEvent } from "./connectors/calendar-event";
import type { EmailMessage } from "./connectors/email-message";
import type {
  DriveFileRecord,
  ConnectorStatus,
  CalendarIntelligenceStatus,
  GmailIntelligenceStatus,
  DriveIntelligenceStatus,
} from "./connectors/types";

/**
 * The one operational reality inside JARVIS.
 *
 * Every consumer — dashboard cards, JARVIS's opening briefing, and every
 * conversational agent via /api/chat — reads from THIS object, built by
 * buildOperationalState() below. Nothing upstream (a card, an agent
 * prompt, a Claude call) is allowed to independently re-derive or infer
 * priorities/projects/signals/schedule; they receive this as structured
 * context and reason from it. See lib/context-builder.ts for how this
 * gets turned into text injected before every Claude call, and
 * DESIGN_CONSTITUTION.md / Sprint 2.4 notes for why this file exists.
 *
 * `OperationalState` only imports *types* from memory/schema and
 * connectors/types (no fs), so it's safe to import client-side with
 * `import type` — only `buildOperationalState()` itself touches the
 * filesystem, and that must stay server-only (API routes).
 */
export interface OperationalState {
  priorities: Priority[];
  projects: ProjectStatus[];
  signals: Signal[];
  /** Signals that represent something actively blocking progress — see deriveBlockers(). */
  blockers: Signal[];
  /** Upcoming commitments — canonical shape, same regardless of connector. */
  calendar: CalendarEvent[];
  /**
   * Exactly the three states the dashboard is allowed to show, computed
   * fresh on every buildOperationalState() call — never a raw OAuth
   * error. See CalendarIntelligenceStatus in connectors/types.ts.
   */
  calendarStatus: CalendarIntelligenceStatus;
  /** Merged, prioritized communications — canonical shape, same regardless of connector or which mailbox it came from. */
  gmailThreads: EmailMessage[];
  /** Same vocabulary/rules as calendarStatus, for Gmail. */
  gmailStatus: GmailIntelligenceStatus;
  driveFiles: DriveFileRecord[];
  /** Same vocabulary/rules as calendarStatus, for Drive (v43). */
  driveStatus: DriveIntelligenceStatus;
  connectorStatuses: ConnectorStatus[];
  updatedAt: string;
}

/**
 * A blocker, here, is a signal that represents pressure on progress rather
 * than something merely informational: deadline pressure or a sequencing
 * conflict. "action" (needs a reply) and "research" (fyi) signals aren't
 * blockers in this sense — they're worth surfacing but nothing is stuck.
 */
function deriveBlockers(signals: Signal[]): Signal[] {
  return signals.filter((s) => s.kind === "deadline" || s.kind === "note");
}

/**
 * Resolves calendar data and status together, with a hard guarantee: this
 * never throws. A Google failure (not connected, expired refresh token,
 * a transient API error) always falls back to the local calendar so the
 * rest of the dashboard keeps working — the failure is only ever
 * reflected in `status`, using the three permitted UI states, never a
 * raw error message.
 */
async function loadCalendar(): Promise<{
  events: CalendarEvent[];
  status: CalendarIntelligenceStatus;
}> {
  const connector = getCalendarConnector();

  if (connector.source === "local") {
    // Never connected (or explicitly forced local) — not a failure, just the default state.
    return { events: await connector.listUpcoming(5), status: "unavailable" };
  }

  try {
    const events = await connector.listUpcoming(5);
    return { events, status: "online" };
  } catch (err) {
    const status: CalendarIntelligenceStatus =
      err instanceof GoogleServiceAuthError && err.reason === "refresh_failed"
        ? "refresh_required"
        : "unavailable";
    console.warn("[operational-state] Google Calendar fetch failed, falling back to local:", err);
    const events = await new LocalCalendarConnector().listUpcoming(5);
    return { events, status };
  }
}

/**
 * Same guarantee as loadCalendar(): never throws. A Google failure of
 * any kind (never connected, missing gmail.readonly scope, expired
 * refresh token, a transient API error) always falls back to local
 * communications data.
 */
async function loadGmail(): Promise<{
  messages: EmailMessage[];
  status: GmailIntelligenceStatus;
}> {
  const connector = getGmailConnector();

  if (connector.source === "local") {
    return { messages: await connector.listRecent(5), status: "unavailable" };
  }

  try {
    const messages = await connector.listRecent(5);
    return { messages, status: "online" };
  } catch (err) {
    const status: GmailIntelligenceStatus =
      err instanceof GoogleServiceAuthError && err.reason === "refresh_failed"
        ? "refresh_required"
        : "unavailable";
    console.warn("[operational-state] Gmail fetch failed, falling back to local:", err);
    const messages = await new LocalGmailConnector().listRecent(5);
    return { messages, status };
  }
}

/**
 * v43. Same guarantee as loadCalendar()/loadGmail(): never throws. A
 * Google failure of any kind (never connected, missing
 * drive.metadata.readonly scope, expired refresh token, a transient API
 * error) always falls back to local Drive activity data.
 */
async function loadDrive(): Promise<{
  files: DriveFileRecord[];
  status: DriveIntelligenceStatus;
}> {
  const connector = getDriveConnector();

  if (connector.source === "local") {
    return { files: await connector.listRecentActivity(5), status: "unavailable" };
  }

  try {
    const files = await connector.listRecentActivity(5);
    return { files, status: "online" };
  } catch (err) {
    const status: DriveIntelligenceStatus =
      err instanceof GoogleServiceAuthError && err.reason === "refresh_failed" ? "refresh_required" : "unavailable";
    console.warn("[operational-state] Google Drive fetch failed, falling back to local:", err);
    const files = await new LocalDriveConnector().listRecentActivity(5);
    return { files, status };
  }
}

/**
 * The single builder of executive context. Server-only (reads the local
 * memory store and calls all three connectors). Called fresh on every
 * request — no caching — so editing memory.json and reloading always
 * reflects immediately everywhere, with no code changes required
 * (Sprint 2.4 acceptance scenario 2).
 */
export async function buildOperationalState(): Promise<OperationalState> {
  const [
    memory,
    { events: calendar, status: calendarStatus },
    { messages: gmailThreads, status: gmailStatus },
    { files: driveFiles, status: driveStatus },
  ] = await Promise.all([readMemory(), loadCalendar(), loadGmail(), loadDrive()]);

  return {
    priorities: memory.priorities,
    projects: memory.projects,
    signals: memory.signals,
    blockers: deriveBlockers(memory.signals),
    calendar,
    calendarStatus,
    gmailThreads,
    gmailStatus,
    driveFiles,
    driveStatus,
    connectorStatuses: getConnectorStatuses({
      calendarConnected: calendarStatus === "online",
      calendarSource: hasStoredGoogleTokens() ? "google" : "local",
      gmailConnected: gmailStatus === "online",
      gmailSource: hasStoredGoogleTokens() ? "google" : "local",
      driveConnected: driveStatus === "online",
      driveSource: hasStoredGoogleTokens() ? "google" : "local",
    }),
    updatedAt: memory.updatedAt,
  };
}
