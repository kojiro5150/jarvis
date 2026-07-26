import { coordinateHandoff } from "./coordinator";

import type {
  CollaborationPlan,
  CollaborationPlanRequest,
  CollaborationPlanStep,
} from "./types";

/**
 * Build an inspectable collaboration plan from an already-ordered set of
 * requested hand-offs.
 *
 * This function preserves caller-declared order and validates each step against
 * its behavioural contract. It does not select specialists, infer dependencies,
 * execute work, judge escalation conditions, or synthesise outputs.
 */
export function planCollaboration(
  request: CollaborationPlanRequest
): CollaborationPlan {
  const steps: CollaborationPlanStep[] = request.steps.map(
    (coordinationRequest, index) => {
      const decision = coordinateHandoff(coordinationRequest);

      return {
        ...decision,
        stepNumber: index + 1,
        requestedAuthority: coordinationRequest.requestedAuthority,
        requiresEscalationAssessment:
          decision.approved && decision.escalationConditions.length > 0,
      };
    }
  );

  const approvedSteps = steps.filter((step) => step.approved);
  const rejectedSteps = steps.filter((step) => !step.approved);
  const approved = rejectedSteps.length === 0;
  const requiresEscalationAssessment = approvedSteps.some(
    (step) => step.requiresEscalationAssessment
  );

  return {
    approved,
    reason: approved
      ? `All ${steps.length} collaboration steps are contract-authorised`
      : `${rejectedSteps.length} of ${steps.length} collaboration steps rejected`,
    steps,
    approvedSteps,
    rejectedSteps,
    requiresEscalationAssessment,
  };
}
