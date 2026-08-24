export const CALENDAR_READ_CAPABILITY = "calendar.read" as const;
export type ProposedOperation = Readonly<{
  capability: typeof CALENDAR_READ_CAPABILITY;
}>;

export interface CalendarReadAuthorityRequest {
  readonly proposedOperation: ProposedOperation;
  readonly currentUserUtterance: string;
}

export type CalendarReadAuthorityDecision = Readonly<{
  capability: typeof CALENDAR_READ_CAPABILITY;
  decision: "ALLOW" | "ASK" | "DENY";
  reason: "explicit_calendar_read" | "explicit_calendar_read_not_established";
  readOnly: true;
}>;

const CALENDAR_REFERENCE = /\b(?:my\s+)?calendars?\b/i;
const EXPLICIT_READ = /(?:\b(?:show|check|view|see|list|read|open)\b[\s\S]*\b(?:my\s+)?calendars?\b|\bwhat(?:'s|\s+is|\s+are)?\b[\s\S]*\b(?:on|in)\s+(?:my\s+)?calendars?\b|\bdo\s+i\s+have\b[\s\S]*\b(?:on|in)\s+(?:my\s+)?calendars?\b)/i;
const NEGATED_READ = /\b(?:do\s+not|don't)\s+(?:show|check|view|see|list|read|open)\b/i;
const NON_READ_ONLY_WORDING = /\b(?:add|book|cancel|create|delete|edit|invite|move|remove|reschedule|schedule|update|write)\b/i;

/**
 * Evaluates the complete isolated authority policy for Calendar reads.
 *
 * This is an eligibility decision, not a grant or an execution instruction.
 * The proposed operation is non-authoritative. Only an applicable explicit
 * statement in the current utterance can establish authority; prior context,
 * ambiguous wording and read-write wording cannot.
 */
export function evaluateCalendarReadAuthority(
  request: CalendarReadAuthorityRequest,
): CalendarReadAuthorityDecision {
  const utterance = request.currentUserUtterance.trim().replace(/[‘’]/g, "'");

  if (request.proposedOperation.capability === CALENDAR_READ_CAPABILITY &&
      CALENDAR_REFERENCE.test(utterance) &&
      EXPLICIT_READ.test(utterance) &&
      !NEGATED_READ.test(utterance) &&
      !NON_READ_ONLY_WORDING.test(utterance)) {
    return Object.freeze({
      capability: CALENDAR_READ_CAPABILITY,
      decision: "ALLOW",
      reason: "explicit_calendar_read",
      readOnly: true,
    });
  }

  return Object.freeze({
    capability: CALENDAR_READ_CAPABILITY,
    decision: "ASK",
    reason: "explicit_calendar_read_not_established",
    readOnly: true,
  });
}
