import type { MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";
import {
  CLAUDE_MODEL,
  getAnthropicClient,
} from "../anthropic-client";
import type {
  ModelContinuityAssessmentModelCall,
} from "./model-continuity-assessment";
import type { ModelContinuityId } from "./model-continuity-contract";

const RELEVANT_TOOL_NAME = "continuity_relevance_relevant";
const NOT_RELEVANT_TOOL_NAME = "continuity_relevance_not_relevant";

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value);
}

function canonicalAssessmentFromToolUse(toolUse: AnthropicToolUseBlock): string {
  if (!isPlainObject(toolUse.input)) {
    throw new Error("Continuity classifier returned invalid tool input.");
  }

  if (toolUse.name === RELEVANT_TOOL_NAME) {
    const keys = Object.keys(toolUse.input);
    if (
      keys.length !== 1
      || keys[0] !== "relevantItemIds"
      || !Array.isArray(toolUse.input.relevantItemIds)
    ) {
      throw new Error("Continuity relevant classifier returned invalid tool input.");
    }

    return JSON.stringify({
      responseType: "continuity_relevance",
      relevance: "relevant",
      relevantItemIds: toolUse.input.relevantItemIds,
    });
  }

  if (toolUse.name === NOT_RELEVANT_TOOL_NAME) {
    if (Object.keys(toolUse.input).length !== 0) {
      throw new Error("Continuity not-relevant classifier returned invalid tool input.");
    }

    return JSON.stringify({
      responseType: "continuity_relevance",
      relevance: "not_relevant",
      relevantItemIds: [],
    });
  }

  throw new Error("Continuity classifier returned an unexpected tool.");
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
      tools: [
        {
          name: RELEVANT_TOOL_NAME,
          description: "Use only when one or more supplied continuity items are directly relevant. Return the relevant continuity IDs only.",
          input_schema: {
            type: "object",
            properties: {
              relevantItemIds: {
                type: "array",
                minItems: 1,
                uniqueItems: true,
                items: {
                  type: "string",
                  enum: [...allowedIds],
                },
              },
            },
            required: ["relevantItemIds"],
            additionalProperties: false,
          },
        },
        {
          name: NOT_RELEVANT_TOOL_NAME,
          description: "Use only when none of the supplied continuity items are directly relevant.",
          input_schema: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
          },
        },
      ],
      tool_choice: {
        type: "any",
      },
    } as MessageCreateParamsNonStreaming);

    const content = response.content as unknown[];

    if (content.some(hasNonEmptyTextBlock)) {
      throw new Error("Continuity classifier returned narrative text.");
    }

    const toolUses = content.filter(isToolUseBlock);
    if (toolUses.length !== 1) {
      throw new Error("Continuity classifier did not return exactly one required tool use.");
    }

    return canonicalAssessmentFromToolUse(toolUses[0]);
  };
}
