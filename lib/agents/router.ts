import { AGENTS_BY_ID } from "./index";
import { jarvis } from "./jarvis";
import {
  findAgentsByCapability,
  findAgentsByTrigger,
} from "./registry";

import type {
  AgentCapability,
  HandoffTrigger,
  RoutingConfidence,
  RoutingDecision,
  RoutingSource,
} from "./types";

/**
 * Structured routing facts produced before deterministic specialist selection.
 *
 * This contract accepts interpreted intent. It does not classify raw user text,
 * call a model, execute a hand-off, or authorise an external action.
 */
export interface RoutingInput {
  /** Explicit specialist requested by the user or orchestrator. */
  requestedAgentId?: string;

  /** Capability required to handle the task. */
  capability?: AgentCapability;

  /** High-level intent associated with the task. */
  trigger?: HandoffTrigger;

  /** How the interpreted routing facts were produced. */
  source: RoutingSource;

  /** Confidence in the interpreted routing facts. */
  confidence: RoutingConfidence;
}

/**
 * Select a specialist using deterministic registry metadata.
 *
 * Precedence:
 * 1. Explicit valid specialist request
 * 2. First capability match in constitutional registry order
 * 3. First trigger match in constitutional registry order
 * 4. JARVIS fallback
 */
export function routeTask(input: RoutingInput): RoutingDecision {
  if (input.requestedAgentId && AGENTS_BY_ID[input.requestedAgentId]) {
    return {
      selectedAgentId: input.requestedAgentId,
      reason: `Explicit specialist request: ${input.requestedAgentId}`,
      confidence: input.confidence,
      source: input.source,
    };
  }

  if (input.capability) {
    const [agent] = findAgentsByCapability(input.capability);

    if (agent) {
      return {
        selectedAgentId: agent.id,
        reason: `Matched capability: ${input.capability}`,
        confidence: input.confidence,
        source: input.source,
      };
    }
  }

  if (input.trigger) {
    const [agent] = findAgentsByTrigger(input.trigger);

    if (agent) {
      return {
        selectedAgentId: agent.id,
        reason: `Matched hand-off trigger: ${input.trigger}`,
        confidence: input.confidence,
        source: input.source,
      };
    }
  }

  return {
    selectedAgentId: jarvis.id,
    reason: input.requestedAgentId
      ? `Unknown specialist requested: ${input.requestedAgentId}; routed to JARVIS`
      : "No specialist match; routed to JARVIS",
    confidence: "low",
    source: "fallback",
  };
}
