export const CALENDAR_READ_CAPABILITY = "calendar.read" as const;

export interface CalendarReadAuthorityRequest {
  readonly currentUserUtterance: string;
}

export type CalendarReadAuthorityDecision = Readonly<{
  capability: typeof CALENDAR_READ_CAPABILITY;
  decision: "ALLOW" | "ASK" | "DENY";
  reason: "explicit_calendar_read" | "ambiguous_current_request" | "calendar_read_not_requested";
  readOnly: true;
}>;

const CALENDAR_REFERENCE = /\b(?:my\s+)?calendars?\b/i;
const EXPLICIT_READ = /(?:\b(?:show|check|view|see|list|read|open)\b[\s\S]*\b(?:my\s+)?calendars?\b|\bwhat(?:'s|\s+is|\s+are)?\b[\s\S]*\b(?:on|in)\s+(?:my\s+)?calendars?\b|\bdo\s+i\s+have\b[\s\S]*\b(?:on|in)\s+(?:my\s+)?calendars?\b)/i;
const CALENDAR_MUTATION = /\b(?:add|book|cancel|create|delete|edit|invite|move|remove|reschedule|schedule|update)\b/i;

/**
 * Evaluates the complete isolated authority policy for Calendar reads.
 *
 * This is an eligibility decision, not a grant or an execution instruction.
 * It derives authority from the current utterance itself; callers cannot
 * attest that a request was user initiated or carry authority forward from
 * prior Calendar context.
 */
export function evaluateCalendarReadAuthority(
  request: CalendarReadAuthorityRequest,
): CalendarReadAuthorityDecision {
  const utterance = request.currentUserUtterance.trim();

  if (CALENDAR_MUTATION.test(utterance)) {
    return Object.freeze({
      capability: CALENDAR_READ_CAPABILITY,
      decision: "DENY",
      reason: "calendar_read_not_requested",
      readOnly: true,
    });
  }

  if (CALENDAR_REFERENCE.test(utterance) && EXPLICIT_READ.test(utterance)) {
    return Object.freeze({
      capability: CALENDAR_READ_CAPABILITY,
      decision: "ALLOW",
      reason: "explicit_calendar_read",
      readOnly: true,
    });
  }

  return Object.freeze({
    capability: CALENDAR_READ_CAPABILITY,
    decision: utterance.length === 0 ? "DENY" : "ASK",
    reason: utterance.length === 0 ? "calendar_read_not_requested" : "ambiguous_current_request",
    readOnly: true,
  });
}
