import { describe, expect, it } from "vitest";
import { DeterministicExecutiveOperatingSystemRuntime } from "../executive-operating-system/runtime";
import { goldenRuntimeInput } from "../../tests/fixtures/eos/golden-projection-artifact-set";
import { ExecutiveContextEngine } from "./engine";
import { executiveContextFixture, executiveContextReferenceTime } from "./fixtures";

describe("Executive Context EOS compatibility", () => {
  it("adds a boundary while preserving the unchanged state-driven EOS path", () => {
    const context = new ExecutiveContextEngine().derive({ sourceSnapshot: executiveContextFixture, referenceTime: executiveContextReferenceTime });
    const runtime = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput);
    expect(context.outcome).toBe("success");
    expect(runtime.situationalAwareness).toEqual(executiveContextFixture.state);
    if (context.outcome === "success") expect(context.snapshot.sourceStateIdentity.snapshotId).toBe(executiveContextFixture.snapshotId);
  });
});
