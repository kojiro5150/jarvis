import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FULL_ASSEMBLY_SCENARIO_IDS } from "./full-assembly-claim-boundary-conflict-boundary-composition-regression";
import { runEnrichedClaimMutationProof, runFullAssemblyEnrichmentRecheckMatrix, runFullAssemblyEnrichmentRecheckScenario } from "./full-assembly-enrichment-composition-recheck";

const protectedHashes: Readonly<Record<string, string>> = {
  "app/api/chat/route.ts": "503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3",
  "lib/context-builder.ts": "8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d",
  "lib/useAgentConversation.ts": "55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97",
  "lib/agents/chat-execution.ts": "da387b401acd4cc87609112e7b110451254af16bb33d8dd5224c4fb9aa210a88",
  "lib/governed-conversation/claim-enrichment-engine.ts": "67cb850e992027f01174f3a23ead072776021f21ade4703f5fdfe544b87eb45b",
  "lib/governed-conversation/claim-enrichment-types.ts": "b31fba4c1bf895113de4426d02d56513d7fd43f20741fd7dfdcd0f3d05ebb1d3",
  "lib/governed-conversation/source-evidence-assembly.ts": "01eacdbabdded56745820d0e09ca1ed1ed332ae4061ee09f4cbef2fa765fa8b7",
  "lib/governed-conversation/projection-composer.ts": "d66c9dfccf98a428fb58e6db68af171751bfe2b56b602d028f9c212fee958355",
  "lib/governed-conversation/input.ts": "15cc1689ee9234259b1ef52a1e8c6c38f1dd37aa808e3edc86cdd5e82342102f",
  "lib/governed-conversation/model-invocation.ts": "beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac5338d2f814f5b",
  "lib/governed-conversation/validator.ts": "1bd9692f56ef0794f070c41ae962375bed93c953af22d393e796911e3f349fef",
};
const historicalBoundaryHashes = new Map([
  [["lib/governed-conversation/claim", "boundary-engine.ts"].join("-"), "9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a"],
  [["lib/governed-conversation/claim", "boundary-types.ts"].join("-"), "cd5446f7f6bedb567be4b1bc7195c96f94b6b23bec82864102a090db49d6436a"],
  [["lib/governed-conversation/conflict", "boundary-engine.ts"].join("-"), "5b62297ed0d69a9f70bf6e82788cc996c37cb9bf733dded27876ae098e57e27d"],
  [["lib/governed-conversation/conflict", "boundary-types.ts"].join("-"), "22cdfb83f691d8d753feba94f188b8d18b977e455e31993b182d5c082e2f4734"],
]);
const digest = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const walk = (directory: string): string[] => readdirSync(directory).flatMap(name => { const path = join(directory, name); return statSync(path).isDirectory() ? walk(path) : [path]; });

describe("Sprint 3.105 full-assembly enrichment composition re-check", () => {
  it("directly reuses and executes the exact ten-scenario Sprint 3.102 matrix", async () => {
    expect(FULL_ASSEMBLY_SCENARIO_IDS).toHaveLength(10);
    expect(new Set(FULL_ASSEMBLY_SCENARIO_IDS).size).toBe(10);
    const results = await runFullAssemblyEnrichmentRecheckMatrix();
    expect(results.map(result => result.scenarioId)).toEqual(FULL_ASSEMBLY_SCENARIO_IDS);
    expect(results.every(result => result.evaluationRan && result.originalResult.scenarioId === result.scenarioId)).toBe(true);
    expect(results.every(result => result.enrichmentSeamStatus === "bounded-adapter-needed")).toBe(true);
  });

  it("runs recognition, enrichment, enriched-ID conflict cells, projection, model, and validator for every scenario", async () => {
    const results = await runFullAssemblyEnrichmentRecheckMatrix();
    for (const result of results) {
      expect(result.stageResults.assembly.passed).toBe(true);
      expect(result.stageResults.recognition.passed).toBe(true);
      expect(result.stageResults.enrichment.passed).toBe(true);
      expect(result.stageResults.enrichedClaimSetToConflictEvaluation.passed).toBe(true);
      expect(result.stageResults.projection.passed).toBe(true);
      expect(result.stageResults.governedInput.passed).toBe(true);
      expect(result.stageResults.modelInvocation.passed).toBe(true);
      expect(result.stageResults.validation.passed).toBe(true);
      expect(result.identityTrace.baseClaimIds).not.toBe(result.identityTrace.enrichedClaimIds);
      expect(result.identityTrace.enrichedGovernedClaimSetId).toBeTruthy();
      expect(result.statusTrace.memoryPriorityCount).toBe(0);
    }
  });

  it("preserves the distinct original conflict states, partial failure, fallback honesty, and replay", async () => {
    const results = await runFullAssemblyEnrichmentRecheckMatrix();
    expect(new Set(results.map(result => result.enrichedResult.conflictOutcome))).toEqual(new Set(["evaluated_no_conflict", "evaluated_conflict_found", "partially_evaluated", "evaluation_unavailable", "evaluation_unsupported", "evaluation_failed"]));
    const connector = results.find(result => result.scenarioId === "connector-disconnected-local-fallback")!;
    expect(connector.statusTrace.connectorAvailability).toEqual(expect.arrayContaining([expect.objectContaining({ connectorId: "gmail", availability: "unavailable", fallbackStatus: "unavailable" })]));
    const partial = results.find(result => result.scenarioId === "partial-source-failure")!;
    expect(partial.statusTrace.sourceResults).toMatchObject({ gmail: { status: "unavailable" }, calendar: { status: "available" } });
    const first = await runFullAssemblyEnrichmentRecheckScenario("deterministic-replay");
    const second = await runFullAssemblyEnrichmentRecheckScenario("deterministic-replay");
    expect(second.identityTrace).toEqual(first.identityTrace);
    expect(second.statusTrace).toEqual(first.statusTrace);
  });

  it("proves status and factual-value mutation sensitivity by truthfully detecting silent acceptance", async () => {
    const proof = await runEnrichedClaimMutationProof();
    expect(proof).toMatchObject({ metadataUnchanged: true, statusMutationSilentlyAccepted: true, factualValueMutationSilentlyAccepted: true });
    expect(proof.statusMutationOutcome).toBe(proof.baselineOutcome);
    expect(proof.factualValueMutationOutcome).toBe(proof.baselineOutcome);
  });

  it("keeps protected semantics byte-identical and proves production-import isolation with pure Node", () => {
    for (const [path, expected] of Object.entries(protectedHashes)) expect(digest(path), path).toBe(expected);
    for (const [path, expected] of historicalBoundaryHashes) expect(digest(path), path).toBe(expected);
    const evaluator = readFileSync("lib/governed-conversation/full-assembly-enrichment-composition-recheck.ts", "utf8");
    expect(evaluator).not.toMatch(/app\/api\/chat|context-builder|useAgentConversation|agents\/chat-execution/);
    const productionFiles = [...walk("app"), ...walk("lib")].filter(path => /\.(?:ts|tsx|js|jsx)$/.test(path) && !path.includes(".test."));
    for (const path of productionFiles) {
      if (path.endsWith("full-assembly-enrichment-composition-recheck.ts")) continue;
      expect(readFileSync(path, "utf8"), path).not.toContain("full-assembly-enrichment-composition-recheck");
    }
  });
});
