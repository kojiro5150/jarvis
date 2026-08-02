import { describe, expect, it } from "vitest";
import { evaluateClaimBoundary } from "./claim-\u0062oundary-engine";
import { enrichGovernedClaims } from "./claim-enrichment-engine";
import { cassieAssemblyInput, cassieBoundaryInput, claimParametersFromCassieEvaluation, ENRICHMENT_TIME, resolverForAddress } from "./claim-enrichment-fixtures";
import { assembleGovernedSourceEvidence } from "./source-evidence-assembly";

describe("immutable enrichment publications", () => {
  const execute = async (address = "cassie@example.com") => { const boundary = evaluateClaimBoundary(cassieBoundaryInput); const assembled = await assembleGovernedSourceEvidence(cassieAssemblyInput()); return { boundary, result: enrichGovernedClaims({ baseClaimSet: boundary.claimSet!, assembledEvidence: assembled, sourceAssemblyReference: "source-assembly:cassie", resolver: resolverForAddress(address), claimParametersByClaimId: claimParametersFromCassieEvaluation(boundary.claimSet!, boundary.evaluation.extractedParameters), referenceTime: ENRICHMENT_TIME, createdAt: ENRICHMENT_TIME }) }; };
  it("carries every required field, new identities, remapped links, and deep immutability", async () => {
    const { boundary, result } = await execute(); const evaluation = result.evaluation, set = result.enrichedClaimSet!;
    expect(Object.keys(evaluation).sort()).toEqual(["admittedEvidenceCategoryCells", "baseGovernedClaimSetId", "claimOutcomes", "createdAt", "enrichmentEvaluationId", "enrichmentRulesetId", "evaluatedClaimIds", "exchangeId", "referenceTime", "requestId", "sourceAssemblyReference", "sourceReferencesAdmitted", "sourceReferencesConsulted", "sourceReferencesRejected", "threadId"].sort());
    expect(Object.keys(set).sort()).toEqual(["baseGovernedClaimSetId", "claimBoundaryEvaluationId", "claimBoundaryRulesetId", "claimIds", "claims", "createdAt", "enrichedGovernedClaimSetId", "enrichmentEvaluationId", "exchangeId", "referenceTime", "requestId", "segmentLinks", "threadId"].sort());
    expect(set.baseGovernedClaimSetId).toBe(boundary.claimSet!.governedClaimSetId); expect(set.enrichedGovernedClaimSetId).not.toBe(set.baseGovernedClaimSetId);
    expect(set.claims.every((claim, index) => claim.baseClaimId === boundary.claimSet!.claims[index].claimId && claim.claimId !== claim.baseClaimId)).toBe(true);
    expect(set.segmentLinks.map(link => link.claimId)).toEqual(set.claimIds); expect(Object.isFrozen(evaluation) && Object.isFrozen(evaluation.claimOutcomes) && Object.isFrozen(set) && Object.isFrozen(set.claims) && Object.isFrozen(set.claims[0].factualValues)).toBe(true);
  });
  it("replays identically and changes only evidence-dependent identities on mutation", async () => {
    const first = await execute(), replay = await execute(), changed = await execute("cassie.changed@example.com");
    expect(replay.result).toEqual(first.result); expect(changed.result.evaluation.enrichmentEvaluationId).not.toBe(first.result.evaluation.enrichmentEvaluationId); expect(changed.result.enrichedClaimSet!.claims[0].claimId).not.toBe(first.result.enrichedClaimSet!.claims[0].claimId); expect(changed.result.enrichedClaimSet!.enrichedGovernedClaimSetId).not.toBe(first.result.enrichedClaimSet!.enrichedGovernedClaimSetId);
    expect(changed.boundary.claimSet).toEqual(first.boundary.claimSet);
  });
});
