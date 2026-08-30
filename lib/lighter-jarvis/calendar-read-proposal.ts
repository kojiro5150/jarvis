import {
  CALENDAR_READ_CAPABILITY,
  type ProposedOperation,
} from "./calendar-read-authority";
import { resolveCalendarReadWindow, type CalendarReadPeriod } from "./calendar-read-window";
import { parseCalendarFactualQuery, type CalendarFactualQuery } from "./calendar-factual-query";

const TEMPORAL_PERIOD = String.raw`(?:today|tomorrow|this\s+(?:morning|afternoon|evening|week)|next\s+week)`;
const CALENDAR_READ_VERB = String.raw`(?:show|check|view|see|list|read|open)`;
const CALENDAR_OBJECT = String.raw`(?:my\s+)?calendars?`;
const CALENDAR_SCOPE = String.raw`(?:today|tomorrow|this\s+(?:morning|afternoon|evening|week)|next\s+week)`;
const CALENDAR_REQUEST = new RegExp(
  String.raw`^(?:(?:please\s+)?${CALENDAR_READ_VERB}\s+(?:me\s+)?${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?|(?:can|could|would)\s+you\s+(?:please\s+)?${CALENDAR_READ_VERB}\s+(?:me\s+)?${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?|what(?:'s|\s+is)\s+on\s+${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?|(?:what\s+do\s+i\s+have|do\s+i\s+have\s+anything)\s+(?:on|in)\s+${CALENDAR_OBJECT}(?:\s+(?:for\s+)?${CALENDAR_SCOPE})?)[?!.]?$`,
  "i",
);
const TEMPORAL_SCHEDULE_QUESTION = new RegExp(
  String.raw`^(?:(?:how\s+does|what(?:'s|\s+is))\s+(?:my\s+)?${TEMPORAL_PERIOD}\s+look(?:\s+like)?|what(?:'s|\s+is)\s+(?:on|scheduled)(?:\s+for)?\s+${TEMPORAL_PERIOD}|what\s+(?:do\s+i\s+have|have\s+i\s+got|appointments\s+do\s+i\s+have)(?:\s+(?:on|for))?\s+${TEMPORAL_PERIOD})[?!.]?$`,
  "i",
);
const CALENDAR_ATTENTION_REQUEST = /^what\s+needs\s+my\s+attention[?!.]?$/i;
const CALENDAR_WEEKLY_ALLOCATION_REQUEST =
  /^(?:how\s+(?:is|does)\s+(?:(?:my|this|next)\s+week)\s+(?:allocated|break\s+down)|what(?:'s|\s+is)\s+(?:my\s+)?weekly\s+allocation|show\s+me\s+how\s+(?:(?:my|this|next)\s+week)\s+is\s+allocated)[?!.]?$/i;

/** Proposes a closed operation; it supplies no evidence that the operation is authorized. */
export function proposeCalendarRead(currentUserUtterance: string, clock: () => Date = () => new Date(), interpretedFactualQuery?: CalendarFactualQuery | null): ProposedOperation | null {
  const utterance = currentUserUtterance.trim().replace(/[‘’]/g, "'");
  const attentionRequest = CALENDAR_ATTENTION_REQUEST.test(utterance);
  const weeklyAllocationRequest = CALENDAR_WEEKLY_ALLOCATION_REQUEST.test(utterance);
  const factualQuery = parseCalendarFactualQuery(utterance) ?? interpretedFactualQuery ?? null;
  if (!attentionRequest && !weeklyAllocationRequest && !factualQuery && !CALENDAR_REQUEST.test(utterance) && !TEMPORAL_SCHEDULE_QUESTION.test(utterance)) return null;
  const match = utterance.match(/\b(today|tomorrow|this\s+morning|this\s+afternoon|this\s+evening|this\s+week|next\s+week)\b/i);
  const period = (attentionRequest
    ? "today"
    : weeklyAllocationRequest
      ? (/\bnext\s+week\b/i.test(utterance) ? "next_week" : "this_week")
      : (match?.[1].toLowerCase().replace(/\s+/g, "_") ?? "default")) as CalendarReadPeriod;

  return Object.freeze({
    capability: CALENDAR_READ_CAPABILITY,
    window: resolveCalendarReadWindow(period, clock()),
    ...(attentionRequest
      ? { purpose: "calendar_attention" as const }
      : weeklyAllocationRequest
        ? { purpose: "calendar_weekly_allocation" as const }
        : factualQuery
          ? { purpose: "calendar_factual_query" as const, factualQuery }
          : {}),
  });
}
