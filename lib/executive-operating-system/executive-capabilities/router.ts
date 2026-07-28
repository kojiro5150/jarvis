import { createHash } from "node:crypto";
import { EXECUTIVE_CONTEXT_CONTRACT_VERSION } from "../../executive-context";
import { ExecutiveCapabilityRegistry } from "./registry";
import {
  EXECUTIVE_CAPABILITY_ROUTING_CONTRACT_VERSION,
  type ExecutiveCapabilityRoutingInput,
  type ExecutiveCapabilityRoutingPlan,
  type RoutedExecutiveCapability,
  type UnresolvedExecutiveCapability,
} from "./types";

const freeze = <T>(value: T): T => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const identity = (parts: readonly unknown[]): string => createHash("sha256").update(JSON.stringify(parts)).digest("hex");

export class ExecutiveCapabilityRouter {
  constructor(private readonly registry: ExecutiveCapabilityRegistry) {}

  route(input: ExecutiveCapabilityRoutingInput): ExecutiveCapabilityRoutingPlan {
    const { executiveContext: context, scenario, policy } = input;
    if (context.derivationMetadata.contractVersion !== EXECUTIVE_CONTEXT_CONTRACT_VERSION) {
      throw new Error(`unsupported executive context contract version: ${context.derivationMetadata.contractVersion}`);
    }
    const registeredScenario = this.registry.scenarios.find((value) => value.scenarioId === scenario.scenarioId);
    const registeredPolicy = this.registry.policies.find((value) => value.policyId === policy.policyId);
    if (registeredScenario !== scenario) throw new Error(`scenario is not the registered definition: ${scenario.scenarioId}`);
    if (registeredPolicy !== policy) throw new Error(`policy is not the registered definition: ${policy.policyId}`);

    const presentTypes = new Set(context.deterministicConditions.map((condition) => condition.type));
    const permitted = new Set(policy.eligibleCapabilityIds);
    const routed = new Map<string, RoutedExecutiveCapability>();
    const unresolved: UnresolvedExecutiveCapability[] = [];

    for (const capabilityId of scenario.capabilityIds) {
      const capability = this.registry.capability(capabilityId)!;
      const rules = this.registry.routingRules.filter((rule) => rule.capabilityId === capabilityId && rule.conditionTypes.every((type) => presentTypes.has(type)));
      if (capability.status !== "active") unresolved.push({ capabilityId, reason: "inactive" });
      else if (!permitted.has(capabilityId)) unresolved.push({ capabilityId, reason: "not_permitted" });
      else if (rules.length === 0) unresolved.push({ capabilityId, reason: "conditions_not_met" });
      else {
        const types = new Set(rules.flatMap((rule) => rule.conditionTypes));
        routed.set(capabilityId, {
          capabilityId,
          capabilityVersion: capability.capabilityVersion,
          routingRuleIds: rules.map((rule) => rule.routingRuleId).sort(),
          supportingConditionIds: context.deterministicConditions.filter((condition) => types.has(condition.type)).map((condition) => condition.conditionId).sort(),
          dependencyCapabilityIds: [...capability.dependencyCapabilityIds].sort(),
        });
      }
    }

    // Dependencies must themselves be in the routed scenario; no recursive execution
    // is attempted here, which also guards callers if an unvalidated registry is forged.
    for (const capability of [...routed.values()]) {
      if (capability.dependencyCapabilityIds.some((id) => !routed.has(id))) {
        routed.delete(capability.capabilityId);
        unresolved.push({ capabilityId: capability.capabilityId, reason: "conditions_not_met" });
      }
    }
    const routedCapabilities = [...routed.values()].sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
    const unresolvedCapabilities = unresolved.sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
    return freeze({
      routingPlanId: `executive-capability-routing:${identity([context.contextId, scenario.scenarioId, policy.policyId, routedCapabilities, unresolvedCapabilities])}`,
      routingContractVersion: EXECUTIVE_CAPABILITY_ROUTING_CONTRACT_VERSION,
      executiveContextId: context.contextId,
      executiveStateSnapshotId: context.sourceStateIdentity.snapshotId,
      executiveContextContractVersion: context.derivationMetadata.contractVersion,
      scenarioId: scenario.scenarioId,
      policyId: policy.policyId,
      routedCapabilities,
      unresolvedCapabilities,
    });
  }
}
