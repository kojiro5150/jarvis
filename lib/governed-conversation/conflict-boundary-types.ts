import type { CommunicationClaimType } from "./types";
import type { GovernedClaimSet } from "./claim-boundary-types";
import type { EnrichedGovernedClaimSet } from "./claim-enrichment-types";

export const CONFLICT_CLASSES = ["source_value_contradiction", "policy_incompatibility", "temporal_commitment_incompatibility"] as const;
export type ConversationalConflictClass = (typeof CONFLICT_CLASSES)[number];
export const CONFLICT_EVALUATION_OUTCOMES = ["evaluated_no_conflict", "evaluated_conflict_found", "partially_evaluated", "evaluation_unavailable", "evaluation_unsupported", "evaluation_failed"] as const;
export type ConflictEvaluationOutcome = (typeof CONFLICT_EVALUATION_OUTCOMES)[number];
export type UnevaluatedReason = "conflict_class_unsupported" | "required_source_unavailable" | "insufficient_source_coverage" | "ruleset_unavailable" | "evaluator_failure" | "claim_type_outside_ruleset" | "evaluation_deferred";

export interface ConflictEvaluationRulesetBody {
  readonly schemaVersion: "1"; readonly rulesetVersion: "1.0.0"; readonly rootTaxonomyVersion: "3.90";
  readonly rootTaxonomy: readonly ConversationalConflictClass[]; readonly executableClasses: readonly ["source_value_contradiction"];
  readonly deferredClasses: readonly ["policy_incompatibility", "temporal_commitment_incompatibility"];
  readonly eligibleClaimTypes: readonly ["contact_address_lookup"]; readonly eligibleSourcePublicationTypes: readonly ["governed_contact_observation"];
  readonly comparisonKeys: readonly ["resolved_contact_address"];
  readonly normalization: Readonly<{ trimWhitespace: true; caseTreatment: "lowercase"; extractStructuredAngleAddress: true; displayNamesParticipate: false; unicodeNormalization: "NFC"; aliasesEquivalent: false }>;
  readonly entityAndScopeRule: "same_entity_key_and_comparison_scope"; readonly sourceOwnerRequirement: "distinct_nonempty_owners";
  readonly admissibilityRule: "immutable_available_covered_claim_scoped_unsuperseded_factual_observation";
  readonly availabilityRequirement: "all_supplied_required_sources_available"; readonly coverageRequirement: "at_least_two_complete_observations";
  readonly claimLinkageRule: "one_existing_claim_in_supplied_claim_set";
  readonly conflictRestriction: "insufficient_coverage"; readonly descriptionTemplate: "source_value_contradiction.contact_address.v1";
  readonly noConflictProofRule: "complete_single_cell_evaluation_with_zero_conflict_set";
  readonly outcomeRules: readonly ConflictEvaluationOutcome[]; readonly failureRule: "fail_closed_without_conflict_set";
  readonly prohibitedRelations: readonly ["different_entity", "different_scope", "different_comparison_key", "superseded_observation", "unavailable_marker", "source_silence"];
}
export interface ConflictEvaluationRuleset extends ConflictEvaluationRulesetBody { readonly conflictEvaluationRulesetId: string }

