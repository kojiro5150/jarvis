import { describe, expect, it } from "vitest";
import { goldenProjectionArtifactSet } from "../../../../tests/fixtures/eos/golden-projection-artifact-set";
import { SituationalAwarenessEngine } from "./engine";

describe("Situational Awareness offline replay", () => {
  it("replays structurally identical output and identity from JSON-compatible input", () => {
    const replay = JSON.parse(JSON.stringify(goldenProjectionArtifactSet)) as typeof goldenProjectionArtifactSet;
    const engine = new SituationalAwarenessEngine();
    const first = engine.assemble(goldenProjectionArtifactSet);
    const second = engine.assemble(replay);
    expect(first.outcome).toBe("success");
    expect(second.outcome).toBe("success");
    if (first.outcome !== "success" || second.outcome !== "success") return;
    expect(second.snapshot.snapshotId).toBe(first.snapshot.snapshotId);
    expect(JSON.stringify(second.snapshot.state)).toBe(JSON.stringify(first.snapshot.state));
    expect(second.snapshot.state.communications).toEqual([]);
    expect(second.snapshot.metadata.sourceIds).toEqual([...second.snapshot.metadata.sourceIds].sort());
    expect(Object.isFrozen(second.snapshot)).toBe(true);
    expect(Object.isFrozen(second.snapshot.state.communications)).toBe(true);
  });
});
