import type { GovernedCalendarFactualEvent as CalendarFactualEvent } from "../governed-conversation/calendar-factual-evidence";
import type { CalendarReadWindow } from "./calendar-read-window";

export type CalendarFactualQuery =
  | Readonly<{ kind: "next_events"; limit: number }>
  | Readonly<{ kind: "next_title_match"; terms: readonly string[] }>
  | Readonly<{ kind: "title_match_on_weekday"; terms: readonly string[]; weekday: CalendarWeekday }>
  | Readonly<{ kind: "title_presence_on_weekday"; terms: readonly string[]; weekday: CalendarWeekday }>
  | Readonly<{ kind: "title_presence_in_period"; terms: readonly string[] }>;

export type CalendarWeekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type CalendarFactualSelection = Readonly<{
  kind: CalendarFactualQuery["kind"];
  status: "matched" | "not_found" | "ambiguous";
  events: readonly CalendarFactualEvent[];
}>;

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const MELBOURNE_ZONE = "Australia/Melbourne";
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { timeZone: MELBOURNE_ZONE, weekday: "long" });

/**
 * Closed, hand-maintained morphology table. This is deliberately not a stemmer
 * or lemmatizer: every equivalence is explicit, reviewable and regression-testable.
 */
export const CALENDAR_FACTUAL_MORPHOLOGY: Readonly<Record<string, string>> = Object.freeze({
  test: "test",
  tests: "test",
  testing: "test",
  meeting: "meeting",
  meetings: "meeting",
  shop: "shop",
  shopping: "shop",
});

export const CALENDAR_FACTUAL_FILLER_TOKENS = Object.freeze(new Set([
  "a", "an", "the", "my", "please", "scheduled", "schedule", "again", "next",
  "going", "go", "to", "at", "in", "on", "for",
]));

const LEVEL_2_RELATIONAL_PATTERN = /\b(?:doing some work|work on|related to|relate to|connected to|associated with)\b/;

const SPOKEN_LIMITS: Readonly<Record<string, number>> = Object.freeze({
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
});

function normalizeText(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, " ").trim();
}

function canonicalToken(token: string): string {
  const normalized = normalizeText(token);
  return CALENDAR_FACTUAL_MORPHOLOGY[normalized] ?? normalized;
}

function queryTerms(value: string): readonly string[] {
  const normalized = normalizeText(value).split(/\s+/).filter(Boolean);
  return Object.freeze(normalized
    .filter(token => !CALENDAR_FACTUAL_FILLER_TOKENS.has(token))
    .map(canonicalToken)
    .filter(Boolean));
}

function titleTokens(value: string): readonly string[] {
  return Object.freeze(normalizeText(value).split(/\s+/).filter(Boolean).map(canonicalToken));
}

function weekday(value: string): CalendarWeekday | null {
  const candidate = value.toLowerCase() as CalendarWeekday;
  return WEEKDAYS.includes(candidate) ? candidate : null;
}

