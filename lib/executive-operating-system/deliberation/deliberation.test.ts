import { describe, expect, it } from "vitest";
import { goldenRuntimeInput } from "../../../tests/fixtures/eos/golden-projection-artifact-set";
import { DeterministicExecutiveOperatingSystemRuntime } from "../runtime";
import { DeterministicExecutiveDeliberationContextEngine } from "./engine";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe("ExecutiveDeliberationContext", () => {
  it("publishes once, immutably and deterministically with canonical lineage", () => {
    const runtime = new DeterministicExecutiveOperatingSystemRuntime();
    const first = runtime.run(goldenRuntimeInput);
    const replay = runtime.run(clone(goldenRuntimeInput));
    const context = first.executiveDeliberationContext;
    expect(context).toEqual(replay.executiveDeliberationContext);
    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.activeExecutiveConcerns)).toBe(true);
    expect(context.executiveStateId).toBe(first.executiveState.snapshotId);
    expect(context.executiveContextId).toBe(first.executiveContextSnapshot.contextId);
    expect(context.situationAssessmentSetId).toBe(first.assessment.situationSetId);
    expect(context.deliberativeMetadata?.assessmentIds).toEqual(first.assessment.assessments.map(item => item.assessmentId).sort());
    expect(first.intent.contextId).toBe(context.deliberationContextId);
    expect(first.trace.stages.filter(stage => stage.stageId === "executive_deliberation_context")).toHaveLength(1);
    expect(first.trace.stages[6].outputArtifactIds).toEqual([context.deliberationContextId]);
  });

  it("rejects missing publications, duplicate assessments, and inconsistent lineage", () => {
    const result = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput);
    const valid = { executiveContextSnapshot: result.executiveContextSnapshot, assessmentSet: result.assessment, lifecycleComparison: result.changes };
    const engine = new DeterministicExecutiveDeliberationContextEngine();
    expect(() => engine.construct({ ...valid, assessmentSet: undefined } as never)).toThrow("situation assessment set is required");
    expect(() => engine.construct({ ...valid, executiveContextSnapshot: undefined } as never)).toThrow("executive context snapshot is required");
    expect(() => engine.construct({ ...valid, assessmentSet: { ...valid.assessmentSet, currentSnapshotId: "wrong" } })).toThrow("broken identity continuity");
    expect(() => engine.construct({ ...valid, assessmentSet: { ...valid.assessmentSet, assessments: [...valid.assessmentSet.assessments, valid.assessmentSet.assessments[0]] } })).toThrow("duplicate situation assessment identity");
  });
});
