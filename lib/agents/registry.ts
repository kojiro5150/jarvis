import { AGENTS, AGENTS_BY_ID } from "./index";
import { jarvis } from "./jarvis";
import { validateBehaviouralConstitutionRegistry } from "./constitutions/registry";

import type {
  AgentCapability,
  AgentDefinition,
  BehaviouralContract,
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

/** Return agents with a machine-readable BOA contract. */
export function listContractedAgents(): AgentDefinition[] {
  return AGENTS.filter((agent) => agent.behaviouralContract);
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

function validateBehaviouralContract(
  agentId: string,
  contract: BehaviouralContract
): string[] {
  const errors: string[] = [];
  const scalarFields: Array<keyof Pick<
    BehaviouralContract,
    "role" | "mandate" | "outputContract"
  >> = ["role", "mandate", "outputContract"];

  for (const field of scalarFields) {
    if (!contract[field].trim()) {
      errors.push(`Agent ${agentId} has empty behavioural contract field: ${field}`);
    }
  }

  const arrayFields: Array<keyof Pick<
    BehaviouralContract,
    | "prevents"
    | "obligations"
    | "epistemicDiscipline"
    | "authority"
    | "escalationConditions"
  >> = [
    "prevents",
    "obligations",
    "epistemicDiscipline",
    "authority",
    "escalationConditions",
  ];

  for (const field of arrayFields) {
    if (contract[field].length === 0) {
      errors.push(`Agent ${agentId} has empty behavioural contract field: ${field}`);
    }
  }

  return errors;
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

    if (!agent.behaviouralContract) {
      errors.push(`Agent ${agent.id} is missing a behavioural contract`);
      continue;
    }

    errors.push(
      ...validateBehaviouralContract(agent.id, agent.behaviouralContract)
    );
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

  errors.push(...validateBehaviouralConstitutionRegistry());

  return errors;
}
