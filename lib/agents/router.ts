import { AGENTS_BY_ID } from "./index";
import { jarvis } from "./jarvis";
import {
  findAgentsByCapability,
  findAgentsByTrigger,
} from "./registry";

import type {
  RoutingDecision,
  RoutingIntent,
} from "./types";

/**
 * Select a specialist from an already-interpreted routing intent using
 * deterministic registry metadata.
 *
 * Precedence:
 * 1. Explicit valid specialist request
 * 2. First capability match, following inferred capability order
 * 3. First trigger match, following inferred trigger order
 * 4. JARVIS fallback
 *
 * Reasoning depth is carried forward unchanged. This function does not
 * classify raw user text, call a model, execute a hand-off, or authorise an
 * external action.
 */
export function routeTask(intent: RoutingIntent): RoutingDecision {
  if (intent.requestedAgentId) {
    if (AGENTS_BY_ID[intent.requestedAgentId]) {
      return {
        selectedAgentId: intent.requestedAgentId,
        reason: `Explicit specialist request: ${intent.requestedAgentId}`,
        confidence: intent.confidence,
        source: intent.source,
        reasoningDepth: intent.reasoningDepth,
      };
    }

    return {
      selectedAgentId: jarvis.id,
      reason: `Unknown specialist requested: ${intent.requestedAgentId}; routed to JARVIS`,
      confidence: "low",
      source: "fallback",
      reasoningDepth: intent.reasoningDepth,
    };
  }

  for (const capability of intent.inferredCapabilities) {
    const [agent] = findAgentsByCapability(capability);

    if (agent) {
      return {
        selectedAgentId: agent.id,
        reason: `Matched capability: ${capability}`,
        confidence: intent.confidence,
        source: intent.source,
        reasoningDepth: intent.reasoningDepth,
      };
    }
  }

  for (const trigger of intent.inferredTriggers) {
    const [agent] = findAgentsByTrigger(trigger);

    if (agent) {
      return {
        selectedAgentId: agent.id,
        reason: `Matched hand-off trigger: ${trigger}`,
        confidence: intent.confidence,
        source: intent.source,
        reasoningDepth: intent.reasoningDepth,
      };
    }
  }

  return {
    selectedAgentId: jarvis.id,
    reason: "No specialist match; routed to JARVIS",
    confidence: "low",
    source: "fallback",
    reasoningDepth: intent.reasoningDepth,
  };
}
