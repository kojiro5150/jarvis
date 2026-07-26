import { AGENTS_BY_ID } from "./index";

import type { ExecutableInstruction } from "./executor";

/** Provider-neutral request produced from one gated execution instruction. */
export interface ModelExecutionRequest {
  selectedAgentId: string;
  systemPrompt: string;
  task: string;
  constraints: string[];
  obligations: string[];
  epistemicDiscipline: string[];
  escalationConditions: string[];
  expectedOutput: string;
}

/** Minimal provider-neutral response returned by an injected adapter. */
export interface ModelExecutionResponse {
  content: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
}

/** Provider boundary. Production SDK details remain outside orchestration. */
export interface ModelAdapter {
  execute(request: ModelExecutionRequest): Promise<ModelExecutionResponse>;
}

export interface ModelExecutionOptions {
  humanApproved?: boolean;
}

export type ModelExecutionResult =
  | {
      status: "completed";
      selectedAgentId: string;
      content: string;
      model?: string;
      inputTokens?: number;
      outputTokens?: number;
    }
  | {
      status: "rejected" | "failed";
      selectedAgentId: string;
      reason: string;
    };

/**
 * Execute one previously gated instruction through an injected model adapter.
 *
 * This boundary performs a model call only. It cannot call tools, perform
 * external side effects, approve proposed actions, or synthesise multiple
 * specialist outputs.
 */
export async function executeInstruction(
  instruction: ExecutableInstruction,
  adapter: ModelAdapter,
  options: ModelExecutionOptions = {}
): Promise<ModelExecutionResult> {
  const agent = AGENTS_BY_ID[instruction.selectedAgentId];

  if (!agent?.behaviouralContract) {
    return {
      status: "rejected",
      selectedAgentId: instruction.selectedAgentId,
      reason: `Agent ${instruction.selectedAgentId} is unavailable for model execution`,
    };
  }

  if (!instruction.task.trim()) {
    return {
      status: "rejected",
      selectedAgentId: instruction.selectedAgentId,
      reason: "Executable instruction has no task",
    };
  }

  if (instruction.requiresHumanApproval && !options.humanApproved) {
    return {
      status: "rejected",
      selectedAgentId: instruction.selectedAgentId,
      reason: "Executable instruction requires explicit human approval",
    };
  }

  if (!agent.behaviouralContract.authority.includes(instruction.authority)) {
    return {
      status: "rejected",
      selectedAgentId: instruction.selectedAgentId,
      reason: `Agent ${instruction.selectedAgentId} is no longer authorised for ${instruction.authority}`,
    };
  }

  const request: ModelExecutionRequest = {
    selectedAgentId: agent.id,
    systemPrompt: agent.systemPrompt,
    task: instruction.task.trim(),
    constraints: [...instruction.constraints],
    obligations: [...instruction.obligations],
    epistemicDiscipline: [...instruction.epistemicDiscipline],
    escalationConditions: [...instruction.escalationConditions],
    expectedOutput: instruction.expectedOutput,
  };

  try {
    const response = await adapter.execute(request);

    if (!response.content.trim()) {
      return {
        status: "failed",
        selectedAgentId: agent.id,
        reason: "Model adapter returned empty content",
      };
    }

    return {
      status: "completed",
      selectedAgentId: agent.id,
      content: response.content,
      model: response.model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
    };
  } catch (error) {
    return {
      status: "failed",
      selectedAgentId: agent.id,
      reason:
        error instanceof Error ? error.message : "Model adapter execution failed",
    };
  }
}
