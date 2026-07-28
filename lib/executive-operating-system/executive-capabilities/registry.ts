import type {
  ExecutiveCapabilityDefinition,
  ExecutiveCapabilityPolicy,
  ExecutiveCapabilityRoutingRule,
  ExecutiveCapabilityScenario,
} from "./types";

const nonEmpty = (value: string, label: string): void => {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} must be a non-empty string`);
};

const unique = (values: readonly string[], label: string): void => {
  if (!Array.isArray(values)) throw new Error(`${label} must be an array`);
  const seen = new Set<string>();
  for (const value of values) {
    nonEmpty(value, label);
    if (seen.has(value)) throw new Error(`${label} contains duplicate capability id: ${value}`);
    seen.add(value);
  }
};

/** A closed, eagerly validated registry. Invalid configuration is never publishable. */
export class ExecutiveCapabilityRegistry {
  private readonly capabilitiesById: ReadonlyMap<string, ExecutiveCapabilityDefinition>;

  constructor(
    readonly capabilities: readonly ExecutiveCapabilityDefinition[],
    readonly scenarios: readonly ExecutiveCapabilityScenario[],
    readonly policies: readonly ExecutiveCapabilityPolicy[],
    readonly routingRules: readonly ExecutiveCapabilityRoutingRule[],
  ) {
    const ids = new Set<string>();
    for (const capability of capabilities) {
      nonEmpty(capability.capabilityId, "capabilityId");
      nonEmpty(capability.capabilityVersion, "capabilityVersion");
      if (capability.status !== "active" && capability.status !== "inactive") throw new Error(`invalid status for capability: ${capability.capabilityId}`);
      if (ids.has(capability.capabilityId)) throw new Error(`duplicate capability id: ${capability.capabilityId}`);
      ids.add(capability.capabilityId);
      unique(capability.dependencyCapabilityIds, `dependencies for ${capability.capabilityId}`);
    }
    this.capabilitiesById = new Map(capabilities.map((capability) => [capability.capabilityId, capability]));

    const validateReferences = (values: readonly string[], owner: string): void => {
      unique(values, owner);
      for (const id of values) if (!ids.has(id)) throw new Error(`${owner} references unknown capability id: ${id}`);
    };
    for (const capability of capabilities) validateReferences(capability.dependencyCapabilityIds, `dependencies for ${capability.capabilityId}`);

    this.validateUniqueObjects(scenarios.map((value) => value.scenarioId), "scenario");
    for (const scenario of scenarios) validateReferences(scenario.capabilityIds, `scenario ${scenario.scenarioId}`);
    this.validateUniqueObjects(policies.map((value) => value.policyId), "policy");
    for (const policy of policies) validateReferences(policy.eligibleCapabilityIds, `policy ${policy.policyId}`);
    this.validateUniqueObjects(routingRules.map((value) => value.routingRuleId), "routing rule");
    for (const rule of routingRules) {
      nonEmpty(rule.capabilityId, `routing rule ${rule.routingRuleId} capabilityId`);
      if (!ids.has(rule.capabilityId)) throw new Error(`routing rule ${rule.routingRuleId} references unknown capability id: ${rule.capabilityId}`);
      if (!Array.isArray(rule.conditionTypes) || rule.conditionTypes.length === 0) throw new Error(`routing rule ${rule.routingRuleId} must declare condition types`);
      if (new Set(rule.conditionTypes).size !== rule.conditionTypes.length) throw new Error(`routing rule ${rule.routingRuleId} contains duplicate condition types`);
    }
    this.rejectDependencyCycles();
    Object.freeze(this.capabilities); Object.freeze(this.scenarios); Object.freeze(this.policies); Object.freeze(this.routingRules); Object.freeze(this);
  }

  capability(capabilityId: string): ExecutiveCapabilityDefinition | undefined { return this.capabilitiesById.get(capabilityId); }

  private validateUniqueObjects(ids: readonly string[], label: string): void {
    const seen = new Set<string>();
    for (const id of ids) { nonEmpty(id, `${label} id`); if (seen.has(id)) throw new Error(`duplicate ${label} id: ${id}`); seen.add(id); }
  }

  private rejectDependencyCycles(): void {
    const visiting = new Set<string>(), visited = new Set<string>();
    const visit = (id: string, path: readonly string[]): void => {
      if (visiting.has(id)) throw new Error(`capability dependency cycle: ${[...path, id].join(" -> ")}`);
      if (visited.has(id)) return;
      visiting.add(id);
      for (const dependency of this.capabilitiesById.get(id)!.dependencyCapabilityIds) visit(dependency, [...path, id]);
      visiting.delete(id); visited.add(id);
    };
    for (const id of this.capabilitiesById.keys()) visit(id, []);
  }
}
