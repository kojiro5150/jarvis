import { describe, expect, it } from "vitest";
import { ExecutiveContextEngine } from "../../executive-context";
import type { ExecutiveContextResult } from "../../executive-context";
import { SituationalAwarenessEngine } from "../situational-awareness/assembly";
import type { ProjectionArtifact } from "../situational-awareness/projection";
import { goldenRuntimeInput } from "../../../tests/fixtures/eos/golden-projection-artifact-set";
import { DeterministicExecutiveOperatingSystemRuntime } from "./engine";
import { ExecutiveOperatingSystemRuntimeError } from "./types";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

describe("canonical runtime state and descriptive context prefix", () => {
  it("publishes one continuous immutable state/context lineage on deterministic replay", () => {
    const runtime = new DeterministicExecutiveOperatingSystemRuntime();
    const first = runtime.run(goldenRuntimeInput);
    const replay = runtime.run(goldenRuntimeInput);

    expect(replay.executiveState).toEqual(first.executiveState);
    expect(replay.executiveContextSnapshot).toEqual(first.executiveContextSnapshot);
    expect(first.executiveContextSnapshot.sourceStateIdentity.snapshotId).toBe(first.executiveState.snapshotId);
    expect(first.executiveContextSnapshot.lifecycle.lifecycleSnapshotId).toBe(first.executiveState.lifecycleSnapshotId);
    expect(first.executiveState.provenance).toEqual(first.executiveState.artifacts.map(({ artifact }) => artifact.provenance));
    expect(first.executiveContextSnapshot.calculationEvidence.every(({ inputIdentities }) => inputIdentities.includes(first.executiveState.snapshotId))).toBe(true);
    expect(Object.isFrozen(first.executiveState)).toBe(true);
    expect(Object.isFrozen(first.executiveContextSnapshot)).toBe(true);

    for (const stage of first.trace.stages.slice(3)) {
      expect(stage.inputArtifactIds).toContain(first.executiveState.snapshotId);
      expect(stage.inputArtifactIds).toContain(first.executiveContextSnapshot.contextId);
    }
    expect(first.trace.stages.slice(0, 3).map(({ stageId }) => stageId)).toEqual([
      "state_assembly", "executive_context_derivation", "snapshot_lifecycle",
    ]);
  });

  it("fails deterministically when canonical state assembly fails", () => {
    const input = clone(goldenRuntimeInput);
    (input.projectionArtifacts.artifacts as ProjectionArtifact[]).push(clone(input.projectionArtifacts.artifacts[0]));
    const run = () => new DeterministicExecutiveOperatingSystemRuntime().run(input);
    expect(run).toThrowError(expect.objectContaining({ stage: "state_assembly", reasonCode: "DUPLICATE_ARTIFACT_ID" }));
    expect(() => run()).toThrow(ExecutiveOperatingSystemRuntimeError);
  });

  it("fails deterministically when descriptive context derivation fails", () => {
    const input = { ...goldenRuntimeInput, referenceTime: "2030-01-14T09:00:00Z" };
    expect(() => new DeterministicExecutiveOperatingSystemRuntime().run(input)).toThrowError(
      expect.objectContaining({ stage: "executive_context_derivation", reasonCode: "CONFIGURATION_FAILURE" }),
    );
  });

  it("rejects a context publication that references a different state", () => {
    const stateResult = new SituationalAwarenessEngine().assemble(goldenRuntimeInput.projectionArtifacts);
    expect(stateResult.outcome).toBe("success");
    if (stateResult.outcome !== "success") return;
    const contextResult = new ExecutiveContextEngine().derive({ sourceSnapshot: stateResult.snapshot, referenceTime: goldenRuntimeInput.referenceTime });
    expect(contextResult.outcome).toBe("success");
    if (contextResult.outcome !== "success") return;
    const mismatch = clone(contextResult.snapshot);
    Object.assign(mismatch.sourceStateIdentity, { snapshotId: "executive-state-snapshot:different" });
    const contextEngine = { derive: (): ExecutiveContextResult => ({ outcome: "success", snapshot: mismatch }) };
    expect(() => new DeterministicExecutiveOperatingSystemRuntime(new SituationalAwarenessEngine(), contextEngine).run(goldenRuntimeInput)).toThrowError(
      expect.objectContaining({ stage: "executive_context_derivation", category: "validation", reasonCode: "state-context-identity-mismatch" }),
    );
  });
});
