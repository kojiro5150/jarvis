import { createHash } from "node:crypto";
import type { ExecutiveContextSnapshot } from "../../../executive-context";
import { EXECUTIVE_CAPABILITY_ROUTING_CONTRACT_VERSION } from "../types";
import type { ExecutiveCapabilityRoutingPlan } from "../types";
import type { CapabilityInvocationEnvelope,CapabilityInvocationRequest,CapabilityInvocationResult,ExecutionPolicy } from "./types";
import type { ExecutiveCapabilityInvoker } from "./invoker";
import { clone,deepFreeze } from "./validation";

const issued=new WeakSet<object>();
const canonical=(value:unknown):string=>JSON.stringify(value,(_key,item)=>item&&typeof item==="object"&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item);
const id=(value:unknown)=>`capability-invocation-envelope:${createHash("sha256").update(canonical(value)).digest("hex")}`;
export const isIssuedInvocationEnvelope=(value:unknown):value is CapabilityInvocationEnvelope=>!!value&&typeof value==="object"&&issued.has(value as object);

export interface CapabilityInvocationHandoffInput { readonly routingPlan:ExecutiveCapabilityRoutingPlan; readonly executiveContext:ExecutiveContextSnapshot; readonly capabilityId:string; readonly executionPolicy:ExecutionPolicy; readonly referenceTime:string }

/** The sole routing-to-invocation coordination boundary. It selects no implementation and evaluates no execution authority. */
export class ExecutiveCapabilityInvocationHandoff {
 constructor(private readonly invoker:ExecutiveCapabilityInvoker){}
 invoke(input:CapabilityInvocationHandoffInput):CapabilityInvocationResult{
  const {routingPlan:plan,executiveContext:context,capabilityId,executionPolicy}=input;
  const routed=plan?.routedCapabilities?.find(item=>item.capabilityId===capabilityId);
  const unresolved=plan?.unresolvedCapabilities?.some(item=>item.capabilityId===capabilityId);
  const dependencies=routed?.dependencyCapabilityIds??[];
  const valid=plan?.routingContractVersion===EXECUTIVE_CAPABILITY_ROUTING_CONTRACT_VERSION&&
   plan.executiveContextId===context?.contextId&&plan.executiveStateSnapshotId===context?.sourceStateIdentity.snapshotId&&
   plan.executiveContextContractVersion===context?.derivationMetadata.contractVersion&&!!routed&&!unresolved&&
   dependencies.every(dependency=>plan.routedCapabilities.some(item=>item.capabilityId===dependency));
  if(!valid)return this.invoker.rejectHandoff({routingPlanId:plan?.routingPlanId??"unknown",capabilityId:capabilityId??"unknown",executionPolicyId:executionPolicy?.policyId??"unknown",referenceTime:input?.referenceTime??"unknown"});
  const evidence={routingPlanId:plan.routingPlanId,routingContractVersion:plan.routingContractVersion,executiveContextId:plan.executiveContextId,executiveStateSnapshotId:plan.executiveStateSnapshotId,executiveContextContractVersion:plan.executiveContextContractVersion,scenarioId:plan.scenarioId,routingPolicyId:plan.policyId,capabilityId:routed.capabilityId,capabilityVersion:routed.capabilityVersion,routingRuleIds:[...routed.routingRuleIds],supportingConditionIds:[...routed.supportingConditionIds],dependencyCapabilityIds:[...dependencies],executionPolicyId:executionPolicy.policyId,executionPolicyVersion:executionPolicy.policyVersion,implementationRegistryId:this.invoker.registryId};
  const envelope=deepFreeze({envelopeId:id(evidence),...clone(evidence)});issued.add(envelope);
  const request:CapabilityInvocationRequest={invocationEnvelope:envelope,executiveContext:context,executionPolicy,referenceTime:input.referenceTime};
  return this.invoker.invoke(request);
 }
}
