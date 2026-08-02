import { canonicalise, lineageIdentity, type RealEosContextReference } from "./lineage-types";
import type { ClaimBoundaryEvaluation, GovernedClaimSet } from "./claim-boundary-types";
import type { EnrichedGovernedClaimSet, EvidenceToClaimEnrichmentEvaluation } from "./claim-enrichment-types";
import type { CanonicalGovernedConflict, ConflictEvaluation, ConflictEvaluationOutcome, GovernedConflictSet } from "./conflict-boundary-types";
import type { CompatibilityContext, ConversationalEvidenceStatus, GovernedClaimInput, GovernedConflict, GovernedConversationTurn, GovernedSourceReference } from "./types";

export interface GovernedPublicationReference { readonly publicationId: string; readonly publicationType: string; readonly schemaVersion: string }

export interface GovernedSourceEvidenceInput { readonly sourceReference: GovernedSourceReference; readonly publicationReference: GovernedPublicationReference; readonly available: boolean; readonly status: ConversationalEvidenceStatus; readonly provenanceReference: string; readonly retrievalTime: string; readonly contentDigest: string; readonly contentKind: string; readonly policyReference: string }
export interface GovernedConnectorAvailabilityInput { readonly connectorId: string; readonly sourceId: string; readonly availability: "available" | "unavailable"; readonly observedAt: string; readonly fallbackStatus: "none" | "unavailable" }
export interface GovernedCalendarEvidenceInput { readonly commitmentReference: string; readonly sourceReference: GovernedSourceReference; readonly start: string; readonly end: string; readonly timezone: string; readonly provenanceReference: string; readonly available: boolean; readonly coverageLimit: string; readonly policyReference: string }
export interface GovernedCommunicationEvidenceInput { readonly communicationReference: string; readonly recipientEvidenceReference: string; readonly sourceReference: GovernedSourceReference; readonly provenanceReference: string; readonly retrievalTime: string; readonly available: boolean; readonly contentDigest?: string; readonly contentKind: string; readonly compatibilityBoundary: string; readonly policyReference: string }
export interface GovernedMemoryPriorityReference { readonly memoryReference: string; readonly sourceOwner: string; readonly freshness: string; readonly available: boolean; readonly classification: "operator_priority" | "derived_interpretation"; readonly policyReference: string; readonly contentDigest?: string }
export interface GovernedConflictInput { readonly conflictId: string; readonly conflictClass: CanonicalGovernedConflict["conflictClass"]; readonly sourceOwnerIds: readonly string[]; readonly affectedClaimIds: readonly string[]; readonly statusRestriction: "insufficient_coverage" | "unavailable" | "unsupported"; readonly descriptionReference: string }
export interface GovernedEffectiveClaimStatus { readonly claimId: string; readonly canonicalStatus: ConversationalEvidenceStatus; readonly effectiveStatus: ConversationalEvidenceStatus; readonly appliedConflictIds: readonly string[] }

