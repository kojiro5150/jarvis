import type { CalendarEvent } from "../calendar-event";
import { normalizeGoogleEvent } from "../calendar-event";
import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";

/** Deployment-only, read-only Calendar API surface with an explicit time bound. */
export class BoundedGoogleCalendarConnector {
  async verifySession(): Promise<void> { await getValidGoogleAccessToken(); }
  async listBetween(start: string, end: string, limit: number): Promise<readonly CalendarEvent[]> {
    if (!(Date.parse(start) < Date.parse(end)) || limit < 1 || limit > 100) throw new Error("invalid bounded calendar window");
    const token = await getValidGoogleAccessToken();
    const calendarsResponse = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {headers:{Authorization:`Bearer ${token}`}});
    if (!calendarsResponse.ok) throw new GoogleServiceAuthError("refresh_failed", "Calendar authentication failed.");
    const calendars = (await calendarsResponse.json() as {items?:Array<{id:string;summary?:string;backgroundColor?:string;hidden?:boolean;deleted?:boolean}>}).items?.filter(c=>!c.hidden&&!c.deleted) ?? [];
    const targets = calendars.length ? calendars : [{id:"primary",summary:"Google Calendar"}];
    const batches = await Promise.all(targets.map(async calendar => {
      const query = new URLSearchParams({timeMin:start,timeMax:end,singleEvents:"true",orderBy:"startTime",maxResults:String(limit)});
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events?${query}`, {headers:{Authorization:`Bearer ${token}`}});
      if (!response.ok) { if (response.status === 401) throw new GoogleServiceAuthError("refresh_failed", "Calendar authentication failed."); throw new Error(`bounded Calendar request failed: ${response.status}`); }
      const data = await response.json() as {items?:Parameters<typeof normalizeGoogleEvent>[0][]};
      return (data.items ?? []).map((event,index)=>normalizeGoogleEvent(event,index,{calendarId:calendar.id,calendarName:calendar.summary ?? "Google Calendar",calendarColor:calendar.backgroundColor}));
    }));
    return batches.flat().sort((a,b)=>a.start.localeCompare(b.start)).slice(0,limit);
  }
}
