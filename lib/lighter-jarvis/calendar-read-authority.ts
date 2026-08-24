export const CALENDAR_READ_CAPABILITY = "calendar.read" as const;

export interface CalendarReadAuthorityRequest {
  readonly capability: string;
  readonly userInitiated: boolean;
}

export type CalendarReadAuthorityDecision = Readonly<{
  capability: typeof CALENDAR_READ_CAPABILITY;
  decision: "within_authority" | "outside_authority";
  reason: "explicit_user_calendar_read" | "not_user_initiated" | "capability_not_permitted";
  readOnly: true;
}>;

/**
 * Evaluates the complete isolated authority policy for Calendar reads.
 *
 * This is an eligibility decision, not a grant or an execution instruction.
 * Only an explicit, user-initiated request for the exact `calendar.read`
 * capability is within authority. Everything else fails closed.
 */
export function evaluateCalendarReadAuthority(
  request: CalendarReadAuthorityRequest,
): CalendarReadAuthorityDecision {
  if (request.capability !== CALENDAR_READ_CAPABILITY) {
    return Object.freeze({
      capability: CALENDAR_READ_CAPABILITY,
      decision: "outside_authority",
      reason: "capability_not_permitted",
      readOnly: true,
    });
  }

  if (!request.userInitiated) {
    return Object.freeze({
      capability: CALENDAR_READ_CAPABILITY,
      decision: "outside_authority",
      reason: "not_user_initiated",
      readOnly: true,
    });
  }

  return Object.freeze({
    capability: CALENDAR_READ_CAPABILITY,
    decision: "within_authority",
    reason: "explicit_user_calendar_read",
    readOnly: true,
  });
}
