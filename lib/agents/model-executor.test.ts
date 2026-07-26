import { describe, expect, it, vi } from "vitest";

import { assembleAgentSystemPrompt } from "./boa-instructions";
import { getBoaInstruction } from "./boa-instruction-registry";
import { executeInstruction } from "./model-executor";
import { herald } from "./herald";
import { jarvis } from "./jarvis";

import type { ExecutableInstruction } from "./executor";
import type { ModelAdapter } from "./model-executor";

function instruction(
  selectedAgentId = herald.id,
  authority: "advise" | "draft" | "propose-action" = "draft"
): ExecutableInstruction {
  return {
    stepNumber: 1,
    selectedAgentId,
    authority,
    task: "Draft the board update",
    constraints: ["Use confirmed facts"],
    obligations: ["Produce a complete draft"],
    epistemicDiscipline: ["Do not invent facts"],
    escalationConditions: ["A legal commitment is created"],
    expectedOutput: "A finished board update",
    requiresEscalationAssessment: true,
    requiresHumanApproval: authority === "propose-action",
  };
}

function adapter(
  execute: ModelAdapter["execute"] = async () => ({
    content: "Completed specialist output",
    model: "fake-model",
    inputTokens: 10,
    outputTokens: 20,
  })
): ModelAdapter {
  return { execute };
}

describe("provider-agnostic model execution", () => {
  it("executes a valid instruction through the injected adapter", async () => {
    const execute = vi.fn(adapter().execute);
    const result = await executeInstruction(instruction(), adapter(execute));

    expect(result).toEqual({
      status: "completed",
      selectedAgentId: herald.id,
      content: "Completed specialist output",
      model: "fake-model",
      inputTokens: 10,
      outputTokens: 20,
    });
    expect(execute).toHaveBeenCalledOnce();
  });

  it("passes bounded specialist context without provider-specific fields", async () => {
    const execute = vi.fn(adapter().execute);
    await executeInstruction(instruction(), adapter(execute));

    expect(execute).toHaveBeenCalledWith({
      selectedAgentId: herald.id,
      systemPrompt: assembleAgentSystemPrompt(
        herald,
        getBoaInstruction(herald.id)
      ),
      task: "Draft the board update",
      constraints: ["Use confirmed facts"],
      obligations: ["Produce a complete draft"],
      epistemicDiscipline: ["Do not invent facts"],
      escalationConditions: ["A legal commitment is created"],
      expectedOutput: "A finished board update",
    });
  });

  it("does not invoke the adapter without required human approval", async () => {
    const execute = vi.fn(adapter().execute);
    const result = await executeInstruction(
      instruction(jarvis.id, "propose-action"),
      adapter(execute)
    );

    expect(result).toEqual({
      status: "rejected",
      selectedAgentId: jarvis.id,
      reason: "Executable instruction requires explicit human approval",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it("allows an approved proposed action to reach model execution only", async () => {
    const execute = vi.fn(adapter().execute);
    const result = await executeInstruction(
      instruction(jarvis.id, "propose-action"),
      adapter(execute),
      { humanApproved: true }
    );

    expect(result.status).toBe("completed");
    expect(execute).toHaveBeenCalledOnce();
  });

  it("rejects unknown agents before invoking the adapter", async () => {
    const execute = vi.fn(adapter().execute);
    const result = await executeInstruction(
      instruction("unknown-agent"),
      adapter(execute)
    );

    expect(result).toEqual({
      status: "rejected",
      selectedAgentId: "unknown-agent",
      reason: "Agent unknown-agent is unavailable for model execution",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns a typed failure when the adapter throws", async () => {
    const result = await executeInstruction(
      instruction(),
      adapter(async () => {
        throw new Error("provider unavailable");
      })
    );

    expect(result).toEqual({
      status: "failed",
      selectedAgentId: herald.id,
      reason: "provider unavailable",
    });
  });

  it("rejects empty model output", async () => {
    const result = await executeInstruction(
      instruction(),
      adapter(async () => ({ content: "   " }))
    );

    expect(result).toEqual({
      status: "failed",
      selectedAgentId: herald.id,
      reason: "Model adapter returned empty content",
    });
  });
});