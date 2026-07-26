import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared server-only Anthropic client and configuration.
 *
 * This module must never be imported by a client component because it reads
 * server-side environment variables.
 */
let client: Anthropic | null = null;

export const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";
export const CLAUDE_MAX_TOKENS = 1024;
export const CLAUDE_TIMEOUT_MS = 30_000;

export function getAnthropicClient(): Anthropic {
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
