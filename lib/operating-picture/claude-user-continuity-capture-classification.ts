import type { MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources/messages";

import {
  CLAUDE_MODEL,
  getAnthropicClient,
} from "../anthropic-client";
import type {
  UserContinuityCaptureClassificationModelCall,
} from "./user-continuity-capture-classification";
import {
  USER_CONTINUITY_CAPTURE_CLASSES,
} from "./user-continuity-capture-contract";

const TOOL_NAME = "user_continuity_capture_classification";

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

export function createRequiredClaudeUserContinuityCaptureClassificationCall():
UserContinuityCaptureClassificationModelCall {
  return async (systemPrompt, messages) => {
    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 192,
      system: systemPrompt,
      messages: messages.map(message => ({
        role: message.role,
        content: message.content,
      })),
      tools: [{
        name: TOOL_NAME,
        description: "Return only the closed explicit user continuity capture classification.",
        input_schema: {
          type: "object",
          properties: {
            responseType: {
              type: "string",
              enum: ["user_continuity_capture_classification"],
            },
            status: {
              type: "string",
              enum: ["classified", "ambiguous"],
            },
            semanticClass: {
              anyOf: [
                {
                  type: "string",
                  enum: [...USER_CONTINUITY_CAPTURE_CLASSES],
                },
                {
                  type: "null",
                },
              ],
            },
          },
          required: ["responseType", "status", "semanticClass"],
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
      throw new Error("Capture classifier returned narrative text.");
    }

    const toolUses = content.filter(isToolUseBlock);
    if (
      toolUses.length !== 1
      || toolUses[0].name !== TOOL_NAME
    ) {
      throw new Error("Capture classifier did not return exactly one required tool use.");
    }

    return JSON.stringify(toolUses[0].input);
  };
}
