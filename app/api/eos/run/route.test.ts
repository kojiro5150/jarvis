import { describe,expect,it } from "vitest";
import { NextRequest } from "next/server";
import { goldenRuntimeInput } from "../../../../tests/fixtures/eos/golden-projection-artifact-set";
import { POST } from "./route";

const EXPECTED_SPRINT_3_35_STAGE_ORDER = [
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
] as const;
const request=(body:unknown)=>new NextRequest("http://localhost/api/eos/run",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});

describe("POST /api/eos/run",()=>{
  it("returns the deterministic canonical Sprint 3.35 runtime result",async()=>{
    const firstResponse=await POST(request(goldenRuntimeInput));
    const secondResponse=await POST(request(goldenRuntimeInput));
    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    const result=await firstResponse.json(),replay=await secondResponse.json();
    const stageIds=result.trace.stages.map(({stageId}:{stageId:string})=>stageId);

    expect(result).toEqual(replay);
    expect(result.proposals.proposalSetId).toMatch(/^governed-action-proposal-set:/);
    expect(stageIds).toEqual(EXPECTED_SPRINT_3_35_STAGE_ORDER);
    expect(result.trace.stages).toHaveLength(EXPECTED_SPRINT_3_35_STAGE_ORDER.length);
    expect(new Set(stageIds).size).toBe(EXPECTED_SPRINT_3_35_STAGE_ORDER.length);
    expect(result.trace.stages.map(({sequence}:{sequence:number})=>sequence)).toEqual(EXPECTED_SPRINT_3_35_STAGE_ORDER.map((_,index)=>index+1));
    expect(result.trace.stages.at(-1)).toMatchObject({stageId:"capability_execution",outputArtifactIds:[result.capabilityExecutionResult.executionResultId]});
    expect(result).not.toHaveProperty("executiveRunRecord");
    expect(stageIds.some((stageId:string)=>stageId.includes("run_record"))).toBe(false);
  });

  it("returns a typed validation error",async()=>{
    const response=await POST(request({projectionArtifacts:{artifacts:[]}}));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({error:{type:"executive_operating_system_runtime_error",stage:"state_assembly",category:"validation",reasonCode:"invalid-runtime-input"}});
  });
});
