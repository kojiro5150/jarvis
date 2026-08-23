import type { ChatMessage } from "./agents/types";
import type { MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import {
  CLAUDE_MAX_TOKENS,
  CLAUDE_MODEL,
  getAnthropicClient,
} from "./anthropic-client";

export { CLAUDE_MODEL } from "./anthropic-client";

export interface ClaudeTool {
  type: string;
  name: string;
}

export interface ClaudeContentBlock {
  type: string;
  text?: string;
  [key: string]: unknown;
}

export interface ClaudeResult {
  content: ClaudeContentBlock[];
  text: string;
}

/**
 * Existing conversational Claude boundary.
 *
 * Sprint 3.3 keeps this public behaviour unchanged while sharing the same
 * server-only client and model configuration as the production model adapter.
 */
export function callClaude(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string>;
export function callClaude(
  systemPrompt: string,
  messages: ChatMessage[],
  tools: ClaudeTool[]
): Promise<ClaudeResult>;
export async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[],
  tools?: ClaudeTool[]
): Promise<string | ClaudeResult> {
  const anthropic = getAnthropicClient();

  const request = {
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    ...(tools ? { tools } : {}),
  } as MessageCreateParamsNonStreaming;

  const response = await anthropic.messages.create(request);
  const content = response.content as ClaudeContentBlock[];

  const text = content
    .filter((block): block is ClaudeContentBlock & { text: string } => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("");

  return tools ? {
    content,
    text,
  } : text;
}