export function parseCalendarFactualQuery(utterance: string): CalendarFactualQuery | null {
  const normalized = utterance.trim().replace(/[‘’]/g, "'");
  if (LEVEL_2_RELATIONAL_PATTERN.test(normalizeText(normalized))) return null;

  const nextEvents = normalized.match(/^what\s+are\s+(?:my\s+)?next\s+([1-5]|one|two|three|four|five)\s+(?:meetings?|calendar\s+events?)[?!.]?$/i);
  if (nextEvents) {
    const rawLimit = nextEvents[1].toLowerCase();
    const limit = /^[1-5]$/.test(rawLimit) ? Number(rawLimit) : SPOKEN_LIMITS[rawLimit];
    if (!limit) return null;
    return Object.freeze({ kind: "next_events", limit });
  }

  const weekdayTime = normalized.match(/^(?:what\s+time\s+is|when\s+is)\s+(?:my\s+|the\s+)?(.+?)\s+on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[?!.]?$/i);
  if (weekdayTime) {
    const terms = queryTerms(weekdayTime[1]);
    const day = weekday(weekdayTime[2]);
    if (terms.length === 0 || !day) return null;
    return Object.freeze({ kind: "title_match_on_weekday", terms, weekday: day });
  }

  const weekdayPresence = normalized.match(/^am\s+i\s+(?:(?:at|in|on)\s+)?(.+?)(?:\s+on)?\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[?!.]?$/i);
  if (weekdayPresence) {
    const terms = queryTerms(weekdayPresence[1]);
    const day = weekday(weekdayPresence[2]);
    if (terms.length === 0 || !day) return null;
    return Object.freeze({ kind: "title_presence_on_weekday", terms, weekday: day });
  }

  const periodPresence = normalized.match(/^do\s+i\s+have\s+(.+?)\s+(?:(?:on|in)\s+)?(today|tomorrow|this\s+week|next\s+week)[?!.]?$/i);
  if (periodPresence) {
    const terms = queryTerms(periodPresence[1]);
    if (terms.length === 0) return null;
    return Object.freeze({ kind: "title_presence_in_period", terms });
  }

  const nextHaveScheduled = normalized.match(/^when\s+do\s+i\s+next\s+have\s+(?:scheduled\s+)?(.+?)[?!.]?$/i);
  if (nextHaveScheduled) {
    const terms = queryTerms(nextHaveScheduled[1]);
    if (terms.length === 0) return null;
    return Object.freeze({ kind: "next_title_match", terms });
  }

  const nextNamed = normalized.match(/^when(?:'s|\s+is)\s+(?:my\s+)?next\s+(.+?)[?!.]?$/i);
  if (nextNamed) {
    const terms = queryTerms(nextNamed[1]);
    if (terms.length === 0) return null;
    return Object.freeze({ kind: "next_title_match", terms });
  }

  const scheduledNext = normalized.match(/^when\s+is\s+(?:my\s+|the\s+)?(.+?)\s+(?:scheduled\s+)?(?:next|again)[?!.]?$/i);
  if (scheduledNext) {
    const terms = queryTerms(scheduledNext[1]);
    if (terms.length === 0) return null;
    return Object.freeze({ kind: "next_title_match", terms });
  }

  const personalWhen = normalized.match(/^when\s+am\s+i\s+(.+?)[?!.]?$/i);
  if (personalWhen) {
    const terms = queryTerms(personalWhen[1]);
    if (terms.length === 0) return null;
    return Object.freeze({ kind: "next_title_match", terms });
  }

  return null;
}

/**
 * High-precision containment detector for personal factual Calendar wording that
 * is not currently in the closed Level-1 grammar. It must never be used to infer
 * a Calendar fact; it only prevents unsupported personal schedule questions from
 * falling through to ordinary model capability claims.
 */
export function isUnsupportedCalendarFactualWording(utterance: string): boolean {
  if (parseCalendarFactualQuery(utterance)) return false;
  const normalized = normalizeText(utterance);
  if (/^when am i\b/.test(normalized)) return true;
  if (/^when is my\b/.test(normalized)) return true;
  if (/^when do i next have\b/.test(normalized)) return true;
  if (/^when do i\b.*\bscheduled\b/.test(normalized)) return true;
  if (/^am i (?:at|in|on)\b.*\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(normalized)) return true;
  if (/^what time is (?:my|the)\b.*\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(normalized)) return true;
  if (/^(?:what|when|where|which|do|did|am|are|is|have|has|can)\b/.test(normalized)
    && /\bmeetings?\b/.test(normalized)
    && /\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this week|next week)\b/.test(normalized)) return true;
  return false;
}

function titleMatches(event: CalendarFactualEvent, terms: readonly string[]): boolean {
  const title = new Set(titleTokens(event.title));
  return terms.length > 0 && terms.every(term => title.has(canonicalToken(term)));
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
  const query = input.query;
  const future = chronological(input.events.filter(event =>
    Date.parse(event.end) > Date.parse(input.window.start)
    && Date.parse(event.start) < Date.parse(input.window.end)
  ));

  if (query.kind === "next_events") {
    const limit = Number.isInteger(query.limit) && query.limit > 0 && query.limit <= 5
      ? query.limit : 0;
    if (limit === 0) return Object.freeze({ kind: query.kind, status: "not_found", events: Object.freeze([]) });
    const selected = future.slice(0, limit);
    return Object.freeze({
      kind: query.kind,
      status: selected.length > 0 ? "matched" : "not_found",
      events: Object.freeze(selected),
    });
  }

  const matches = future.filter(event => titleMatches(event, query.terms))
    .filter(event =>
      (query.kind !== "title_match_on_weekday" && query.kind !== "title_presence_on_weekday")
      || weekdayOf(event.start) === query.weekday
    );

  if (matches.length === 0) {
    return Object.freeze({ kind: query.kind, status: "not_found", events: Object.freeze([]) });
  }

  if (query.kind === "next_title_match") {
    const firstStart = matches[0].start;
    const earliest = matches.filter(event => event.start === firstStart);
    if (earliest.length !== 1) {
      return Object.freeze({ kind: query.kind, status: "ambiguous", events: Object.freeze([]) });
    }
    return Object.freeze({ kind: query.kind, status: "matched", events: Object.freeze([earliest[0]]) });
  }

  if (matches.length !== 1) {
    return Object.freeze({ kind: query.kind, status: "ambiguous", events: Object.freeze([]) });
  }
  return Object.freeze({ kind: query.kind, status: "matched", events: Object.freeze([matches[0]]) });
}

const datePartsFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: MELBOURNE_ZONE, weekday: "short", day: "numeric", month: "2-digit",
});
const MONTH_LABELS = Object.freeze([
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const);
const timeFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: MELBOURNE_ZONE, hour: "numeric", minute: "2-digit", hour12: true,
});
const upperMeridiem = (value: string): string => value.replace(/\b(am|pm)\b/gi, match => match.toUpperCase());

