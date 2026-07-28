import { createSituationalAwarenessSnapshot,compareSituationalAwarenessSnapshots } from "../situational-awareness/lifecycle";
import { SituationalAwarenessEngine } from "../situational-awareness/assembly";
import { ExecutiveContextEngine as DescriptiveExecutiveContextEngine } from "../../executive-context";
import { AttentionPolicyRegistry,INITIAL_ATTENTION_POLICIES,constructExecutiveAttentionQueue } from "../attention";
import { ExecutiveSituationEngine,SituationFormationRegistry,INITIAL_SITUATION_FORMATION_POLICIES } from "../situations";
import { ExecutiveSituationAssessmentEngine,SituationAssessmentRegistry,INITIAL_SITUATION_ASSESSMENT_POLICIES } from "../assessment";
import { ExecutiveContextEngine,ExecutiveContextRegistry,INITIAL_CONTEXT_POLICIES } from "../context";
import { DeterministicIntentEngine,DeterministicConstraintEngine,ExecutiveIntentRegistry,ExecutiveConstraintRegistry,INITIAL_INTENT_POLICIES,INITIAL_CONSTRAINT_POLICIES } from "../intent";
import { DeterministicCandidatePlanConstructionEngine,DeterministicCandidatePlanRegistry,productionCandidatePlanPolicies } from "../planning/candidates";
import { DeterministicCandidatePlanEvaluationEngine,DeterministicCandidatePlanEvaluationRegistry,productionCandidatePlanEvaluationPolicies } from "../planning/evaluation";
import { DeterministicCandidatePlanComparisonEngine,DeterministicCandidatePlanComparisonRegistry,productionCandidatePlanComparisonPolicies } from "../planning/comparison";
import { DeterministicExecutiveReasoningEngine,DeterministicExecutiveReasoningRegistry,productionReasoningPolicies } from "../reasoning";
import { DeterministicGovernedActionProposalEngine,DeterministicGovernedActionProposalRegistry,productionProposalPolicies } from "../proposal";
import { clone,deepFreeze,validateRuntimeInput,validateTrace } from "./validation";
import { stageTrace } from "./trace";
import { ExecutiveOperatingSystemRuntimeError } from "./types";
import { ExecutiveCapabilityInvocationHandoff,ExecutiveCapabilityInvoker } from "../executive-capabilities";
import type { ExecutiveOperatingSystemCapabilityInvocationInput,ExecutiveOperatingSystemInput,ExecutiveOperatingSystemResult,ExecutiveOperatingSystemResultWithInvocation,ExecutiveOperatingSystemStageId,ExecutiveOperatingSystemStageTrace } from "./types";

