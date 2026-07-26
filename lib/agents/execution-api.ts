import { prepareExecution } from "./executor";
import { executeInstruction } from "./model-executor";

import type { ModelAdapter, ModelExecutionResult } from "./model-executor";
import type { CollaborationPlanStep, HandoffAuthority } from "./types";

export interface SpecialistExecutionApiRequest {
  step: CollaborationPlanStep;
  task: string;
  constraints: string[];
  expectedOutput?: string;
  humanApproved?: boolean;
}

export interface SpecialistExecutionApiResponse {
  status: number;
  body:
    | { status: "completed"; result: ModelExecutionResult }
    | { status: "rejected" | "failed"; reason: string };
}

const AUTHORITIES: HandoffAuthority[] = ["advise", "draft", "propose-action"];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isAuthority(value: unknown): value is HandoffAuthority {
  return typeof value === "string" && AUTHORITIES.includes(value as HandoffAuthority);
}

function isCollaborationPlanStep(value: unknown): value is CollaborationPlanStep {
  if (!value || typeof value !== "object") return false;

  const step = value as Record<string, unknown>;
  return (
    Number.isInteger(step.stepNumber) &&
    typeof step.selectedAgentId === "string" &&
    isAuthority(step.requestedAuthority) &&
    typeof step.approved === "boolean" &&
    typeof step.reason === "string" &&
    (step.grantedAuthority === undefined || isAuthority(step.grantedAuthority)) &&
    isStringArray(step.obligations) &&
    isStringArray(step.epistemicDiscipline) &&
    isStringArray(step.escalationConditions) &&
    typeof step.requiresEscalationAssessment === "boolean"
  );
}

export function parseSpecialistExecutionRequest(
  value: unknown
): SpecialistExecutionApiRequest | null {
  if (!value || typeof value !== "object") return null;

  const request = value as Record<string, unknown>;
  if (
    !isCollaborationPlanStep(request.step) ||
    typeof request.task !== "string" ||
    !isStringArray(request.constraints) ||
    (request.expectedOutput !== undefined &&
      typeof request.expectedOutput !== "string") ||
    (request.humanApproved !== undefined &&
      typeof request.humanApproved !== "boolean")
  ) {
    return null;
  }

  return {
    step: request.step,
    task: request.task,
    constraints: [...request.constraints],
    expectedOutput: request.expectedOutput,
    humanApproved: request.humanApproved,
  };
}

/**
 * Prepare and execute one approved specialist step through an injected adapter.
 * This boundary cannot call tools, perform side effects or execute multiple steps.
 */
export async function handleSpecialistExecution(
  request: SpecialistExecutionApiRequest,
  adapter: ModelAdapter
): Promise<SpecialistExecutionApiResponse> {
  const preparation = prepareExecution({
    step: request.step,
    task: request.task,
    constraints: request.constraints,
    expectedOutput: request.expectedOutput,
  });

  if (!preparation.prepared || !preparation.instruction) {
    return {
      status: 422,
      body: { status: "rejected", reason: preparation.reason },
    };
  }

  const result = await executeInstruction(preparation.instruction, adapter, {
    humanApproved: request.humanApproved,
  });

  if (result.status === "completed") {
    return { status: 200, body: { status: "completed", result } };
  }

  if (
    result.status === "rejected" &&
    result.reason === "Executable instruction requires explicit human approval"
  ) {
    return { status: 403, body: { status: "rejected", reason: result.reason } };
  }

  if (result.status === "rejected") {
    return { status: 422, body: { status: "rejected", reason: result.reason } };
  }

  return {
    status: 502,
    body: { status: "failed", reason: "Specialist model execution failed" },
  };
}
