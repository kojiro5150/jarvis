import type { ChatMessage } from "../agents/types";
import { OMITTED_GMAIL_INVITATION_DECLINE_DRAFT } from "./gmail-invitation-decline-draft-contract";

const DRAFT_RELEASE = /^Proposed reply to .+\nSubject: .+\n\n[\s\S]+\n\nDrafted from the freshly authorised exact Gmail message\. This message has not been sent\.$/;

/** Request-only projection. The visible client transcript remains unchanged. */
export function projectGmailInvitationDeclineDraftsForTransport(
  messages: readonly ChatMessage[],
  hasDraftRelease: boolean,
): ChatMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: hasDraftRelease && message.role === "assistant" && DRAFT_RELEASE.test(message.content)
      ? OMITTED_GMAIL_INVITATION_DECLINE_DRAFT
      : message.content,
  }));
}

const REUSE = /^(?:(?:edit|revise|rewrite|shorten|expand|send|queue|save|use) (?:that|the) (?:draft|reply)|(?:make|keep) (?:that|the) (?:draft|reply) (?:shorter|longer|warmer|more formal)|send it)[.!?]?$/i;

export function isGmailInvitationDeclineDraftReuse(utterance: string): boolean {
  return REUSE.test(utterance.trim().replace(/\s+/g, " "));
}
