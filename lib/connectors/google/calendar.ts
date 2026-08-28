import type { CalendarConnector } from "../calendar";
import type { ConnectorSource } from "../types";
import type { CalendarEvent } from "../calendar-event";
import { normalizeGoogleEvent } from "../calendar-event";
import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";
import {
  deriveCalendarAcquisitionCompleteness,
  type CalendarAcquisitionContinuation,
  type CalendarAcquisitionResult,
  type CalendarAcquisitionTargetRecord,
  type CalendarTargetDiscovery,
} from "../calendar-acquisition-completeness";

/**
 * Kept as an alias — this used to be its own class defined here. Now
 * shared across every Google connector (see auth-error.ts) since Calendar
 * and Gmail use the same token store and the same reasons apply to both.
 * Re-exported under this name so existing imports (operational-state.ts)
 * don't need to change.
 */
export { GoogleServiceAuthError as GoogleCalendarAuthError };

const CALENDAR_LIST_URL = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
const CALENDAR_EVENTS_BASE_URL = "https://www.googleapis.com/calendar/v3/calendars";

interface GoogleCalendarListEntry {
  id: string;
  summary?: string;
  backgroundColor?: string;
  hidden?: boolean;
  deleted?: boolean;
}

/**
 * Real Google Calendar connector — implements the same CalendarConnector
 * interface the local connector does, so nothing above this layer (cards,
 * briefing, agent prompts) needs to change. Reads every calendar the
 * account can see (via calendarList.list), not just "primary" — Sam has
 * a personal Gmail calendar and a separate "Governance Engineering"
 * calendar, and JARVIS needs both, merged into one chronological view
 * with each event's calendar identified. Still calendar.readonly only —
 * calendarList.list and events.list on any visible calendar are both
 * covered by that one scope, no re-consent needed.
 */
export class GoogleCalendarConnector implements CalendarConnector {
  readonly source: ConnectorSource = "google";

  /** Discovers every calendar the account can see, skipping ones the person has hidden or deleted from their own list. */
  private async listCalendars(accessToken: string): Promise<GoogleCalendarListEntry[]> {
    const res = await fetch(CALENDAR_LIST_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new GoogleServiceAuthError(
          "refresh_failed",
          "Calendar API rejected the access token (calendarList)."
        );
      }
      throw new Error(`Calendar list request failed: ${res.status}`);
    }

    const json = (await res.json()) as { items?: GoogleCalendarListEntry[] };
    return (json.items ?? []).filter((cal) => !cal.deleted && !cal.hidden);
  }

  /**
   * Events for one calendar. A 401 here means the whole token is bad —
   * that propagates up and triggers a reconnect prompt. Any other
   * failure (a specific shared calendar losing access, a transient 5xx)
   * is caught and logged so one bad calendar doesn't take down the
   * merged view of every other calendar.
   */
  private async listEventsForCalendar(
    accessToken: string,
    calendar: GoogleCalendarListEntry,
    limit: number,
    start: string,
    end: string,
  ): Promise<Readonly<{
    events: readonly CalendarEvent[];
    target: CalendarAcquisitionTargetRecord;
  }>> {
    const params = new URLSearchParams({
      timeMin: start,
      timeMax: end,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: String(limit),
    });

    const url = `${CALENDAR_EVENTS_BASE_URL}/${encodeURIComponent(calendar.id)}/events?${params.toString()}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });

    if (!res.ok) {
      if (res.status === 401) {
        throw new GoogleServiceAuthError(
          "refresh_failed",
          "Calendar API rejected the access token."
        );
      }
      console.warn(
        `[google/calendar] events fetch failed for calendar "${calendar.id}": ${res.status} — skipping this calendar.`
      );
      return Object.freeze({
        events: Object.freeze([]),
        target: Object.freeze({
          calendarId: calendar.id,
          status: "unavailable" as const,
          returnedCount: 0,
          continuation: "unknown" as const,
        }),
      });
    }

    const json = (await res.json()) as {
      items?: Parameters<typeof normalizeGoogleEvent>[0][];
      nextPageToken?: unknown;
    };
    const meta = {
      calendarId: calendar.id,
      calendarName: calendar.summary && calendar.summary.trim().length > 0 ? calendar.summary : calendar.id,
      calendarColor: calendar.backgroundColor,
    };
    const events = Object.freeze(
      (json.items ?? []).map((item, i) => normalizeGoogleEvent(item, i, meta)),
    );
    const continuation: CalendarAcquisitionContinuation =
      typeof json.nextPageToken === "string" && json.nextPageToken.trim() !== ""
        ? "present"
        : json.nextPageToken === undefined
          ? "none"
          : "unknown";

    return Object.freeze({
      events,
      target: Object.freeze({
        calendarId: calendar.id,
        status: continuation === "none" ? "complete" as const : "partial" as const,
        returnedCount: events.length,
        continuation,
      }),
    });
  }

  /**
   * Merges the next 7 days across every accessible calendar into one
   * chronological list. Default behavior is "all accessible calendars" —
   * no calendar-source filter yet (a later, explicitly deferred sprint).
   */
  async listUpcoming(limit = 5): Promise<CalendarEvent[]> {
    const now = new Date();
    return this.listBetween(now.toISOString(), new Date(now.getTime() + 7 * 86_400_000).toISOString(), limit);
  }

  /** Fetches only the caller-authorized half-open interval and preserves retrieval completeness facts. */
  async listBetweenWithCompleteness(start: string, end: string, limit = 5): Promise<CalendarAcquisitionResult> {
    const accessToken = await getValidGoogleAccessToken();
    const calendars = await this.listCalendars(accessToken);
    const observedAt = new Date().toISOString();

    const targetDiscovery: CalendarTargetDiscovery =
      calendars.length > 0 ? "calendar_list" : "primary_fallback";
    const targets: GoogleCalendarListEntry[] =
      calendars.length > 0 ? calendars : [{ id: "primary" }];

    const perCalendar = await Promise.all(
      targets.map((cal) => this.listEventsForCalendar(accessToken, cal, limit, start, end)),
    );

    const merged = perCalendar
      .flatMap(result => [...result.events])
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const mergeTruncated = merged.length > limit;
    const events = Object.freeze(merged.slice(0, limit));
    const targetRecords = Object.freeze(perCalendar.map(result => result.target));
    const completeness = deriveCalendarAcquisitionCompleteness({
      targetDiscovery,
      targets: targetRecords,
      mergeTruncated,
    });

    return Object.freeze({
      events,
      completeness: Object.freeze({
        sourceId: "google-calendar" as const,
        windowStart: start,
        windowEnd: end,
        requestedLimit: limit,
        targetDiscovery,
        targetCount: targets.length,
        targets: targetRecords,
        mergedReturnedCount: events.length,
        mergeTruncated,
        completeness,
        observedAt,
      }),
    });
  }

  /** Compatibility surface for existing Calendar consumers. */
  async listBetween(start: string, end: string, limit = 5): Promise<CalendarEvent[]> {
    return [...(await this.listBetweenWithCompleteness(start, end, limit)).events];
  }
}
