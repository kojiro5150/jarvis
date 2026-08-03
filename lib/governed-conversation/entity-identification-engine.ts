import { canonicalise } from "./lineage-types";
import { ENTITY_IDENTIFICATION_RULESET } from "./entity-identification-ruleset";
import { assertDistinctPublicationIdentities, constructEntityIdentificationCandidate, constructEntityIdentificationEvaluation } from "./entity-identification-publications";
import type { EntityIdentificationCandidate, EntityIdentificationEngineInput, EntityIdentificationEvaluation, EntityIdentificationMatchingBasis, EntityIdentificationOutcome } from "./entity-identification-types";
import type { GovernedCommunicationEvidenceInput } from "./projection-composer";

export const normalizeEntityIdentificationReference = (value: string): string =>
  value.normalize("NFC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US");

function matchingBasis(reference: string, displayName: string): EntityIdentificationMatchingBasis | undefined {
  if (reference === displayName) return "exact_governed_display_name_match";
  const firstToken = displayName.split(" ")[0];
  return reference === firstToken ? "governed_first_token_display_name_alias_match" : undefined;
}

function admitted(evidence: GovernedCommunicationEvidenceInput): boolean {
  return evidence.available === true
    && evidence.contentKind === "gmail_communication_metadata"
    && evidence.compatibilityBoundary === "gmail_metadata_non_authoritative_conversation_context.v1"
    && ENTITY_IDENTIFICATION_RULESET.admittedPolicyReferences.includes(evidence.policyReference as never)
    && typeof evidence.senderDisplayName === "string"
    && evidence.senderDisplayName.trim().length > 0
    && evidence.communicationReference.trim().length > 0
    && evidence.provenanceReference.trim().length > 0
    && evidence.sourceReference.sourceId === "google-gmail"
    && Object.values(evidence.sourceReference).every(value => typeof value === "string" && value.trim().length > 0);
}

function candidateFor(reference: string, evidence: GovernedCommunicationEvidenceInput): EntityIdentificationCandidate | undefined {
  if (!admitted(evidence)) return undefined;
  const displayReference = evidence.senderDisplayName!;
  const normalizedDisplay = normalizeEntityIdentificationReference(displayReference);
  const basis = matchingBasis(reference, normalizedDisplay);
  return basis ? constructEntityIdentificationCandidate(evidence, displayReference, normalizedDisplay, basis) : undefined;
}

const compareCandidates = (left: EntityIdentificationCandidate, right: EntityIdentificationCandidate): number =>
  left.candidateId.localeCompare(right.candidateId);

export function identifyGovernedEntity(input: EntityIdentificationEngineInput): EntityIdentificationEvaluation {
  if (input.parameter.name !== "personName" || !input.parameter.segmentId || !input.parameter.value.trim()) throw new Error("only a nonempty recognised personName parameter is admitted");
  if (!input.threadId || !input.requestId || !input.exchangeId || !input.claimBoundaryEvaluationReference || !input.recognizedIntentReference) throw new Error("entity-identification conversational lineage is required");
  if (!input.createdAt || Number.isNaN(Date.parse(input.createdAt))) throw new Error("createdAt must be an ISO instant");

  const normalizedEntityReference = normalizeEntityIdentificationReference(input.parameter.value);
  const candidates = input.gmailSourceResult.status === "available"
    ? input.communicationEvidence.flatMap(evidence => candidateFor(normalizedEntityReference, evidence) ?? []).sort(compareCandidates)
    : [];
  const admittedEvidenceReferences = input.gmailSourceResult.status === "available"
    ? input.communicationEvidence.filter(admitted).map(item => item.communicationReference).sort()
    : [];
  const count = candidates.length;
  const outcome: EntityIdentificationOutcome = input.gmailSourceResult.status !== "available"
    ? "entity_source_unavailable"
    : count === 0 ? "unresolved_no_match" : count === 1 ? "resolved" : "ambiguous_multiple_matches";
  const resolvedCandidateReference = outcome === "resolved" ? candidates[0].candidateId : undefined;
  const evaluation = constructEntityIdentificationEvaluation({
    entityIdentificationRulesetId: ENTITY_IDENTIFICATION_RULESET.entityIdentificationRulesetId,
    schemaVersion: "1",
    threadId: input.threadId,
    requestId: input.requestId,
    exchangeId: input.exchangeId,
    claimBoundaryEvaluationReference: input.claimBoundaryEvaluationReference,
    recognizedIntentReference: input.recognizedIntentReference,
    unresolvedEntityReference: input.parameter.value,
    normalizedEntityReference,
    admittedEvidenceReferences,
    candidates,
    candidateReferences: candidates.map(candidate => candidate.candidateId),
    qualifyingCandidateCount: count,
    sourceStatus: input.gmailSourceResult.status,
    ...(input.gmailSourceResult.failureReason ? { sourceFailureReason: input.gmailSourceResult.failureReason } : {}),
    outcome,
    ...(resolvedCandidateReference ? { resolvedCandidateReference } : {}),
    disambiguationRequired: outcome === "ambiguous_multiple_matches",
    clarificationCandidateReferences: outcome === "ambiguous_multiple_matches" ? candidates.map(({ candidateId, displayReference, evidenceReference }) => ({ candidateId, displayReference, evidenceReference })) : [],
    createdAt: input.createdAt,
  });
  assertDistinctPublicationIdentities(ENTITY_IDENTIFICATION_RULESET, evaluation);
  return evaluation;
}

export const canonicalEntityIdentificationEvaluation = (evaluation: EntityIdentificationEvaluation): string => canonicalise(evaluation);
