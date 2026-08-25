import {
  CALENDAR_READ_CAPABILITY,
  type ProposedOperation,
} from "./calendar-read-authority";

const CALENDAR_REFERENCE = /\b(?:my\s+)?calendars?\b/i;
const TEMPORAL_PERIOD = String.raw`(?:today|tomorrow|this\s+(?:morning|afternoon|evening|week))`;
const TEMPORAL_SCHEDULE_QUESTION = new RegExp(
  String.raw`^(?:(?:how\s+does|what(?:'s|\s+is))\s+(?:my\s+)?${TEMPORAL_PERIOD}\s+look(?:\s+like)?|what(?:'s|\s+is)\s+(?:on|scheduled)(?:\s+for)?\s+${TEMPORAL_PERIOD}|what\s+do\s+i\s+have(?:\s+for)?\s+${TEMPORAL_PERIOD})[?!.]?$`,
  "i",
);
const CALENDAR_READ = Object.freeze({ capability: CALENDAR_READ_CAPABILITY });

/** Proposes a closed operation; it supplies no evidence that the operation is authorized. */
export function proposeCalendarRead(currentUserUtterance: string): ProposedOperation | null {
  const utterance = currentUserUtterance.trim().replace(/[‘’]/g, "'");
  return CALENDAR_REFERENCE.test(utterance) || TEMPORAL_SCHEDULE_QUESTION.test(utterance)
    ? CALENDAR_READ
    : null;
}
