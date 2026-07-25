import { AGENTS_BY_ID } from "./index";

import type {
  CoordinationDecision,
  CoordinationRequest,
} from "./types";

/**
 * Check a requested specialist hand-off against the selected agent's declared
 * BOA behavioural contract.
 *
 * This function is pure and deterministic. It does not infer intent, judge
 * whether a free-text escalation condition has been met, call a model, or
 * authorise any external side effect.
 */
export function coordinateHandoff(
  request: CoordinationRequest
): CoordinationDecision {
  const agent = AGENTS_BY_ID[request.selectedAgentId];

  if (!agent) {
    return {
      selectedAgentId: request.selectedAgentId,
      approved: false,
      reason: `Unknown agent: ${request.selectedAgentId}`,
      obligations: [],
      epistemicDiscipline: [],
      escalationConditions: [],
    };
  }

  const contract = agent.behaviouralContract;

  if (!contract) {
    return {
      selectedAgentId: agent.id,
      approved: false,
      reason: `Agent ${agent.id} has no behavioural contract`,
      obligations: [],
      epistemicDiscipline: [],
      escalationConditions: [],
    };
  }

  if (!contract.authority.includes(request.requestedAuthority)) {
    return {
      selectedAgentId: agent.id,
      approved: false,
      reason: `Agent ${agent.id} is not authorised for ${request.requestedAuthority}`,
      obligations: [...contract.obligations],
      epistemicDiscipline: [...contract.epistemicDiscipline],
      escalationConditions: [...contract.escalationConditions],
      outputContract: contract.outputContract,
    };
  }

  return {
    selectedAgentId: agent.id,
    approved: true,
    reason: `Agent ${agent.id} is authorised for ${request.requestedAuthority}`,
    grantedAuthority: request.requestedAuthority,
    obligations: [...contract.obligations],
    epistemicDiscipline: [...contract.epistemicDiscipline],
    escalationConditions: [...contract.escalationConditions],
    outputContract: contract.outputContract,
  };
}
