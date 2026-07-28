import type { ExecutiveContextSnapshot } from "../../../executive-context";

export const CAPABILITY_INVOCATION_CONTRACT_VERSION = "1.0";
export type JsonValue = null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue };
export type ImplementationStatus = "AVAILABLE" | "DISABLED" | "EXPERIMENTAL" | "DEPRECATED";
export type ExecutionClass = "READ_ONLY" | "ANALYSIS" | "ADVISORY" | "PROPOSAL" | "ACTION_CAPABLE";
export type InvocationLifecycleState = "PENDING" | "VALIDATING" | "RESOLVING_IMPLEMENTATION" | "VALIDATING_AUTHORITY" | "INVOKING" | "VALIDATING_RESULT" | "COMPLETED" | "FAILED";
export type InvocationFailureCategory = "ROUTING_PLAN_FAILURE" | "IMPLEMENTATION_RESOLUTION_FAILURE" | "DISABLED_IMPLEMENTATION_FAILURE" | "COMPATIBILITY_FAILURE" | "EXECUTION_POLICY_FAILURE" | "EXECUTION_AUTHORITY_FAILURE" | "INVOCATION_VALIDATION_FAILURE" | "RESULT_VALIDATION_FAILURE" | "TIMEOUT_FAILURE" | "INVOCATION_RECORD_FAILURE";
export type InvocationStage = "VALIDATING" | "RESOLVING_IMPLEMENTATION" | "VALIDATING_AUTHORITY" | "CONSTRUCTING_INVOCATION" | "INVOKING" | "VALIDATING_RESULT" | "CONSTRUCTING_RECORD";

/** @deprecated Caller-authored routing authority is not accepted by governed invocation. */
export interface CapabilityRoutingPlan {
 readonly routingPlanId:string; readonly capabilityId:string; readonly capabilityVersion:string; readonly routingStatus:"ROUTABLE";
 readonly executiveContextId:string; readonly executiveStateSnapshotId:string; readonly routingContractVersion:string;
 readonly authority:Readonly<{registered:boolean;eligible:boolean;permitted:boolean}>;
 readonly dependencies:readonly Readonly<{dependencyId:string;status:"SATISFIED"|"UNSATISFIED"}>[];
}
export interface CapabilityInvocationEnvelope {
 readonly envelopeId:string; readonly routingPlanId:string; readonly routingContractVersion:string;
 readonly executiveContextId:string; readonly executiveStateSnapshotId:string; readonly executiveContextContractVersion:string;
 readonly scenarioId:string; readonly routingPolicyId:string; readonly capabilityId:string; readonly capabilityVersion:string;
 readonly routingRuleIds:readonly string[]; readonly supportingConditionIds:readonly string[]; readonly dependencyCapabilityIds:readonly string[];
 readonly executionPolicyId:string; readonly executionPolicyVersion:string; readonly implementationRegistryId:string;
}
export interface ExecutionPolicy {
 readonly policyId:string; readonly policyVersion:string; readonly executionEnabled:boolean;
 readonly permittedExecutionClasses:readonly ExecutionClass[]; readonly permittedImplementationStatuses:readonly ImplementationStatus[];
 readonly preferredImplementationIds?:readonly string[]; readonly timeoutMilliseconds:number;
 readonly requiredInvocationContractVersion:string; readonly metadata:Readonly<Record<string,JsonValue>>;
}
export interface CapabilityInvocationProvenance extends Omit<CapabilityInvocationEnvelope,"envelopeId"|"executionPolicyVersion"|"implementationRegistryId"> { readonly invocationEnvelopeId:string; readonly executionPolicyId:string; readonly registryId:string; readonly implementationId:string; readonly implementationVersion:string; readonly invocationContractVersion:string }
export interface CapabilityInvocationContext { readonly invocationId:string; readonly invocationEnvelope:CapabilityInvocationEnvelope; readonly executiveContext:ExecutiveContextSnapshot; readonly executionPolicy:ExecutionPolicy; readonly referenceTime:string; readonly provenance:CapabilityInvocationProvenance }
export interface CapabilityExecutionResult { readonly resultId:string; readonly capabilityId:string; readonly implementationId:string; readonly contractVersion:string; readonly elapsedMilliseconds:number; readonly metadata:Readonly<Record<string,JsonValue>> }
export interface ExecutiveCapabilityImplementationDescriptor { readonly implementationId:string; readonly capabilityId:string; readonly implementationVersion:string; readonly implementationStatus:ImplementationStatus; readonly executionClass:ExecutionClass; readonly supportedCapabilityVersions:readonly string[]; readonly supportedContractVersions:readonly string[]; readonly precedence:number; readonly provider:string }
export interface ExecutiveCapabilityImplementation extends ExecutiveCapabilityImplementationDescriptor { invoke(context:CapabilityInvocationContext):CapabilityExecutionResult }
export interface InvocationLifecycleTransition { readonly state:InvocationLifecycleState; readonly sequence:number; readonly referenceTime:string }
export interface CapabilityInvocationRecord { readonly recordId:string; readonly invocationId:string; readonly capabilityId:string; readonly implementationId:string; readonly routingPlanId:string; readonly executionPolicyId:string; readonly lifecycleState:"COMPLETED"; readonly executionOutcome:"SUCCESS"; readonly resultId:string; readonly executionEvidence:Readonly<{referenceTime:string;lifecycle:readonly InvocationLifecycleTransition[]}>; readonly provenance:CapabilityInvocationProvenance; readonly executionMetadata:Readonly<{executionClass:ExecutionClass;implementationStatus:ImplementationStatus;elapsedMilliseconds:number}>; readonly contractVersions:Readonly<{invocation:string;routing:string;result:string}> }
export interface CapabilityInvocationFailure { readonly failureId:string; readonly category:InvocationFailureCategory; readonly capabilityId:string; readonly implementationId?:string; readonly executionPolicyId:string; readonly stage:InvocationStage; readonly message:string; readonly evidence:Readonly<{routingPlanId:string;referenceTime:string;reasonCode:string}> }
export type CapabilityInvocationResult = Readonly<{ok:true;record:CapabilityInvocationRecord}> | Readonly<{ok:false;failure:CapabilityInvocationFailure}>;
export interface CapabilityInvocationRequest { readonly invocationEnvelope:CapabilityInvocationEnvelope; readonly executiveContext:ExecutiveContextSnapshot; readonly executionPolicy:ExecutionPolicy; readonly referenceTime:string }
