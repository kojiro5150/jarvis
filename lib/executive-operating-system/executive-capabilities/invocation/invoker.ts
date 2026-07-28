import { isIssuedInvocationEnvelope } from "./envelope";
import { ExecutiveCapabilityImplementationRegistry } from "./registry";
import { CAPABILITY_EXECUTION_RESULT_VERSION,CAPABILITY_INVOCATION_CONTRACT_VERSION,IMPLEMENTATION_RESOLUTION_POLICY_ID } from "./types";
import type { ApprovalState,AuthorityValidationOutcome,CapabilityExecutionResult,CapabilityInvocationOutcome,CapabilityInvocationRecord,CapabilityInvocationRequest,ExecutiveCapabilityImplementation,ExecutionStatus,InvocationFailureCode,InvocationPolicy } from "./types";
import { deepFreeze,identity,validateEnvelope,validateImplementationReturn,validatePolicy } from "./validation";

const noExecutionStatus=(disposition:CapabilityInvocationRecord["invocationDisposition"]):ExecutionStatus=>disposition==="unsupported"?"unsupported":disposition==="implementation_unresolved"?"implementation_unavailable":"not_attempted";
export class ExecutiveCapabilityInvoker {
 constructor(private readonly registry:ExecutiveCapabilityImplementationRegistry){if(!(registry instanceof ExecutiveCapabilityImplementationRegistry))throw new Error("INVALID_IMPLEMENTATION_REGISTRY")}
 get registryId(){return this.registry.registryId}
 invoke(request:CapabilityInvocationRequest):CapabilityInvocationOutcome {
  const envelope=request?.invocationEnvelope,policy=request?.invocationPolicy;
  if(!envelope)throw new Error("MISSING_INVOCATION_ENVELOPE");
  if(!isIssuedInvocationEnvelope(envelope))throw new Error("INVALID_ENVELOPE_IDENTITY");
  validateEnvelope(envelope);validatePolicy(policy);
  if(!request.referenceTime||!Number.isFinite(Date.parse(request.referenceTime)))throw new Error("INVALID_INVOCATION_POLICY");
  const item=envelope.requestItems.find(x=>x.disposition==="prepared");
  const approvalRequired=item?.approvalRequired??false;
  const authorityRequirements=(item?.authorityRequirements??[]).map(x=>x.authorityRequirementId).sort();
  let implementation:ExecutiveCapabilityImplementation|undefined;
  let disposition:CapabilityInvocationRecord["invocationDisposition"]="not_invoked";
  const blockers:InvocationFailureCode[]=[];
  let approvalState:ApprovalState=policy.approvalState;
  let authorityOutcome:AuthorityValidationOutcome="not_evaluated";
  if(!policy.enabled){disposition="refused";blockers.push("INVALID_INVOCATION_POLICY")}
  else if(!item){disposition="not_invoked"}
  else if(item.capabilityId!==envelope.capabilityId||item.proposalId.length===0){disposition="refused";blockers.push("INVALID_CAPABILITY_IDENTITY")}
  else if(approvalRequired&&policy.approvalState!=="granted"){disposition="blocked";blockers.push("MISSING_APPROVAL_STATE")}
  else if(!policy.autonomousExecutionPermitted){disposition="blocked";blockers.push("PROHIBITED_AUTONOMOUS_ACTION")}
  else if(envelope.unresolvedBlockers.length||item.unresolvedConditions.length){disposition="blocked";blockers.push("UNRESOLVED_BLOCKER")}
  else if(!authorityRequirements.every(x=>policy.grantedAuthorityIds.includes(x))){disposition="blocked";authorityOutcome="insufficient";blockers.push("INSUFFICIENT_AUTHORITY")}
  else {
   authorityOutcome="satisfied";
   const registered=this.registry.forCapability(envelope.capabilityId);
   const compatible=registered.filter(x=>x.actionClasses.includes(item.actionClass));
   if(registered.length===0){disposition="implementation_unresolved";blockers.push("NO_IMPLEMENTATION")}
   else if(compatible.length===0){disposition="unsupported";blockers.push("UNSUPPORTED_ACTION_CLASS")}
   else {
    const enabled=compatible.filter(x=>x.implementationStatus!=="DISABLED"&&policy.permittedImplementationStatuses.includes(x.implementationStatus)&&policy.permittedExecutionClasses.includes(x.executionClass)&&policy.permittedSideEffectClasses.includes(x.sideEffectClassification));
    const selected=policy.explicitImplementationId?enabled.filter(x=>x.implementationId===policy.explicitImplementationId):enabled;
    if(enabled.length===0){disposition="blocked";blockers.push(compatible.every(x=>x.implementationStatus==="DISABLED")?"IMPLEMENTATION_DISABLED":"UNSUPPORTED_ACTION_CLASS")}
    else if(selected.length!==1){disposition="implementation_unresolved";blockers.push(selected.length===0?"NO_IMPLEMENTATION":"AMBIGUOUS_IMPLEMENTATION")}
    else {implementation=selected[0];disposition="invoked"}
   }
  }
  const recordBody={envelopeId:envelope.envelopeId,handoffId:envelope.handoffId,routingPlanId:envelope.routingPlanId,...(item?{proposalId:item.proposalId}:{}),proposalSetId:envelope.proposalSetId,capabilityId:envelope.capabilityId,...(implementation?{implementationId:implementation.implementationId}:{}),invocationPolicyId:policy.policyId,implementationResolutionPolicyId:IMPLEMENTATION_RESOLUTION_POLICY_ID,approvalRequired,approvalState,authorityRequirements,authorityValidationOutcome:authorityOutcome,blockerClassification:blockers,invocationDisposition:disposition,executionAttempted:!!implementation,lineage:{executiveStateSnapshotId:envelope.executiveStateSnapshotId,executiveContextId:envelope.executiveContextId,deliberationContextId:envelope.deliberationContextId,reasoningRecordId:envelope.reasoningRecordId},metadata:{owner:"ExecutiveCapabilityInvoker" as const,contractVersion:CAPABILITY_INVOCATION_CONTRACT_VERSION,referenceTime:request.referenceTime}};
  let invocationRecord=deepFreeze({invocationRecordId:identity("capability-invocation-record",recordBody),...recordBody});
  let execution:Omit<CapabilityExecutionResult,"executionResultId">;
  if(!implementation||!item){execution={invocationRecordId:invocationRecord.invocationRecordId,envelopeId:envelope.envelopeId,...(item?{proposalId:item.proposalId}:{}),capabilityId:envelope.capabilityId,...(implementation?{implementationId:implementation.implementationId}:{}),executionStatus:noExecutionStatus(disposition),executionAttempted:false,sideEffectAttempted:false,sideEffectConfirmed:false,...(blockers[0]?{errorCode:blockers[0]}:{}),implementationMetadata:{},lineage:invocationRecord.lineage,completionMetadata:{owner:"ExecutiveCapabilityInvoker",contractVersion:CAPABILITY_EXECUTION_RESULT_VERSION,referenceTime:request.referenceTime},redactionMetadata:{redacted:false},grantsApproval:false};}
  else {
   try {const returned=implementation.invoke(deepFreeze({invocationId:invocationRecord.invocationRecordId,envelopeId:envelope.envelopeId,proposalId:item.proposalId,capabilityId:envelope.capabilityId,actionClass:item.actionClass,boundedRequest:item.boundedRequest as never,constraints:item.constraints,referenceTime:request.referenceTime}));validateImplementationReturn(returned);execution={invocationRecordId:invocationRecord.invocationRecordId,envelopeId:envelope.envelopeId,proposalId:item.proposalId,capabilityId:envelope.capabilityId,implementationId:implementation.implementationId,executionStatus:returned.status,executionAttempted:true,sideEffectAttempted:returned.sideEffectAttempted,sideEffectConfirmed:returned.sideEffectConfirmed,...(returned.output!==undefined?{boundedOutput:returned.output}:{}),...(returned.errorCode?{errorCode:returned.errorCode}:{}),implementationMetadata:returned.metadata,lineage:invocationRecord.lineage,completionMetadata:{owner:"ExecutiveCapabilityInvoker",contractVersion:CAPABILITY_EXECUTION_RESULT_VERSION,referenceTime:request.referenceTime},redactionMetadata:{redacted:false},grantsApproval:false};}
   catch(error){execution={invocationRecordId:invocationRecord.invocationRecordId,envelopeId:envelope.envelopeId,proposalId:item.proposalId,capabilityId:envelope.capabilityId,implementationId:implementation.implementationId,executionStatus:"failed",executionAttempted:true,sideEffectAttempted:false,sideEffectConfirmed:false,errorCode:error instanceof Error&&error.message==="MALFORMED_IMPLEMENTATION_RESULT"?"MALFORMED_IMPLEMENTATION_RESULT":"IMPLEMENTATION_EXCEPTION",implementationMetadata:{},lineage:invocationRecord.lineage,completionMetadata:{owner:"ExecutiveCapabilityInvoker",contractVersion:CAPABILITY_EXECUTION_RESULT_VERSION,referenceTime:request.referenceTime},redactionMetadata:{redacted:false},grantsApproval:false};}
  }
  const capabilityExecutionResult=deepFreeze({executionResultId:identity("capability-execution-result",execution),...execution});
  return deepFreeze({invocationRecord,capabilityExecutionResult});
 }
}
export function createInvocationPolicy(policy:InvocationPolicy){validatePolicy(policy);return deepFreeze({...policy,grantedAuthorityIds:[...policy.grantedAuthorityIds],permittedExecutionClasses:[...policy.permittedExecutionClasses],permittedSideEffectClasses:[...policy.permittedSideEffectClasses],permittedImplementationStatuses:[...policy.permittedImplementationStatuses]})}
