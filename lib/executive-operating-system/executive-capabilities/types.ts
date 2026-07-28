import type {
  GovernedActionProposal,
  GovernedActionProposalBoundary,
  GovernedActionProposalAuthorityRequirement,
  GovernedActionProposalCondition,
  GovernedActionProposalKind,
  GovernedActionProposalStatus,
  GovernedActionProposalSet,
} from "../proposal";

export const EXECUTIVE_CAPABILITY_ROUTING_CONTRACT_VERSION = "executive-capability-routing-v2" as const;

export type CapabilityStatus = "active" | "inactive";
export interface ExecutiveCapabilityDefinition {
  readonly capabilityId: string;
  readonly capabilityVersion: string;
  readonly status: CapabilityStatus;
  readonly dependencyCapabilityIds: readonly string[];
  readonly supportedActionClasses: readonly GovernedActionProposalKind[];
}
export interface ExecutiveCapabilityScenario { readonly scenarioId:string; readonly capabilityIds:readonly string[] }
export interface ExecutiveCapabilityPolicy { readonly policyId:string; readonly policyVersion:string; readonly eligibleCapabilityIds:readonly string[] }
export interface ExecutiveCapabilityRoutingRule {
  readonly routingRuleId:string;
  readonly capabilityId:string;
  readonly actionClasses:readonly GovernedActionProposalKind[];
  readonly blockedConditionTypes?:readonly GovernedActionProposalCondition["conditionType"][];
}
export interface ExecutiveCapabilityRoutingInput {
  readonly proposalSet:GovernedActionProposalSet;
  readonly scenario:ExecutiveCapabilityScenario;
  readonly policy:ExecutiveCapabilityPolicy;
}
export type CapabilityEligibilityReason = "eligible"|"inactive"|"not_permitted"|"unsupported_action"|"constitutional_constraint"|"conditions_not_met";
export interface RoutedExecutiveCapability { readonly proposalId:string; readonly capabilityId:string; readonly capabilityVersion:string; readonly routingRuleIds:readonly string[]; readonly supportingConditionIds:readonly string[]; readonly dependencyCapabilityIds:readonly string[] }
export interface IneligibleExecutiveCapability { readonly proposalId:string; readonly capabilityId:string; readonly reason:Exclude<CapabilityEligibilityReason,"eligible">; readonly routingRuleIds:readonly string[] }
export interface UnresolvedExecutiveCapability { readonly proposalId:string; readonly capabilityId?:string; readonly reason:"no_matching_capability"|"unsupported_action"|"blocked_by_constitutional_constraint"|"conditions_not_met" }
export interface ProposalCapabilityRouting {
  readonly proposalId:string;
  readonly actionClass:GovernedActionProposalKind;
  readonly proposalStatus:GovernedActionProposalStatus;
  readonly routingReason:string;
  readonly boundedRequest:GovernedActionProposal["payload"];
  readonly conditions:readonly GovernedActionProposalCondition[];
  readonly boundaries:readonly GovernedActionProposalBoundary[];
  readonly evidenceRequirements:readonly string[];
  readonly eligibleCapabilityIds:readonly string[];
  readonly ineligibleCapabilities:readonly IneligibleExecutiveCapability[];
  readonly status:"eligible"|"ineligible"|"unresolved";
  readonly approvalRequired:boolean;
  readonly authorityRequirements:readonly GovernedActionProposalAuthorityRequirement[];
  readonly constitutionalConstraintsApplied:readonly string[];
}
export interface ExecutiveCapabilityRoutingPlan {
  readonly routingPlanId:string;
  readonly routingContractVersion:typeof EXECUTIVE_CAPABILITY_ROUTING_CONTRACT_VERSION;
  readonly proposalSetId:string;
  readonly executiveStateSnapshotId:string;
  readonly executiveContextId:string;
  readonly executiveContextContractVersion:"executive-context-v1";
  readonly deliberationContextId:string;
  readonly reasoningRecordId:string;
  readonly scenarioId:string;
  readonly policyId:string;
  readonly policyVersion:string;
  readonly proposalRoutings:readonly ProposalCapabilityRouting[];
  readonly routedCapabilities:readonly RoutedExecutiveCapability[];
  readonly ineligibleCapabilities:readonly IneligibleExecutiveCapability[];
  readonly unresolvedCapabilities:readonly UnresolvedExecutiveCapability[];
  readonly metadata:Readonly<{owner:"ExecutiveCapabilityRouter";semantics:"eligibility_only";approvalGranted:false;invocationPerformed:false;executionPerformed:false}>;
}
