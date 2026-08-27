import type { GovernedCalendarEvidenceInput } from "../governed-conversation/projection-composer";
import type { CalendarReadPeriod, CalendarReadWindow } from "./calendar-read-window";
import type { ChatMessage } from "../agents/types";
import { normalizedCalendarClock, userSuppliedTimedCalendarDetail } from "./calendar-provenance-truthfulness";

export type UserCalendarBinding = Readonly<{ commitmentStart: string; clock: string; label: string; provenance: "user" }>;
export type UnboundUserCalendarDetail = Readonly<{ clock: string; label: string; statement: string }>;
export type CalendarBindingState = Readonly<{
  bindings: readonly UserCalendarBinding[];
  unbound: readonly UnboundUserCalendarDetail[];
}>;

export type CalendarContextSource = Readonly<{
  source: "calendar";
  capability: "calendar.read";
  period: CalendarReadPeriod;
  window: Readonly<{ start: string; end: string; timeZone: "Australia/Melbourne" }>;
  commitments: readonly Readonly<{ start: string; end: string }>[];
  userSuppliedBindings: readonly UserCalendarBinding[];
  unboundUserSuppliedDetails: readonly Readonly<{ clock: string; label: string; provenance: "user"; binding: "unbound" }>[];
}>;

const melbourneClock = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit", hour12: true });
function commitmentClock(start: string): string {
  const parts = melbourneClock.formatToParts(new Date(start));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(value => value.type === type)?.value ?? "";
  return normalizedCalendarClock(part("hour"), part("minute"), part("dayPeriod"));
}

/** Server-only, exact start-clock binding. The current user turn is never a binding source. */
export function bindUserCalendarDetails(messages: readonly ChatMessage[], commitments: readonly Readonly<{ start: string; end: string }>[]): CalendarBindingState {
  const currentUserIndex = messages.findLastIndex(message => message.role === "user");
  const starts = new Map(commitments.map(commitment => [commitmentClock(commitment.start), commitment.start]));
  const bindings: UserCalendarBinding[] = [];
  const unbound: UnboundUserCalendarDetail[] = [];
  messages.forEach((message, index) => {
    if (message.role !== "user" || index >= currentUserIndex) return;
    const detail = userSuppliedTimedCalendarDetail(message.content);
    if (!detail) return;
    const commitmentStart = starts.get(detail.clock);
    if (commitmentStart) bindings.push(Object.freeze({ commitmentStart, clock: detail.clock, label: detail.label, provenance: "user" }));
    else unbound.push(Object.freeze(detail));
  });
  return Object.freeze({ bindings: Object.freeze(bindings), unbound: Object.freeze(unbound) });
}

/** Closed allow-list projection. No connector/evidence object is retained or spread. */
export function projectCalendarContext(
  evidence: readonly GovernedCalendarEvidenceInput[],
  window: CalendarReadWindow,
  bindings: readonly UserCalendarBinding[] = [],
  unbound: readonly UnboundUserCalendarDetail[] = [],
): CalendarContextSource {
  const commitments = Object.freeze(evidence.map(item => Object.freeze({ start: item.start, end: item.end })));
  return Object.freeze({
    source: "calendar",
    capability: "calendar.read",
    period: window.period,
    window: Object.freeze({ start: window.start, end: window.end, timeZone: window.timeZone }),
    commitments,
    userSuppliedBindings: Object.freeze([...bindings]),
    unboundUserSuppliedDetails: Object.freeze(unbound.map(detail => Object.freeze({
      clock: detail.clock, label: detail.label, provenance: "user" as const, binding: "unbound" as const,
    }))),
  });
}
