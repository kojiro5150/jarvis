import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FULL_ASSEMBLY_SCENARIO_IDS, fullAssemblyExpectedOutcome } from "./full-assembly-claim-boundary-conflict-boundary-composition-regression";
import { runEnrichedClaimMutationProof } from "./full-assembly-enrichment-composition-recheck";
import { compareObservationIntegrityDigests, runIntegrityCouplingRegressionMatrix, runIntegrityNonSuccessOutcomeChecks, runIntegrityReplayDeterminismCheck } from "./integrity-coupling-full-assembly-regression";

describe("Sprint 3.110 integrity-coupling full-assembly regression", () => {
  it("directly runs both real matrices and their real expected-outcome mapping for all ten unique scenarios", async () => {
    expect(FULL_ASSEMBLY_SCENARIO_IDS).toHaveLength(10); expect(new Set(FULL_ASSEMBLY_SCENARIO_IDS).size).toBe(10);
    const results = await runIntegrityCouplingRegressionMatrix();
    expect(results.map(result => result.scenarioId)).toEqual(FULL_ASSEMBLY_SCENARIO_IDS);
    for (const result of results) { expect(result.expectedOutcome).toBe(fullAssemblyExpectedOutcome(result.scenarioId)); expect(result.expectedOutcomePreserved).toBe(result.observedConflictOutcome === fullAssemblyExpectedOutcome(result.scenarioId)); expect(result.stageResults.expectedOutcome.evidence).toContain(fullAssemblyExpectedOutcome(result.scenarioId)); expect(result.integrityCheckResult).toBe("passed"); expect(result.claimIntegrityDigests.length).toBeGreaterThan(0); expect(result.claimIntegrityDigests.every(trace => trace.matched)).toBe(true); expect(result.observationIntegrityDigests.every(trace => trace.matched)).toBe(true); }
  });

  it("Replay Determinism: compares claim, observation, and governed identities byte-for-byte across three runs", async () => {
    const replay = await runIntegrityReplayDeterminismCheck();
    expect(replay.runCount).toBeGreaterThanOrEqual(3); expect(replay.claimDigestsByteIdentical).toBe(true); expect(replay.observationDigestsByteIdentical).toBe(true); expect(replay.expectedOutcomePreserved).toBe(true); expect(replay.finding).toBeUndefined();
    for (const values of Object.values(replay.governedIdentitiesCompared)) expect(new Set(values).size).toBe(1);
  });

  it("proves integrity passes before the unavailable, unsupported, and evaluator-failed real causes", async () => {
    const results = await runIntegrityNonSuccessOutcomeChecks();
    expect(results.map(result => result.observedOutcome)).toEqual(["evaluation_unavailable", "evaluation_unsupported", "evaluation_failed"]);
    expect(results.map(result => result.realOutcomeReason)).toEqual(["required_source_unavailable", "conflict_class_unsupported", "evaluator_failure"]);
    expect(results.every(result => result.integrityVerificationPassed && !result.falsePositiveDetected)).toBe(true);
  });

  it("reruns the real mutation proof and proves the evaluator itself detects trace mutation", async () => {
    expect(await runEnrichedClaimMutationProof()).toMatchObject({ baselineOutcome: "evaluated_no_conflict", statusMutationRejected: true, statusMutationErrorCode: "published_claim_digest_mismatch", factualValueMutationRejected: true, factualValueMutationErrorCode: "published_claim_digest_mismatch", noStatusMutationEvaluationPublished: true, noFactualValueMutationEvaluationPublished: true, statusMutationSilentlyAccepted: false, factualValueMutationSilentlyAccepted: false });
    const result = (await runIntegrityCouplingRegressionMatrix())[0]; const observation = result.observationIntegrityDigests[0]; const claims = result.enrichmentRegressionResult.statusTrace.enrichedClaims as Parameters<typeof compareObservationIntegrityDigests>[1];
    expect(compareObservationIntegrityDigests([{ sourcePublicationId: observation.sourcePublicationId, affectedClaimId: observation.affectedClaimId, evaluatedClaimIntegrityDigest: `sha256:${"0".repeat(64)}` }], claims)[0].matched).toBe(false);
  });

  it("keeps protected files byte-identical and proves pure-Node production isolation", () => {
    const hashes: Record<string, string> = { "app/api/chat/route.ts": "8fa36884a15158aa04e84ae53d3b8796499d4a2d4f6d74a08a8363aefb8a776d", "lib/context-builder.ts": "8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d", "lib/useAgentConversation.ts": "55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97", "lib/agents/chat-execution.ts": "a8fc170c4273b0dc9e90ec1d85dfaf98c2b4aeddbae3e38380fbe4aad3533dc7", "lib/governed-conversation/claim-integrity.ts": "6eca0f4e8eb8ce477baa23e0b30dcff0dc9d2f36882138926a3e86519c570d5a", "lib/governed-conversation/claim-enrichment-engine.ts": "5c60fff548a152533fa1634daa1096ca6144eb2c72c70998c544b25010129454", "lib/governed-conversation/claim-enrichment-publications.ts": "995af5788c58903eece42438cdad0190fe4c686cfd53e8a1f46eb8655f9f91c1", "lib/governed-conversation/conflict-boundary-engine.ts": "ea0835339911d9a3d40af38333e0f0c39295477d70e1ebc63145375c47ff6064", "lib/governed-conversation/conflict-boundary-types.ts": "f3c7e6860640de98d3a05e7198dc6b1735a0696ed1327e949a0ac4a698a28277", "lib/governed-conversation/projection-composer.ts": "51b58941273e2b6ac748ce94e54368020928a384074cd3f062bd8d9b2dcd6106", "lib/governed-conversation/source-evidence-assembly.ts": "01eacdbabdded56745820d0e09ca1ed1ed332ae4061ee09f4cbef2fa765fa8b7", "lib/governed-conversation/model-invocation.ts": "beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac5338d2f814f5b", "lib/governed-conversation/validator.ts": "1bd9692f56ef0794f070c41ae962375bed93c953af22d393e796911e3f349fef" };
    for (const [path, expected] of Object.entries(hashes)) expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(expected);
    const walk = (directory: string): string[] => readdirSync(directory).flatMap(name => { const path = join(directory, name); return statSync(path).isDirectory() ? walk(path) : [path]; });
    for (const path of [...walk("app"), ...walk("lib")].filter(path => /\.(?:ts|tsx|js|jsx)$/.test(path) && !path.includes(".test.") && !path.endsWith("integrity-coupling-full-assembly-regression.ts"))) expect(readFileSync(path, "utf8"), path).not.toContain("integrity-coupling-full-assembly-regression");
  });
});
