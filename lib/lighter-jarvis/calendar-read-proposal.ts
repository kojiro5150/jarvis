import {
  CALENDAR_READ_CAPABILITY,
  type ProposedOperation,
} from "./calendar-read-authority";

const CALENDAR_REFERENCE = /\b(?:my\s+)?calendars?\b/i;
const TEMPORAL_SCHEDULE_QUESTION = /^(?:how\s+does|what(?:'s|\s+is))\s+(?:my\s+)?(?:today|tomorrow|this\s+(?:morning|afternoon|evening|week))\s+look(?:\s+like)?[?!.]?$/i;
const CALENDAR_READ = Object.freeze({ capability: CALENDAR_READ_CAPABILITY });

/** Proposes a closed operation; it supplies no evidence that the operation is authorized. */
export function proposeCalendarRead(currentUserUtterance: string): ProposedOperation | null {
  const utterance = currentUserUtterance.trim();
  return CALENDAR_REFERENCE.test(utterance) || TEMPORAL_SCHEDULE_QUESTION.test(utterance)
    ? CALENDAR_READ
    : null;
}
