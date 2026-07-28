import { describe,expect,it } from "vitest";
import { NextRequest } from "next/server";
import { goldenRuntimeInput } from "../../../../tests/fixtures/eos/golden-projection-artifact-set";
import { POST } from "./route";
const request=(body:unknown)=>new NextRequest("http://localhost/api/eos/run",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
describe("POST /api/eos/run",()=>{it("returns the canonical runtime result",async()=>{const response=await POST(request(goldenRuntimeInput));expect(response.status).toBe(200);const result=await response.json();expect(result.proposals.proposalSetId).toMatch(/^governed-action-proposal-set:/);expect(result.trace.stages).toHaveLength(14)});it("returns a typed validation error",async()=>{const response=await POST(request({projectionArtifacts:{artifacts:[]}}));expect(response.status).toBe(400);expect(await response.json()).toMatchObject({error:{type:"executive_operating_system_runtime_error",stage:"state_assembly",category:"validation",reasonCode:"invalid-runtime-input"}})})});