export interface GovernedSourceObservation {
  readonly sourcePublicationId: string; readonly sourceOwnerId: string; readonly sourceType: "governed_contact_observation";
  readonly resourceEntityId: string; readonly affectedClaimId: string; readonly comparisonKey: string;
  readonly canonicalFactualValue: string; readonly originalFactualValue: string; readonly observedAt: string; readonly publishedAt: string;
  readonly provenance: string; readonly comparisonScope: string; readonly availability: "available" | "unavailable";
  readonly coverage: "complete" | "insufficient"; readonly supersessionStatus: "current" | "superseded";
  readonly contentKind: "contact_address" | "unavailable_marker"; readonly schemaVersion: "1";
}
export interface BaseConflictEvaluableClaimSet extends GovernedClaimSet { readonly claimSetKind: "base"; readonly claimSetPublicationId: string; readonly claimSetPublicationType: "governed_claim_set" }
export interface EnrichedConflictEvaluableClaimSet extends EnrichedGovernedClaimSet { readonly claimSetKind: "enriched"; readonly claimSetPublicationId: string; readonly claimSetPublicationType: "enriched_governed_claim_set"; readonly schemaVersion: "1" }
export type ConflictEvaluableClaimSet = BaseConflictEvaluableClaimSet | EnrichedConflictEvaluableClaimSet;
export interface EvaluatedClaimSetReference { readonly publicationId: string; readonly publicationType: "governed_claim_set" | "enriched_governed_claim_set"; readonly claimSetKind: "base" | "enriched"; readonly schemaVersion: "1" }
export interface UnevaluatedScope { readonly claimId?: string; readonly conflictClass: ConversationalConflictClass; readonly sourceRequirement: string; readonly comparisonScope: string; readonly reason: UnevaluatedReason; readonly explanationReference: string }
export interface ConflictCellEvaluation { readonly claimId: string; readonly conflictClass: "source_value_contradiction"; readonly comparisonScope: string; readonly result: "match" | "no_match"; readonly coverage: "complete" }
export interface CanonicalGovernedConflict {
  readonly conflictId: string; readonly schemaVersion: "1"; readonly conflictClass: "source_value_contradiction"; readonly affectedClaimIds: readonly [string];
  readonly sourcePublicationReferences: readonly string[]; readonly sourceOwnerIds: readonly string[]; readonly comparisonKey: "resolved_contact_address";
  readonly comparisonScope: string; readonly normalizedValues: readonly string[]; readonly originalValues: readonly string[];
  readonly statusRestriction: "insufficient_coverage"; readonly descriptionReference: "source_value_contradiction.contact_address.v1";
  readonly rulesetRuleId: "source_value_contradiction.contact_address.v1"; readonly evidenceCoverageReferences: readonly string[];
  readonly evaluatedAt: string; readonly selectedSourceOwnerId?: never;
}
export interface GovernedConflictSet {
  readonly governedConflictSetId: string; readonly schemaVersion: "1"; readonly conflictEvaluationId: string; readonly conflictEvaluationRulesetId: string;
  readonly governedClaimSetId: string; readonly baseGovernedClaimSetId: string; readonly evaluatedClaimSetReference: EvaluatedClaimSetReference; readonly enrichmentEvaluationId?: string; readonly enrichedGovernedClaimSetId?: string; readonly evaluatedClaimIds: readonly string[]; readonly evaluatedClasses: readonly ["source_value_contradiction"];
  readonly sourcePublicationReferences: readonly string[]; readonly evaluationCoverage: "complete" | "partial"; readonly conflicts: readonly CanonicalGovernedConflict[]; readonly createdAt: string;
}
export interface ConflictEvaluation {
  readonly conflictEvaluationId: string; readonly schemaVersion: "1"; readonly conflictEvaluationRulesetId: string; readonly governedClaimSetId: string; readonly baseGovernedClaimSetId: string; readonly evaluatedClaimSetReference: EvaluatedClaimSetReference; readonly enrichmentEvaluationId?: string; readonly enrichedGovernedClaimSetId?: string;
  readonly evaluatedClaimIds: readonly string[]; readonly requestedConflictClasses: readonly ConversationalConflictClass[]; readonly executableConflictClasses: readonly ConversationalConflictClass[];
  readonly sourcePublicationReferences: readonly string[]; readonly sourceOwnerIds: readonly string[]; readonly sourceAvailabilityReferences: readonly string[]; readonly sourceCoverageReferences: readonly string[];
  readonly referenceTime: string; readonly cellEvaluations: readonly ConflictCellEvaluation[]; readonly outcome: ConflictEvaluationOutcome; readonly unevaluatedReasons: readonly UnevaluatedScope[];
  readonly createdAt: string; readonly priorEvaluationId?: string; readonly threadId: string; readonly requestId: string; readonly exchangeId: string; readonly conflictSetId?: string;
}
export interface ConflictEngineInput { readonly ruleset?: ConflictEvaluationRuleset; readonly claimSet?: ConflictEvaluableClaimSet; readonly observations: readonly GovernedSourceObservation[]; readonly requestedConflictClasses: readonly ConversationalConflictClass[]; readonly referenceTime: string; readonly createdAt: string; readonly evaluationDiscriminator: string; readonly priorEvaluationId?: string }
export interface ConflictEngineResult { readonly evaluation?: ConflictEvaluation; readonly conflictSet?: GovernedConflictSet }
export type EligibleConflictClaimType = Extract<CommunicationClaimType, "contact_address_lookup">;
