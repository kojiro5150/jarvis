import { describe, expect, it } from "vitest";
import { evaluateClaimBoundary } from "./claim-boundary-engine";
import { evaluateGovernedConversationalConflicts } from "./conflict-boundary-engine";
import { constructBaseConflictEvaluableClaimSet } from "./conflict-boundary-publications";
import { CONFLICT_EVALUATION_RULESET } from "./conflict-boundary-ruleset";
import { composeGovernedConversationalProjection, computeEffectiveClaimStatus, constructGovernedConflictSummary } from "./projection-composer";
import type { GovernedSourceObservation } from "./conflict-boundary-types";

const time = "2026-08-01T12:00:00.000Z";
const lineage = { threadId: "thread:3.95:cassie", requestId: "request:3.95:cassie", exchangeId: "exchange:3.95:cassie" };
function chain() {
  const claims = evaluateClaimBoundary({ text: "What's Cassie's email? Anything important?", ...lineage, referenceTime: time, createdAt: time, entities: [{ entityId: "person:cassie", personName: "Cassie", displayLabel: "Cassie" }] });
  if (!claims.claimSet) throw new Error("claim set required");
  const contactId = claims.claimSet.claims.find(claim => claim.claimType === "contact_address_lookup")!.claimId;
  const observation = (suffix: string, value: string): GovernedSourceObservation => ({ schemaVersion: "1", sourcePublicationId: `source:${suffix}`, sourceOwnerId: `owner:${suffix}`, sourceType: "governed_contact_observation", resourceEntityId: "person:cassie", affectedClaimId: contactId, comparisonKey: "resolved_contact_address", canonicalFactualValue: value, originalFactualValue: value, observedAt: time, publishedAt: time, provenance: `publisher:${suffix}`, comparisonScope: "current_primary_deliverable_address", availability: "available", coverage: "complete", supersessionStatus: "current", contentKind: "contact_address" });
  const conflicts = evaluateGovernedConversationalConflicts({ ruleset: CONFLICT_EVALUATION_RULESET, claimSet: constructBaseConflictEvaluableClaimSet(claims.claimSet), observations: [observation("a", "cassie.primary@example.com"), observation("b", "cassie.other@example.org")], requestedConflictClasses: ["source_value_contradiction"], referenceTime: time, createdAt: time, evaluationDiscriminator: "conflict:3.95:cassie" });
  const summaries = conflicts.conflictSet!.conflicts.map(constructGovernedConflictSummary);
  const projectionInput = { schemaVersion: "1", claimPublicationStage: "base" as const, evidenceRulesetId: "evidence:3.95", compatibilityRulesetId: "compatibility:3.95", claimClassificationRulesetId: claims.evaluation.claimBoundaryRulesetId, claimBoundaryEvaluation: claims.evaluation, governedClaimSet: claims.claimSet, conflictEvaluation: conflicts.evaluation, governedConflictSet: conflicts.conflictSet, ...lineage, referenceTime: time, createdAt: time, sourceEvidence: [], connectorAvailability: [], calendarEvidence: [], communicationEvidence: [], memoryPriorityReferences: [], compatibilityContext: [], conversationHistory: [], claims: claims.claimSet.claims, conflicts: summaries };
  return { claims, conflicts, summaries, projectionInput, projection: composeGovernedConversationalProjection(projectionInput) };
}

