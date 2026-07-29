import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createAnonymisedValidationSummary, determineMigrationRecommendation, recordOperationalValidation, validateProvenance } from ".";
import type { OperationalScenarioRecord, ValidationProvenance } from ".";
const generatedAt="2026-07-29T12:00:00.000Z";
const provenance=(executionSource:ValidationProvenance["executionSource"]):ValidationProvenance=>{
 const base={
  synthetic:{executionSource:"synthetic",connectorSource:"fixture",validationLevel:"framework",oauthSession:"not_applicable"},
  manual_observation:{executionSource:"manual_observation",connectorSource:"manual_ui_observation",validationLevel:"exploratory",oauthSession:"not_applicable"},
  recorded_replay:{executionSource:"recorded_replay",connectorSource:"recorded_connector_output",validationLevel:"replay",oauthSession:"not_applicable"},
  authenticated_deployment:{executionSource:"authenticated_deployment",connectorSource:"live_google_calendar",validationLevel:"operational",oauthSession:"present"},
  mixed:{executionSource:"mixed",connectorSource:"mixed",validationLevel:"exploratory",oauthSession:"not_applicable"},
 }[executionSource];
 return {...base,generatedBy:"test",generatedAt,runnerVersion:"runner-v1"} as ValidationProvenance;
};
const scenario=():OperationalScenarioRecord=>({scenarioId:"OV-1",scenarioCategory:"CURRENT_WORKING_DAY",validationDate:"2026-07-29",connectorEvidence:{title:"secret"},canonicalProjection:{},situationalAwareness:{},availabilityComputation:{},executiveRepresentation:{},comparisonClassification:"Equivalent",outcomeReason:"EXPECTED_MATCH",matchedClaims:1,comparedClaims:1});
const attestation={reportWritten:true as const,challengeCompleted:true as const,attestedAt:generatedAt,confirmedAt:generatedAt,confirmingOperator:"operator",challengeId:"random",reportHash:"a".repeat(64),runnerVersion:"runner-v1"};
describe("provenance and evidence gating",()=>{
 it("accepts all five exact combinations and rejects inconsistencies",()=>{for(const source of ["synthetic","manual_observation","recorded_replay","authenticated_deployment","mixed"] as const) expect(()=>validateProvenance(provenance(source))).not.toThrow();expect(()=>validateProvenance({...provenance("authenticated_deployment"),oauthSession:"absent"})).toThrow("inconsistent");});
 it("permits operational recommendations only after evidence attestation",()=>{for(const source of ["synthetic","manual_observation","recorded_replay","mixed"] as const) expect(determineMigrationRecommendation(provenance(source),"confirmed",[scenario()],attestation)).toBe("NOT_ASSESSED");expect(determineMigrationRecommendation(provenance("authenticated_deployment"),"pending",[scenario()],attestation)).toBe("NOT_ASSESSED");expect(determineMigrationRecommendation(provenance("authenticated_deployment"),"confirmed",[scenario()],attestation)).toBe("PROCEED");expect(determineMigrationRecommendation(provenance("authenticated_deployment"),"confirmed",[{...scenario(),comparisonClassification:"Action Required"}],attestation)).toBe("DEFER");});
 it("creates a closed summary without evidence or challenge material",()=>{const summary=createAnonymisedValidationSummary({runId:"run",provenance:provenance("synthetic"),operatorConfirmation:"pending",scenarios:[scenario()]});expect(summary.migrationRecommendation).toBe("NOT_ASSESSED");const encoded=JSON.stringify(summary);expect(encoded).not.toContain("secret");expect(encoded).not.toContain("challengeId");});
 it("writes only protected, non-overwriting local reports",async()=>{const root=await mkdtemp(path.join(tmpdir(),"ov-"));const input={runId:"safe",provenance:provenance("synthetic"),operatorConfirmation:"pending" as const,scenarios:[scenario()]};const result=await recordOperationalValidation(input,{repositoryRoot:root});expect(await readFile(result.reportPath,"utf8")).toContain("connectorEvidence");await expect(recordOperationalValidation(input,{repositoryRoot:root})).rejects.toThrow();await expect(recordOperationalValidation({...input,runId:"../bad"},{repositoryRoot:root})).rejects.toThrow("unsafe");});
});
