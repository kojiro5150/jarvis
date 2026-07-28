export const CAPABILITY_ROUTER_CONTRACT_VERSION = "1.0.0" as const;
export const CAPABILITY_ROUTER_IMPLEMENTATION_VERSION = "1.0.0" as const;

export type CapabilityStatus = "AVAILABLE" | "DISABLED" | "EXPERIMENTAL" | "DEPRECATED";
export type CapabilityInvocationMode = "EXPLICIT" | "SCENARIO_REQUIRED" | "CONTEXT_TRIGGERED" | "DEPENDENCY";
export type InvocationSource = "USER" | "EXECUTIVE_SCENARIO" | "DETERMINISTIC_CONTEXT_RULE" | "CAPABILITY_DEPENDENCY" | "SYSTEM_CONFIGURATION";
export type CapabilityExecutionClass = "READ_ONLY_ANALYSIS" | "ADVISORY" | "PROPOSAL_GENERATION" | "ACTION_CAPABLE";

export interface ExecutiveContextCondition { readonly conditionId: string; readonly rule: string; readonly evidenceIds: readonly string[] }
/** Canonical deterministic context boundary from Sprint 3.27; never the assessment-driven EOS context stage. */
export interface ExecutiveContextSnapshot {
  readonly contextSnapshotId: string;
  readonly sourceStateSnapshotId: string;
  readonly contextContractVersion: string;
  readonly observedAt: string;
  readonly conditions: readonly ExecutiveContextCondition[];
  readonly sourceState: Readonly<{ snapshotId: string; lifecycleSnapshotId: string; assemblyVersion: string; canonicalContractVersion: string }>;
}