interface PublicationInputs {
  readonly claimPublicationStage: "base" | "enriched";
  readonly claimBoundaryEvaluation: ClaimBoundaryEvaluation;
  readonly governedClaimSet: GovernedClaimSet;
  readonly enrichmentEvaluation?: EvidenceToClaimEnrichmentEvaluation;
  readonly enrichedGovernedClaimSet?: EnrichedGovernedClaimSet;
  readonly conflictEvaluation?: ConflictEvaluation;
  readonly governedConflictSet?: GovernedConflictSet;
}
export interface GovernedConversationalProjectionInput extends PublicationInputs { readonly schemaVersion: string; readonly evidenceRulesetId: string; readonly compatibilityRulesetId: string; readonly claimClassificationRulesetId: string; readonly threadId: string; readonly requestId: string; readonly exchangeId: string; readonly referenceTime: string; readonly createdAt: string; readonly sourceEvidence: readonly GovernedSourceEvidenceInput[]; readonly connectorAvailability: readonly GovernedConnectorAvailabilityInput[]; readonly calendarEvidence: readonly GovernedCalendarEvidenceInput[]; readonly communicationEvidence: readonly GovernedCommunicationEvidenceInput[]; readonly memoryPriorityReferences: readonly GovernedMemoryPriorityReference[]; readonly compatibilityContext: readonly CompatibilityContext[]; readonly conversationHistory: readonly GovernedConversationTurn[]; readonly claims: readonly GovernedClaimInput[]; readonly conflicts: readonly GovernedConflictInput[]; readonly optionalApplicationContextReferences?: readonly string[]; readonly optionalRealEosReferences?: readonly RealEosContextReference[] }
export interface GovernedConversationalProjection { readonly projectionId: string; readonly schemaVersion: string; readonly claimPublicationStage: "base" | "enriched"; readonly baseGovernedClaimSetId: string; readonly enrichmentRulesetId?: string; readonly enrichmentEvaluationId?: string; readonly enrichedGovernedClaimSetId?: string; readonly enrichedClaimBaseReferences?: readonly { readonly claimId: string; readonly baseClaimId: string }[]; readonly evidenceRulesetId: string; readonly compatibilityRulesetId: string; readonly claimClassificationRulesetId: string; readonly claimBoundaryRulesetId: string; readonly claimBoundaryEvaluationId: string; readonly governedClaimSetId: string; readonly conflictEvaluationRulesetId?: string; readonly conflictEvaluationId?: string; readonly conflictEvaluationOutcome?: ConflictEvaluationOutcome; readonly governedConflictSetId?: string; readonly threadId: string; readonly requestId: string; readonly exchangeId: string; readonly referenceTime: string; readonly createdAt: string; readonly upstreamPublicationReferences: readonly GovernedPublicationReference[]; readonly sourceEvidenceReferences: readonly GovernedSourceEvidenceInput[]; readonly connectorAvailability: readonly GovernedConnectorAvailabilityInput[]; readonly calendarEvidence: readonly GovernedCalendarEvidenceInput[]; readonly communicationEvidence: readonly GovernedCommunicationEvidenceInput[]; readonly memoryPriorityReferences: readonly GovernedMemoryPriorityReference[]; readonly compatibilityContext: readonly CompatibilityContext[]; readonly conversationHistory: readonly GovernedConversationTurn[]; readonly claims: readonly GovernedClaimInput[]; readonly conflicts: readonly GovernedConflictInput[]; readonly effectiveClaimStatuses: readonly GovernedEffectiveClaimStatus[]; readonly optionalApplicationContextReferences: readonly string[]; readonly optionalRealEosReferences: readonly RealEosContextReference[] }

const equal = (left: unknown, right: unknown): boolean => canonicalise(left) === canonicalise(right);
const sorted = (values: readonly string[]): readonly string[] => [...values].sort();
export function constructGovernedConflictSummary(conflict: CanonicalGovernedConflict): GovernedConflictInput {
  return Object.freeze({ conflictId: conflict.conflictId, conflictClass: conflict.conflictClass, sourceOwnerIds: sorted(conflict.sourceOwnerIds), affectedClaimIds: sorted(conflict.affectedClaimIds), statusRestriction: conflict.statusRestriction, descriptionReference: conflict.descriptionReference });
}

export function computeEffectiveClaimStatus(canonicalStatus: ConversationalEvidenceStatus, restrictions: readonly GovernedConflictInput["statusRestriction"][]): ConversationalEvidenceStatus {
  const unique = new Set(restrictions);
  if (!unique.size || canonicalStatus === "unsupported" || canonicalStatus === "unavailable") return canonicalStatus;
  if (unique.has("unsupported") && unique.has("unavailable")) throw new Error("ambiguous unavailable and unsupported restrictions");
  if (unique.has("unsupported")) return "unsupported";
  if (unique.has("unavailable")) return "unavailable";
  if (unique.has("insufficient_coverage") && canonicalStatus === "available") return "insufficient_coverage";
  return canonicalStatus;
}

