import { describe, expect, it } from "vitest";
import { evaluateGovernedConversationalConflicts } from "./conflict-boundary-engine";
import { CONFLICT_EVALUATION_RULESET } from "./conflict-boundary-ruleset";
import { CONFLICT_EVALUATION_OUTCOMES } from "./conflict-boundary-types";
import { FIXTURE_TIME, contradictoryObservations, makeConflictClaimSet, makeObservation } from "./conflict-boundary-fixtures";

const run = (overrides: Record<string, unknown> = {}) => evaluateGovernedConversationalConflicts({ ruleset: CONFLICT_EVALUATION_RULESET, claimSet: makeConflictClaimSet(), observations: contradictoryObservations(), requestedConflictClasses: ["source_value_contradiction"], referenceTime: FIXTURE_TIME, createdAt: FIXTURE_TIME, evaluationDiscriminator: `conflict-run:${JSON.stringify(overrides)}`, ...overrides } as Parameters<typeof evaluateGovernedConversationalConflicts>[0]);

describe("Sprint 3.92 governed conflict engine", () => {
  it("requires a claim set and creates no evaluation without one", () => expect(run({ claimSet: undefined })).toEqual({}));
  it("derives the central genuine contradiction without adjudicating", () => {
    const result = run(), conflict = result.conflictSet!.conflicts[0], claim = makeConflictClaimSet().claims[0];
    expect(result.evaluation!.outcome).toBe("evaluated_conflict_found"); expect(result.conflictSet!.conflicts).toHaveLength(1);
    expect(conflict).toMatchObject({ conflictClass: "source_value_contradiction", affectedClaimIds: [claim.claimId], comparisonKey: "resolved_contact_address", statusRestriction: "insufficient_coverage", descriptionReference: "source_value_contradiction.contact_address.v1" });
    expect(conflict.sourcePublicationReferences).toEqual(["source-publication:contacts-a", "source-publication:contacts-b"]);
    expect(conflict.sourceOwnerIds).toEqual(["source-owner:contacts-a", "source-owner:contacts-b"]);
    expect(conflict.originalValues).toEqual(["cassie.hayward@example.org", "cassie.primary@example.com"]);
    expect(conflict.selectedSourceOwnerId).toBeUndefined();
  });
  it("publishes explicit complete no-conflict proof and a linked zero set", () => {
    const result = run({ observations: [makeObservation(), makeObservation({ sourcePublicationId: "source-publication:contacts-b", sourceOwnerId: "source-owner:contacts-b", canonicalFactualValue: " Cassie Primary <CASSIE.PRIMARY@example.com> ", originalFactualValue: " Cassie Primary <CASSIE.PRIMARY@example.com> " })] });
    expect(result.evaluation).toMatchObject({ outcome: "evaluated_no_conflict", cellEvaluations: [{ result: "no_match", coverage: "complete" }] });
    expect(result.conflictSet?.conflicts).toEqual([]); expect(result.evaluation?.conflictSetId).toBe(result.conflictSet?.governedConflictSetId);
  });
  it("does not conflate different entity, key, scope, or superseded records", () => {
    for (const observations of [
      [makeObservation(), makeObservation({ sourcePublicationId: "b", sourceOwnerId: "b", resourceEntityId: "person:other", canonicalFactualValue: "other@example.org", originalFactualValue: "other@example.org" })],
      [makeObservation(), makeObservation({ sourcePublicationId: "b", sourceOwnerId: "b", comparisonKey: "other_key", canonicalFactualValue: "other@example.org", originalFactualValue: "other@example.org" })],
      [makeObservation(), makeObservation({ sourcePublicationId: "b", sourceOwnerId: "b", comparisonScope: "historical", canonicalFactualValue: "other@example.org", originalFactualValue: "other@example.org" })],
      [makeObservation(), makeObservation({ sourcePublicationId: "b", sourceOwnerId: "b", supersessionStatus: "superseded", canonicalFactualValue: "other@example.org", originalFactualValue: "other@example.org" })],
    ]) expect(run({ observations }).conflictSet?.conflicts).toEqual([]);
  });
  it("represents source silence, insufficient coverage, and unavailable markers as unavailable rather than conflict", () => {
    for (const observations of [[makeObservation()], [makeObservation(), makeObservation({ sourcePublicationId: "b", coverage: "insufficient" })], [makeObservation(), makeObservation({ sourcePublicationId: "b", availability: "unavailable", contentKind: "unavailable_marker", canonicalFactualValue: "unavailable", originalFactualValue: "unavailable" })]]) {
      const result = run({ observations }); expect(result.evaluation?.outcome).toBe("evaluation_unavailable"); expect(result.conflictSet).toBeUndefined();
    }
  });
  it("fails closed for unknown claim linkage and malformed factual values", () => {
    for (const observations of [[makeObservation({ affectedClaimId: "unknown" }), makeObservation({ sourcePublicationId: "b" })], [makeObservation(), makeObservation({ sourcePublicationId: "b", canonicalFactualValue: "not-address", originalFactualValue: "not-address" })]]) {
      const result = run({ observations }); expect(result.evaluation?.outcome).toBe("evaluation_failed"); expect(result.conflictSet).toBeUndefined();
    }
  });
  it("returns unsupported for an ineligible claim and both deferred classes", () => {
    expect(run({ claimSet: makeConflictClaimSet("message_importance") }).evaluation?.outcome).toBe("evaluation_unsupported");
    for (const conflictClass of ["policy_incompatibility", "temporal_commitment_incompatibility"] as const) { const result = run({ requestedConflictClasses: [conflictClass] }); expect(result.evaluation?.outcome).toBe("evaluation_unsupported"); expect(result.evaluation?.unevaluatedReasons[0].reason).toBe("conflict_class_unsupported"); expect(result.conflictSet).toBeUndefined(); }
  });
  it("declares partially_evaluated but cannot produce it in Part 1's single cell", () => {
    expect(CONFLICT_EVALUATION_OUTCOMES).toContain("partially_evaluated");
    // Section 18: one contact_address_lookup claim × one executable class is one cell; it cannot be partitioned into evaluated and unevaluated cells.
    const representativePartOneResults = [run(), run({ observations: [makeObservation()] }), run({ observations: [makeObservation({ affectedClaimId: "unknown" }), makeObservation({ sourcePublicationId: "b" })] })];
    expect(representativePartOneResults.every(result => result.evaluation?.outcome !== "partially_evaluated")).toBe(true);
  });
});
