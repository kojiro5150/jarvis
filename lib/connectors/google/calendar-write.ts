import type { CalendarEvent } from "../calendar-event";
import { normalizeGoogleEvent } from "../calendar-event";
import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";
import { hasGoogleCalendarWriteScope } from "./calendar-write-scope";

const BASE = "https://www.googleapis.com/calendar/v3/calendars";

export type CalendarMoveWriteResult = Readonly<{
  ok: boolean;
  status: number;
}>;

export interface CalendarEventWritePort {
  hasWriteScope(): Promise<boolean>;
  moveEvent(calendarId: string, eventId: string, start: string, end: string): Promise<CalendarMoveWriteResult>;
  readEvent(calendarId: string, eventId: string): Promise<CalendarEvent | null>;
}

export class GoogleCalendarEventWriteConnector implements CalendarEventWritePort {
  async hasWriteScope(): Promise<boolean> {
    return hasGoogleCalendarWriteScope();
  }

  async moveEvent(calendarId: string, eventId: string, start: string, end: string): Promise<CalendarMoveWriteResult> {
    if (!(await this.hasWriteScope())) return Object.freeze({ ok: false, status: 403 });
    const accessToken = await getValidGoogleAccessToken();
    const res = await fetch(`${BASE}/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: { dateTime: start },
        end: { dateTime: end },
      }),
    });
    if (res.status === 401) {
      throw new GoogleServiceAuthError("refresh_failed", "Calendar API rejected the access token during event move.");
    }
    return Object.freeze({ ok: res.ok, status: res.status });
  }

  async readEvent(calendarId: string, eventId: string): Promise<CalendarEvent | null> {
    const accessToken = await getValidGoogleAccessToken();
    const res = await fetch(`${BASE}/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?eventLabelVersion=1`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.status === 404) return null;
    if (res.status === 401) {
      throw new GoogleServiceAuthError("refresh_failed", "Calendar API rejected the access token during event verification.");
    }
    if (!res.ok) throw new Error(`Calendar event read failed: ${res.status}`);
    const raw = await res.json() as Parameters<typeof normalizeGoogleEvent>[0];
    return normalizeGoogleEvent(raw, 0, { calendarId, calendarName: calendarId });
  }
}