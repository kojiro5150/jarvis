import type { ChatMessage } from "@/lib/agents/types";
import { buildProductionDawnwatchInput } from "@/lib/dawnwatch-presentation-selection";
import { buildOperationalState } from "@/lib/operational-state";
import { buildLighterSystemPrompt, type LighterSpecialist } from "./specialists";

export async function buildSpecialistPrompt(specialist: LighterSpecialist): Promise<string> {
  if (specialist.id !== "dawnwatch") return buildLighterSystemPrompt(specialist);

  const state = await buildOperationalState();
  const governedInput = buildProductionDawnwatchInput(state);
  return buildLighterSystemPrompt(
    specialist,
    JSON.stringify({
      contract: "governed_dawnwatch_presentation_input",
      notice: "Identity and provenance fields are deterministic evidence. Do not reconstruct missing values.",
      input: governedInput,
    }),
  );
}

export function areValidMessages(messages: unknown): messages is ChatMessage[] {
  return Array.isArray(messages) && messages.length > 0 && messages.length <= 40 && messages.every(
    message => message && typeof message === "object"
      && (message.role === "user" || message.role === "assistant")
      && typeof message.content === "string"
      && message.content.length > 0
      && message.content.length < 8_000,
  );
}
