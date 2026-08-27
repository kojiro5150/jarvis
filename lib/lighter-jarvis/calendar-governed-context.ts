import type { GovernedCalendarEvidenceInput } from "../governed-conversation/projection-composer";
import type { CalendarReadPeriod, CalendarReadWindow } from "./calendar-read-window";

export type CalendarContextSource = Readonly<{
  source: "calendar";
  capability: "calendar.read";
  period: CalendarReadPeriod;
  window: Readonly<{ start: string; end: string; timeZone: "Australia/Melbourne" }>;
  commitments: readonly Readonly<{ start: string; end: string }>[];
}>;

/** Closed allow-list projection. No connector/evidence object is retained or spread. */
export function projectCalendarContext(
  evidence: readonly GovernedCalendarEvidenceInput[],
  window: CalendarReadWindow,
): CalendarContextSource {
  const commitments = Object.freeze(evidence.map(item => Object.freeze({ start: item.start, end: item.end })));
  return Object.freeze({
    source: "calendar",
    capability: "calendar.read",
    period: window.period,
    window: Object.freeze({ start: window.start, end: window.end, timeZone: window.timeZone }),
    commitments,
  });
}
