import {
  CLAUDE_MAX_TOKENS,
  CLAUDE_MODEL,
  CLAUDE_TIMEOUT_MS,
  getAnthropicClient,
} from "../anthropic-client";

import type {
  ModelAdapter,
  ModelExecutionRequest,
  ModelExecutionResponse,
} from "./model-executor";

interface ClaudeTextBlock {
  type: string;
  text?: string;
}

interface ClaudeMessageResponse {
  content: ClaudeTextBlock[];
  model?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

interface ClaudeMessagesClient {
  create(
    params: {
      model: string;
      max_tokens: number;
      system: string;
      messages: Array<{ role: "user"; content: string }>;
    },
    options?: { timeout?: number }
  ): Promise<ClaudeMessageResponse>;
}

export interface ClaudeModelAdapterOptions {
  client?: ClaudeMessagesClient;
  model?: string;
  maxTokens?: number;
  timeoutMs?: number;
}

function section(title: string, values: string[]): string {
  return values.length > 0
    ? `${title}:\n${values.map((value) => `- ${value}`).join("\n")}`
    : `${title}:\n- None declared`;
}

/** Build the bounded task prompt supplied to Claude. */
export function buildClaudeExecutionPrompt(
  request: ModelExecutionRequest
): string {
  return [
    `TASK:\n${request.task}`,
    section("CONSTRAINTS", request.constraints),
    section("BEHAVIOURAL OBLIGATIONS", request.obligations),
    section("EPISTEMIC DISCIPLINE", request.epistemicDiscipline),
    section("ESCALATION CONDITIONS TO SURFACE, NOT DECIDE", request.escalationConditions),
    `EXPECTED OUTPUT:\n${request.expectedOutput}`,
    "Return only the requested specialist output. Do not call tools, perform actions, or claim that an external side effect occurred.",
  ].join("\n\n");
}

/**
 * Production Anthropic implementation of the provider-neutral model boundary.
 *
 * The adapter performs one text-only Messages API call. It has no tool schema,
 * cannot perform external side effects, and does not approve proposed actions.
 */
export class ClaudeModelAdapter implements ModelAdapter {
  private readonly client: ClaudeMessagesClient;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly timeoutMs: number;

  constructor(options: ClaudeModelAdapterOptions = {}) {
    this.client =
      options.client ??
      (getAnthropicClient().messages as unknown as ClaudeMessagesClient);
    this.model = options.model ?? CLAUDE_MODEL;
    this.maxTokens = options.maxTokens ?? CLAUDE_MAX_TOKENS;
    this.timeoutMs = options.timeoutMs ?? CLAUDE_TIMEOUT_MS;
  }

  async execute(
    request: ModelExecutionRequest
  ): Promise<ModelExecutionResponse> {
    const response = await this.client.create(
      {
        model: this.model,
        max_tokens: this.maxTokens,
        system: request.systemPrompt,
        messages: [
          {
            role: "user",
            content: buildClaudeExecutionPrompt(request),
          },
        ],
      },
      { timeout: this.timeoutMs }
    );

    const content = response.content
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return {
      content,
      model: response.model ?? this.model,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
    };
  }
}
