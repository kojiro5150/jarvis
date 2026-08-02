import { describe, expect, it } from "vitest";
import { evaluateClaimBoundary } from "./claim-boundary-engine";
import { enrichGovernedClaims } from "./claim-enrichment-engine";
import { cassieAssemblyInput, cassieBoundaryInput, claimParametersFromCassieEvaluation, ENRICHMENT_TIME, resolverForAddress } from "./claim-enrichment-fixtures";
import { constructEnrichedClaimSet } from "./claim-enrichment-publications";
import { EnrichedClaimIntegrityError, GOVERNED_ENRICHED_CLAIM_INTEGRITY_POLICY_ID, constructEnrichedClaimIntegrityBody, isClaimIntegrityDigest, recomputeEnrichedClaimIntegrityDigest, serializeEnrichedClaimIntegrityBody } from "./claim-integrity";
import { CONFLICT_EVALUATION_RULESET } from "./conflict-boundary-ruleset";
import { evaluateGovernedConversationalConflicts } from "./conflict-boundary-engine";
import { constructBaseConflictEvaluableClaimSet, constructEnrichedConflictEvaluableClaimSet } from "./conflict-boundary-publications";
import type { ConflictEngineInput, GovernedSourceObservation } from "./conflict-boundary-types";
import { assembleGovernedSourceEvidence } from "./source-evidence-assembly";

async function genuine() {
  const boundary = evaluateClaimBoundary(cassieBoundaryInput);
  const assembled = await assembleGovernedSourceEvidence(cassieAssemblyInput());
  const result = enrichGovernedClaims({ baseClaimSet: boundary.claimSet!, assembledEvidence: assembled, sourceAssemblyReference: "source-assembly:integrity-test", resolver: resolverForAddress(), claimParametersByClaimId: claimParametersFromCassieEvaluation(boundary.claimSet!, boundary.evaluation.extractedParameters), referenceTime: ENRICHMENT_TIME, createdAt: ENRICHMENT_TIME });
  if (result.outcome !== "completed") throw new Error("fixture enrichment failed");
  const originalSet = result.enrichedClaimSet; const claim = originalSet.claims.find(item => item.claimType === "contact_address_lookup")!;
  const set = constructEnrichedClaimSet({ ...originalSet, claims: [claim], segmentLinks: originalSet.segmentLinks.filter(link => link.claimId === claim.claimId) });
  const observation = (suffix: string, value: string, digest: string | null = claim.claimIntegrityDigest): GovernedSourceObservation => ({ sourcePublicationId: `integrity-source:${suffix}`, sourceOwnerId: `integrity-owner:${suffix}`, sourceType: "governed_contact_observation", resourceEntityId: "person:cassie", affectedClaimId: claim.claimId, ...(digest === null ? {} : { evaluatedClaimIntegrityDigest: digest as `sha256:${string}` }), comparisonKey: "resolved_contact_address", canonicalFactualValue: value, originalFactualValue: value, observedAt: ENRICHMENT_TIME, publishedAt: ENRICHMENT_TIME, provenance: `integrity-publisher:${suffix}`, comparisonScope: "current_primary_deliverable_address", availability: "available", coverage: "complete", supersessionStatus: "current", contentKind: "contact_address", schemaVersion: "1" });
  const observations = [observation("a", "cassie@example.com"), observation("b", "cassie@example.com")];
  const input: ConflictEngineInput = { ruleset: CONFLICT_EVALUATION_RULESET, claimSet: constructEnrichedConflictEvaluableClaimSet(set), observations, requestedConflictClasses: ["source_value_contradiction"], referenceTime: ENRICHMENT_TIME, createdAt: ENRICHMENT_TIME, evaluationDiscriminator: "integrity-test" };
  return { boundary, result, set, claim, observation, input };
}
const thrownCode = (run: () => unknown) => { try { run(); } catch (error) { expect(error).toBeInstanceOf(EnrichedClaimIntegrityError); return (error as EnrichedClaimIntegrityError).code; } throw new Error("expected integrity rejection"); };

