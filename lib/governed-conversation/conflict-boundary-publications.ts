import { createHash } from "node:crypto";
import { canonicalise, lineageIdentity } from "./lineage-types";
import type { GovernedClaimSet } from "./claim-boundary-types";
import type { EnrichedGovernedClaimSet } from "./claim-enrichment-types";
import type { BaseConflictEvaluableClaimSet, CanonicalGovernedConflict, ConflictEvaluation, ConflictEvaluationRuleset, ConflictEvaluationRulesetBody, EnrichedConflictEvaluableClaimSet, GovernedConflictSet } from "./conflict-boundary-types";

const digest = (value: unknown) => createHash("sha256").update(canonicalise(value)).digest("hex");
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") { for (const nested of Object.values(value as Record<string, unknown>)) deepFreeze(nested); Object.freeze(value); }
  return value;
}
const freeze = <T>(value: T): T => deepFreeze(structuredClone(value)) as T;
function required(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

export function constructBaseConflictEvaluableClaimSet(set: GovernedClaimSet): BaseConflictEvaluableClaimSet {
  required(set.schemaVersion === "1" && Boolean(set.governedClaimSetId), "base claim-set identity is required");
  required(new Set(set.claimIds).size === set.claimIds.length && set.claims.every(claim => set.claimIds.includes(claim.claimId)), "duplicate or mismatched base claim identity");
  required(set.segmentLinks.every(link => set.claimIds.includes(link.claimId)), "base segment link references unknown claim");
  return freeze({ ...set, claimSetKind: "base", claimSetPublicationType: "governed_claim_set", claimSetPublicationId: set.governedClaimSetId });
}
export function constructEnrichedConflictEvaluableClaimSet(set: EnrichedGovernedClaimSet): EnrichedConflictEvaluableClaimSet {
  required(Boolean(set.enrichedGovernedClaimSetId && set.baseGovernedClaimSetId && set.enrichmentEvaluationId), "enriched claim-set lineage is required");
  required(set.enrichedGovernedClaimSetId !== set.baseGovernedClaimSetId, "base and enriched claim-set identities must differ");
  required(new Set(set.claimIds).size === set.claimIds.length && set.claims.every(claim => Boolean(claim.baseClaimId) && claim.claimId !== claim.baseClaimId && set.claimIds.includes(claim.claimId)), "invalid enriched claim identity");
  required(set.segmentLinks.every(link => set.claimIds.includes(link.claimId)), "enriched segment link references unknown claim");
  return freeze({ ...set, schemaVersion: "1", claimSetKind: "enriched", claimSetPublicationType: "enriched_governed_claim_set", claimSetPublicationId: set.enrichedGovernedClaimSetId });
}

export function constructConflictEvaluationRuleset(body: ConflictEvaluationRulesetBody): ConflictEvaluationRuleset {
  required(body.rootTaxonomy.length === 3 && body.executableClasses.length === 1 && body.deferredClasses.length === 2, "closed conflict taxonomy is required");
  required(body.outcomeRules.length === 6 && body.outcomeRules.includes("partially_evaluated"), "six-state outcome vocabulary is required");
  return freeze({ ...body, conflictEvaluationRulesetId: `conflict-evaluation-ruleset:${digest(body)}` });
}
export function constructCanonicalGovernedConflict(body: Omit<CanonicalGovernedConflict, "conflictId">): CanonicalGovernedConflict {
  required(body.affectedClaimIds.length === 1 && body.sourcePublicationReferences.length >= 2, "claim linkage and two sources are required");
  const canonicalBody = { ...body, sourcePublicationReferences: [...body.sourcePublicationReferences].sort(), sourceOwnerIds: [...body.sourceOwnerIds].sort(), normalizedValues: [...body.normalizedValues].sort(), originalValues: [...body.originalValues].sort(), evidenceCoverageReferences: [...body.evidenceCoverageReferences].sort() };
  return freeze({ ...canonicalBody, conflictId: `governed-conflict:${digest(canonicalBody)}` });
}
export function constructConflictEvaluation(body: Omit<ConflictEvaluation, "conflictEvaluationId">, discriminator: string): ConflictEvaluation {
  required(body.governedClaimSetId && body.threadId && body.requestId && body.exchangeId, "claim-set and conversational lineage are required");
  required(discriminator && ![body.governedClaimSetId, body.exchangeId, body.requestId, body.conflictEvaluationRulesetId].includes(discriminator), "distinct evaluation event discriminator is required");
  const { conflictSetId: _linkedOutput, ...eventBody } = body;
  return freeze({ ...body, conflictEvaluationId: lineageIdentity("conflict-evaluation", { ...eventBody, discriminator }) });
}
export function constructGovernedConflictSet(body: Omit<GovernedConflictSet, "governedConflictSetId">): GovernedConflictSet {
  const canonicalBody = { ...body, conflicts: [...body.conflicts].sort((a, b) => a.conflictId.localeCompare(b.conflictId)), sourcePublicationReferences: [...body.sourcePublicationReferences].sort() };
  required(canonicalBody.conflictEvaluationId !== canonicalBody.governedClaimSetId, "set identities must not alias inputs");
  required(canonicalBody.conflictEvaluationId && canonicalBody.conflictEvaluationRulesetId && canonicalBody.governedClaimSetId, "canonical conflict-set links are required");
  return freeze({ ...canonicalBody, governedConflictSetId: `governed-conflict-set:${digest(canonicalBody)}` });
}