describe("Sprint 3.95 corrected claims/conflicts composition", () => {
  it("proves the real compound Cassie chain remains whole and is partially evaluated", () => {
    const { claims, conflicts } = chain(), set = claims.claimSet!;
    expect(set.claims.map(claim => claim.claimType)).toEqual(["contact_address_lookup", "message_importance"]);
    expect(conflicts.evaluation).toMatchObject({ governedClaimSetId: set.governedClaimSetId, outcome: "partially_evaluated", threadId: set.threadId, requestId: set.requestId, exchangeId: set.exchangeId });
    expect(conflicts.evaluation!.cellEvaluations).toEqual([expect.objectContaining({ claimId: set.claims[0].claimId, result: "match" })]);
    expect(conflicts.evaluation!.unevaluatedReasons).toEqual([expect.objectContaining({ claimId: set.claims[1].claimId, reason: "claim_type_outside_ruleset" })]);
    expect(conflicts.conflictSet).toMatchObject({ governedClaimSetId: set.governedClaimSetId, conflicts: [expect.objectContaining({ affectedClaimIds: [set.claims[0].claimId] })] });
    expect(conflicts.conflictSet!.conflicts[0].selectedSourceOwnerId).toBeUndefined();
  });
  it("preserves all nine identifiers, canonical summaries, and effective status without adjudication", () => {
    const { claims, conflicts, summaries, projection } = chain(), set = claims.claimSet!, conflict = conflicts.conflictSet!.conflicts[0];
    expect(projection).toMatchObject({ claimBoundaryRulesetId: claims.evaluation.claimBoundaryRulesetId, claimBoundaryEvaluationId: claims.evaluation.claimBoundaryEvaluationId, governedClaimSetId: set.governedClaimSetId, conflictEvaluationRulesetId: conflicts.evaluation!.conflictEvaluationRulesetId, conflictEvaluationId: conflicts.evaluation!.conflictEvaluationId, governedConflictSetId: conflicts.conflictSet!.governedConflictSetId, ...lineage, conflictEvaluationOutcome: "partially_evaluated" });
    expect(summaries[0]).toEqual({ conflictId: conflict.conflictId, conflictClass: conflict.conflictClass, sourceOwnerIds: conflict.sourceOwnerIds, affectedClaimIds: conflict.affectedClaimIds, statusRestriction: conflict.statusRestriction, descriptionReference: conflict.descriptionReference });
    expect(projection.effectiveClaimStatuses).toEqual([expect.objectContaining({ canonicalStatus: "insufficient_coverage", effectiveStatus: "insufficient_coverage", appliedConflictIds: [conflict.conflictId] }), expect.objectContaining({ canonicalStatus: "unsupported", effectiveStatus: "unsupported", appliedConflictIds: [] })]);
    expect(JSON.stringify(projection)).not.toContain("selectedSourceOwnerId");
  });
  it("fails closed on every publication-chain or summary mutation and on never evaluated", () => {
    const { projectionInput } = chain();
    expect(() => composeGovernedConversationalProjection({ ...projectionInput, exchangeId: "exchange:wrong" })).toThrow("claim exchange lineage mismatch");
    expect(() => composeGovernedConversationalProjection({ ...projectionInput, claimClassificationRulesetId: "ruleset:wrong" })).toThrow("claim publication lineage mismatch");
    expect(() => composeGovernedConversationalProjection({ ...projectionInput, governedConflictSet: { ...projectionInput.governedConflictSet!, conflictEvaluationId: "evaluation:wrong" } })).toThrow("conflict-set publication lineage mismatch");
    expect(() => composeGovernedConversationalProjection({ ...projectionInput, conflicts: [{ ...projectionInput.conflicts[0], sourceOwnerIds: ["owner:wrong"] }] })).toThrow("conflict summary does not match canonical conflict set");
    expect(() => composeGovernedConversationalProjection({ ...projectionInput, conflictEvaluation: undefined, governedConflictSet: undefined, conflicts: [] })).toThrow("nonempty claim set requires conflict evaluation");
  });
  it("uses an explicit monotonic status matrix and rejects ambiguous cause precedence", () => {
    expect(computeEffectiveClaimStatus("available", [])).toBe("available");
    expect(computeEffectiveClaimStatus("available", ["insufficient_coverage"])).toBe("insufficient_coverage");
    expect(computeEffectiveClaimStatus("unsupported", ["insufficient_coverage"])).toBe("unsupported");
    expect(() => computeEffectiveClaimStatus("available", ["unavailable", "unsupported"])).toThrow("ambiguous");
  });
});
