import { AGENTS, AGENTS_BY_ID } from "./index";
import { jarvis } from "./jarvis";

import type {
  AgentCapability,
  AgentDefinition,
  HandoffTrigger,
} from "./types";

/**
 * Return a registered agent by ID.
 *
 * Unknown IDs fall back to JARVIS so callers always receive
 * a valid agent definition.
 */
export function getAgentById(id: string): AgentDefinition {
  return AGENTS_BY_ID[id] ?? jarvis;
}

/**
 * Return every agent that declares the requested capability.
 */
export function findAgentsByCapability(
  capability: AgentCapability
): AgentDefinition[] {
  return AGENTS.filter((agent) =>
    agent.capabilities?.includes(capability)
  );
}

/**
 * Return every agent associated with the requested routing trigger.
 */
export function findAgentsByTrigger(
  trigger: HandoffTrigger
): AgentDefinition[] {
  return AGENTS.filter((agent) =>
    agent.handoffTriggers?.includes(trigger)
  );
}

/**
 * Return the unique capabilities currently declared
 * across the registered agents.
 */
export function listCapabilities(): AgentCapability[] {
  return Array.from(
    new Set(
      AGENTS.flatMap((agent) => agent.capabilities ?? [])
    )
  );
}

/**
 * Validate structural invariants of the agent registry.
 *
 * This checks deterministic metadata only. It does not validate
 * prompts, model behaviour, routing quality, or runtime execution.
 */
export function validateAgentRegistry(): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const agent of AGENTS) {
    if (seenIds.has(agent.id)) {
      errors.push(`Duplicate agent id: ${agent.id}`);
    }

    seenIds.add(agent.id);
  }

  const primaryAgents = AGENTS.filter(
    (agent) => agent.isPrimary
  );

  if (primaryAgents.length !== 1) {
    errors.push(
      `Expected exactly one primary agent, found ${primaryAgents.length}`
    );
  }

  if (!AGENTS_BY_ID[jarvis.id]) {
    errors.push("JARVIS is missing from AGENTS_BY_ID");
  }

  return errors;
}