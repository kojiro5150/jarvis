import { createHash } from "node:crypto";
import { canonicalise, lineageIdentity } from "./lineage-types";
import type { CanonicalGovernedConflict, ConflictEvaluation, ConflictEvaluationRuleset, ConflictEvaluationRulesetBody, GovernedConflictSet } from "./conflict-boundary-types";

const digest = (value: unknown) => createHash("sha256").update(canonicalise(value)).digest("hex");
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") { for (const nested of Object.values(value as Record<string, unknown>)) deepFreeze(nested); Object.freeze(value); }
  return value;
}
const freeze = <T>(value: T): T => deepFreeze(structuredClone(value)) as T;
function required(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }

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
  required(discriminator && ![body.governedClaimSetId, body.exchangeId, body.requestId, body.conflictEvaluationRulesetId].includes(discriminator), "distinct evaluation event discriminator is required");
  const { conflictSetId: _linkedOutput, ...eventBody } = body;
  return freeze({ ...body, conflictEvaluationId: lineageIdentity("conflict-evaluation", { ...eventBody, discriminator }) });
}
export function constructGovernedConflictSet(body: Omit<GovernedConflictSet, "governedConflictSetId">): GovernedConflictSet {
  const canonicalBody = { ...body, conflicts: [...body.conflicts].sort((a, b) => a.conflictId.localeCompare(b.conflictId)), sourcePublicationReferences: [...body.sourcePublicationReferences].sort() };
  required(canonicalBody.conflictEvaluationId !== canonicalBody.governedClaimSetId, "set identities must not alias inputs");
  return freeze({ ...canonicalBody, governedConflictSetId: `governed-conflict-set:${digest(canonicalBody)}` });
}
