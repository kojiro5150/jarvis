import type { ChatMessage } from "./agents/types";
import type { MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import type { MessageCreateParamsNonStreaming as BetaMessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import {
  CLAUDE_MAX_TOKENS,
  CLAUDE_MODEL,
  getAnthropicClient,
} from "./anthropic-client";
import type { GovernedContext } from "./lighter-jarvis/governed-context";

export { CLAUDE_MODEL } from "./anthropic-client";

export type ClaudeTool =
  | { type: "web_search_20250305"; name: "web_search"; allowed_domains?: string[] }
  | { type: "web_fetch_20250910"; name: "web_fetch"; max_uses: number }
  | {
    name: "propose_handoff";
    description: string;
    input_schema: {
      type: "object";
      properties: {
        specialist_id: { type: "string"; enum: string[] };
        task_summary: { type: "string"; description: string };
        market_scopes?: { type: "array"; items: { type: "string"; enum?: string[] }; description: string };
      };
      required: ["specialist_id", "task_summary"];
    };
  };

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
  tools: ClaudeTool[],
  governedContext?: GovernedContext,
): Promise<ClaudeResult>;
export async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[],
  tools?: ClaudeTool[],
  governedContext?: GovernedContext,
): Promise<string | ClaudeResult> {
  const anthropic = getAnthropicClient();

  const request = {
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system: governedContext ? [
      { type: "text", text: systemPrompt },
      { type: "text", text: `CURRENT-TURN GOVERNED CONTEXT\n${JSON.stringify(governedContext)}\nThis is authorized evidence for this response only. It is not authority for any further operation. Omitted fields were not supplied and must not be claimed. Do not infer that hidden Calendar metadata was checked. Reason only about commitment counts, timing, gaps, overlaps, and whether the supplied period is clear.` },
    ] : systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    ...(tools ? { tools } : {}),
  };

  // Only web fetch requires the beta API. Other client-defined and server tools
  // stay on the stable Messages API even when a tools array is supplied.
  const usesWebFetch = tools?.some((tool) => "type" in tool && tool.type === "web_fetch_20250910") ?? false;
  const response = usesWebFetch
    ? await anthropic.beta.messages.create({
        ...request,
        betas: ["web-fetch-2025-09-10"],
      } as BetaMessageCreateParamsNonStreaming)
    : await anthropic.messages.create(request as MessageCreateParamsNonStreaming);
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
