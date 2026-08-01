import { describe, expect, it } from "vitest";
import { buildContextBlock } from "../context-builder";
import { conversationalEvaluationScenarios, SYNTHETIC_EVALUATION_NOTICE } from "./evaluation-fixtures";
import { aggregateScenarioClassification, compareConversationalClaimCoverage, evaluateConversationalScenario, reconstructLegacyClaimExposure, type GovernedClaimEvaluation, type LegacyClaimExposure } from "./parallel-evaluation";

describe("Sprint 3.78 conversational parallel evaluation", () => {
  const results = conversationalEvaluationScenarios.map(evaluateConversationalScenario);

  it("evaluates all mandatory audit-grounded scenarios without model or production authority", () => {
    expect(results).toHaveLength(12);
    expect(results.every(result => result.syntheticEvidenceNotice === SYNTHETIC_EVALUATION_NOTICE)).toBe(true);
    expect(results.every(result => !result.modelInvocationUsed && !result.productionAuthorityChanged)).toBe(true);
    expect(conversationalEvaluationScenarios.every(scenario => scenario.auditReference.startsWith("Sprint 3.75"))).toBe(true);
  });

  it("computes the Cassie claims independently and preserves the available contact", () => {
    const result = results.find(value => value.scenarioId === "cassie-contact-and-importance")!;
    expect(result.governedEvaluation.map(claim => claim.status)).toEqual(["available", "unsupported"]);
    expect(result.claimComparisons.map(claim => claim.classification)).toEqual(["Preserved Availability", "Governed Improvement"]);
    expect(result.scenarioClassification).toBe("Governed Improvement");
  });

  it("covers insufficient, unavailable, unsupported, conflict, and genuine availability", () => {
    const byId = Object.fromEntries(results.map(result => [result.scenarioId, result]));
    expect(byId["subject-only-content"].governedEvaluation[0].status).toBe("insufficient_coverage");
    expect(byId["snippet-only-agreement"].scenarioClassification).toBe("Governed Improvement");
    expect(byId["unavailable-with-fallback"].governedEvaluation[0].status).toBe("unavailable");
    expect(byId["heuristic-importance"].governedEvaluation[0].status).toBe("unsupported");
    expect(byId["recipient-conflict"].governedEvaluation[0]).toMatchObject({ status: "insufficient_coverage", governedEvidenceUsed: true });
    expect(byId["sufficient-cassie-address"].scenarioClassification).toBe("Preserved Availability");
  });

  it("proves reconstruction fidelity against the real context builder", () => {
    const cassie = conversationalEvaluationScenarios[0];
    const exposure = reconstructLegacyClaimExposure(cassie, cassie.claims[1]);
    expect(exposure.serializedContext).toBe(buildContextBlock({ priorities: [], projects: [], signals: [], blockers: [], calendar: [], calendarStatus: "unavailable", gmailThreads: [...cassie.messages], gmailStatus: "online", driveFiles: [], driveStatus: "unavailable", connectorStatuses: [], updatedAt: "2026-07-15T12:00:00.000Z" }, "full", new Date("2026-07-15T12:00:00.000Z")));
    expect(exposure.serializedContext).toContain("Communications (1 requiring attention):");
    expect(exposure.serializedContext).toContain("Proposal update (from Cassie <cassie@example.invalid>, unread)");
    expect(exposure.fieldsExposed).toEqual(expect.arrayContaining(["subject", "from", "snippet", "unread"]));
    expect(exposure.fieldsExposed).not.toEqual(expect.arrayContaining(["important", "needsReply"]));
    expect(exposure).toMatchObject({ evidenceStatusExposed: false, sourceAvailabilityExposed: false, provenanceExposed: false, unsupportedStateExposed: false, coverageBoundaryExposed: false, contentKindExposed: false });
  });

  it("is mutation-sensitive when an available claim loses its source lineage", () => {
    const baseline = results.find(value => value.scenarioId === "sufficient-cassie-address")!;
    expect(baseline.claimComparisons[0].classification).toBe("Preserved Availability");
    const mutated: GovernedClaimEvaluation = { ...baseline.governedEvaluation[0], sourceReferences: [], provenancePreserved: false };
    expect(compareConversationalClaimCoverage(baseline.legacyExposure[0], mutated).classification).toBe("Governed Defect");
  });

  it("computes defect, unmeasurable and undocumented boundaries without scenario metadata", () => {
    const legacy: LegacyClaimExposure = { ...results[0].legacyExposure[0], deterministicComparisonPossible: true };
    const governed = results[0].governedEvaluation[0];
    expect(compareConversationalClaimCoverage(legacy, { ...governed, status: "unsupported" }).classification).toBe("Governed Defect");
    expect(compareConversationalClaimCoverage({ ...legacy, deterministicComparisonPossible: false }, governed).classification).toBe("Legacy Boundary Unmeasurable");
    expect(compareConversationalClaimCoverage(legacy, { ...governed, contractBoundaryDocumented: false }).classification).toBe("Undocumented Evaluation Boundary");
  });

  it("uses deterministic multi-claim severity precedence", () => {
    expect(aggregateScenarioClassification([
      { claimId: "a", classification: "Preserved Availability", rationale: "", governingContractSections: [] },
      { claimId: "b", classification: "Governed Defect", rationale: "", governingContractSections: [] },
    ])).toBe("Governed Defect");
  });
});
