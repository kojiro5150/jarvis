import type { ChatMessage } from "@/lib/agents/types";

const CALENDAR_RECALL_FOLLOW_UP = /^(?:what (?:times? did you (?:just )?(?:see|give me)|did you (?:just )?(?:say|tell me)(?: (?:my schedule was|about tomorrow))?|did you report for tomorrow)|when were those (?:two )?(?:commitments|meetings)|what are the meetings about)[?!.]*$/i;
const PRIOR_CALENDAR_REPORT = /(?:\bbased on (?:the result from )?your calendar\b|\blooking at your calendar for (?:today|tomorrow|this (?:morning|afternoon|evening|week)|next seven days)\b[\s\S]*?\byou have (?:\d+|one|two|three|four|five) commitments?\b|\bcalendar result (?:I )?reported\b|\b(?:today|tomorrow|this (?:morning|afternoon|evening|week)|next seven days) (?:is clear|you have \d+ commitments?)\b|\byour calendar (?:is clear|has \d+ commitments?)\b)/i;
const SCHEDULE_INTERVAL_TEXT = String.raw`\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\s*[–-]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM)`;
const SCHEDULE_ONLY_CALENDAR_REPORT = new RegExp(
  String.raw`^Based on your calendar(?: for [^,.\n]+)?,?\s+you have (?:\d+|one|two|three|four|five) commitments?:\s*${SCHEDULE_INTERVAL_TEXT}(?:\s*(?:,|and|\n)\s*${SCHEDULE_INTERVAL_TEXT})*[.!]?$`,
  "i",
);
const DETAIL_FOLLOW_UP = /^what are (?:those|the) (?:meetings|commitments) about[?!.]*$/i;
const USER_SUPPLIED_TIMED_CALENDAR_DETAIL = /\b(?:my|the)\s+(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s+(?:meeting|commitment)\s+(?:is|was)(?:\s+(?:called|about))?\s+\S/i;
const SCHEDULE_INTERVAL_PARTS = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*[–-]\s*\d{1,2}(?::\d{2})?\s*(AM|PM)/gi;
const OMITTED_CALENDAR_METADATA = String.raw`(?:titles?|subjects?|descriptions?|details?|locations?|attendees?|organi[sz]ers?)`;
const FALSE_CALENDAR_REREAD_OFFER = new RegExp(
  String.raw`(^|(?:\r?\n)+|(?<=[.!?])\s+)((?:(?:If you(?:'d| would) like,?\s+)?I can|Would you like me to)\s+(?:(?:check|read|open|access)\s+(?:your\s+|the\s+)?calendar\s+again|(?:reread|re-read)\s+(?:your\s+|the\s+)?calendar)\b[^.!?\n]*\b${OMITTED_CALENDAR_METADATA}\b[^.!?\n]*[.!?]?)`,
  "gi",
);
const CALENDAR_METADATA_LIMITATION =
  "The governed Calendar path available here does not expose titles or descriptions.";

function normalizedTime(hourText: string, minuteText: string | undefined, meridiem: string): string {
  return `${Number(hourText)}:${Number(minuteText ?? "0")}:${meridiem.toUpperCase()}`;
}

/** Presentation-only exact clock binding against the latest visible Calendar report. */
function hasBoundUserCalendarDetail(messages: readonly ChatMessage[], currentUserIndex: number,
  report: ChatMessage | undefined): boolean {
  if (!report) return false;
  const intervalStarts = new Set<string>();
  for (const match of report.content.matchAll(SCHEDULE_INTERVAL_PARTS)) {
    intervalStarts.add(normalizedTime(match[1], match[2], match[3] ?? match[4]));
  }
  if (intervalStarts.size === 0) return false;
  return messages.some((message, index) => {
    if (index >= currentUserIndex || message.role !== "user") return false;
    const match = message.content.normalize("NFKC").replace(/\s+/g, " ")
      .match(USER_SUPPLIED_TIMED_CALENDAR_DETAIL);
    return Boolean(match && intervalStarts.has(normalizedTime(match[1], match[2], match[3])));
  });
}

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
  const report = messages.findLast((message, index) => index < currentUserIndex
    && message.role === "assistant" && PRIOR_CALENDAR_REPORT.test(message.content));
  return Boolean(report && SCHEDULE_ONLY_CALENDAR_REPORT.test(report.content.trim())
    && !hasBoundUserCalendarDetail(messages, currentUserIndex, report));
}

export function isCalendarDetailRecallFollowUp(utterance: string | undefined): boolean {
  return Boolean(utterance && DETAIL_FOLLOW_UP.test(utterance.normalize("NFKC").replace(/\s+/g, " ").trim()));
}

