import type { ChatMessage } from "@/lib/agents/types";
import {
  buildLighterSystemPrompt,
  LIGHTER_SPECIALISTS,
} from "./specialists";

export const MAX_MODEL_MESSAGES = 40;
export const MAX_RETAINED_HISTORY_MESSAGES = MAX_MODEL_MESSAGES - 1;

export async function buildSpecialistPrompt(): Promise<string> {
  return buildLighterSystemPrompt(LIGHTER_SPECIALISTS.jarvis);
}

export function areValidMessages(messages: unknown): messages is ChatMessage[] {
  return areValidMessageTranscript(messages) && messages.length <= MAX_MODEL_MESSAGES;
}

/** Validates authority inputs without treating the ordinary-model context cap as an authority cap. */
export function areValidMessageTranscript(messages: unknown): messages is ChatMessage[] {
  return Array.isArray(messages) && messages.length > 0 && messages.every(
    message => message && typeof message === "object"
      && (message.role === "user" || message.role === "assistant")
      && typeof message.content === "string"
      && message.content.length > 0
      && message.content.length < 8_000,
  );
}

/**
 * Applies the fixed model transport cap without making semantic relevance
 * decisions. The final entry is the incoming turn, leaving 39 history slots.
 */
export function compactModelTranscript(messages: readonly ChatMessage[]): ChatMessage[] {
  return messages.length <= MAX_MODEL_MESSAGES
    ? messages.map(message => ({ role: message.role, content: message.content }))
    : messages.slice(-MAX_MODEL_MESSAGES).map(message => ({ role: message.role, content: message.content }));
}
