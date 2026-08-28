import {
  CALENDAR_READ_CAPABILITY,
  type ProposedOperation,
} from "./calendar-read-authority";
import { resolveCalendarReadWindow, type CalendarReadPeriod } from "./calendar-read-window";

const TEMPORAL_PERIOD = String.raw`(?:today|tomorrow|this\s+(?:morning|afternoon|evening|week))`;
const CALENDAR_READ_VERB = String.raw`(?:show|check|view|see|list|read|open)`;
const CALENDAR_OBJECT = String.raw`(?:my\s+)?calendars?`;
const CALENDAR_SCOPE = String.raw`(?:today|tomorrow|this\s+(?:morning|afternoon|evening|week))`;
const CALENDAR_REQUEST = new RegExp(
  String.raw`^(?:(?:please\s+)?${CALENDAR_READ_VERB}\s+(?:me\s+)?${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?|(?:can|could|would)\s+you\s+(?:please\s+)?${CALENDAR_READ_VERB}\s+(?:me\s+)?${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?|what(?:'s|\s+is)\s+on\s+${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?|(?:what\s+do\s+i\s+have|do\s+i\s+have\s+anything)\s+(?:on|in)\s+${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?)[?!.]?$`,
  "i",
);
const TEMPORAL_SCHEDULE_QUESTION = new RegExp(
  String.raw`^(?:(?:how\s+does|what(?:'s|\s+is))\s+(?:my\s+)?${TEMPORAL_PERIOD}\s+look(?:\s+like)?|what(?:'s|\s+is)\s+(?:on|scheduled)(?:\s+for)?\s+${TEMPORAL_PERIOD}|what\s+(?:do\s+i\s+have|have\s+i\s+got|appointments\s+do\s+i\s+have)(?:\s+for)?\s+${TEMPORAL_PERIOD})[?!.]?import {
  CALENDAR_READ_CAPABILITY,
  type ProposedOperation,
} from "./calendar-read-authority";
import { resolveCalendarReadWindow, type CalendarReadPeriod } from "./calendar-read-window";

const TEMPORAL_PERIOD = String.raw`(?:today|tomorrow|this\s+(?:morning|afternoon|evening|week))`;
const CALENDAR_READ_VERB = String.raw`(?:show|check|view|see|list|read|open)`;
const CALENDAR_OBJECT = String.raw`(?:my\s+)?calendars?`;
const CALENDAR_SCOPE = String.raw`(?:today|tomorrow|this\s+(?:morning|afternoon|evening|week))`;
const CALENDAR_REQUEST = new RegExp(
  String.raw`^(?:(?:please\s+)?${CALENDAR_READ_VERB}\s+(?:me\s+)?${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?|(?:can|could|would)\s+you\s+(?:please\s+)?${CALENDAR_READ_VERB}\s+(?:me\s+)?${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?|what(?:'s|\s+is)\s+on\s+${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?|(?:what\s+do\s+i\s+have|do\s+i\s+have\s+anything)\s+(?:on|in)\s+${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?)[?!.]?$`,
  "i",
);
,
  "i",
);
const CALENDAR_ATTENTION_REQUEST = /^(?:what(?:'s|\s+is)\s+)?what\s+needs\s+my\s+attention[?!.]?$/i;
/** Proposes a closed operation; it supplies no evidence that the operation is authorized. */
export function proposeCalendarRead(currentUserUtterance: string, clock: () => Date = () => new Date()): ProposedOperation | null {
  const utterance = currentUserUtterance.trim().replace(/[‘’]/g, "'");
  const attentionRequest = CALENDAR_ATTENTION_REQUEST.test(utterance);
  if (!attentionRequest && !CALENDAR_REQUEST.test(utterance) && !TEMPORAL_SCHEDULE_QUESTION.test(utterance)) return null;
  const match = utterance.match(/\b(today|tomorrow|this\s+morning|this\s+afternoon|this\s+evening|this\s+week)\b/i);
  const period = (attentionRequest ? "today" : (match?.[1].toLowerCase().replace(/\s+/g, "_") ?? "default")) as CalendarReadPeriod;
  return Object.freeze({
    capability: CALENDAR_READ_CAPABILITY,
    window: resolveCalendarReadWindow(period, clock()),
    ...(attentionRequest ? { purpose: "calendar_attention" as const } : {}),
  });
}
