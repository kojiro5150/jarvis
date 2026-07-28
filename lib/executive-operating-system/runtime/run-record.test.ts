import {describe,expect,it} from "vitest";
import {goldenRuntimeInput} from "../../../tests/fixtures/eos/golden-projection-artifact-set";
import {DeterministicExecutiveOperatingSystemRuntime} from "./engine";
import {EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER} from "./types";
import {ExecutiveOperatingSystemRuntimeError} from "./types";

describe("ExecutiveRunRecord",()=>{
 it("is the single immutable deterministic final constitutional publication",()=>{
  const runtime=new DeterministicExecutiveOperatingSystemRuntime();
  const first=runtime.run(goldenRuntimeInput),replay=runtime.run(goldenRuntimeInput);
  expect(replay.executiveRunRecord).toEqual(first.executiveRunRecord);
  expect(Object.isFrozen(first.executiveRunRecord)).toBe(true);
  expect(first.trace.stages.map(x=>x.stageId)).toEqual(EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER);
  expect(first.trace.stages.filter(x=>x.stageId==="executive_run_record")).toHaveLength(1);
  expect(first.trace.stages.at(-1)?.outputArtifactIds).toEqual([first.executiveRunRecord.executiveRunRecordId]);
 });
 it("references every publication without copying its payload",()=>{
  const result=new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput);
  const expected=["ProjectionArtifactSet","ExecutiveStateSnapshot","ExecutiveContextSnapshot","SnapshotChangeSet","ExecutiveAttentionQueue","ExecutiveSituationSet","SituationAssessmentSet","ExecutiveDeliberationContext","IntentSet","ConstraintSet","CandidatePlanSet","PlanEvaluationSet","PlanComparisonSet","ExecutiveReasoningRecord","GovernedActionProposalSet","ExecutiveCapabilityRoutingPlan","ExecutiveCapabilityInvocationHandoff","CapabilityInvocationEnvelope","CapabilityInvocationRecord","CapabilityExecutionResult"];
  expect(result.executiveRunRecord.publicationReferences.map(x=>x.publicationType)).toEqual(expected);
  expect(result.executiveRunRecord.publicationReferences.every(x=>x.status==="published"&&x.publicationIds.length>0)).toBe(true);
  expect(new Set(result.executiveRunRecord.publicationReferences.flatMap(x=>x.publicationIds)).size).toBe(result.executiveRunRecord.publicationReferences.flatMap(x=>x.publicationIds).length);
  expect(result.executiveRunRecord).not.toHaveProperty("reasoning");
  expect(result.executiveRunRecord).not.toHaveProperty("capabilityExecutionResult");
  expect(result.executiveRunRecord.orderedStageTrace.stages).toHaveLength(EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER.length-1);
  expect(result.executiveRunRecord.authorityEvidence.grantsApproval).toBe(false);
 });
 it("publishes an immutable partial record without fabricating later publications",()=>{
  const input={...goldenRuntimeInput,referenceTime:"2030-01-14T09:00:00Z"};
  try {new DeterministicExecutiveOperatingSystemRuntime().run(input);throw new Error("expected failure")}
  catch(error){
   expect(error).toBeInstanceOf(ExecutiveOperatingSystemRuntimeError);
   const record=(error as ExecutiveOperatingSystemRuntimeError).executiveRunRecord!;
   expect(record.outcome).toBe("failed");expect(Object.isFrozen(record)).toBe(true);
   expect(record.immutableFailures).toHaveLength(1);
   expect(record.publicationReferences.find(x=>x.publicationType==="ExecutiveStateSnapshot")?.status).toBe("published");
   expect(record.publicationReferences.find(x=>x.publicationType==="ExecutiveContextSnapshot")?.status).toBe("absent");
   expect(record.publicationReferences.find(x=>x.publicationType==="CapabilityExecutionResult")?.publicationIds).toEqual([]);
  }
 });
});
