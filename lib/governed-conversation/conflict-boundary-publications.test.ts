import { describe, expect, it } from "vitest";
import { evaluateGovernedConversationalConflicts } from "./conflict-boundary-engine";
import { CONFLICT_EVALUATION_RULESET, CONFLICT_EVALUATION_RULESET_BODY } from "./conflict-boundary-ruleset";
import { constructConflictEvaluationRuleset } from "./conflict-boundary-publications";
import { FIXTURE_TIME, contradictoryObservations, makeConflictClaimSet } from "./conflict-boundary-fixtures";
import type { ConflictEvaluationRulesetBody } from "./conflict-boundary-types";

describe("Sprint 3.92 publication identity", () => {
  const claimSet = makeConflictClaimSet();
  const result = evaluateGovernedConversationalConflicts({ ruleset: CONFLICT_EVALUATION_RULESET, claimSet, observations: contradictoryObservations(), requestedConflictClasses: ["source_value_contradiction"], referenceTime: FIXTURE_TIME, createdAt: FIXTURE_TIME, evaluationDiscriminator: "identity-event" });
  it("keeps all publication identity domains distinct from each other and lineage", () => {
    const ids = [CONFLICT_EVALUATION_RULESET.conflictEvaluationRulesetId, result.evaluation!.conflictEvaluationId, result.conflictSet!.governedConflictSetId, result.conflictSet!.conflicts[0].conflictId, claimSet.claimIds[0], claimSet.governedClaimSetId, claimSet.exchangeId];
    expect(new Set(ids).size).toBe(ids.length); expect(ids.map(x => x.split(":")[0])).toEqual(expect.arrayContaining(["conflict-evaluation-ruleset", "conflict-evaluation", "governed-conflict-set", "governed-conflict"]));
  });
  it("changes ruleset identity when a material body changes", () => {
    const changed = { ...CONFLICT_EVALUATION_RULESET_BODY, normalization: { ...CONFLICT_EVALUATION_RULESET_BODY.normalization, aliasesEquivalent: true } } as unknown as ConflictEvaluationRulesetBody;
    expect(constructConflictEvaluationRuleset(changed).conflictEvaluationRulesetId).not.toBe(CONFLICT_EVALUATION_RULESET.conflictEvaluationRulesetId);
  });
  it("freezes the evaluation, set, conflicts, and nested values", () => {
    expect(Object.isFrozen(result.evaluation)).toBe(true); expect(Object.isFrozen(result.conflictSet)).toBe(true); expect(Object.isFrozen(result.conflictSet!.conflicts[0])).toBe(true);
  });
  it("changes evaluation and conflict identities for material input changes", () => {
    const changed = evaluateGovernedConversationalConflicts({ ruleset: CONFLICT_EVALUATION_RULESET, claimSet, observations: contradictoryObservations().map((x, i) => i ? { ...x, canonicalFactualValue: "cassie.third@example.net", originalFactualValue: "cassie.third@example.net" } : x), requestedConflictClasses: ["source_value_contradiction"], referenceTime: FIXTURE_TIME, createdAt: FIXTURE_TIME, evaluationDiscriminator: "changed-event" });
    expect(changed.evaluation!.conflictEvaluationId).not.toBe(result.evaluation!.conflictEvaluationId); expect(changed.conflictSet!.conflicts[0].conflictId).not.toBe(result.conflictSet!.conflicts[0].conflictId);
  });
});
