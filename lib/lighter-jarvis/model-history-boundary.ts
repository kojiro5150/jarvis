import type { ChatMessage } from "@/lib/agents/types";

/**
 * The model-history boundary is deliberately content-derived.  The client is
 * allowed to replay presentation messages, but it cannot attest that a turn
 * was governed (or non-governed) with metadata.  Consequently every message
 * shaped like one of our deterministic private releases is omitted, whether
 * it is genuine or fabricated.
 */
const OMITTED_PRIVATE_RELEASE = "[Governed private result omitted from ordinary model context.]";

const GMAIL_FIELD_RELEASE = /^(?:Subject|Snippet|Plain text body|Attachment filenames|Attachment MIME metadata):/;
const CALENDAR_RELEASE = /^(?:(?:Today|Tomorrow|This morning|This afternoon|This evening|This week) is clear\.|Your Calendar is clear for the next seven days\.|(?:Today|Tomorrow|This morning|This afternoon|This evening|This week|Next seven days) you have \d+ commitments?:\n-|Your Calendar has (?:no|\d+) commitments? in )/;

export function isDeterministicPrivateRelease(content: string): boolean {
  return content === "No Gmail message IDs found."
    || content.startsWith("Gmail message IDs:\n-")
    || GMAIL_FIELD_RELEASE.test(content)
    || CALENDAR_RELEASE.test(content);
}

/** Returns a fresh model-only history; the client-visible transcript is never mutated. */
export function sanitizeModelHistory(messages: readonly ChatMessage[]): ChatMessage[] {
  return messages.map(message => message.role === "assistant" && isDeterministicPrivateRelease(message.content)
    ? { role: "assistant", content: OMITTED_PRIVATE_RELEASE }
    : { role: message.role, content: message.content });
}
