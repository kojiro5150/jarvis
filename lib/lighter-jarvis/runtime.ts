import type { ChatMessage } from "@/lib/agents/types";
import {
  buildLighterSystemPrompt,
  LIGHTER_SPECIALISTS,
} from "./specialists";

export async function buildSpecialistPrompt(): Promise<string> {
  return buildLighterSystemPrompt(LIGHTER_SPECIALISTS.jarvis);
}

export function areValidMessages(messages: unknown): messages is ChatMessage[] {
  return areValidMessageTranscript(messages) && messages.length <= 40;
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