function assertProjection(input: GovernedConversationalProjectionInput): void {
  if (!input.threadId || !input.requestId || !input.exchangeId || input.exchangeId === input.optionalRealEosReferences?.find(reference => reference.publicationId === input.exchangeId)?.publicationId) throw new Error("distinct conversational lineage is required");
  if (!input.schemaVersion || !input.evidenceRulesetId || !input.compatibilityRulesetId || !input.claimClassificationRulesetId) throw new Error("projection ruleset identities are required");
  const evaluation = input.claimBoundaryEvaluation, set = input.governedClaimSet;
  if (input.claimClassificationRulesetId !== set.claimBoundaryRulesetId || evaluation.claimBoundaryRulesetId !== set.claimBoundaryRulesetId || set.claimBoundaryEvaluationId !== evaluation.claimBoundaryEvaluationId) throw new Error("claim publication lineage mismatch");
  if (![evaluation, set].every(item => item.threadId === input.threadId && item.requestId === input.requestId && item.exchangeId === input.exchangeId)) throw new Error("claim exchange lineage mismatch");
  const enrichmentEvaluation = input.enrichmentEvaluation, enrichedSet = input.enrichedGovernedClaimSet;
  if (input.claimPublicationStage === "base") {
    if (enrichmentEvaluation || enrichedSet) throw new Error("base stage prohibits enrichment publications");
    if (!equal(input.claims, set.claims)) throw new Error("claim summaries do not match governed claim set");
  } else {
    if (!enrichmentEvaluation || !enrichedSet) throw new Error("enriched stage requires complete enrichment publications");
    if (enrichmentEvaluation.baseGovernedClaimSetId !== set.governedClaimSetId || enrichedSet.baseGovernedClaimSetId !== set.governedClaimSetId || enrichedSet.enrichmentEvaluationId !== enrichmentEvaluation.enrichmentEvaluationId || !enrichmentEvaluation.enrichmentRulesetId) throw new Error("enrichment publication lineage mismatch");
    if (!equal(input.claims, enrichedSet.claims)) throw new Error("claim summaries do not match enriched governed claim set");
    if (enrichedSet.claims.some(claim => !set.claimIds.includes(claim.baseClaimId) || claim.claimId === claim.baseClaimId)) throw new Error("invalid enriched claim base reference");
  }
  const claimIds = input.claims.map(claim => claim.claimId); if (new Set(claimIds).size !== claimIds.length) throw new Error("duplicate claim identity");
  const conflictEvaluation = input.conflictEvaluation, conflictSet = input.governedConflictSet;
  if (input.claims.length && !conflictEvaluation) throw new Error("nonempty claim set requires conflict evaluation");
  if (conflictEvaluation) {
    if (input.claimPublicationStage === "enriched" && (conflictEvaluation.enrichmentEvaluationId !== input.enrichmentEvaluation!.enrichmentEvaluationId || conflictEvaluation.enrichedGovernedClaimSetId !== input.enrichedGovernedClaimSet!.enrichedGovernedClaimSetId)) throw new Error("conflict enrichment lineage mismatch");
    if (conflictEvaluation.governedClaimSetId !== set.governedClaimSetId || conflictEvaluation.baseGovernedClaimSetId !== set.governedClaimSetId || conflictEvaluation.evaluatedClaimSetReference.claimSetKind !== input.claimPublicationStage || conflictEvaluation.evaluatedClaimSetReference.publicationId !== (input.claimPublicationStage === "base" ? set.governedClaimSetId : input.enrichedGovernedClaimSet!.enrichedGovernedClaimSetId) || conflictEvaluation.conflictEvaluationRulesetId === "" || conflictEvaluation.threadId !== input.threadId || conflictEvaluation.requestId !== input.requestId || conflictEvaluation.exchangeId !== input.exchangeId) throw new Error("conflict evaluation lineage mismatch");
    const permitsSet = ["evaluated_no_conflict", "evaluated_conflict_found", "partially_evaluated"].includes(conflictEvaluation.outcome);
    if (permitsSet !== Boolean(conflictSet)) throw new Error("conflict-set presence does not match evaluation outcome");
    if (conflictSet && (conflictSet.governedConflictSetId !== conflictEvaluation.conflictSetId || conflictSet.conflictEvaluationId !== conflictEvaluation.conflictEvaluationId || conflictSet.conflictEvaluationRulesetId !== conflictEvaluation.conflictEvaluationRulesetId || conflictSet.governedClaimSetId !== set.governedClaimSetId || conflictSet.baseGovernedClaimSetId !== set.governedClaimSetId || !equal(conflictSet.evaluatedClaimSetReference, conflictEvaluation.evaluatedClaimSetReference) || conflictSet.enrichmentEvaluationId !== conflictEvaluation.enrichmentEvaluationId || conflictSet.enrichedGovernedClaimSetId !== conflictEvaluation.enrichedGovernedClaimSetId)) throw new Error("conflict-set publication lineage mismatch");
  } else if (conflictSet) throw new Error("conflict set requires evaluation");
  const canonicalConflicts = conflictSet?.conflicts ?? [];
  if (input.conflicts.length !== canonicalConflicts.length || input.conflicts.some(summary => { const canonical = canonicalConflicts.find(conflict => conflict.conflictId === summary.conflictId); return !canonical || !equal(summary, constructGovernedConflictSummary(canonical)); })) throw new Error("conflict summary does not match canonical conflict set");
  if (input.conflicts.some(conflict => conflict.affectedClaimIds.some(id => !claimIds.includes(id)))) throw new Error("conflict references unknown claim");
  if (input.connectorAvailability.some(item => !item.availability || !item.observedAt)) throw new Error("connector availability is required");
  const sourceKeys = new Set(input.sourceEvidence.map(item => `${item.sourceReference.sourceId}|${item.sourceReference.resourceId}|${item.sourceReference.field}|${item.sourceReference.observedAt}`));
  for (const claim of input.claims) for (const reference of claim.sourceReferences) if (!sourceKeys.has(`${reference.sourceId}|${reference.resourceId}|${reference.field}|${reference.observedAt}`)) throw new Error("claim references unknown governed source");
  if (input.conversationHistory.some(turn => turn.canonicalEvidence !== false)) throw new Error("conversation history is non-canonical");
  if (input.compatibilityContext.some(context => context.authority !== "none")) throw new Error("compatibility context has no evidence authority");
  if (input.optionalRealEosReferences?.some(reference => reference.genuinePublication !== true)) throw new Error("synthetic EOS references are prohibited");
}

