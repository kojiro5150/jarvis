import { describe, expect, it } from "vitest";
import {
  ENTITY_IDENTIFICATION_COMPOSITION_SCENARIO_IDS,
  runEntityHandoffMutationProof,
  runEntityIdentificationCompositionMatrix,
  runExistingCompositionBaselines,
} from "./entity-identification-claim-enrichment-composition-check";

describe("Sprint 3.116 entity-identification composition check", () => {
  it("runs the unique, ambiguous, and zero-match real-engine scenarios", async () => {
    const results = await runEntityIdentificationCompositionMatrix();
    expect(results.map(item => item.scenarioId)).toEqual(ENTITY_IDENTIFICATION_COMPOSITION_SCENARIO_IDS);
    expect(results.map(item => item.entityIdentificationOutcome)).toEqual(["resolved", "ambiguous_multiple_matches", "unresolved_no_match"]);
    expect(results.every(item => item.evaluationRan && !item.fixtureIdentityUsed)).toBe(true);
    expect(results.every(item => item.parameterMappingStatus === "semantic_incompatibility")).toBe(true);
    expect(results[0]).toMatchObject({ enrichmentOutcome: "enriched_available", evidenceReferencesPreserved: true, entityLineagePreserved: false });
    expect(results.slice(1).every(item => item.resolvedEntityReference === undefined && item.enrichmentOutcome === undefined)).toBe(true);
  });

  it("detects that a fabricated handoff identity is silently accepted", async () => {
    await expect(runEntityHandoffMutationProof()).resolves.toMatchObject({ rejected: false, silentlyAccepted: true, actualDetector: "none", compositionStatus: "semantic_incompatibility" });
  });

  it("reuses all ten unchanged baseline, enrichment, and integrity matrices", async () => {
    const result = await runExistingCompositionBaselines();
    expect(result.scenarioIds).toHaveLength(10);
    expect(result.base.every((item: { readonly regressionPassed: boolean }) => item.regressionPassed)).toBe(true);
    expect(result.enrichmentPassed).toBe(true);
    expect(result.integrityPassed).toBe(true);
  }, 30_000);
});
