import type { GovernedCalendarEvidenceInput } from "../governed-conversation/projection-composer";
import type { ScopedCalendarEvidenceResult } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import type { DiscretionaryAvailabilityPreference } from "../operating-picture/discretionary-availability-preference";
import { resolveMelbourneLocalInterval, type CalendarReadWindow } from "./calendar-read-window";

export type CalendarFreeTimeSlot = Readonly<{ start: string; end: string }>;
export type CalendarFreeTimeResult =
  | Readonly<{ status: "available"; slots: readonly CalendarFreeTimeSlot[]; includeWeekend: boolean; observedAt: string }>
  | Readonly<{ status: "rejected"; reason: "calendar_unavailable" | "calendar_incomplete" | "invalid_input" }>;

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Australia/Melbourne", year: "numeric", month: "2-digit", day: "2-digit",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Australia/Melbourne", weekday: "short",
});

function localDate(instant: Date): string {
  const parts = Object.fromEntries(dateFormatter.formatToParts(instant)
    .filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function eventBounds(event: GovernedCalendarEvidenceInput): readonly [number, number] | null {
  if (event.timezone === "floating-date" && /^\d{4}-\d{2}-\d{2}$/.test(event.start) && /^\d{4}-\d{2}-\d{2}$/.test(event.end)) {
    const start = resolveMelbourneLocalInterval({ date: event.start, startHour: 0, endHour: 24 });
    // Date-only Calendar ends are exclusive. Resolve the end date's midnight.
    const end = resolveMelbourneLocalInterval({ date: event.end, startHour: 0, endHour: 24 });
    return start && end ? Object.freeze([Date.parse(start.start), Date.parse(end.start)]) : null;
  }
  const start = Date.parse(event.start);
  const end = Date.parse(event.end);
  // A zero-duration provider interval occupies no time. The governed Calendar
  // publisher admits that shape, so the calculator must not turn it into a
  // whole-result failure. Reversed or unparseable bounds remain invalid.
  return Number.isFinite(start) && Number.isFinite(end) && end >= start ? Object.freeze([start, end]) : null;
}

function merge(intervals: readonly (readonly [number, number])[]): readonly (readonly [number, number])[] {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const result: [number, number][] = [];
  for (const interval of sorted) {
    const previous = result.at(-1);
    if (previous && interval[0] <= previous[1]) previous[1] = Math.max(previous[1], interval[1]);
    else result.push([interval[0], interval[1]]);
  }
  return Object.freeze(result.map(value => Object.freeze(value)));
}

export function calculateCalendarFreeTime(input: Readonly<{
  evidence: ScopedCalendarEvidenceResult;
  window: CalendarReadWindow;
  preference: DiscretionaryAvailabilityPreference;
  includeWeekend: boolean;
  now: Date;
}>): CalendarFreeTimeResult {
  if (input.evidence.status !== "available") return Object.freeze({ status: "rejected", reason: "calendar_unavailable" });
  if (input.evidence.coverageState !== "bounded_complete_request") return Object.freeze({ status: "rejected", reason: "calendar_incomplete" });
  if (input.window.period !== "this_week" || !Number.isFinite(input.now.getTime()) || !input.evidence.observedAt) return Object.freeze({ status: "rejected", reason: "invalid_input" });
  const eventIntervals = input.evidence.evidence.map(eventBounds);
  if (eventIntervals.some(interval => interval === null)) return Object.freeze({ status: "rejected", reason: "invalid_input" });
  const windowStart = Date.parse(input.window.start);
  const windowEnd = Date.parse(input.window.end);
  const slots: CalendarFreeTimeSlot[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const instant = new Date(windowStart + offset * 86_400_000);
    const date = localDate(instant);
    const day = weekdayFormatter.format(new Date(resolveMelbourneLocalInterval({ date, startHour: 0, endHour: 24 })!.start));
    const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day);
    if (!weekday && !input.includeWeekend) continue;
    const envelope = resolveMelbourneLocalInterval({ date, startHour: input.preference.startHour, endHour: input.preference.endHour });
    if (!envelope) return Object.freeze({ status: "rejected", reason: "invalid_input" });
    const start = Math.max(Date.parse(envelope.start), input.now.getTime(), windowStart);
    const end = Math.min(Date.parse(envelope.end), windowEnd);
    if (end <= start) continue;
    const occupied = merge((eventIntervals as readonly (readonly [number, number])[]).flatMap(([busyStart, busyEnd]) => {
      const clippedStart = Math.max(start, busyStart);
      const clippedEnd = Math.min(end, busyEnd);
      return clippedEnd > clippedStart ? [[clippedStart, clippedEnd] as const] : [];
    }));
    let availableStart = start;
    for (const [busyStart, busyEnd] of occupied) {
      if (busyStart > availableStart) slots.push(Object.freeze({ start: new Date(availableStart).toISOString(), end: new Date(busyStart).toISOString() }));
      availableStart = Math.max(availableStart, busyEnd);
    }
    if (availableStart < end) slots.push(Object.freeze({ start: new Date(availableStart).toISOString(), end: new Date(end).toISOString() }));
  }
  return Object.freeze({ status: "available", slots: Object.freeze(slots), includeWeekend: input.includeWeekend, observedAt: input.evidence.observedAt });
}
