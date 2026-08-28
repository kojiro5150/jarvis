import type { CalendarEventRecord, ConnectorSource } from "./types";
import type { CalendarTimeMode } from "./calendar-time-mode";

/**
 * The one calendar event shape every consumer above the connector layer
 * (OperationalState, the Calendar card, briefing.ts, context-builder.ts)
 * is allowed to depend on. Both LocalCalendarConnector and
 * GoogleCalendarConnector normalize into this before returning anything
 * from listUpcoming() — nothing downstream should ever see a raw Google
 * API event or a raw local CalendarEventRecord.
 *
 * This exists because the local seed data and Google's Calendar API
 * shapes drifted (Google: `summary`/`start.dateTime`/`start.date`; local:
 * flat `day`/`date`/`title`/`time` display strings) — briefing.ts crashed
 * assuming every event had the same fields regardless of source. See the
 * Google Calendar connector follow-up bug report.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  /** ISO 8601 datetime (timed events) or ISO date "YYYY-MM-DD" (all-day). */
  start: string;
  /** Same format as `start`. */
  end: string;
  /** Display label, e.g. "MON". Derived from `start`, never re-derive downstream. */
  day: string;
  /** Display label, e.g. "09:00" or "All day". Derived from `start`/`end`. */
  time: string;
  source: ConnectorSource;
  /** Which calendar this came from — Google's calendar id, or "local" for seed data. */
  calendarId: string;
  /** Human-readable calendar name, e.g. "Governance Engineering" — safe to show in the UI. */
  calendarName: string;
  /** Google's calendarList backgroundColor (hex), if the calendar has one set. */
  calendarColor?: string;
  /** Provider-supplied per-event label identity when Google returns one. Opaque at the connector boundary. */
  eventLabelId?: string;
  /** Deterministic governed mode, present only when provider label definitions were successfully resolved. */
  timeMode?: CalendarTimeMode;
  /** Provider observation when available; consumers must not infer beyond it. */
  status?: "confirmed" | "tentative" | "cancelled";
  /** Provider-supplied recurrence identity; presence means this is an observed recurring instance. */
  recurringEventId?: string;
  /** Authenticated user's provider-supplied attendee response, when Google identifies it. */
  selfAttendeeResponse?: "needsAction" | "declined" | "tentative" | "accepted";
}

interface GoogleEventLike {
  id?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  eventLabelId?: string;
  status?: "confirmed" | "tentative" | "cancelled";
  recurringEventId?: string;
  attendees?: Array<{ self?: boolean; responseStatus?: "needsAction" | "declined" | "tentative" | "accepted" }>;
}

/** Which calendar an event was fetched from — attached per-request, since a raw Google event object doesn't carry this itself. */
export interface GoogleCalendarMeta {
  calendarId: string;
  calendarName: string;
  calendarColor?: string;
}

/**
 * Parses a Google start/end field into a timezone-safe local Date for
 * display purposes, distinguishing timed events (`dateTime`, carries an
 * explicit UTC offset — safe to hand straight to `new Date()`) from
 * all-day events (`date`, a bare "YYYY-MM-DD" — `new Date()` parses that
 * as UTC midnight, which can roll over to the wrong day once converted
 * back to a negative-UTC-offset local timezone). All-day dates are
 * parsed component-by-component instead, in local time, to avoid that.
 */
function parseGoogleField(
  field: { dateTime?: string; date?: string } | undefined
): { raw: string; isAllDay: boolean; localDate: Date } | null {
  if (field?.dateTime) {
    return { raw: field.dateTime, isAllDay: false, localDate: new Date(field.dateTime) };
  }
  if (field?.date) {
    const [y, m, d] = field.date.split("-").map(Number);
    return { raw: field.date, isAllDay: true, localDate: new Date(y, (m || 1) - 1, d || 1) };
  }
  return null;
}

function displayDay(localDate: Date): string {
  if (Number.isNaN(localDate.getTime())) return "—";
  return localDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function displayTime(localDate: Date, isAllDay: boolean): string {
  if (isAllDay) return "All day";
  if (Number.isNaN(localDate.getTime())) return "—";
  return localDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/**
 * Maps a raw Google Calendar API event onto the canonical CalendarEvent
 * shape. `meta` identifies which calendar this event was fetched from —
 * a raw Google event doesn't carry that itself, since it's a property of
 * the request (calendars/{calendarId}/events), not the event object.
 * Defaults to an unlabeled calendar if omitted, for callers/tests that
 * don't care about multi-calendar attribution.
 */
export function normalizeGoogleEvent(
  event: GoogleEventLike,
  index: number,
  meta: GoogleCalendarMeta = { calendarId: "primary", calendarName: "Google Calendar" }
): CalendarEvent {
  const start = parseGoogleField(event.start);
  const end = parseGoogleField(event.end) ?? start;
  const now = new Date();

  return {
    id: event.id ?? `google-${meta.calendarId}-${index}`,
    title: event.summary && event.summary.trim().length > 0 ? event.summary : "(No title)",
    start: start?.raw ?? now.toISOString(),
    end: end?.raw ?? start?.raw ?? now.toISOString(),
    day: start ? displayDay(start.localDate) : displayDay(now),
    time: start ? displayTime(start.localDate, start.isAllDay) : "—",
    source: "google",
    calendarId: meta.calendarId,
    calendarName: meta.calendarName,
    calendarColor: meta.calendarColor,
    eventLabelId: event.eventLabelId,
    status: event.status,
    recurringEventId: event.recurringEventId,
    selfAttendeeResponse: event.attendees?.find((attendee) => attendee.self)?.responseStatus,
  };
}

/**
 * Local project memory only ever stored display strings (day/date/time),
 * never real timestamps — it's seed/mock data, not a real calendar.
 * Synthesizes a plausible local-time start/end from `date` (day-of-month)
 * and `time`, so local events carry exactly the same canonical shape as
 * Google's rather than a parallel, thinner one.
 */
export function normalizeLocalRecord(record: CalendarEventRecord, index: number): CalendarEvent {
  const isAllDay = record.time.trim().toLowerCase() === "all day";
  const now = new Date();
  const dayOfMonth = Number(record.date);
  const localDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    Number.isNaN(dayOfMonth) ? now.getDate() : dayOfMonth
  );

  if (!isAllDay) {
    const [hoursStr, minutesStr] = record.time.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (!Number.isNaN(hours)) {
      localDate.setHours(hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
    }
  }

  const iso = localDate.toISOString();

  return {
    id: `local-${index}`,
    title: record.title,
    start: iso,
    end: iso,
    // Local records already carry their own display strings — trust them
    // over re-deriving from the synthesized date, since day/time here are
    // Sam's own seed content, not something to second-guess.
    day: record.day,
    time: record.time,
    source: "local",
    // Local project memory isn't really multi-calendar — one placeholder
    // identity, not shown in the UI (the card only labels google-sourced
    // events with a calendar name, to avoid noise on this mock data).
    calendarId: "local",
    calendarName: "Local calendar",
  };
}

/**
 * Day-of-month for display (e.g. "8"), derived from a canonical event's
 * `start` the same timezone-safe way normalizeGoogleEvent's day/time are —
 * component parsing for bare "YYYY-MM-DD" dates, direct Date parsing
 * otherwise. Shared so the Calendar card doesn't reimplement this.
 */
export function dateOfMonth(startIso: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(startIso)) {
    const [, , d] = startIso.split("-");
    return String(Number(d));
  }
  const parsed = new Date(startIso);
  return Number.isNaN(parsed.getTime()) ? "—" : String(parsed.getDate());
}
