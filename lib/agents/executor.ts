import { AGENTS_BY_ID } from "./index";

import type {
  CollaborationPlanStep,
  HandoffAuthority,
} from "./types";

/** Input to the deterministic execution-preparation boundary. */
export interface ExecutionRequest {
  step: CollaborationPlanStep;
  task: string;
  constraints: string[];
  expectedOutput?: string;
}

/** Inspectable instruction envelope for a later runtime adapter. */
export interface ExecutableInstruction {
  stepNumber: number;
  selectedAgentId: string;
  authority: HandoffAuthority;
  task: string;
  constraints: string[];
  obligations: string[];
  epistemicDiscipline: string[];
  escalationConditions: string[];
  expectedOutput: string;
  requiresEscalationAssessment: boolean;
  requiresHumanApproval: boolean;
}

/** Result of preparing, but not executing, one collaboration-plan step. */
export interface ExecutionDecision {
  prepared: boolean;
  reason: string;
  instruction?: ExecutableInstruction;
}

/**
 * Convert an approved collaboration-plan step into an execution instruction.
 *
 * This function is pure and deterministic. It does not invoke a model, call a
 * tool, perform a side effect, interpret escalation conditions, or grant human
 * approval.
 */
export function prepareExecution(
  request: ExecutionRequest
): ExecutionDecision {
  const { step } = request;

  if (!step.approved || !step.grantedAuthority) {
    return {
      prepared: false,
      reason: `Collaboration step ${step.stepNumber} is not approved`,
    };
  }

  if (!request.task.trim()) {
    return {
      prepared: false,
      reason: `Collaboration step ${step.stepNumber} has no executable task`,
    };
  }

  const agent = AGENTS_BY_ID[step.selectedAgentId];

  if (!agent?.behaviouralContract) {
    return {
      prepared: false,
      reason: `Agent ${step.selectedAgentId} is unavailable for execution preparation`,
    };
  }

  const contract = agent.behaviouralContract;

  if (!contract.authority.includes(step.grantedAuthority)) {
    return {
      prepared: false,
      reason: `Agent ${agent.id} is no longer authorised for ${step.grantedAuthority}`,
    };
  }

  if (step.requestedAuthority !== step.grantedAuthority) {
    return {
      prepared: false,
      reason: `Collaboration step ${step.stepNumber} has inconsistent authority`,
    };
  }

  return {
    prepared: true,
    reason: `Collaboration step ${step.stepNumber} prepared for ${agent.id}`,
    instruction: {
      stepNumber: step.stepNumber,
      selectedAgentId: agent.id,
      authority: step.grantedAuthority,
      task: request.task.trim(),
      constraints: [...request.constraints],
      obligations: [...contract.obligations],
      epistemicDiscipline: [...contract.epistemicDiscipline],
      escalationConditions: [...contract.escalationConditions],
      expectedOutput:
        request.expectedOutput?.trim() || contract.outputContract,
      requiresEscalationAssessment:
        contract.escalationConditions.length > 0,
      requiresHumanApproval: step.grantedAuthority === "propose-action",
    },
  };
}
