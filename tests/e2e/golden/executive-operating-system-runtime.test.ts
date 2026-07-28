import { describe,expect,it } from "vitest";
import { DeterministicExecutiveOperatingSystemRuntime,EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER } from "../../../lib/executive-operating-system/runtime";
import { goldenRuntimeInput } from "../../fixtures/eos/golden-projection-artifact-set";

const EXPECTED_SPRINT_3_36_STAGE_ORDER = [
  "state_assembly",
  "executive_context_derivation",
  "snapshot_lifecycle",
  "executive_attention",
  "situation_formation",
  "situation_assessment",
  "executive_deliberation_context",
  "intent_and_constraints",
  "candidate_plan_construction",
  "candidate_plan_evaluation",
  "candidate_plan_comparison",
  "executive_reasoning",
  "governed_action_proposal",
  "capability_routing",
  "capability_invocation_handoff",
  "capability_invocation_envelope",
  "capability_invocation",
  "capability_execution",
  "executive_run_record",
] as const;

describe("golden EOS runtime",()=>{
  it("replays the complete immutable Sprint 3.36 pipeline",()=>{
    const before=JSON.stringify(goldenRuntimeInput),runtime=new DeterministicExecutiveOperatingSystemRuntime();
    const first=runtime.run(goldenRuntimeInput),second=runtime.run(goldenRuntimeInput);
    const firstStageIds=first.trace.stages.map(({stageId})=>stageId);

    expect(EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER).toEqual(EXPECTED_SPRINT_3_36_STAGE_ORDER);
    expect(firstStageIds).toEqual(EXPECTED_SPRINT_3_36_STAGE_ORDER);
    expect(first.trace.stages).toHaveLength(EXPECTED_SPRINT_3_36_STAGE_ORDER.length);
    expect(new Set(firstStageIds).size).toBe(EXPECTED_SPRINT_3_36_STAGE_ORDER.length);
    expect(first.trace.stages.map(({sequence})=>sequence)).toEqual(EXPECTED_SPRINT_3_36_STAGE_ORDER.map((_,index)=>index+1));
    expect(first).toEqual(second);
    expect(first.trace).toEqual(second.trace);
    expect(first.trace.stages.every(stage=>Object.isFrozen(stage)&&Object.isFrozen(stage.inputArtifactIds)&&Object.isFrozen(stage.outputArtifactIds))).toBe(true);
    expect(first.trace.stages.at(-1)).toMatchObject({stageId:"executive_run_record",outputArtifactIds:[first.executiveRunRecord.executiveRunRecordId]});
    expect(first.executiveRunRecord.outcome).toBe("completed");
    expect(first.trace.stages.filter(({stageId})=>String(stageId)==="executive_run_record")).toHaveLength(1);
    expect(first.situations.situations.length).toBeGreaterThan(0);
    expect(first.proposals.proposalSetId).toMatch(/^governed-action-proposal-set:/);
    expect(first.proposals.proposals).toEqual([]);
    expect(first.attention.records[0].entityId).toBe("governance-review");
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.trace.stages)).toBe(true);
    expect(JSON.stringify(goldenRuntimeInput)).toBe(before);
    expect(JSON.stringify(first)).not.toMatch(/duration|runId|machineId/);
  });
});