export function composeGovernedConversationalProjection(input: GovernedConversationalProjectionInput): GovernedConversationalProjection {
  assertProjection(input);
  const conflictEvaluation = input.conflictEvaluation, conflictSet = input.governedConflictSet;
  const enrichmentLineage = input.claimPublicationStage === "enriched" ? { enrichmentRulesetId: input.enrichmentEvaluation!.enrichmentRulesetId, enrichmentEvaluationId: input.enrichmentEvaluation!.enrichmentEvaluationId, enrichedGovernedClaimSetId: input.enrichedGovernedClaimSet!.enrichedGovernedClaimSetId, enrichedClaimBaseReferences: input.enrichedGovernedClaimSet!.claims.map(({ claimId, baseClaimId }) => ({ claimId, baseClaimId })).sort((a, b) => a.claimId.localeCompare(b.claimId)) } : {};
  const body = { schemaVersion: input.schemaVersion, claimPublicationStage: input.claimPublicationStage, baseGovernedClaimSetId: input.governedClaimSet.governedClaimSetId, ...enrichmentLineage, evidenceRulesetId: input.evidenceRulesetId, compatibilityRulesetId: input.compatibilityRulesetId, claimClassificationRulesetId: input.claimClassificationRulesetId, claimBoundaryRulesetId: input.governedClaimSet.claimBoundaryRulesetId, claimBoundaryEvaluationId: input.claimBoundaryEvaluation.claimBoundaryEvaluationId, governedClaimSetId: input.governedClaimSet.governedClaimSetId, conflictEvaluationRulesetId: conflictEvaluation?.conflictEvaluationRulesetId, conflictEvaluationId: conflictEvaluation?.conflictEvaluationId, conflictEvaluationOutcome: conflictEvaluation?.outcome, governedConflictSetId: conflictSet?.governedConflictSetId, threadId: input.threadId, requestId: input.requestId, exchangeId: input.exchangeId, referenceTime: input.referenceTime, createdAt: input.createdAt, upstreamPublicationReferences: input.sourceEvidence.map(item => item.publicationReference), sourceEvidenceReferences: input.sourceEvidence, connectorAvailability: input.connectorAvailability, calendarEvidence: input.calendarEvidence, communicationEvidence: input.communicationEvidence, memoryPriorityReferences: input.memoryPriorityReferences, compatibilityContext: input.compatibilityContext, conversationHistory: input.conversationHistory, claims: input.claims, conflicts: input.conflicts, effectiveClaimStatuses: input.claims.map(claim => { const applied = input.conflicts.filter(conflict => conflict.affectedClaimIds.includes(claim.claimId)); return { claimId: claim.claimId, canonicalStatus: claim.status, effectiveStatus: computeEffectiveClaimStatus(claim.status, applied.map(conflict => conflict.statusRestriction)), appliedConflictIds: applied.map(conflict => conflict.conflictId).sort() }; }), optionalApplicationContextReferences: input.optionalApplicationContextReferences ?? [], optionalRealEosReferences: input.optionalRealEosReferences ?? [] };
  return Object.freeze(structuredClone({ projectionId: lineageIdentity("governed-conversational-projection", body), ...body }));
}

export interface GovernedInputReference { readonly governedInputId: string; readonly projectionId: string; readonly requestId: string; readonly exchangeId: string; readonly referenceTime: string; readonly schemaVersion: string }
export function constructGovernedInputReference(projection: GovernedConversationalProjection): GovernedInputReference { const body = { projectionId: projection.projectionId, requestId: projection.requestId, exchangeId: projection.exchangeId, referenceTime: projection.referenceTime, schemaVersion: projection.schemaVersion }; return Object.freeze({ governedInputId: lineageIdentity("governed-conversational-input", body), ...body }); }
export type ExistingGovernedConflict = GovernedConflict;
