import {
  CALENDAR_READ_CAPABILITY,
  type ProposedOperation,
} from "./calendar-read-authority";
import { resolveCalendarReadWindow, type CalendarReadPeriod } from "./calendar-read-window";

const CALENDAR_REFERENCE = /\b(?:my\s+)?calendars?\b/i;
const TEMPORAL_PERIOD = String.raw`(?:today|tomorrow|this\s+(?:morning|afternoon|evening|week))`;
const TEMPORAL_SCHEDULE_QUESTION = new RegExp(
  String.raw`^(?:(?:how\s+does|what(?:'s|\s+is))\s+(?:my\s+)?${TEMPORAL_PERIOD}\s+look(?:\s+like)?|what(?:'s|\s+is)\s+(?:on|scheduled)(?:\s+for)?\s+${TEMPORAL_PERIOD}|what\s+(?:do\s+i\s+have|have\s+i\s+got|appointments\s+do\s+i\s+have)(?:\s+for)?\s+${TEMPORAL_PERIOD})[?!.]?$`,
  "i",
);
/** Proposes a closed operation; it supplies no evidence that the operation is authorized. */
export function proposeCalendarRead(currentUserUtterance: string, clock: () => Date = () => new Date()): ProposedOperation | null {
  const utterance = currentUserUtterance.trim().replace(/[‘’]/g, "'");
  if (!CALENDAR_REFERENCE.test(utterance) && !TEMPORAL_SCHEDULE_QUESTION.test(utterance)) return null;
  const match = utterance.match(/\b(today|tomorrow|this\s+morning|this\s+afternoon|this\s+evening|this\s+week)\b/i);
  const period = (match?.[1].toLowerCase().replace(/\s+/g, "_") ?? "default") as CalendarReadPeriod;
  return Object.freeze({ capability: CALENDAR_READ_CAPABILITY, window: resolveCalendarReadWindow(period, clock()) });
}
