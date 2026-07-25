/**
 * Shared record types for the Calendar / Gmail / Drive connectors.
 *
 * These are deliberately Google-shaped-but-not-Google-specific: the field
 * names describe what JARVIS needs to reason about (a meeting, a thread
 * needing a reply, a recently touched file), not the shape of any one
 * vendor's API response. A future Google-backed connector implementation
 * maps Google's response onto these types; nothing above the connector
 * layer (cards, briefing, agent prompts) needs to know or care that the
 * mapping happened.
 */

/** Where a connector is currently getting its data from. */
export type ConnectorSource = "local" | "google";

export interface CalendarEventRecord {
  day: string;
  date: string;
  title: string;
  time: string;
}

export interface EmailThreadRecord {
  title: string;
  from: string;
  detail: string;
  /** Human-readable, e.g. "3 days" — not a real timestamp yet in Phase 1. */
  waitingSince: string;
}

export interface DriveFileRecord {
  name: string;
  project: string;
  /** Human-readable, e.g. "Yesterday" — not a real timestamp yet in Phase 1. */
  modified: string;
}

/**
 * Every connector reports its own status rather than JARVIS guessing.
 * Consumers (a future settings panel, STEVE's engineering context) can
 * read this; it is NOT meant to surface in JARVIS's own conversational
 * voice — see DESIGN_CONSTITUTION.md Principle 3.
 */
export interface ConnectorStatus {
  name: "calendar" | "gmail" | "drive";
  source: ConnectorSource;
  /** True once a real (non-local) backend is wired up and reachable. */
  connected: boolean;
}

/**
 * The three calendar states the dashboard is allowed to show, in this
 * exact vocabulary — never a raw OAuth error, never implementation detail.
 * "online": Google Calendar connected and the last fetch succeeded.
 * "unavailable": not connected yet (or a non-auth failure), local data in use.
 * "refresh_required": was connected, but the refresh token is no longer
 * valid (revoked/expired) — needs the person to reconnect.
 */
export type CalendarIntelligenceStatus = "online" | "unavailable" | "refresh_required";

/** Same vocabulary, same rules, for Gmail — see CalendarIntelligenceStatus above. */
export type GmailIntelligenceStatus = "online" | "unavailable" | "refresh_required";

/** Same vocabulary, same rules, for Drive (v43) — see CalendarIntelligenceStatus above. */
export type DriveIntelligenceStatus = "online" | "unavailable" | "refresh_required";
