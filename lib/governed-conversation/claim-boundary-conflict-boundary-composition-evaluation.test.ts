import { describe, expect, it } from "vitest";
import { composeGovernedConversationalProjection } from "./projection-composer";
import { CONFLICT_EVALUATION_RULESET } from "./conflict-boundary-ruleset";
import { detectsAffectedClaimMutation, detectsExchangeMutation, detectsPublicationMutation, detectsRestrictionMutation, runCompositionEvaluation } from "./claim-boundary-conflict-boundary-composition-evaluation";

describe("Sprint 3.93 claims/conflicts composition evaluation", () => {
  const result = runCompositionEvaluation();
  const central = result.scenario.centralClaims;
  const independent = result.scenario.conflict;

  it("runs the exact Cassie question through the real claim engine", () => {
    expect(result.question).toBe("What's Cassie's email? Anything important?");
    expect(central.evaluation.outcome).toBe("recognised");
    expect(central.claimSet?.claims.map(x => [x.claimType, x.status])).toEqual([["contact_address_lookup", "insufficient_coverage"], ["message_importance", "unsupported"]]);
    expect(central.claimSet?.claims.every(x => x.material && x.sourceReferences.length === 0)).toBe(true);
  });

  it("honestly detects that the real compound publication cannot enter the conflict scope", () => {
    expect(result.centralConflictAttempt.evaluation?.governedClaimSetId).toBe(central.claimSet?.governedClaimSetId);
    expect(result.centralConflictAttempt.evaluation?.outcome).toBe("evaluation_unsupported");
    expect(result.centralConflictAttempt.conflictSet).toBeUndefined();
    expect(result.findings.find(x => x.seam === "Claim Set → Conflict engine")?.compositionStatus).toBe("semantic-incompatibility");
  });

  it("uses real functions to prove the independently reachable canonical conflict", () => {
    const set = independent.conflictSet!; const evaluation = independent.evaluation!; const claimSet = result.scenario.contactClaims.claimSet!; const conflict = set.conflicts[0];
    expect(evaluation.outcome).toBe("evaluated_conflict_found");
    expect(evaluation.conflictEvaluationRulesetId).toBe(CONFLICT_EVALUATION_RULESET.conflictEvaluationRulesetId);
    expect(evaluation.governedClaimSetId).toBe(claimSet.governedClaimSetId);
    expect(set.governedClaimSetId).toBe(claimSet.governedClaimSetId);
    expect(conflict.affectedClaimIds).toEqual([claimSet.claimIds[0]]);
    expect(conflict.sourceOwnerIds).toHaveLength(2);
    expect(conflict.normalizedValues).toHaveLength(2);
    expect(conflict.statusRestriction).toBe("insufficient_coverage");
    expect(conflict.selectedSourceOwnerId).toBeUndefined();
  });

  it("proves publication identities are distinct and lineage is derived on the reachable seam", () => {
    const c = result.scenario.contactClaims; const e = independent.evaluation!; const s = independent.conflictSet!;
    const ids = [c.evaluation.claimBoundaryRulesetId, c.evaluation.claimBoundaryEvaluationId, c.claimSet!.governedClaimSetId, c.claimSet!.claimIds[0], e.conflictEvaluationRulesetId, e.conflictEvaluationId, s.governedConflictSetId, s.conflicts[0].conflictId, c.claimSet!.threadId, c.claimSet!.requestId, c.claimSet!.exchangeId];
    expect(new Set(ids).size).toBe(ids.length);
    expect([e.threadId, e.requestId, e.exchangeId]).toEqual([c.claimSet!.threadId, c.claimSet!.requestId, c.claimSet!.exchangeId]);
  });

  it("runs real no-conflict, unavailable, and unsupported engine paths and diagnoses projection collapse", () => {
    expect(result.scenario.noConflict.evaluation?.outcome).toBe("evaluated_no_conflict");
    expect(result.scenario.noConflict.conflictSet?.conflicts).toEqual([]);
    const unavailable = result.scenario.run([], "evaluation:unavailable");
    const unsupported = result.scenario.run(result.scenario.compatible, "evaluation:unsupported", central.claimSet!);
    expect(unavailable.evaluation?.outcome).toBe("evaluation_unavailable");
    expect(unsupported.evaluation?.outcome).toBe("evaluation_unsupported");
    expect(result.findings.find(x => x.seam === "Evaluation state → Projection")?.compositionStatus).toBe("semantic-incompatibility");
  });

  it("genuinely attempts projection and exercises its unknown-claim validator", () => {
    expect(result.projectionAttempt.threadId).toBe(central.claimSet!.threadId);
    expect(result.projectionAttempt.requestId).toBe(central.claimSet!.requestId);
    expect(result.projectionAttempt.exchangeId).toBe(central.claimSet!.exchangeId);
    expect(() => composeGovernedConversationalProjection({ ...result.projectionInput, conflicts: [{ conflictId: "mutation", sourceOwners: [], affectedClaimIds: ["unknown"], statusRestriction: "insufficient_coverage", descriptionReference: "mutation" }] })).toThrow("conflict references unknown claim");
  });

  it("is mutation-sensitive across linkage, exchange, restriction, and publication identity", () => {
    const set = independent.conflictSet!; const conflict = set.conflicts[0]; const claimIds = result.scenario.contactClaims.claimSet!.claimIds;
    expect(detectsAffectedClaimMutation(claimIds, conflict.affectedClaimIds)).toBe(true);
    expect(detectsAffectedClaimMutation(claimIds, ["unknown:claim"])).toBe(false);
    expect(detectsExchangeMutation(central.claimSet!.exchangeId, central.claimSet!.exchangeId)).toBe(true);
    expect(detectsExchangeMutation(central.claimSet!.exchangeId, "exchange:mutated")).toBe(false);
    expect(detectsRestrictionMutation(conflict.statusRestriction)).toBe(true);
    expect(detectsRestrictionMutation("available")).toBe(false);
    expect(detectsPublicationMutation(set.governedConflictSetId, set.governedConflictSetId)).toBe(true);
    expect(detectsPublicationMutation(set.governedConflictSetId, "governed-conflict-set:mutated")).toBe(false);
  });
});
