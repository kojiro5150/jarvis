import { describe, expect, it } from "vitest";

import {
  buildClaudeExecutionPrompt,
  ClaudeModelAdapter,
} from "./claude-model-adapter";

import type { ModelExecutionRequest } from "./model-executor";

const request: ModelExecutionRequest = {
  selectedAgentId: "phdss",
  systemPrompt: "You are PHDSS.",
  task: "Assess the governance risks",
  constraints: ["Human authority is retained"],
  obligations: ["Surface material unknowns"],
  epistemicDiscipline: ["Distinguish evidence from inference"],
  escalationConditions: ["A clinical safety issue is identified"],
  expectedOutput: "A bounded governance assessment",
};

describe("Claude model adapter", () => {
  it("builds a bounded prompt containing every BOA instruction category", () => {
    const prompt = buildClaudeExecutionPrompt(request);

    expect(prompt).toContain("TASK:\nAssess the governance risks");
    expect(prompt).toContain("CONSTRAINTS:\n- Human authority is retained");
    expect(prompt).toContain("BEHAVIOURAL OBLIGATIONS:\n- Surface material unknowns");
    expect(prompt).toContain("EPISTEMIC DISCIPLINE:\n- Distinguish evidence from inference");
    expect(prompt).toContain(
      "ESCALATION CONDITIONS TO SURFACE, NOT DECIDE:\n- A clinical safety issue is identified"
    );
    expect(prompt).toContain("EXPECTED OUTPUT:\nA bounded governance assessment");
    expect(prompt).toContain("Do not call tools");
  });

  it("normalises Claude text and token usage", async () => {
    let capturedParams: unknown;
    let capturedOptions: unknown;

    const adapter = new ClaudeModelAdapter({
      model: "claude-test",
      maxTokens: 512,
      timeoutMs: 1_500,
      client: {
        async create(params, options) {
          capturedParams = params;
          capturedOptions = options;

          return {
            model: "claude-test",
            content: [
              { type: "text", text: "First paragraph." },
              { type: "tool_use" },
              { type: "text", text: "Second paragraph." },
            ],
            usage: { input_tokens: 21, output_tokens: 9 },
          };
        },
      },
    });

    await expect(adapter.execute(request)).resolves.toEqual({
      content: "First paragraph.\nSecond paragraph.",
      model: "claude-test",
      inputTokens: 21,
      outputTokens: 9,
    });

    expect(capturedParams).toMatchObject({
      model: "claude-test",
      max_tokens: 512,
      system: "You are PHDSS.",
      messages: [{ role: "user" }],
    });
    expect(capturedOptions).toEqual({ timeout: 1_500 });
  });

  it("uses the configured model when the provider omits one", async () => {
    const adapter = new ClaudeModelAdapter({
      model: "claude-fallback",
      client: {
        async create() {
          return { content: [{ type: "text", text: "Completed" }] };
        },
      },
    });

    await expect(adapter.execute(request)).resolves.toMatchObject({
      content: "Completed",
      model: "claude-fallback",
    });
  });

  it("returns empty content for the provider-neutral execution boundary to reject", async () => {
    const adapter = new ClaudeModelAdapter({
      client: {
        async create() {
          return { content: [{ type: "tool_use" }] };
        },
      },
    });

    await expect(adapter.execute(request)).resolves.toMatchObject({
      content: "",
    });
  });
});
