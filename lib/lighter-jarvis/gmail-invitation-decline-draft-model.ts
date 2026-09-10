import type { MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";

import {
  CLAUDE_MAX_TOKENS,
  CLAUDE_MODEL,
  CLAUDE_TIMEOUT_MS,
  getAnthropicClient,
} from "../anthropic-client";

export type GmailInvitationDeclineDraftContextSource = Readonly<{
  source: "gmail_invitation_decline_draft";
  sender: string;
  subject: string;
  plainTextBody: string;
}>;

export type GmailInvitationDeclineDraftModelCall = (
  instruction: string,
  context: GmailInvitationDeclineDraftContextSource,
) => Promise<string>;

const SYSTEM_INSTRUCTION = [
  "Prepare only a polite email reply that thanks the sender for the invitation and declines it.",
  "Use only the supplied current-turn Gmail evidence and user instruction.",
  "Do not invent dates, times, meetings, calls, meals, contact details, money, links, actions, or delivery status.",
  "Return exactly JSON with three string keys: sender, subject, draft.",
].join("\n");

export const callGmailInvitationDeclineDraftModel: GmailInvitationDeclineDraftModelCall =
  async (instruction, context) => {
    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system: SYSTEM_INSTRUCTION,
      messages: [{
        role: "user",
        content: JSON.stringify({ instruction, evidence: context }),
      }],
    } as MessageCreateParamsNonStreaming, { timeout: CLAUDE_TIMEOUT_MS });
    return response.content
      .filter((block): block is typeof block & { type: "text"; text: string } => block.type === "text")
      .map((block) => block.text)
      .join("");
  };
