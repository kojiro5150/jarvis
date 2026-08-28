import type { CalendarEvent } from "../connectors/calendar-event";
import type { CalendarReadWindow } from "./calendar-read-window";

export type CalendarFactualQuery =
  | Readonly<{ kind: "next_events"; limit: number }>
  | Readonly<{ kind: "next_title_match"; terms: readonly string[] }>
  | Readonly<{ kind: "title_match_on_weekday"; terms: readonly string[]; weekday: CalendarWeekday }>;

export type CalendarWeekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type CalendarFactualEvent = Readonly<{
  title: string;
  start: string;
  end: string;
  calendarName: string;
}>;

export type CalendarFactualSelection = Readonly<{
  kind: CalendarFactualQuery["kind"];
  status: "matched" | "not_found" | "ambiguous";
  events: readonly CalendarFactualEvent[];
}>;

const MELBOURNE_ZONE = "Australia/Melbourne";
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { timeZone: MELBOURNE_ZONE, weekday: "long" });

function normalizeToken(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value: string): readonly string[] {
  return Object.freeze(normalizeToken(value).split(/\s+/).filter(Boolean));
}

function isTimedEvent(event: CalendarEvent): boolean {
  return Number.isFinite(Date.parse(event.start)) && Number.isFinite(Date.parse(event.end))
    && /(?:Z|[+-]\d{2}:\d{2})$/.test(event.start)
    && /(?:Z|[+-]\d{2}:\d{2})$/.test(event.end);
}

/**
 * Closed server-owned factual projection. Title is allowed here for deterministic
 * selection/presentation only. No provider object is retained or spread upward.
 */
export function projectCalendarFactualEvents(events: readonly CalendarEvent[]): readonly CalendarFactualEvent[] {
  return Object.freeze(events.flatMap(event => {
    if (!isTimedEvent(event) || typeof event.title !== "string" || !event.title.trim()) return [];
    return [Object.freeze({
      title: event.title,
      start: event.start,
      end: event.end,
      calendarName: event.calendarName,
    })];
  }));
}

function titleMatches(event: CalendarFactualEvent, queryTerms: readonly string[]): boolean {
  const titleTokens = new Set(tokens(event.title));
  return queryTerms.length > 0 && queryTerms.every(term => titleTokens.has(normalizeToken(term)));
}

function weekdayOf(start: string): CalendarWeekday {
  return weekdayFormatter.format(new Date(start)).toLowerCase() as CalendarWeekday;
}

function chronological(events: readonly CalendarFactualEvent[]): CalendarFactualEvent[] {
  return [...events].sort((left, right) => {
    const byStart = Date.parse(left.start) - Date.parse(right.start);
    if (byStart !== 0) return byStart;
    const byEnd = Date.parse(left.end) - Date.parse(right.end);
    if (byEnd !== 0) return byEnd;
    return left.title.localeCompare(right.title);
  });
}

export function selectCalendarFactualQuery(input: {
  events: readonly CalendarFactualEvent[];
  query: CalendarFactualQuery;
  window: CalendarReadWindow;
}): CalendarFactualSelection {
  const future = chronological(input.events.filter(event =>
    Date.parse(event.end) > Date.parse(input.window.start)
    && Date.parse(event.start) < Date.parse(input.window.end)
  ));

  if (input.query.kind === "next_events") {
    const limit = Number.isInteger(input.query.limit) && input.query.limit > 0 && input.query.limit <= 5
      ? input.query.limit : 0;
    if (limit === 0) return Object.freeze({ kind: input.query.kind, status: "not_found", events: Object.freeze([]) });
    const selected = future.slice(0, limit);
    return Object.freeze({
      kind: input.query.kind,
      status: selected.length > 0 ? "matched" : "not_found",
      events: Object.freeze(selected),
    });
  }

  const matches = future.filter(event => titleMatches(event, input.query.terms))
    .filter(event => input.query.kind !== "title_match_on_weekday" || weekdayOf(event.start) === input.query.weekday);

  if (matches.length === 0) {
    return Object.freeze({ kind: input.query.kind, status: "not_found", events: Object.freeze([]) });
  }

  if (input.query.kind === "next_title_match") {
    const firstStart = matches[0].start;
    const earliest = matches.filter(event => event.start === firstStart);
    if (earliest.length !== 1) {
      return Object.freeze({ kind: input.query.kind, status: "ambiguous", events: Object.freeze([]) });
    }
    return Object.freeze({ kind: input.query.kind, status: "matched", events: Object.freeze([earliest[0]]) });
  }

  if (matches.length !== 1) {
    return Object.freeze({ kind: input.query.kind, status: "ambiguous", events: Object.freeze([]) });
  }
  return Object.freeze({ kind: input.query.kind, status: "matched", events: Object.freeze([matches[0]]) });
}

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: MELBOURNE_ZONE, weekday: "short", day: "numeric", month: "short",
});
const timeFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: MELBOURNE_ZONE, hour: "numeric", minute: "2-digit", hour12: true,
});
const upperMeridiem = (value: string): string => value.replace(/\b(am|pm)\b/gi, match => match.toUpperCase());

function when(event: CalendarFactualEvent): string {
  return `${dateFormatter.format(new Date(event.start))}, ${upperMeridiem(timeFormatter.format(new Date(event.start)))}–${upperMeridiem(timeFormatter.format(new Date(event.end)))}`;
}

/** Deterministic private-data renderer. No model participates. */
export function renderCalendarFactualSelection(selection: CalendarFactualSelection, query: CalendarFactualQuery): string {
  if (selection.status === "not_found") {
    return "Calendar factual result:\nNo matching timed Calendar event was found in this bounded read.";
  }
  if (selection.status === "ambiguous") {
    return "Calendar factual result:\nMore than one event matched equally; please be more specific.";
  }
  if (query.kind === "next_events") {
    return [
      `Calendar factual result:\nNext ${selection.events.length} timed Calendar event${selection.events.length === 1 ? "" : "s"}:`,
      ...selection.events.map(event => `- ${event.title} — ${when(event)}`),
    ].join("\n");
  }
  const event = selection.events[0];
  return `Calendar factual result:\n- ${event.title} — ${when(event)}`;
}