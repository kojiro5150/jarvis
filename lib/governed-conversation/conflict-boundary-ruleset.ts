import type { ConflictEvaluationRulesetBody } from "./conflict-boundary-types";
import { constructConflictEvaluationRuleset } from "./conflict-boundary-publications";

export const CONFLICT_EVALUATION_RULESET_BODY: ConflictEvaluationRulesetBody = {
  schemaVersion: "1", rulesetVersion: "1.0.0", rootTaxonomyVersion: "3.90",
  rootTaxonomy: ["source_value_contradiction", "policy_incompatibility", "temporal_commitment_incompatibility"], executableClasses: ["source_value_contradiction"], deferredClasses: ["policy_incompatibility", "temporal_commitment_incompatibility"],
  eligibleClaimTypes: ["contact_address_lookup"], eligibleSourcePublicationTypes: ["governed_contact_observation"], comparisonKeys: ["resolved_contact_address"],
  normalization: { trimWhitespace: true, caseTreatment: "lowercase", extractStructuredAngleAddress: true, displayNamesParticipate: false, unicodeNormalization: "NFC", aliasesEquivalent: false },
  entityAndScopeRule: "same_entity_key_and_comparison_scope", sourceOwnerRequirement: "distinct_nonempty_owners", admissibilityRule: "immutable_available_covered_claim_scoped_unsuperseded_factual_observation",
  availabilityRequirement: "all_supplied_required_sources_available", coverageRequirement: "at_least_two_complete_observations", claimLinkageRule: "one_existing_claim_in_supplied_claim_set",
  conflictRestriction: "insufficient_coverage", descriptionTemplate: "source_value_contradiction.contact_address.v1", noConflictProofRule: "complete_single_cell_evaluation_with_zero_conflict_set",
  outcomeRules: ["evaluated_no_conflict", "evaluated_conflict_found", "partially_evaluated", "evaluation_unavailable", "evaluation_unsupported", "evaluation_failed"], failureRule: "fail_closed_without_conflict_set",
  prohibitedRelations: ["different_entity", "different_scope", "different_comparison_key", "superseded_observation", "unavailable_marker", "source_silence"],
};
export const CONFLICT_EVALUATION_RULESET = constructConflictEvaluationRuleset(CONFLICT_EVALUATION_RULESET_BODY);
