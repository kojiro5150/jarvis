import { describe, expect, it } from "vitest";
import { DeterministicExecutiveOperatingSystemRuntime } from "../../runtime";
import { goldenRuntimeInput } from "../../../../tests/fixtures/eos/golden-projection-artifact-set";
import { SituationalAwarenessEngine } from "./engine";

describe("ExecutiveStateSnapshot EOS compatibility", () => {
  it("is the exact canonical state publication consumed by the EOS runtime", () => {
    const assembled = new SituationalAwarenessEngine().assemble(goldenRuntimeInput.projectionArtifacts);
    const runtime = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput);
    expect(assembled.outcome).toBe("success");
    if (assembled.outcome !== "success") return;
    expect(runtime.executiveState).toEqual(assembled.snapshot);
    expect(runtime.situationalAwareness).toBe(runtime.executiveState.state);
    expect(assembled.snapshot.state).toEqual(runtime.situationalAwareness);
    expect(assembled.snapshot.lifecycleSnapshotId).toBe(runtime.snapshot.snapshotId);
    expect(assembled.snapshot.observedAt).toBe(runtime.snapshot.observedAt);
  });
});
