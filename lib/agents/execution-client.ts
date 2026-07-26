import type { AgentDefinition, HandoffAuthority } from "./types";
import type { SpecialistExecutionApiRequest } from "./execution-api";

export interface SpecialistExecutionForm {
  authority: HandoffAuthority;
  task: string;
  constraintsText: string;
  expectedOutput: string;
  humanApproved: boolean;
}

export type SpecialistExecutionUiResult =
  | { status: "completed"; content: string; model?: string }
  | { status: "rejected" | "failed"; reason: string };

export function buildSpecialistExecutionRequest(
  agent: AgentDefinition,
  form: SpecialistExecutionForm
): SpecialistExecutionApiRequest | null {
  const contract = agent.behaviouralContract;
  if (!contract || !contract.authority.includes(form.authority)) return null;

  const task = form.task.trim();
  if (!task) return null;

  const constraints = form.constraintsText
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    step: {
      stepNumber: 1,
      selectedAgentId: agent.id,
      requestedAuthority: form.authority,
      approved: true,
      reason: `User selected ${agent.id} with declared ${form.authority} authority`,
      grantedAuthority: form.authority,
      obligations: [...contract.obligations],
      epistemicDiscipline: [...contract.epistemicDiscipline],
      escalationConditions: [...contract.escalationConditions],
      outputContract: contract.outputContract,
      requiresEscalationAssessment: contract.escalationConditions.length > 0,
    },
    task,
    constraints,
    expectedOutput: form.expectedOutput.trim() || undefined,
    humanApproved:
      form.authority === "propose-action" ? form.humanApproved : undefined,
  };
}

export function parseSpecialistExecutionResponse(
  value: unknown
): SpecialistExecutionUiResult {
  if (!value || typeof value !== "object") {
    return { status: "failed", reason: "Invalid execution response" };
  }

  const response = value as Record<string, unknown>;
  if (response.status === "completed" && response.result && typeof response.result === "object") {
    const result = response.result as Record<string, unknown>;
    if (result.status === "completed" && typeof result.content === "string") {
      return {
        status: "completed",
        content: result.content,
        model: typeof result.model === "string" ? result.model : undefined,
      };
    }
  }

  if (
    (response.status === "rejected" || response.status === "failed") &&
    typeof response.reason === "string"
  ) {
    return { status: response.status, reason: response.reason };
  }

  return { status: "failed", reason: "Invalid execution response" };
}
