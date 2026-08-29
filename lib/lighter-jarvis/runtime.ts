import type { ChatMessage } from "@/lib/agents/types";
import {
  buildLighterSystemPrompt,
  getLighterSpecialist,
  LIGHTER_SPECIALISTS,
  type LighterSpecialist,
} from "./specialists";

export interface RelaySpecialistReply {
  specialistId: string;
  reply: string;
}

export async function buildSpecialistPrompt(
  specialist: LighterSpecialist,
  relaySpecialistReply?: RelaySpecialistReply,
): Promise<string> {
  if (specialist.id === "jarvis" && relaySpecialistReply) {
    const sourceSpecialist = getLighterSpecialist(relaySpecialistReply.specialistId);
    if (!sourceSpecialist) return buildLighterSystemPrompt(specialist);
    return buildLighterSystemPrompt(
      specialist,
      JSON.stringify({
        contract: "governed_specialist_reply",
        sourceSpecialistId: sourceSpecialist.id,
        sourceSpecialistName: sourceSpecialist.name,
        reply: relaySpecialistReply.reply,
      }),
    );
  }
  if (specialist.id === "jarvis") {
    return buildLighterSystemPrompt(specialist);
  }
  return buildLighterSystemPrompt(specialist);
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