export interface ExecutiveCapability {
  readonly capabilityId: string; readonly version: string; readonly owningModuleId: string;
  readonly displayName: string; readonly description: string; readonly status: CapabilityStatus;
  readonly supportedInvocationModes: readonly CapabilityInvocationMode[];
  readonly requiredContextContract: string;
  readonly requiredContextConditions: readonly string[]; readonly prohibitedContextConditions: readonly string[];
  readonly requiredScenarioReferences: readonly string[]; readonly requiredCapabilities: readonly string[];
  readonly incompatibleCapabilities: readonly string[]; readonly executionClass: CapabilityExecutionClass;
  readonly ordering: Readonly<{ precedence: number }>;
}
export interface ExecutiveCapabilityRegistry { readonly registryIdentity: string; readonly capabilities: readonly ExecutiveCapability[]; get(capabilityId: string): ExecutiveCapability | undefined }
export interface CapabilityInvocationRequest {
  readonly requestId: string; readonly requestedCapabilityIds: readonly string[]; readonly invocationMode: "EXPLICIT";
  readonly source: "USER" | "SYSTEM_CONFIGURATION"; readonly scenarioId: string; readonly contextSnapshotId: string;
  readonly requestedAt?: string; readonly metadata?: Readonly<Record<string, string>>;
}
export interface CapabilityScenarioAuthority {
  readonly scenarioId: string; readonly scenarioVersion: string; readonly references: readonly string[];
  readonly requiredCapabilityIds: readonly string[]; readonly permittedCapabilityIds: readonly string[];
  readonly prohibitedCapabilityIds: readonly string[]; readonly permittedModuleIds: readonly string[];
  readonly permittedExecutionClasses: readonly CapabilityExecutionClass[]; readonly operatingMode?: string;
}
export interface ContextRoutingRule {
  readonly ruleId: string; readonly version: string; readonly targetCapabilityId: string;
  readonly requiredConditionIds: readonly string[]; readonly prohibitedConditionIds: readonly string[];
  readonly scenarioIds: readonly string[]; readonly operatingModes: readonly string[]; readonly precedence: number;
}
export interface RoutingPolicy {
  readonly policyId: string; readonly version: string; readonly permittedInvocationModes: readonly CapabilityInvocationMode[];
  readonly allowCapabilityIds: readonly string[]; readonly denyCapabilityIds: readonly string[];
  readonly allowExperimental: boolean; readonly allowDeprecated: boolean; readonly requireExplicitRequest: boolean;
  readonly maximumCapabilityCount: number; readonly incompatibilityBehaviour: "FAIL" | "PUBLISH_CONFLICT";
  readonly contextRules: readonly ContextRoutingRule[];
}
export interface InvocationAuthority { readonly mode: CapabilityInvocationMode; readonly source: InvocationSource; readonly authorityId: string }
export interface CapabilityEligibilityRecord {
  readonly capabilityId: string; readonly capabilityVersion: string; readonly registryIdentity: string;
  readonly requested: boolean; readonly eligible: boolean; readonly permitted: boolean; readonly routable: boolean;
  readonly invocationAuthorities: readonly InvocationAuthority[]; readonly satisfiedRequirements: readonly string[];
  readonly unsatisfiedRequirements: readonly string[]; readonly prohibitions: readonly string[];
  readonly dependencies: readonly string[]; readonly incompatibilities: readonly string[]; readonly evidence: readonly string[];
}
export type RoutingConflictType = "INCOMPATIBLE_CAPABILITIES" | "MISSING_DEPENDENCY" | "PROHIBITED_DEPENDENCY";
export interface RoutingConflict { readonly conflictId: string; readonly type: RoutingConflictType; readonly capabilityIds: readonly string[]; readonly governingRules: readonly string[]; readonly sourceAuthorities: readonly string[]; readonly evidence: readonly string[]; readonly message: string }
export interface CapabilityRoutingPlan {
  readonly routingPlanId: string; readonly contextSnapshotId: string; readonly stateSnapshotId: string;
  readonly scenarioId: string; readonly registryIdentity: string; readonly routingPolicyIdentity: string; readonly invocationRequestId: string;
  readonly eligibilityRecords: readonly CapabilityEligibilityRecord[]; readonly eligibleCapabilities: readonly string[];
  readonly permittedCapabilities: readonly string[]; readonly orderedInvocationCandidates: readonly string[];
  readonly excludedCapabilities: readonly string[]; readonly unresolvedCapabilities: readonly string[];
  readonly dependencyGraph: readonly Readonly<{ capabilityId: string; requiredCapabilityIds: readonly string[] }>[];
  readonly routingConflicts: readonly RoutingConflict[]; readonly evidence: readonly string[];
  readonly routingMetadata: Readonly<{ contractVersion: typeof CAPABILITY_ROUTER_CONTRACT_VERSION; implementationVersion: typeof CAPABILITY_ROUTER_IMPLEMENTATION_VERSION }>;
}
export type RoutingFailureCode = "CONTEXT_VALIDATION_FAILURE" | "REGISTRY_VALIDATION_FAILURE" | "INVOCATION_REQUEST_FAILURE" | "SCENARIO_COMPATIBILITY_FAILURE" | "ROUTING_POLICY_FAILURE" | "DEPENDENCY_RESOLUTION_FAILURE" | "ROUTING_CONFLICT_FAILURE" | "ROUTING_IDENTITY_FAILURE" | "ROUTING_PLAN_VALIDATION_FAILURE";
export interface CapabilityRoutingFailure { readonly outcome: "failure"; readonly code: RoutingFailureCode; readonly stage: string; readonly governingRule: string; readonly message: string; readonly identities: Readonly<Record<string, string>> }
export interface CapabilityRoutingSuccess { readonly outcome: "success"; readonly plan: CapabilityRoutingPlan }
export type CapabilityRoutingResult = CapabilityRoutingSuccess | CapabilityRoutingFailure;
export interface CapabilityRoutingInput { readonly context: ExecutiveContextSnapshot; readonly registry: ExecutiveCapabilityRegistry; readonly scenario: CapabilityScenarioAuthority; readonly request: CapabilityInvocationRequest; readonly policy: RoutingPolicy; readonly explicitReferenceTime?: string }
