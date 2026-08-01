import { describe, expect, it } from "vitest";
import {
  DAWNWATCH_EVALUATION_SCENARIOS,
  compareDawnwatchRuntime,
  evaluateDawnwatchScenario,
  runDawnwatchScenario,
} from "./dawnwatch-parallel-evaluation";

describe("DAWNWATCH parallel evaluation", () => {
  it("runs deterministic synthetic scenarios with explicit replay context", () => {
    const first = DAWNWATCH_EVALUATION_SCENARIOS.map(evaluateDawnwatchScenario);
    expect(first).toEqual(DAWNWATCH_EVALUATION_SCENARIOS.map(evaluateDawnwatchScenario));
    expect(first.every(result => result.context.referenceTime === "2026-07-31T12:00:00Z"
      && result.context.locale === "en-AU" && result.context.viewerTimeZone === "Australia/Melbourne")).toBe(true);
  });

  it("registers the original and Sprint 3.71 recipient scenarios", () => {
    expect(DAWNWATCH_EVALUATION_SCENARIOS).toEqual([
      "shared-priority-observation", "empty-evidence", "unavailable-evidence", "tomorrow-afternoon",
      "recipient-evidence-available", "recipient-evidence-unknown", "recipient-evidence-not-fetched", "recipient-evidence-not-authorised",
    ]);
    expect(DAWNWATCH_EVALUATION_SCENARIOS.map(evaluateDawnwatchScenario)
      .every(result => result.evaluationVersion === "sprint-3.71-v1")).toBe(true);
  });

  it("runs authoritative recipient evidence through the production bridge to available", () => {
    const result = evaluateDawnwatchScenario("recipient-evidence-available");
    expect(result.evidence.governedRuntimeOutput).toMatchObject({ communications: { status: "available" } });
    expect(result.evidence.comparison.governed).toMatchObject({
      recipientEvidence: "available", sourceAvailability: "available",
      evidenceStatuses: ["available"],
    });
    expect(result.evidence.comparison.equal).toBe(false);
    // This is the unchanged comparator's computed result, including its existing broad Sprint 3.64 rule.
    expect(result.evidence.classification).toBe("Intentional Improvement");
  });

  it.each([
    ["recipient-evidence-unknown", "unknown"],
    ["recipient-evidence-not-fetched", "not_fetched"],
    ["recipient-evidence-not-authorised", "not_authorised"],
  ] as const)("keeps %s visible and insufficient", (scenario, recipientEvidence) => {
    const result = evaluateDawnwatchScenario(scenario);
    expect(result.evidence.governedRuntimeOutput).toMatchObject({ communications: { status: "insufficient_coverage" } });
    expect(result.evidence.comparison.governed).toMatchObject({
      recipientEvidence, sourceAvailability: "available", evidenceStatuses: ["insufficient_coverage"],
    });
    expect(result.evidence.classification).toBe("Intentional Improvement");
  });

  it("computes authorised improvements from actual negative claims and evidence statuses", () => {
    for (const scenario of ["empty-evidence", "unavailable-evidence"] as const) {
      const result = evaluateDawnwatchScenario(scenario);
      expect(result.evidence.classification).toBe("Intentional Improvement");
      expect(result.evidence.governingSection).toContain("Sprint 3.64");
      expect(result.evidence.comparison.equal).toBe(false);
    }
  });

  it("computes tomorrow afternoon as a cited unsupported boundary and records legacy non-semantics", () => {
    const result = evaluateDawnwatchScenario("tomorrow-afternoon");
    expect(result.evidence.classification).toBe("Unsupported Boundary");
    expect(result.evidence.governingSection).toContain("Tomorrow Afternoon Rule");
    expect(result.evidence.legacyContext).toMatch(/incomplete|coincidence/);
    expect(result.evidence.governedRuntimeOutput).toEqual({ capability: "temporal_window", status: "unsupported", availability: "pending_governance" });
  });

  it("proves runtime mutation changes Equivalent to Defect without comparator changes", () => {
    const { input: _input, ...before } = runDawnwatchScenario("shared-priority-observation");
    expect(compareDawnwatchRuntime(before).classification).toBe("Equivalent");
    const mutated = { ...before, governedComparable: ["Mutated governed observation"] };
    expect(compareDawnwatchRuntime(mutated).classification).toBe("Defect");
  });

  it("detects a recipient-surface mutation with the unchanged comparator", () => {
    const { input: _input, ...baseline } = runDawnwatchScenario("recipient-evidence-unknown");
    expect(compareDawnwatchRuntime(baseline).classification).toBe("Intentional Improvement");
    const comparable = baseline.governedComparable as { observations: readonly unknown[] };
    const mutated = { ...baseline, governedComparable: { observations: comparable.observations.slice(1) } };
    expect(compareDawnwatchRuntime(mutated).classification).toBe("Defect");
  });

  it("computes undocumented runtime failures from missing runtime results", () => {
    expect(compareDawnwatchRuntime({
      capability: "failure probe", legacyOutput: "legacy", legacyComparable: "legacy",
      governedComparable: undefined, failure: "governed runtime failed",
    }).classification).toBe("Undocumented Failure Mode");
  });
});
