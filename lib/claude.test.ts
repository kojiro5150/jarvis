import { beforeEach, describe, expect, it, vi } from "vitest";

const { stableCreate, betaCreate } = vi.hoisted(() => ({
  stableCreate: vi.fn(),
  betaCreate: vi.fn(),
}));

vi.mock("./anthropic-client", () => ({
  CLAUDE_MAX_TOKENS: 1024,
  CLAUDE_MODEL: "test-model",
  getAnthropicClient: () => ({
    messages: { create: stableCreate },
    beta: { messages: { create: betaCreate } },
  }),
}));

import { callClaude, type ClaudeTool } from "./claude";

const handoffTool: ClaudeTool = {
  name: "propose_handoff",
  description: "Propose a specialist handoff.",
  input_schema: {
    type: "object",
    properties: {
      specialist_id: { type: "string", enum: ["dawnwatch"] },
    },
    required: ["specialist_id"],
  },
};

describe("callClaude endpoint selection", () => {
  beforeEach(() => {
    stableCreate.mockReset().mockResolvedValue({ content: [{ type: "text", text: "Reason" }] });
    betaCreate.mockReset();
  });

  it("uses the stable Messages API for a propose_handoff-only call", async () => {
    const result = await callClaude(
      "system",
      [{ role: "user", content: "Please route this" }],
      [handoffTool],
    );

    expect(stableCreate).toHaveBeenCalledOnce();
    expect(stableCreate).toHaveBeenCalledWith(expect.objectContaining({ tools: [handoffTool] }));
    expect(betaCreate).not.toHaveBeenCalled();
    expect(result.text).toBe("Reason");
  });
});
