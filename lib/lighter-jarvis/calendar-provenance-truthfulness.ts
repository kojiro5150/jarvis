import type { ChatMessage } from "@/lib/agents/types";

const CALENDAR_RECALL_FOLLOW_UP = /^(?:what (?:times? did you (?:just )?(?:see|give me)|did you (?:just )?(?:say|tell me)(?: (?:my schedule was|about tomorrow))?|did you report for tomorrow)|when were those (?:two )?(?:commitments|meetings)|what are the meetings about)[?!.]*$/i;
const PRIOR_CALENDAR_REPORT = /(?:\bbased on (?:the result from )?your calendar\b|\bcalendar result (?:I )?reported\b|\b(?:today|tomorrow|this (?:morning|afternoon|evening|week)|next seven days) (?:is clear|you have \d+ commitments?)\b|\byour calendar (?:is clear|has \d+ commitments?)\b)/i;
const SCHEDULE_INTERVAL_TEXT = String.raw`\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\s*[–-]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)`;
const SCHEDULE_ONLY_CALENDAR_REPORT = new RegExp(
  String.raw`^Based on your calendar(?: for [^,.\n]+)?,?\s+you have (?:\d+|one|two|three|four|five) commitments?:\s*${SCHEDULE_INTERVAL_TEXT}(?:\s*(?:,|and|\n)\s*${SCHEDULE_INTERVAL_TEXT})*[.!]?$`,
  "i",
);
const DETAIL_FOLLOW_UP = /^what are (?:those|the) (?:meetings|commitments) about[?!.]*$/i;
const USER_SUPPLIED_CALENDAR_DETAIL = /\b(?:my|the)\s+(?:\d{1,2}(?::\d{2})?\s*(?:AM|PM)\s+)?(?:meeting|commitment)\s+(?:is|was|is called|was called|is about|was about)\s+\S/i;

export function isCalendarRecallFollowUp(utterance: string | undefined): boolean {
  if (!utterance) return false;
  return CALENDAR_RECALL_FOLLOW_UP.test(utterance.normalize("NFKC").replace(/\s+/g, " ").trim());
}

/** Content-derived, presentation-only history signal; never authority evidence. */
export function hasPriorVisibleCalendarReport(messages: readonly ChatMessage[]): boolean {
  const currentUserIndex = messages.findLastIndex(message => message.role === "user");
  return messages.some((message, index) => index < currentUserIndex
    && message.role === "assistant"
    && PRIOR_CALENDAR_REPORT.test(message.content));
}

/**
 * Proves only the deliberately bounded report grammar emitted in tests and
 * presentation. Merely containing an interval is not proof: mixed prose must
 * remain ordinary recallable conversation.
 */
export function priorVisibleCalendarReportIsScheduleOnly(messages: readonly ChatMessage[]): boolean {
  const currentUserIndex = messages.findLastIndex(message => message.role === "user");
  const hasExplicitUserDetail = messages.some((message, index) => index < currentUserIndex
    && message.role === "user"
    && USER_SUPPLIED_CALENDAR_DETAIL.test(message.content.normalize("NFKC").replace(/\s+/g, " ")));
  if (hasExplicitUserDetail) return false;
  const report = messages.findLast((message, index) => index < currentUserIndex
    && message.role === "assistant" && PRIOR_CALENDAR_REPORT.test(message.content));
  return Boolean(report && SCHEDULE_ONLY_CALENDAR_REPORT.test(report.content.trim()));
}

export function isCalendarDetailRecallFollowUp(utterance: string | undefined): boolean {
  return Boolean(utterance && DETAIL_FOLLOW_UP.test(utterance.normalize("NFKC").replace(/\s+/g, " ").trim()));
}

export function attributeCalendarRecollection(content: string): string | undefined {
  const rewrites: readonly [RegExp, (match: RegExpMatchArray) => string][] = [
    [/^I (?:saw|identified) ((?:two )?(?:time blocks?|commitments)|these times) (?:on|in) your calendar for tomorrow\s*:\s*([\s\S]+)$/i,
      match => `From the calendar result I reported earlier, ${match[1]} were ${match[2]}`],
    [/^The calendar (?:information|result) I saw showed\s+([\s\S]+)$/i,
      match => `The earlier calendar result I reported showed ${match[1]}`],
    [/^The calendar (?:information|result) I saw\s*[:,]?\s*([\s\S]+)$/i,
      match => `From the earlier calendar result I reported, ${match[1]}`],
    [/^I saw (?:two )?time slots? on your calendar:\s*([\s\S]+)$/i,
      match => `From the calendar result I reported earlier, the time slots were ${match[1]}`],
    [/^I can see that ([\s\S]+)$/i,
      match => `From the calendar result I reported earlier, ${match[1]}`],
    [/^I can see (?:from|on|in) your calendar(?: that)?\s*[:,]?\s*([\s\S]+)$/i,
      match => `From the calendar result I reported earlier, ${match[1]}`],
    [/^I saw (.+?) on your calendar([.:,;!?][\s\S]*)?$/i,
      match => `From the calendar result I reported earlier, I reported ${match[1]}${match[2] ?? "."}`],
    [/^I just (?:checked|read|opened|looked at) your calendar(?: and)?\s*[:,]?\s*([\s\S]*)$/i,
      match => `From the calendar result I reported earlier${match[1] ? `, ${match[1]}` : "."}`],
    [/^Your calendar (?:currently )?shows?\s*[:,]?\s*([\s\S]+)$/i,
      match => `From the calendar result I reported earlier, ${match[1]}`],
    [/^I identified (.+?) from your calendar([.:,;!?][\s\S]*)?$/i,
      match => `From the calendar result I reported earlier, I reported ${match[1]}${match[2] ?? "."}`],
  ];
  for (const [pattern, rewrite] of rewrites) {
    const match = content.match(pattern);
    if (match) return rewrite(match);
  }
  return undefined;
}
