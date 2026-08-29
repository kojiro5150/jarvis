import type { ChatMessage } from "@/lib/agents/types";
import { isProviderIdLike } from "./private-capability-handoff-guard";

/**
 * The model-history boundary is deliberately content-derived.  The client is
 * allowed to replay presentation messages, but it cannot attest that a turn
 * was governed (or non-governed) with metadata.  Consequently every message
 * shaped like one of our deterministic private releases is omitted, whether
 * it is genuine or fabricated.
 */
const OMITTED_PRIVATE_RELEASE = "[Governed private result omitted from ordinary model context.]";
const NEGATIVE_CALENDAR_FACTUAL_RELEASE = "[Prior governed Calendar factual result: no matching event.]";
const OMITTED_CALENDAR_FACTUAL_REQUEST = "[Prior governed Calendar factual request omitted from ordinary model context.]";
const OMITTED_GMAIL_READ_REQUEST = "[Prior governed Gmail read request omitted from ordinary model context.]";
const OMITTED_DRIVE_READ_REQUEST = "[Prior governed Drive read request omitted from ordinary model context.]";
const OMITTED_DRIVE_PROVIDER_ID_FOLLOW_UP = "[Prior governed Drive provider-ID follow-up omitted from ordinary model context.]";

const GMAIL_FIELD_RELEASE = /^(?:From|Subject|Snippet|Plain text body|Attachment filenames|Attachment MIME metadata):/;
const GMAIL_SUBJECT_LIST_RELEASE = /^(?:Recent Gmail messages:\n(?:-|1\. From:)|No recent Gmail messages found\.$)/;
const GMAIL_SENDER_RELEASE = /^(?:Gmail messages from .+:\n-|No Gmail messages found from .+\.|I found more than one real Gmail sender matching that reference:\n-)/;
const CALENDAR_RELEASE = /^(?:(?:Today|Tomorrow|This morning|This afternoon|This evening|This week|Next week) is clear\.|Your Calendar is clear for the next seven days\.|(?:Today|Tomorrow|This morning|This afternoon|This evening|This week|Next week|Next seven days) you have \d+ commitments?:\n-|Your Calendar has (?:no|\d+) commitments? in |(?:This|Next) week's resolved Calendar allocation:|Calendar factual result:\n)/;
const DRIVE_RELEASE = /^(?:No Drive files found\.|Drive files:\n-)/;
const DRIVE_CONTENT_RELEASE = /^Drive document \([A-Za-z0-9_-]+\):\n/;
const EXACT_GMAIL_READ_REQUEST = /^gmail\.read [^\s\[\],<>]+ \[(?:sender|subject|snippet|plain_text_body|attachment_filenames|attachment_mime_metadata)(?:,(?:sender|subject|snippet|plain_text_body|attachment_filenames|attachment_mime_metadata))*\]$/;
const EXACT_DRIVE_READ_REQUEST = /^drive\.read [A-Za-z0-9_-]+ \[text\]$/;
const EXPLICIT_CONFIRMATION = /^(?:yes|yes,?\s+please|confirm|confirmed|proceed|go\s+ahead)[.!]?$/i;

function priorCalendarRequestIndexes(messages: readonly ChatMessage[], currentUserIndex: number): ReadonlySet<number> {
  const requestIndexes = new Set<number>();
  messages.forEach((message, releaseIndex) => {
    if (releaseIndex >= currentUserIndex
      || message.role !== "assistant"
      || !message.content.startsWith("Calendar factual result:\n")) return;

    const confirmationIndex = releaseIndex - 1;
    const promptIndex = releaseIndex - 2;
    const requestIndex = releaseIndex - 3;
    const confirmation = messages[confirmationIndex];
    const prompt = messages[promptIndex];
    const request = messages[requestIndex];

    if (!confirmation || confirmation.role !== "user" || !EXPLICIT_CONFIRMATION.test(confirmation.content.trim())) return;
    if (!prompt || prompt.role !== "assistant"
      || prompt.content !== "Please explicitly confirm that I may read your Calendar.") return;
    if (!request || request.role !== "user") return;

    requestIndexes.add(requestIndex);
  });
  return requestIndexes;
}


/** Content-derived signal used only by downstream deny/presentation guards. */
export function hasGovernedGmailHistory(messages: readonly ChatMessage[]): boolean {
  const currentUserIndex = messages.findLastIndex(message => message.role === "user");
  return messages.some((message, index) =>
    (message.role === "assistant" && (
      message.content === "No Gmail message IDs found."
      || message.content.startsWith("Gmail message IDs:\n-")
      || GMAIL_SUBJECT_LIST_RELEASE.test(message.content)
      || GMAIL_SENDER_RELEASE.test(message.content)
      || GMAIL_FIELD_RELEASE.test(message.content)
    ))
    || (message.role === "user" && index !== currentUserIndex && EXACT_GMAIL_READ_REQUEST.test(message.content.trim())),
  );
}

export function hasGovernedDriveHistory(messages: readonly ChatMessage[]): boolean {
  const currentUserIndex = messages.findLastIndex(message => message.role === "user");
  return messages.some((message, index) =>
    (message.role === "assistant" && (DRIVE_RELEASE.test(message.content) || DRIVE_CONTENT_RELEASE.test(message.content)))
    || (message.role === "user" && index !== currentUserIndex && EXACT_DRIVE_READ_REQUEST.test(message.content)),
  );
}

function isNegativeCalendarFactualRelease(content: string): boolean {
  return content === "Calendar factual result:\nNo matching timed Calendar event was found in this bounded read."
    || content === "Calendar factual result:\nNo.";
}

export function isDeterministicPrivateRelease(content: string): boolean {
  return content === "No Gmail message IDs found."
    || content.startsWith("Gmail message IDs:\n-")
    || GMAIL_SUBJECT_LIST_RELEASE.test(content)
    || GMAIL_SENDER_RELEASE.test(content)
    || GMAIL_FIELD_RELEASE.test(content)
    || CALENDAR_RELEASE.test(content)
    || DRIVE_RELEASE.test(content)
    || DRIVE_CONTENT_RELEASE.test(content);
}

/** Returns a fresh model-only history; the client-visible transcript is never mutated. */
export function sanitizeModelHistory(messages: readonly ChatMessage[]): ChatMessage[] {
  const currentUserIndex = messages.findLastIndex(message => message.role === "user");
  const calendarRequestIndexes = priorCalendarRequestIndexes(messages, currentUserIndex);
  let governedDriveHistorySeen = false;
  return messages.map((message, index) => {
    const hadPriorGovernedDriveHistory = governedDriveHistorySeen;
    if ((message.role === "assistant" && (DRIVE_RELEASE.test(message.content) || DRIVE_CONTENT_RELEASE.test(message.content)))
      || (message.role === "user" && EXACT_DRIVE_READ_REQUEST.test(message.content))) {
      governedDriveHistorySeen = true;
    }
    if (message.role === "assistant" && isNegativeCalendarFactualRelease(message.content)) {
      return { role: "assistant", content: NEGATIVE_CALENDAR_FACTUAL_RELEASE };
    }
    if (message.role === "assistant" && isDeterministicPrivateRelease(message.content)) {
      return { role: "assistant", content: OMITTED_PRIVATE_RELEASE };
    }
    if (message.role === "user" && index !== currentUserIndex && calendarRequestIndexes.has(index)) {
      return { role: "user", content: OMITTED_CALENDAR_FACTUAL_REQUEST };
    }
    if (message.role === "user" && index !== currentUserIndex && EXACT_GMAIL_READ_REQUEST.test(message.content.trim())) {
      return { role: "user", content: OMITTED_GMAIL_READ_REQUEST };
    }
    if (message.role === "user" && index !== currentUserIndex && EXACT_DRIVE_READ_REQUEST.test(message.content)) {
      return { role: "user", content: OMITTED_DRIVE_READ_REQUEST };
    }
    if (message.role === "user" && index !== currentUserIndex && hadPriorGovernedDriveHistory && isProviderIdLike(message.content)) {
      return { role: "user", content: OMITTED_DRIVE_PROVIDER_ID_FOLLOW_UP };
    }
    return { role: message.role, content: message.content };
  });
}
