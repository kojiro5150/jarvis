import type { CanonicalGovernedConflict, ConflictEngineInput, ConflictEngineResult, ConflictEvaluation, ConversationalConflictClass, GovernedSourceObservation, UnevaluatedReason } from "./conflict-boundary-types";
import { constructCanonicalGovernedConflict, constructConflictEvaluation, constructGovernedConflictSet } from "./conflict-boundary-publications";

const SOURCE_REQUIREMENT = "two_complete_governed_contact_observations";
const EXPLANATION = "conflict_evaluation.part1.v1";
const normalizeAddress = (value: string): string => {
  const normalized = value.normalize("NFC").trim();
  const angle = normalized.match(/<([^<>]+)>$/)?.[1] ?? normalized;
  const result = angle.trim().toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(result)) throw new Error("factual value is not a deliverable address");
  return result;
};

function unevaluated(input: ConflictEngineInput, outcome: "evaluation_unavailable" | "evaluation_unsupported" | "evaluation_failed", reason: UnevaluatedReason, conflictClass: ConversationalConflictClass, claimId?: string): ConflictEngineResult {
  const claimSet = input.claimSet;
  const evaluation = constructConflictEvaluation({ schemaVersion: "1", conflictEvaluationRulesetId: input.ruleset?.conflictEvaluationRulesetId ?? "ruleset:unavailable", governedClaimSetId: claimSet?.governedClaimSetId,
    evaluatedClaimIds: [], requestedConflictClasses: input.requestedConflictClasses, executableConflictClasses: input.ruleset?.executableClasses ?? [], sourcePublicationReferences: input.observations.map(x => x.sourcePublicationId).filter(Boolean).sort(), sourceOwnerIds: input.observations.map(x => x.sourceOwnerId).filter(Boolean).sort(),
    sourceAvailabilityReferences: input.observations.map(x => `${x.sourcePublicationId}:availability`).filter(x => !x.startsWith(":")), sourceCoverageReferences: input.observations.map(x => `${x.sourcePublicationId}:coverage`).filter(x => !x.startsWith(":")), referenceTime: input.referenceTime, cellEvaluations: [], outcome,
    unevaluatedReasons: [{ claimId, conflictClass, sourceRequirement: SOURCE_REQUIREMENT, comparisonScope: input.observations[0]?.comparisonScope ?? "claim_scope", reason, explanationReference: EXPLANATION }], createdAt: input.createdAt, priorEvaluationId: input.priorEvaluationId, threadId: claimSet?.threadId, requestId: claimSet?.requestId, exchangeId: claimSet?.exchangeId }, input.evaluationDiscriminator);
  return Object.freeze({ evaluation });
}