export class DeterministicExecutiveOperatingSystemRuntime {
 constructor(private readonly stateAssemblyEngine:Pick<SituationalAwarenessEngine,"assemble">=new SituationalAwarenessEngine(),private readonly descriptiveContextEngine:Pick<DescriptiveExecutiveContextEngine,"derive">=new DescriptiveExecutiveContextEngine()) {}
 runWithCapabilityInvocation(raw:ExecutiveOperatingSystemInput,execution:ExecutiveOperatingSystemCapabilityInvocationInput):ExecutiveOperatingSystemResultWithInvocation {
  const result=this.run(raw);
  const invoker=new ExecutiveCapabilityInvoker(execution.implementationRegistry);
  const capabilityInvocation=new ExecutiveCapabilityInvocationHandoff(invoker).invoke({routingPlan:execution.routingPlan,executiveContext:execution.executiveContext,capabilityId:execution.capabilityId,executionPolicy:execution.executionPolicy,referenceTime:execution.referenceTime});
  return deepFreeze({...result,capabilityInvocation});
 }
 run(raw:ExecutiveOperatingSystemInput):ExecutiveOperatingSystemResult {
  try{validateRuntimeInput(raw)}catch(error){throw new ExecutiveOperatingSystemRuntimeError("state_assembly","validation","invalid-runtime-input",[],error)}
  const input=deepFreeze(clone(raw)), ids=input.projectionArtifacts.artifacts.map(x=>x.provenance.sourceId), traces:ExecutiveOperatingSystemStageTrace[]=[];
  const step=<T>(stage:ExecutiveOperatingSystemStageId,ins:readonly string[],execute:()=>T,out:(x:T)=>readonly string[],empty=(x:T)=>false):T=>{try{const value=execute();traces.push(stageTrace(stage,traces.length+1,ins,out(value),empty(value)));return value}catch(error){throw new ExecutiveOperatingSystemRuntimeError(stage,"execution","stage-execution-failed",ins,error)}};
  const assembled=step("state_assembly",ids,()=>this.stateAssemblyEngine.assemble(input.projectionArtifacts),x=>x.outcome==="success"?[x.snapshot.snapshotId]:[]);
  if(assembled.outcome==="failure") throw new ExecutiveOperatingSystemRuntimeError("state_assembly","execution",assembled.code,ids,assembled);
  const executiveState=assembled.snapshot;
  const derived=step("executive_context_derivation",[executiveState.snapshotId],()=>this.descriptiveContextEngine.derive({sourceSnapshot:executiveState,referenceTime:input.referenceTime}),x=>x.outcome==="success"?[x.snapshot.contextId]:[]);
  if(derived.outcome==="failure") throw new ExecutiveOperatingSystemRuntimeError("executive_context_derivation","execution",derived.code,[executiveState.snapshotId],derived);
  const executiveContextSnapshot=derived.snapshot;
  if(executiveContextSnapshot.sourceStateIdentity.snapshotId!==executiveState.snapshotId) throw new ExecutiveOperatingSystemRuntimeError("executive_context_derivation","validation","state-context-identity-mismatch",[executiveState.snapshotId,executiveContextSnapshot.contextId]);
  if(executiveState.lifecycleSnapshotId!==input.projectionArtifacts.snapshotId||executiveState.previousLifecycleSnapshotId!==input.projectionArtifacts.previousSnapshot.snapshotId) throw new ExecutiveOperatingSystemRuntimeError("snapshot_lifecycle","validation","state-lifecycle-identity-mismatch",[executiveState.snapshotId]);
  const canonicalIds=[executiveState.snapshotId,executiveContextSnapshot.contextId] as const;
  const awareness=executiveState.state;
  const snapshot=step("snapshot_lifecycle",canonicalIds,()=>createSituationalAwarenessSnapshot({snapshotId:executiveState.lifecycleSnapshotId,observedAt:executiveState.observedAt,state:executiveState.state}),x=>[x.snapshotId]);
  const changes=compareSituationalAwarenessSnapshots(input.projectionArtifacts.previousSnapshot,snapshot);
  const attention=step("executive_attention",[...canonicalIds,changes.previousSnapshotId,changes.currentSnapshotId],()=>constructExecutiveAttentionQueue(changes,new AttentionPolicyRegistry(INITIAL_ATTENTION_POLICIES)),x=>[x.queueId],x=>x.records.length===0);
  const situations=step("situation_formation",[...canonicalIds,attention.queueId],()=>new ExecutiveSituationEngine(new SituationFormationRegistry(INITIAL_SITUATION_FORMATION_POLICIES)).form(attention),x=>x.situations.map(s=>s.situationId),x=>x.situations.length===0);
  const assessment=step("situation_assessment",[...canonicalIds,...situations.situations.map(s=>s.situationId)],()=>new ExecutiveSituationAssessmentEngine(new SituationAssessmentRegistry(INITIAL_SITUATION_ASSESSMENT_POLICIES)).assess(situations),x=>[x.situationSetId],x=>x.assessments.length===0);
  const context=step("executive_context",[...canonicalIds,assessment.situationSetId],()=>new ExecutiveContextEngine(new ExecutiveContextRegistry(INITIAL_CONTEXT_POLICIES)).construct(assessment),x=>[x.contextId]);
  const intentAndConstraints=step("intent_and_constraints",[...canonicalIds,context.contextId],()=>({intent:new DeterministicIntentEngine(new ExecutiveIntentRegistry(INITIAL_INTENT_POLICIES)).construct(context,input.configuration.intent),constraints:new DeterministicConstraintEngine(new ExecutiveConstraintRegistry(INITIAL_CONSTRAINT_POLICIES)).construct(context,input.configuration.constraints)}),x=>[x.intent.intentSetId,x.constraints.constraintSetId],x=>x.intent.objectives.length===0&&x.constraints.constraints.length===0);
  const {intent,constraints}=intentAndConstraints;
  const candidatePlans=step("candidate_plan_construction",[...canonicalIds,context.contextId,intent.intentSetId,constraints.constraintSetId],()=>new DeterministicCandidatePlanConstructionEngine(new DeterministicCandidatePlanRegistry(productionCandidatePlanPolicies)).construct({context,intentSet:intent,constraintSet:constraints,definitions:input.configuration.candidatePlanDefinitions}),x=>[x.candidatePlanSetId],x=>x.candidates.length===0);
  const evaluation=step("candidate_plan_evaluation",[...canonicalIds,candidatePlans.candidatePlanSetId],()=>new DeterministicCandidatePlanEvaluationEngine(new DeterministicCandidatePlanEvaluationRegistry(productionCandidatePlanEvaluationPolicies)).evaluate({context,intentSet:intent,constraintSet:constraints,candidatePlanSet:candidatePlans,definitions:input.configuration.evaluationDefinitions}),x=>[x.evaluatedCandidatePlanSetId],x=>x.evaluatedCandidates.length===0);
  const comparison=step("candidate_plan_comparison",[...canonicalIds,evaluation.evaluatedCandidatePlanSetId],()=>new DeterministicCandidatePlanComparisonEngine(new DeterministicCandidatePlanComparisonRegistry(productionCandidatePlanComparisonPolicies)).compare({context,intentSet:intent,constraintSet:constraints,candidatePlanSet:candidatePlans,evaluatedCandidatePlanSet:evaluation,definitions:input.configuration.comparisonDefinitions}),x=>[x.comparisonSetId],x=>x.profiles.length===0);
  const reasoning=step("executive_reasoning",[...canonicalIds,comparison.comparisonSetId],()=>new DeterministicExecutiveReasoningEngine((()=>{const r=new DeterministicExecutiveReasoningRegistry();productionReasoningPolicies.forEach(p=>r.register(p));return r})()).reason({context,intentSet:intent,constraintSet:constraints,candidatePlanSet:candidatePlans,evaluatedCandidatePlanSet:evaluation,candidatePlanComparisonSet:comparison,definitions:input.configuration.reasoningDefinitions}),x=>[x.reasoningRecordId],x=>x.observations.length===0);
  const proposals=step("governed_action_proposal",[...canonicalIds,reasoning.reasoningRecordId],()=>new DeterministicGovernedActionProposalEngine((()=>{const r=new DeterministicGovernedActionProposalRegistry();productionProposalPolicies.forEach(p=>r.register(p));return r})()).propose({context,intentSet:intent,constraintSet:constraints,candidatePlanSet:candidatePlans,evaluatedCandidatePlanSet:evaluation,candidatePlanComparisonSet:comparison,executiveReasoningRecord:reasoning,definitions:input.configuration.proposalDefinitions}),x=>[x.proposalSetId],x=>x.proposals.length===0);
  const trace=deepFreeze({stages:traces});validateTrace(trace);
  return deepFreeze({executiveState,executiveContextSnapshot,situationalAwareness:awareness,snapshot,changes,attention,situations,assessment,context,intent,constraints,candidatePlans,evaluation,comparison,reasoning,proposals,trace});
 }
}
