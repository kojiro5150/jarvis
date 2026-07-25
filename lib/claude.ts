import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "./agents/types";

/**
 * Server-only Claude client. This file must never be imported from a
 * client component ("use client") — it reads the API key from process.env,
 * which is only populated on the server / at build time for server code.
 */
let client: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (dev) or your Vercel project's Environment Variables (prod)."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

export const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";

export async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
}
