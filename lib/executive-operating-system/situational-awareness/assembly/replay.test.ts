import { describe, expect, it } from "vitest";
import { goldenProjectionArtifactSet } from "../../../../tests/fixtures/eos/golden-projection-artifact-set";
import { SituationalAwarenessEngine } from "./engine";

describe("Situational Awareness offline replay", () => {
  it("replays structurally identical output and identity from JSON-compatible input", () => {
    const replay = JSON.parse(JSON.stringify(goldenProjectionArtifactSet)) as typeof goldenProjectionArtifactSet;
    const engine = new SituationalAwarenessEngine();
    const first = engine.assemble(goldenProjectionArtifactSet);
    const second = engine.assemble(replay);
    expect(second).toEqual(first);
    expect(first.outcome === "success" && second.outcome === "success" && second.snapshot.snapshotId).toBe(first.outcome === "success" ? first.snapshot.snapshotId : false);
  });
});
