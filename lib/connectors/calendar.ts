import { readMemory } from "@/lib/memory/store";
import type { ConnectorSource } from "./types";
import type { CalendarEvent } from "./calendar-event";
import { normalizeLocalRecord } from "./calendar-event";
import { GoogleCalendarConnector } from "./google/calendar";
import { hasStoredGoogleTokens } from "./google/tokens";

/**
 * What JARVIS needs from "a calendar," independent of whose calendar it
 * actually is. Every implementation returns the canonical CalendarEvent
 * shape (lib/connectors/calendar-event.ts) — normalized at the source, so
 * nothing downstream (OperationalState, cards, briefing) ever has to
 * branch on which provider an event came from.
 */
export interface CalendarConnector {
  readonly source: ConnectorSource;
  listUpcoming(limit?: number): Promise<CalendarEvent[]>;
}

/** Reads from the local JSON memory store. Always available, no auth required. */
export class LocalCalendarConnector implements CalendarConnector {
  readonly source: ConnectorSource = "local";

  async listUpcoming(limit = 5): Promise<CalendarEvent[]> {
    const memory = await readMemory();
    return memory.calendar.slice(0, limit).map(normalizeLocalRecord);
  }
}

/**
 * Factory — swap providers with the CALENDAR_CONNECTOR env var:
 *   - "local"  — always the local JSON memory store.
 *   - "google" — always GoogleCalendarConnector (will surface an auth
 *     error from listUpcoming() if not actually connected yet).
 *   - unset (default, "auto") — Google once connected via
 *     /api/auth/google/start, local until then. This is what lets
 *     "Connect Calendar" work with no env changes: OAuth once, and the
 *     factory picks Google up automatically on the next request.
 */
export function getCalendarConnector(): CalendarConnector {
  const provider = process.env.CALENDAR_CONNECTOR;
  if (provider === "local") return new LocalCalendarConnector();
  if (provider === "google") return new GoogleCalendarConnector();
  return hasStoredGoogleTokens() ? new GoogleCalendarConnector() : new LocalCalendarConnector();
}
