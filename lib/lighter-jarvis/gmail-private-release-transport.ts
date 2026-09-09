import type { ChatMessage } from "@/lib/agents/types";
import { OMITTED_GMAIL_PRIVATE_RELEASE } from "./gmail-private-release-contract";

const GMAIL_RELEASE_PREFIX =
  /^(?:From|Subject|Snippet|Plain text body|Attachment filenames|Attachment MIME metadata):/;

/** Creates request-only history. The visible conversation array is never mutated. */
export function projectGmailPrivateReleasesForTransport(
  messages: readonly ChatMessage[],
  hasEligibleReference: boolean,
): ChatMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: hasEligibleReference
      && message.role === "assistant"
      && message.content.length >= 8_000
      && GMAIL_RELEASE_PREFIX.test(message.content)
      ? OMITTED_GMAIL_PRIVATE_RELEASE
      : message.content,
  }));
}
