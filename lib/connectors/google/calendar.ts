import type { CalendarConnector } from "../calendar";
import type { ConnectorSource } from "../types";
import type { CalendarEvent } from "../calendar-event";
import { normalizeGoogleEvent } from "../calendar-event";
import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";

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
    limit: number
  ): Promise<CalendarEvent[]> {
    const now = new Date();
    const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      timeMin: now.toISOString(),
      timeMax: sevenDaysOut.toISOString(),
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
      return [];
    }

    const json = (await res.json()) as {
      items?: Parameters<typeof normalizeGoogleEvent>[0][];
    };
    const meta = {
      calendarId: calendar.id,
      calendarName: calendar.summary && calendar.summary.trim().length > 0 ? calendar.summary : calendar.id,
      calendarColor: calendar.backgroundColor,
    };
    return (json.items ?? []).map((item, i) => normalizeGoogleEvent(item, i, meta));
  }

  /**
   * Merges the next 7 days across every accessible calendar into one
   * chronological list. Default behavior is "all accessible calendars" —
   * no calendar-source filter yet (a later, explicitly deferred sprint).
   */
  async listUpcoming(limit = 5): Promise<CalendarEvent[]> {
    const accessToken = await getValidGoogleAccessToken();
    const calendars = await this.listCalendars(accessToken);

    // An empty (non-hidden) calendarList is unusual but not impossible —
    // fall back to "primary" so a fresh connection still shows something.
    const targets: GoogleCalendarListEntry[] =
      calendars.length > 0 ? calendars : [{ id: "primary" }];

    const perCalendar = await Promise.all(
      targets.map((cal) => this.listEventsForCalendar(accessToken, cal, limit))
    );

    return perCalendar
      .flat()
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, limit);
  }
}
