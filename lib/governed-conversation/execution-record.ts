import type { ClaimOwnership, ConversationalEvidenceStatus, GovernedConversationalInput, GovernedConversationalResponseEnvelope } from "./types";
import type { ConversationalExecutionRecord } from "./lineage-types";

const statuses: readonly ConversationalEvidenceStatus[] = ["available", "insufficient_coverage", "unavailable", "unsupported"];
const ownerships: readonly ClaimOwnership[] = ["deterministic_observation", "deterministic_status", "operator_provided", "legacy_compatibility", "model_interpretation", "model_advisory", "unsupported"];
const count = <T extends string>(values: readonly T[], all: readonly T[]) => Object.fromEntries(all.map(key => [key, values.filter(value => value === key).length])) as Record<T, number>;

export type ConversationalExecutionRecordMetadata = Pick<ConversationalExecutionRecord, "sourceReferences" | "sourceAvailability" | "evidenceStatusSummary" | "claimStatusSummary" | "retrievalPolicyDecisionReferences" | "validatorVersion" | "validationOutcome" | "ownershipSummary" | "refusalOutcome" | "segmentSummary" | "agentId" | "modelExecutionMetadataReferences">;

/** Builds metadata for the one authoritative conversational terminal record. */
export function constructConversationalExecutionRecordMetadata(value: { readonly input: GovernedConversationalInput; readonly envelope: GovernedConversationalResponseEnvelope; readonly agentId: string; readonly retrievalPolicyDecisionReferences?: readonly string[]; readonly modelExecutionMetadataReferences?: readonly string[] }): ConversationalExecutionRecordMetadata {
  const sourceReferences = [...new Map(value.input.claims.flatMap(claim => claim.sourceReferences).map(reference => [`${reference.sourceId}:${reference.resourceId}:${reference.field}`, reference])).values()];
  const observedOwnership = value.envelope.observedFacts.map(fact => fact.ownership as ClaimOwnership);
  const modelOwnership = [...(value.envelope.interpretation ? [value.envelope.interpretation.ownership as ClaimOwnership] : []), ...(value.envelope.advisoryNextSteps ?? []).map(step => step.ownership as ClaimOwnership)];
  return {
    sourceReferences,
    sourceAvailability: Object.fromEntries(value.input.sources.map(source => [source.sourceId, source.available])),
    evidenceStatusSummary: count(value.input.claims.map(claim => claim.status), statuses),
    claimStatusSummary: value.input.claims.map(claim => ({ claimId: claim.claimId, status: claim.status })),
    retrievalPolicyDecisionReferences: value.retrievalPolicyDecisionReferences ?? [],
    validatorVersion: value.envelope.validation.validatorVersion,
    validationOutcome: value.envelope.validation.outcome,
    ownershipSummary: count([...value.input.claims.map(claim => claim.ownership as ClaimOwnership), ...observedOwnership, ...modelOwnership], ownerships),
    refusalOutcome: value.envelope.refusal?.reason ?? null,
    segmentSummary: { deterministic: value.envelope.observedFacts.length + value.envelope.claims.length, modelOwned: (value.envelope.interpretation ? 1 : 0) + (value.envelope.advisoryNextSteps?.length ?? 0) },
    agentId: value.agentId,
    modelExecutionMetadataReferences: value.modelExecutionMetadataReferences ?? [],
  };
}