function formatMelbourneDate(value: string): string {
  const parts = datePartsFormatter.formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find(item => item.type === type)?.value ?? "";
  const monthIndex = Number(part("month")) - 1;
  const month = MONTH_LABELS[monthIndex];
  if (!month) throw new Error("Calendar factual event month is invalid");
  return `${part("weekday")}, ${part("day")} ${month}`;
}

function when(event: CalendarFactualEvent): string {
  return `${formatMelbourneDate(event.start)}, ${upperMeridiem(timeFormatter.format(new Date(event.start)))}–${upperMeridiem(timeFormatter.format(new Date(event.end)))}`;
}

/** Deterministic private-data renderer. No model participates. */
export function renderCalendarFactualSelection(selection: CalendarFactualSelection, query: CalendarFactualQuery): string {
  if (selection.status === "not_found") {
    if (query.kind === "title_presence_on_weekday" || query.kind === "title_presence_in_period") {
      return "Calendar factual result:\nNo.";
    }
    return "Calendar factual result:\nNo matching timed Calendar event was found in this bounded read.";
  }
  if (selection.status === "ambiguous") {
    return "Calendar factual result:\nI found more than one Calendar event that matches that wording; please be more specific.";
  }
  if (query.kind === "next_events") {
    return [
      `Calendar factual result:\nNext ${selection.events.length} timed Calendar event${selection.events.length === 1 ? "" : "s"}:`,
      ...selection.events.map(event => `- ${event.title} — ${when(event)}`),
    ].join("\n");
  }
  const event = selection.events[0];
  if (query.kind === "title_presence_on_weekday" || query.kind === "title_presence_in_period") {
    return `Calendar factual result:\nYes. ${event.title} — ${when(event)}`;
  }
  return `Calendar factual result:\n- ${event.title} — ${when(event)}`;
}
