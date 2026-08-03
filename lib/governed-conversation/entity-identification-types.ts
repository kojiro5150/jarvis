import type { ExtractedParameter } from "./claim-\u0062oundary-types";
import type { GovernedCommunicationEvidenceInput } from "./projection-composer";
import type { AssemblySourceStatus } from "./source-evidence-assembly";
import type { GovernedSourceReference } from "./types";

export type EntityIdentificationOutcome =
  | "resolved"
  | "ambiguous_multiple_matches"
  | "unresolved_no_match"
  | "entity_source_unavailable";

export type EntityIdentificationMatchingBasis =
  | "exact_governed_display_name_match"
  | "governed_first_token_display_name_alias_match";

export interface EntityIdentificationCandidate {
  readonly candidateId: string;
  readonly entityKind: "person";
  readonly displayReference: string;
  readonly normalizedMatchValue: string;
  readonly sourceReference: GovernedSourceReference;
  readonly sourceOwner: string;
  readonly provenanceReference: string;
  readonly evidenceReference: string;
  readonly matchingBasis: EntityIdentificationMatchingBasis;
}

export interface EntityIdentificationRulesetBody {
  readonly schemaVersion: "1";
  readonly rulesetVersion: "1.0.0";
  readonly admittedParameterNames: readonly ["personName"];
  readonly admittedEntityKinds: readonly ["person"];
  readonly admittedEvidenceCategories: readonly ["Governed Communication Evidence"];
  readonly admittedPolicyReferences: readonly ["governed-gmail-conversational-metadata-disclosure.v2"];
  readonly normalizationRules: readonly ["unicode_nfc", "trim_surrounding_whitespace", "collapse_internal_whitespace", "lowercase_en_us"];
  readonly matchingBases: readonly ["exact_governed_display_name_match", "governed_first_token_display_name_alias_match"];
  readonly matchingPrecedence: readonly ["exact_governed_display_name_match", "governed_first_token_display_name_alias_match"];
  readonly cardinalityRules: Readonly<{ zero: "unresolved_no_match"; one: "resolved"; multiple: "ambiguous_multiple_matches" }>;
  readonly sourceAvailabilityRules: Readonly<{ unavailable: "entity_source_unavailable"; failed: "entity_source_unavailable" }>;
  readonly prohibitedMechanisms: readonly ["substring", "prefix", "fuzzy", "semantic", "model", "ranking", "external_search", "identity_fusion"];
}

export interface EntityIdentificationRuleset extends EntityIdentificationRulesetBody {
  readonly entityIdentificationRulesetId: string;
  readonly publicationDigest: string;
}

export interface ClarificationCandidateReference {
  readonly candidateId: string;
  readonly displayReference: string;
  readonly evidenceReference: string;
}

export interface EntityIdentificationEvaluation {
  readonly entityIdentificationEvaluationId: string;
  readonly entityIdentificationRulesetId: string;
  readonly schemaVersion: "1";
  readonly threadId: string;
  readonly requestId: string;
  readonly exchangeId: string;
  readonly claimBoundaryEvaluationReference: string;
  readonly recognizedIntentReference: string;
  readonly unresolvedEntityReference: string;
  readonly normalizedEntityReference: string;
  readonly admittedEvidenceReferences: readonly string[];
  readonly candidates: readonly EntityIdentificationCandidate[];
  readonly candidateReferences: readonly string[];
  readonly qualifyingCandidateCount: number;
  readonly sourceStatus: AssemblySourceStatus;
  readonly sourceFailureReason?: string;
  readonly outcome: EntityIdentificationOutcome;
  readonly resolvedEntityReference?: string;
  readonly resolvedCandidateReference?: string;
  readonly disambiguationRequired: boolean;
  readonly clarificationCandidateReferences: readonly ClarificationCandidateReference[];
  readonly createdAt: string;
}

export interface EntityIdentificationEngineInput {
  readonly parameter: ExtractedParameter;
  readonly communicationEvidence: readonly GovernedCommunicationEvidenceInput[];
  readonly gmailSourceResult: Readonly<{ status: AssemblySourceStatus; failureReason?: string }>;
  readonly threadId: string;
  readonly requestId: string;
  readonly exchangeId: string;
  readonly claimBoundaryEvaluationReference: string;
  readonly recognizedIntentReference: string;
  readonly createdAt: string;
}