describe("governed enriched-claim integrity v1", () => {
  it("serializes the fixed body deterministically, canonicalizes sets, and validates the exact digest encoding", async () => {
    const { set, claim } = await genuine();
    const context = { enrichmentEvaluationId: set.enrichmentEvaluationId, threadId: set.threadId, requestId: set.requestId, exchangeId: set.exchangeId, segmentIds: set.segmentLinks.filter(link => link.claimId === claim.claimId).map(link => link.segmentId) };
    const body = constructEnrichedClaimIntegrityBody(claim, context);
    expect(Object.keys(body)).toEqual(["policy", "claimId", "baseClaimId", "claimType", "material", "status", "ownership", "sourceReferences", "factualValues", "sourceAvailable", "provenance", "observedAt", "contentKind", "boundedComplete", "conflicts", "enrichmentEvaluationId", "threadId", "requestId", "exchangeId", "segmentIds"]);
    expect(body.policy).toBe(GOVERNED_ENRICHED_CLAIM_INTEGRITY_POLICY_ID); expect(serializeEnrichedClaimIntegrityBody(body)).toBe(serializeEnrichedClaimIntegrityBody(constructEnrichedClaimIntegrityBody(claim, { ...context, segmentIds: [...context.segmentIds].reverse() })));
    expect(recomputeEnrichedClaimIntegrityDigest(claim, context)).toBe(claim.claimIntegrityDigest); expect(isClaimIntegrityDigest(claim.claimIntegrityDigest)).toBe(true);
    expect(isClaimIntegrityDigest(claim.claimIntegrityDigest.toUpperCase())).toBe(false); expect(isClaimIntegrityDigest(claim.claimIntegrityDigest.slice(7))).toBe(false); expect(isClaimIntegrityDigest("sha256:abc")).toBe(false);
  });

  it("publishes frozen claim and record digests and commits them to enriched-set identity", async () => {
    const { result, set, claim } = await genuine();
    expect(Object.isFrozen(claim)).toBe(true); expect(result.evaluation.claimOutcomes[0]).toMatchObject({ claimIntegrityPolicyId: GOVERNED_ENRICHED_CLAIM_INTEGRITY_POLICY_ID, claimIntegrityDigest: claim.claimIntegrityDigest });
    const changed = constructEnrichedClaimSet({ ...set, claims: [{ ...claim, claimIntegrityDigest: (`sha256:${"0".repeat(64)}`) as const }, ...set.claims.slice(1)] });
    expect(changed.enrichedGovernedClaimSetId).not.toBe(set.enrichedGovernedClaimSetId);
  });

  it("allows valid matching and contradictory enriched observations", async () => {
    const fixture = await genuine();
    const validResult = evaluateGovernedConversationalConflicts(fixture.input); expect(validResult.evaluation?.outcome).toBe("evaluated_no_conflict");
    const conflict = evaluateGovernedConversationalConflicts({ ...fixture.input, observations: [fixture.observation("a", "cassie@example.com"), fixture.observation("b", "other@example.com")], evaluationDiscriminator: "integrity-conflict" });
    expect(conflict.evaluation?.outcome).toBe("evaluated_conflict_found"); expect(conflict.conflictSet).toBeTruthy();
  });

  it("rejects every protected claim mutation before returning an evaluation", async () => {
    const fixture = await genuine(); const claim = fixture.claim;
    const mutations: Record<string, unknown>[] = [
      { status: "unsupported" }, { factualValues: ["changed@example.com"] }, { sourceReferences: [...claim.sourceReferences, { sourceId: "x", resourceId: "x", field: "x", observedAt: ENRICHMENT_TIME }] },
      { provenance: `${claim.provenance}:changed` }, { sourceAvailable: !claim.sourceAvailable }, { boundedComplete: !claim.boundedComplete }, { observedAt: "2026-08-01T12:00:01.000Z" }, { contentKind: "plain_text_body" }, { baseClaimId: `${claim.baseClaimId}:changed` },
      { conflicts: [{ conflictId: "conflict:changed", claimId: claim.claimId, governedReference: { sourceId: "x", resourceId: "x", field: "x", observedAt: ENRICHMENT_TIME }, compatibilityContextId: "context:x", description: "changed" }] },
    ];
    for (const mutation of mutations) {
      const mutatedSet = { ...fixture.set, claims: fixture.set.claims.map(item => item.claimId === claim.claimId ? { ...item, ...mutation } : item) };
      let returned = false; const code = thrownCode(() => { const value = evaluateGovernedConversationalConflicts({ ...fixture.input, claimSet: constructEnrichedConflictEvaluableClaimSet(mutatedSet), evaluationDiscriminator: `mutation:${Object.keys(mutation)[0]}` }); returned = Boolean(value.evaluation || value.conflictSet); });
      expect(code).toBe("published_claim_digest_mismatch"); expect(returned).toBe(false);
    }
    const segmentSet = { ...fixture.set, segmentLinks: fixture.set.segmentLinks.map(link => link.claimId === claim.claimId ? { ...link, segmentId: `${link.segmentId}:changed` } : link) };
    expect(thrownCode(() => evaluateGovernedConversationalConflicts({ ...fixture.input, claimSet: constructEnrichedConflictEvaluableClaimSet(segmentSet), evaluationDiscriminator: "mutation:segment" }))).toBe("published_claim_digest_mismatch");
  });

  it("uses the exact closed claim and observation mismatch codes", async () => {
    const fixture = await genuine(); const claim = fixture.claim; const malformed = "sha256:ABC" as `sha256:${string}`; const other = `sha256:${"0".repeat(64)}` as const;
    const claimCase = (change: Record<string, unknown>) => ({ ...fixture.input, claimSet: constructEnrichedConflictEvaluableClaimSet({ ...fixture.set, claims: fixture.set.claims.map(item => item.claimId === claim.claimId ? { ...item, ...change } : item) }), evaluationDiscriminator: `claim-case:${Object.keys(change).join()}` });
    expect(thrownCode(() => evaluateGovernedConversationalConflicts(claimCase({ claimIntegrityPolicyId: undefined, claimIntegrityDigest: undefined })))).toBe("claim_digest_missing");
    expect(thrownCode(() => evaluateGovernedConversationalConflicts(claimCase({ claimIntegrityPolicyId: "wrong-policy" })))).toBe("claim_integrity_policy_mismatch");
    expect(thrownCode(() => evaluateGovernedConversationalConflicts(claimCase({ claimIntegrityDigest: malformed })))).toBe("claim_integrity_digest_malformed");
    const observationCase = (observations: GovernedSourceObservation[]) => ({ ...fixture.input, observations, evaluationDiscriminator: `observation-case:${observations.length}:${observations.map(x => x.sourcePublicationId).join()}` });
    expect(thrownCode(() => evaluateGovernedConversationalConflicts(observationCase([fixture.observation("missing", "cassie@example.com", null)])))).toBe("observation_digest_missing");
    expect(thrownCode(() => evaluateGovernedConversationalConflicts(observationCase([fixture.observation("malformed", "cassie@example.com", malformed)])))).toBe("claim_integrity_digest_malformed");
    expect(thrownCode(() => evaluateGovernedConversationalConflicts(observationCase([fixture.observation("other", "cassie@example.com", other)])))).toBe("observation_claim_digest_mismatch");
    expect(thrownCode(() => evaluateGovernedConversationalConflicts(observationCase([fixture.observation("correct", "cassie@example.com"), fixture.observation("mixed", "cassie@example.com", other)])))).toBe("mixed_observation_claim_digests");
  });

  it("prohibits enriched digests on base observations without changing ordinary base evaluation", async () => {
    const fixture = await genuine(); const baseSet = constructBaseConflictEvaluableClaimSet(fixture.boundary.claimSet!); const affectedClaimId = baseSet.claimIds[0];
    const baseObservations = fixture.input.observations.map(item => ({ ...item, affectedClaimId, evaluatedClaimIntegrityDigest: undefined }));
    expect(evaluateGovernedConversationalConflicts({ ...fixture.input, claimSet: baseSet, observations: baseObservations, evaluationDiscriminator: "base-valid" }).evaluation).toBeTruthy();
    expect(() => evaluateGovernedConversationalConflicts({ ...fixture.input, claimSet: baseSet, observations: [{ ...baseObservations[0], evaluatedClaimIntegrityDigest: fixture.claim.claimIntegrityDigest }], evaluationDiscriminator: "base-invalid" })).toThrow("base observations");
  });
});
