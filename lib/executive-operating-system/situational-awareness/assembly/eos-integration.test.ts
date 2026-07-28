import { describe, expect, it } from "vitest";
import { DeterministicExecutiveOperatingSystemRuntime } from "../../runtime";
import { goldenRuntimeInput } from "../../../../tests/fixtures/eos/golden-projection-artifact-set";
import { SituationalAwarenessEngine } from "./engine";

describe("ExecutiveStateSnapshot EOS compatibility", () => {
  it("represents exactly the canonical state consumed by the unchanged EOS runtime", () => {
    const assembled = new SituationalAwarenessEngine().assemble(goldenRuntimeInput.projectionArtifacts);
    const runtime = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput);
    expect(assembled.outcome).toBe("success");
    if (assembled.outcome !== "success") return;
    expect(assembled.snapshot.state).toEqual(runtime.situationalAwareness);
    expect(assembled.snapshot.lifecycleSnapshotId).toBe(runtime.snapshot.snapshotId);
    expect(assembled.snapshot.observedAt).toBe(runtime.snapshot.observedAt);
  });
});
