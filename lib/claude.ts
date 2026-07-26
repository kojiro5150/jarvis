import type { ChatMessage } from "./agents/types";
import {
  CLAUDE_MAX_TOKENS,
  CLAUDE_MODEL,
  getAnthropicClient,
} from "./anthropic-client";

export { CLAUDE_MODEL } from "./anthropic-client";

/**
 * Existing conversational Claude boundary.
 *
 * Sprint 3.3 keeps this public behaviour unchanged while sharing the same
 * server-only client and model configuration as the production model adapter.
 */
export async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
}
