import type { CalendarFactualQuery } from "./calendar-factual-query";
import type { CalendarReadWindow } from "./calendar-read-window";

export const CALENDAR_READ_CAPABILITY = "calendar.read" as const;
export type ProposedCalendarReadOperation = Readonly<{
  capability: typeof CALENDAR_READ_CAPABILITY;
  window: CalendarReadWindow;
  /**
   * Optional presentation/composition intent retained inside the server-owned
   * pending operation. It never grants authority or widens the Calendar read.
   */
  purpose?: "calendar_attention" | "calendar_weekly_allocation" | "calendar_factual_query" | "calendar_morning_brief" | "calendar_advise" | "calendar_act_validation";
  /** Server-owned deterministic factual selector intent; never model context. */
  factualQuery?: CalendarFactualQuery;
  /** Exact today sub-window bound at proposal time for Morning Brief composition. */
  morningBriefTodayWindow?: CalendarReadWindow;
}>;
/** Retained name for the closed Calendar proposal API. */
export type ProposedOperation = ProposedCalendarReadOperation;

export interface CalendarReadAuthorityRequest {
  readonly proposedOperation: ProposedCalendarReadOperation;
  readonly currentUserUtterance: string;
}

export type CalendarReadAuthorityEvidence = Readonly<{
  source: "current_user_utterance";
  utterance: string;
  basis: "explicit_calendar_read";
}>;

export type CalendarReadAuthorityDecision = Readonly<{
  capability: typeof CALENDAR_READ_CAPABILITY;
  decision: "ALLOW" | "ASK" | "DENY";
  reason: "explicit_calendar_read" | "explicit_calendar_read_not_established";
  readOnly: true;
  authorityEvidence: readonly CalendarReadAuthorityEvidence[];
}>;

const CALENDAR_REFERENCE = /\b(?:my\s+)?calendars?\b/i;
const EXPLICIT_READ = /(?:\b(?:show|check|view|see|list|read|open)\b[\s\S]*\b(?:my\s+)?calendars?\b|\bwhat(?:'s|\s+is|\s+are)?\b[\s\S]*\b(?:on|in)\s+(?:my\s+)?calendars?\b|\bdo\s+i\s+have\b[\s\S]*\b(?:on|in)\s+(?:my\s+)?calendars?\b)/i;
const NEGATED_READ = /\b(?:(?:do\s+not|don't|cannot|can't|never|not)\b[^.!?\n]{0,80}\b(?:show|check|view|see|list|read|open)|(?:show|check|view|see|list|read|open)\b[^.!?\n]{0,80}\bnot\b[^.!?\n]{0,40}\b(?:my\s+)?calendars?)\b/i;
const NON_READ_ONLY_WORDING = /\b(?:add|book|cancel|create|delete|edit|invite|move|remove|reschedule|schedule|update|write)\b/i;

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
      authorityEvidence: Object.freeze([
        Object.freeze({
          source: "current_user_utterance",
          utterance: request.currentUserUtterance,
          basis: "explicit_calendar_read",
        }),
      ]),
    });
  }

  return Object.freeze({
    capability: CALENDAR_READ_CAPABILITY,
    decision: "ASK",
    reason: "explicit_calendar_read_not_established",
    readOnly: true,
    authorityEvidence: Object.freeze([]),
  });
}
