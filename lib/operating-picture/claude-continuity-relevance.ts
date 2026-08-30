import type { MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import {
  CLAUDE_MODEL,
  getAnthropicClient,
} from "../anthropic-client";
import type {
  ModelContinuityAssessmentModelCall,
} from "./model-continuity-assessment";
import type { ModelContinuityId } from "./model-continuity-contract";

const TOOL_NAME = "continuity_relevance";

type AnthropicToolUseBlock = Readonly<{
  type: "tool_use";
  name: string;
  input: unknown;
}>;

function isToolUseBlock(value: unknown): value is AnthropicToolUseBlock {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && (value as Record<string, unknown>).type === "tool_use"
    && typeof (value as Record<string, unknown>).name === "string"
    && "input" in (value as Record<string, unknown>);
}

function hasNonEmptyTextBlock(value: unknown): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const block = value as Record<string, unknown>;
  return block.type === "text"
    && typeof block.text === "string"
    && block.text.trim().length > 0;
}

export function createRequiredClaudeContinuityModelCall(
  allowedContinuityIds: readonly ModelContinuityId[],
): ModelContinuityAssessmentModelCall {
  const allowedIds = Object.freeze([...allowedContinuityIds]);

  return async (systemPrompt, messages) => {
    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      system: systemPrompt,
      messages: messages.map(message => ({
        role: message.role,
        content: message.content,
      })),
      tools: [{
        name: TOOL_NAME,
        description: "Return only the closed durable-continuity relevance assessment.",
        input_schema: {
          type: "object",
          properties: {
            responseType: {
              type: "string",
              enum: ["continuity_relevance"],
            },
            relevance: {
              type: "string",
              enum: ["relevant", "not_relevant"],
            },
            relevantItemIds: {
              type: "array",
              items: {
                type: "string",
                enum: [...allowedIds],
              },
            },
          },
          required: ["responseType", "relevance", "relevantItemIds"],
          additionalProperties: false,
        },
      }],
      tool_choice: {
        type: "tool",
        name: TOOL_NAME,
      },
    } as MessageCreateParamsNonStreaming);

    const content = response.content as unknown[];

    if (content.some(hasNonEmptyTextBlock)) {
      throw new Error("Continuity classifier returned narrative text.");
    }

    const toolUses = content.filter(isToolUseBlock);
    if (
      toolUses.length !== 1
      || toolUses[0].name !== TOOL_NAME
    ) {
      throw new Error("Continuity classifier did not return exactly one required tool use.");
    }

    return JSON.stringify(toolUses[0].input);
  };
}