export function evaluateGovernedConversationalConflicts(input: ConflictEngineInput): ConflictEngineResult {
  if (!input.claimSet) return Object.freeze({}); // Decision 1: no claim set means no evaluation event.
  const requested = input.requestedConflictClasses[0] ?? "source_value_contradiction";
  if (!input.ruleset) return unevaluated(input, "evaluation_unavailable", "ruleset_unavailable", requested);
  if (input.requestedConflictClasses.length !== 1 || requested !== "source_value_contradiction") return unevaluated(input, "evaluation_unsupported", "conflict_class_unsupported", requested, input.claimSet.claimIds[0]);
  if (input.claimSet.claims.length !== 1 || input.claimSet.claims[0].claimType !== "contact_address_lookup") return unevaluated(input, "evaluation_unsupported", "claim_type_outside_ruleset", requested, input.claimSet.claimIds[0]);
  const claim = input.claimSet.claims[0];
  if (input.observations.some(x => !x.sourcePublicationId || !x.sourceOwnerId || !x.provenance || !x.observedAt || !input.claimSet!.claimIds.includes(x.affectedClaimId))) return unevaluated(input, "evaluation_failed", "evaluator_failure", requested, claim.claimId);
  if (input.observations.length < 2 || input.observations.some(x => x.availability === "unavailable" || x.coverage !== "complete" || x.contentKind === "unavailable_marker")) return unevaluated(input, "evaluation_unavailable", input.observations.some(x => x.availability === "unavailable" || x.contentKind === "unavailable_marker") ? "required_source_unavailable" : "insufficient_source_coverage", requested, claim.claimId);
  try {
    const current = input.observations.filter(x => x.supersessionStatus === "current");
    const usable = current.filter(x => x.sourceType === "governed_contact_observation" && x.comparisonKey === "resolved_contact_address");
    for (const item of usable) if (normalizeAddress(item.canonicalFactualValue) !== normalizeAddress(item.originalFactualValue)) throw new Error("canonical value does not match normalization");
    const relations = new Map<string, GovernedSourceObservation[]>();
    for (const item of usable) {
      const key = `${item.affectedClaimId}|${item.resourceEntityId}|${item.comparisonKey}|${item.comparisonScope}`;
      relations.set(key, [...(relations.get(key) ?? []), item]);
    }
    const conflicts: CanonicalGovernedConflict[] = [];
    for (const [scopeKey, observations] of [...relations].sort(([a], [b]) => a.localeCompare(b))) {
      const values = new Set(observations.map(x => normalizeAddress(x.canonicalFactualValue)));
      if (observations.length < 2 || values.size < 2) continue;
      conflicts.push(constructCanonicalGovernedConflict({ schemaVersion: "1", conflictClass: "source_value_contradiction", affectedClaimIds: [claim.claimId], sourcePublicationReferences: observations.map(x => x.sourcePublicationId), sourceOwnerIds: observations.map(x => x.sourceOwnerId), comparisonKey: "resolved_contact_address", comparisonScope: scopeKey.split("|").at(-1)!, normalizedValues: [...values], originalValues: observations.map(x => x.originalFactualValue), statusRestriction: "insufficient_coverage", descriptionReference: "source_value_contradiction.contact_address.v1", rulesetRuleId: "source_value_contradiction.contact_address.v1", evidenceCoverageReferences: observations.map(x => `${x.sourcePublicationId}:coverage`), evaluatedAt: input.referenceTime }));
    }
    const outcome = conflicts.length ? "evaluated_conflict_found" as const : "evaluated_no_conflict" as const;
    const evaluationBody: Omit<ConflictEvaluation, "conflictEvaluationId"> = { schemaVersion: "1", conflictEvaluationRulesetId: input.ruleset.conflictEvaluationRulesetId, governedClaimSetId: input.claimSet.governedClaimSetId, evaluatedClaimIds: [claim.claimId], requestedConflictClasses: input.requestedConflictClasses, executableConflictClasses: ["source_value_contradiction"], sourcePublicationReferences: input.observations.map(x => x.sourcePublicationId).sort(), sourceOwnerIds: input.observations.map(x => x.sourceOwnerId).sort(), sourceAvailabilityReferences: input.observations.map(x => `${x.sourcePublicationId}:availability`).sort(), sourceCoverageReferences: input.observations.map(x => `${x.sourcePublicationId}:coverage`).sort(), referenceTime: input.referenceTime, cellEvaluations: [{ claimId: claim.claimId, conflictClass: "source_value_contradiction", comparisonScope: usable[0]?.comparisonScope ?? "claim_scope", result: conflicts.length ? "match" : "no_match", coverage: "complete" }], outcome, unevaluatedReasons: [], createdAt: input.createdAt, priorEvaluationId: input.priorEvaluationId, threadId: input.claimSet.threadId, requestId: input.claimSet.requestId, exchangeId: input.claimSet.exchangeId };
    const initialEvaluation = constructConflictEvaluation(evaluationBody, input.evaluationDiscriminator);
    const conflictSet = constructGovernedConflictSet({ schemaVersion: "1", conflictEvaluationId: initialEvaluation.conflictEvaluationId, conflictEvaluationRulesetId: input.ruleset.conflictEvaluationRulesetId, governedClaimSetId: input.claimSet.governedClaimSetId, evaluatedClaimIds: [claim.claimId], evaluatedClasses: ["source_value_contradiction"], sourcePublicationReferences: input.observations.map(x => x.sourcePublicationId), evaluationCoverage: "complete", conflicts, createdAt: input.createdAt });
    const evaluation = constructConflictEvaluation({ ...evaluationBody, conflictSetId: conflictSet.governedConflictSetId }, input.evaluationDiscriminator);
    return Object.freeze({ evaluation, conflictSet });
  } catch {
    return unevaluated(input, "evaluation_failed", "evaluator_failure", requested, claim.claimId);
  }
}
