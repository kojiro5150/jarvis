import type { CanonicalGovernedConflict, ConflictCellEvaluation, ConflictEngineInput, ConflictEngineResult, ConflictEvaluation, ConflictEvaluationOutcome, ConversationalConflictClass, GovernedSourceObservation, UnevaluatedReason, UnevaluatedScope } from "./conflict-boundary-types";
import { constructCanonicalGovernedConflict, constructConflictEvaluation, constructGovernedConflictSet } from "./conflict-boundary-publications";

const SOURCE_REQUIREMENT = "two_complete_governed_contact_observations";
const EXPLANATION = "conflict_evaluation.part1.v1";
const normalizeAddress = (value: string): string => {
  const normalized = value.normalize("NFC").trim();
  const result = (normalized.match(/<([^<>]+)>$/)?.[1] ?? normalized).trim().toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(result)) throw new Error("factual value is not a deliverable address");
  return result;
};

const reason = (claimId: string | undefined, conflictClass: ConversationalConflictClass, value: UnevaluatedReason, scope = "claim_scope"): UnevaluatedScope => ({ claimId, conflictClass, sourceRequirement: SOURCE_REQUIREMENT, comparisonScope: scope, reason: value, explanationReference: EXPLANATION });

export function deriveConflictEvaluationOutcome(cells: readonly ConflictCellEvaluation[], unevaluated: readonly UnevaluatedScope[]): ConflictEvaluationOutcome {
  if (cells.length && unevaluated.length) return "partially_evaluated";
  if (cells.length) return cells.some(cell => cell.result === "match") ? "evaluated_conflict_found" : "evaluated_no_conflict";
  if (unevaluated.some(item => item.reason === "evaluator_failure")) return "evaluation_failed";
  if (unevaluated.every(item => item.reason === "claim_type_outside_ruleset" || item.reason === "conflict_class_unsupported" || item.reason === "evaluation_deferred")) return "evaluation_unsupported";
  return "evaluation_unavailable";
}

function publishEvaluation(input: ConflictEngineInput, cells: readonly ConflictCellEvaluation[], unevaluated: readonly UnevaluatedScope[], conflicts: readonly CanonicalGovernedConflict[]): ConflictEngineResult {
  const claimSet = input.claimSet!;
  const outcome = deriveConflictEvaluationOutcome(cells, unevaluated);
  const baseGovernedClaimSetId = claimSet.claimSetKind === "base" ? claimSet.governedClaimSetId : claimSet.baseGovernedClaimSetId;
  const evaluatedClaimSetReference = { publicationId: claimSet.claimSetPublicationId, publicationType: claimSet.claimSetPublicationType, claimSetKind: claimSet.claimSetKind, schemaVersion: "1" as const };
  if (claimSet.claimSetPublicationId !== (claimSet.claimSetKind === "base" ? claimSet.governedClaimSetId : claimSet.enrichedGovernedClaimSetId)) throw new Error("claim-set publication identity mismatch");
  const enrichmentLineage = claimSet.claimSetKind === "enriched" ? { enrichmentEvaluationId: claimSet.enrichmentEvaluationId, enrichedGovernedClaimSetId: claimSet.enrichedGovernedClaimSetId } : {};
  const body: Omit<ConflictEvaluation, "conflictEvaluationId"> = {
    schemaVersion: "1", conflictEvaluationRulesetId: input.ruleset?.conflictEvaluationRulesetId ?? "ruleset:unavailable", governedClaimSetId: baseGovernedClaimSetId, baseGovernedClaimSetId, evaluatedClaimSetReference, ...enrichmentLineage,
    evaluatedClaimIds: cells.map(cell => cell.claimId), requestedConflictClasses: input.requestedConflictClasses, executableConflictClasses: input.ruleset?.executableClasses ?? [],
    sourcePublicationReferences: input.observations.map(item => item.sourcePublicationId).filter(Boolean).sort(), sourceOwnerIds: input.observations.map(item => item.sourceOwnerId).filter(Boolean).sort(),
    sourceAvailabilityReferences: input.observations.map(item => `${item.sourcePublicationId}:availability`).filter(item => !item.startsWith(":")).sort(), sourceCoverageReferences: input.observations.map(item => `${item.sourcePublicationId}:coverage`).filter(item => !item.startsWith(":")).sort(),
    referenceTime: input.referenceTime, cellEvaluations: cells, outcome, unevaluatedReasons: unevaluated, createdAt: input.createdAt, priorEvaluationId: input.priorEvaluationId,
    threadId: claimSet.threadId, requestId: claimSet.requestId, exchangeId: claimSet.exchangeId,
  };
  const initial = constructConflictEvaluation(body, input.evaluationDiscriminator);
  if (!["evaluated_no_conflict", "evaluated_conflict_found", "partially_evaluated"].includes(outcome)) return Object.freeze({ evaluation: initial });
  const conflictSet = constructGovernedConflictSet({ schemaVersion: "1", conflictEvaluationId: initial.conflictEvaluationId, conflictEvaluationRulesetId: body.conflictEvaluationRulesetId, governedClaimSetId: baseGovernedClaimSetId, baseGovernedClaimSetId, evaluatedClaimSetReference, ...enrichmentLineage, evaluatedClaimIds: cells.map(cell => cell.claimId), evaluatedClasses: ["source_value_contradiction"], sourcePublicationReferences: body.sourcePublicationReferences, evaluationCoverage: unevaluated.length ? "partial" : "complete", conflicts, createdAt: input.createdAt });
  return Object.freeze({ evaluation: constructConflictEvaluation({ ...body, conflictSetId: conflictSet.governedConflictSetId }, input.evaluationDiscriminator), conflictSet });
}

