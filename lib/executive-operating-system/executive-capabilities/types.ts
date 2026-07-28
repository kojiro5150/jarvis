import type {
  ExecutiveContextConditionType,
  ExecutiveContextSnapshot,
} from "../../executive-context";

export const EXECUTIVE_CAPABILITY_ROUTING_CONTRACT_VERSION =
  "executive-capability-routing-v1" as const;

export type CapabilityStatus = "active" | "inactive";

export interface ExecutiveCapabilityDefinition {
  readonly capabilityId: string;
  readonly capabilityVersion: string;
  readonly status: CapabilityStatus;
  readonly dependencyCapabilityIds: readonly string[];
}

export interface ExecutiveCapabilityScenario {
  readonly scenarioId: string;
  readonly capabilityIds: readonly string[];
}

export interface ExecutiveCapabilityPolicy {
  readonly policyId: string;
  readonly eligibleCapabilityIds: readonly string[];
}

export interface ExecutiveCapabilityRoutingRule {
  readonly routingRuleId: string;
  readonly capabilityId: string;
  /** Stable condition types drive routing; condition identities are evidence only. */
  readonly conditionTypes: readonly ExecutiveContextConditionType[];
}

export interface ExecutiveCapabilityRoutingInput {
  readonly executiveContext: ExecutiveContextSnapshot;
  readonly scenario: ExecutiveCapabilityScenario;
  readonly policy: ExecutiveCapabilityPolicy;
}

export interface RoutedExecutiveCapability {
  readonly capabilityId: string;
  readonly capabilityVersion: string;
  readonly routingRuleIds: readonly string[];
  readonly supportingConditionIds: readonly string[];
  readonly dependencyCapabilityIds: readonly string[];
}

export interface UnresolvedExecutiveCapability {
  readonly capabilityId: string;
  readonly reason: "inactive" | "not_permitted" | "conditions_not_met";
}

export interface ExecutiveCapabilityRoutingPlan {
  readonly routingPlanId: string;
  readonly routingContractVersion: typeof EXECUTIVE_CAPABILITY_ROUTING_CONTRACT_VERSION;
  readonly executiveContextId: string;
  readonly executiveStateSnapshotId: string;
  readonly executiveContextContractVersion: "executive-context-v1";
  readonly scenarioId: string;
  readonly policyId: string;
  readonly routedCapabilities: readonly RoutedExecutiveCapability[];
  readonly unresolvedCapabilities: readonly UnresolvedExecutiveCapability[];
}