/** Metadata-only audit seam used by the ordinary-model path; it exposes no message content. */
export function calendarRecallDiagnostics(messages: readonly ChatMessage[],
  hasCurrentCalendarGovernedContext = false) {
  const currentUserUtterance = messages.findLast(message => message.role === "user")?.content;
  const priorCalendarReportPresent = hasPriorVisibleCalendarReport(messages);
  const calendarRecallFollowUp = isCalendarRecallFollowUp(currentUserUtterance);
  const isCalendarRecollection = priorCalendarReportPresent && calendarRecallFollowUp;
  return {
    messageCount: messages.length,
    orderedRoles: messages.map(message => message.role),
    priorCalendarReportPresent,
    calendarRecallFollowUp,
    priorVisibleReportIsScheduleOnly: isCalendarRecollection
      && priorVisibleCalendarReportIsScheduleOnly(messages),
    hasCurrentCalendarGovernedContext,
    isCalendarRecollection,
    isDetailFollowUp: isCalendarRecollection
      && isCalendarDetailRecallFollowUp(currentUserUtterance),
  } as const;
}

/** Rewrites only reread offers that falsely promise omitted Calendar metadata. */
export function rewriteFalseCalendarRereadOffer(content: string): string | undefined {
  if (!FALSE_CALENDAR_REREAD_OFFER.test(content)) return undefined;
  FALSE_CALENDAR_REREAD_OFFER.lastIndex = 0;
  let insertedLimitation = false;
  return content.replace(FALSE_CALENDAR_REREAD_OFFER, (_offer, separator: string) => {
    if (insertedLimitation) return separator;
    insertedLimitation = true;
    return `${separator}${CALENDAR_METADATA_LIMITATION}`;
  }).trim();
}

export function attributeCalendarRecollection(content: string): string | undefined {
  // Inspect the complete reply before rewriting. A leading "I saw" can acquire
  // false Calendar provenance from a later sentence in the same response.
  const isCalendarResultReply = /\bcalendar\b/i.test(content);
  if (isCalendarResultReply) {
    const justSawSchedule = content.match(
      /^I just saw ((?:two |\d+ )?(?:time blocks?|time slots?|commitments?|appointments?)[\s\S]+?)\s*\n\s*These are the times I reported from the calendar view a moment ago\.?$/i,
    );
    if (justSawSchedule) {
      return `From the calendar result I reported earlier, there were ${justSawSchedule[1]}`;
    }

    const multiSentenceSaw = content.match(/^I saw\s*:\s*([\s\S]+?)\s*\n\s*Those are the (.+?) I reported from your calendar([^.]*)\.?$/i);
    if (multiSentenceSaw) {
      return `From the calendar result I reported earlier, the ${multiSentenceSaw[2]} were:\n\n${multiSentenceSaw[1]}`;
    }

    const currentSourceRewrites: readonly [RegExp, string][] = [
      [/^From the calendar data I (?:can|could) access,?\s+(?:I )?(?:can )?(?:only )?(?:see|access)\s+/i,
        "From the earlier calendar result I reported, I only had "],
      [/^The calendar view I saw only (?:showed|contained)\s+/i,
        "The earlier Calendar result I reported contained only "],
      [/^The calendar view I saw (?:showed|contained)\s+/i,
        "The earlier Calendar result I reported contained "],
      [/^The calendar projection I can see only includes\s+/i,
        "The earlier Calendar projection I reported only included "],
      [/^The calendar projection I can see shows\s+/i,
        "The earlier Calendar projection I reported showed "],
      [/^The calendar projection I can see contains\s+/i,
        "The earlier Calendar projection I reported contained "],
      [/^The calendar evidence I (?:currently )?have access to shows?\s+/i,
        "The earlier calendar result I reported contained "],
      [/^The calendar (?:data|entries|information) I (?:can|could) (?:currently )?see (?:only )?(?:includes?|shows?)\s+/i,
        "The earlier calendar result I reported only included "],
      [/^The calendar entries I (?:can|could) (?:currently )?see (?:are|were)\s+/i,
        "The entries in the earlier calendar result I reported were "],
      [/^The calendar (?:evidence|information) I (?:currently )?have access to (?:includes?|contains?)\s+/i,
        "The earlier calendar result I reported contained "],
      [/^The calendar (?:data|evidence|information) shows?\s+/i,
        "The earlier calendar result I reported showed "],
      [/^The calendar shows?\s+/i, "The earlier calendar result I reported showed "],
      [/^The information available to me from your calendar shows?\s+/i,
        "The earlier calendar result I reported showed "],
    ];
    for (const [pattern, replacement] of currentSourceRewrites) {
      if (pattern.test(content)) return content.replace(pattern, replacement);
    }
  }

  const rewrites: readonly [RegExp, (match: RegExpMatchArray) => string][] = [
    [/^I (?:just )?(?:saw|identified) ((?:two )?(?:time blocks?|commitments)|these times) (?:on|in) your calendar for tomorrow\s*:?\s*([\s\S]+)$/i,
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

/**
 * Attributes only leading schedule-result perception language. The caller must
 * have already established Calendar recollection from server-owned history;
 * this helper neither detects Calendar intent nor supplies authority.
 */
export function attributeBareCalendarRecollection(content: string): string | undefined {
  const match = content.match(
    /^I (?:can see|(?:just )?saw) ((?:(?:the|those|these) )?(?:timing|times|time blocks?|time slots?)(?:\b[\s\S]*)|(?:the |those |these |two |\d+ )?(?:meetings?|commitments?|appointments?)\b[\s\S]*)$/i,
  );
  if (!match) return undefined;
  return `From the calendar result I reported earlier, ${match[1]}`;
}