export function evaluateGovernedConversationalConflicts(input: ConflictEngineInput): ConflictEngineResult {
  if (!input.claimSet) return Object.freeze({});
  const requested = input.requestedConflictClasses[0] ?? "source_value_contradiction";
  if (!input.ruleset) return publishEvaluation(input, [], [reason(undefined, requested, "ruleset_unavailable")], []);
  if (input.requestedConflictClasses.length !== 1 || requested !== "source_value_contradiction") return publishEvaluation(input, [], input.claimSet.claims.map(claim => reason(claim.claimId, requested, "conflict_class_unsupported")), []);
  if (input.observations.some(item => !item.sourcePublicationId || !item.sourceOwnerId || !item.provenance || !item.observedAt || !input.claimSet!.claimIds.includes(item.affectedClaimId))) return publishEvaluation(input, [], [reason(input.claimSet.claimIds[0], requested, "evaluator_failure")], []);

  const cells: ConflictCellEvaluation[] = [], unevaluated: UnevaluatedScope[] = [], conflicts: CanonicalGovernedConflict[] = [];
  try {
    for (const claim of input.claimSet.claims) {
      if (claim.claimType !== "contact_address_lookup") { unevaluated.push(reason(claim.claimId, requested, "claim_type_outside_ruleset")); continue; }
      const scoped = input.observations.filter(item => item.affectedClaimId === claim.claimId);
      if (scoped.length < 2 || scoped.some(item => item.availability === "unavailable" || item.coverage !== "complete" || item.contentKind === "unavailable_marker")) {
        unevaluated.push(reason(claim.claimId, requested, scoped.some(item => item.availability === "unavailable" || item.contentKind === "unavailable_marker") ? "required_source_unavailable" : "insufficient_source_coverage", scoped[0]?.comparisonScope)); continue;
      }
      const usable = scoped.filter(item => item.supersessionStatus === "current" && item.sourceType === "governed_contact_observation" && item.comparisonKey === "resolved_contact_address");
      for (const item of usable) if (normalizeAddress(item.canonicalFactualValue) !== normalizeAddress(item.originalFactualValue)) throw new Error("canonical value does not match normalization");
      const relations = new Map<string, GovernedSourceObservation[]>();
      for (const item of usable) { const key = `${item.resourceEntityId}|${item.comparisonKey}|${item.comparisonScope}`; relations.set(key, [...(relations.get(key) ?? []), item]); }
      const claimConflicts: CanonicalGovernedConflict[] = [];
      for (const [scopeKey, observations] of [...relations].sort(([a], [b]) => a.localeCompare(b))) {
        const values = new Set(observations.map(item => normalizeAddress(item.canonicalFactualValue)));
        if (observations.length < 2 || values.size < 2) continue;
        claimConflicts.push(constructCanonicalGovernedConflict({ schemaVersion: "1", conflictClass: "source_value_contradiction", affectedClaimIds: [claim.claimId], sourcePublicationReferences: observations.map(item => item.sourcePublicationId), sourceOwnerIds: observations.map(item => item.sourceOwnerId), comparisonKey: "resolved_contact_address", comparisonScope: scopeKey.split("|").at(-1)!, normalizedValues: [...values], originalValues: observations.map(item => item.originalFactualValue), statusRestriction: "insufficient_coverage", descriptionReference: "source_value_contradiction.contact_address.v1", rulesetRuleId: "source_value_contradiction.contact_address.v1", evidenceCoverageReferences: observations.map(item => `${item.sourcePublicationId}:coverage`), evaluatedAt: input.referenceTime }));
      }
      conflicts.push(...claimConflicts); cells.push({ claimId: claim.claimId, conflictClass: "source_value_contradiction", comparisonScope: usable[0]?.comparisonScope ?? "claim_scope", result: claimConflicts.length ? "match" : "no_match", coverage: "complete" });
    }
    return publishEvaluation(input, cells, unevaluated, conflicts);
  } catch { return publishEvaluation(input, [], [reason(input.claimSet.claimIds[0], requested, "evaluator_failure")], []); }
}
