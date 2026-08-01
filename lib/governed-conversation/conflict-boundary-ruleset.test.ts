import { describe, expect, it } from "vitest";
import { CONFLICT_EVALUATION_RULESET, CONFLICT_EVALUATION_RULESET_BODY } from "./conflict-boundary-ruleset";
import { constructConflictEvaluationRuleset } from "./conflict-boundary-publications";

describe("Sprint 3.92 conflict ruleset", () => {
  it("is immutable, stable, versioned, and content identified", () => {
    expect(Object.isFrozen(CONFLICT_EVALUATION_RULESET)).toBe(true);
    expect(constructConflictEvaluationRuleset(CONFLICT_EVALUATION_RULESET_BODY).conflictEvaluationRulesetId).toBe(CONFLICT_EVALUATION_RULESET.conflictEvaluationRulesetId);
    const changed = constructConflictEvaluationRuleset({ ...CONFLICT_EVALUATION_RULESET_BODY, rulesetVersion: "1.0.0", descriptionTemplate: "source_value_contradiction.contact_address.v1" });
    expect(changed.conflictEvaluationRulesetId).toBe(CONFLICT_EVALUATION_RULESET.conflictEvaluationRulesetId);
    expect(constructConflictEvaluationRuleset({ ...CONFLICT_EVALUATION_RULESET_BODY, normalization: { ...CONFLICT_EVALUATION_RULESET_BODY.normalization, unicodeNormalization: "NFC" } }).conflictEvaluationRulesetId).toBe(CONFLICT_EVALUATION_RULESET.conflictEvaluationRulesetId);
  });
  it("closes execution to one class, two deferred classes, one claim and one comparison", () => {
    expect(CONFLICT_EVALUATION_RULESET.executableClasses).toEqual(["source_value_contradiction"]);
    expect(CONFLICT_EVALUATION_RULESET.deferredClasses).toEqual(["policy_incompatibility", "temporal_commitment_incompatibility"]);
    expect(CONFLICT_EVALUATION_RULESET.eligibleClaimTypes).toEqual(["contact_address_lookup"]);
    expect(CONFLICT_EVALUATION_RULESET.comparisonKeys).toEqual(["resolved_contact_address"]);
    expect(CONFLICT_EVALUATION_RULESET.conflictRestriction).toBe("insufficient_coverage");
    expect(CONFLICT_EVALUATION_RULESET.noConflictProofRule).toBe("complete_single_cell_evaluation_with_zero_conflict_set");
    expect("extensionMap" in CONFLICT_EVALUATION_RULESET).toBe(false);
  });
  it("declares all six closed outcomes", () => expect(CONFLICT_EVALUATION_RULESET.outcomeRules).toEqual(["evaluated_no_conflict", "evaluated_conflict_found", "partially_evaluated", "evaluation_unavailable", "evaluation_unsupported", "evaluation_failed"]));
});
