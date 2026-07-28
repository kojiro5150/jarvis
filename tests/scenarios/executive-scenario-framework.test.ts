import { describe, expect, it } from "vitest";
import { goldenRuntimeConfiguration } from "../fixtures/eos/golden-projection-artifact-set";
import { cancelledCommitmentScenario } from "./cancelled-commitment/scenario";
import { canonicalExecutiveScenarioRegistry } from "./index";
import { CanonicalExecutiveScenarioRegistry } from "./registry/registry";
import { structurallyEqual } from "./shared/constitutional";
import { DeterministicExecutiveScenarioLoader } from "./shared/loader";

describe("Executive Scenario Framework constitutional guarantees", () => {
  it("publishes validated canonical scenarios in stable code-unit order", () => {
    const later = { ...cancelledCommitmentScenario, metadata: { ...cancelledCommitmentScenario.metadata, id: "z-scenario" } };
    const earlier = { ...cancelledCommitmentScenario, metadata: { ...cancelledCommitmentScenario.metadata, id: "a-scenario" } };
    const registry = new CanonicalExecutiveScenarioRegistry([later, earlier]);
    expect(registry.list().map(({ metadata }) => metadata.id)).toEqual(["a-scenario", "z-scenario"]);
    expect(Object.isFrozen(registry.list())).toBe(true);
    expect(Object.isFrozen(registry.list()[0].projectionArtifacts.artifacts)).toBe(true);
  });

  it("rejects invalid and duplicate scenarios before publication", () => {
    expect(() => new CanonicalExecutiveScenarioRegistry([
      cancelledCommitmentScenario,
      cancelledCommitmentScenario,
    ])).toThrow("duplicate executive scenario");
    expect(() => new CanonicalExecutiveScenarioRegistry([
      { ...cancelledCommitmentScenario, metadata: { ...cancelledCommitmentScenario.metadata, id: "Not Canonical" } },
    ])).toThrow("canonical identifier");
  });

  it("uses canonical structural equality rather than property insertion order", () => {
    expect(structurallyEqual({ executive: { risk: "high", count: 1 } }, { executive: { count: 1, risk: "high" } })).toBe(true);
    expect(structurallyEqual(["first", "second"], ["second", "first"])).toBe(false);
  });

  it("replays through the canonical EOS runtime deterministically and freezes reports", () => {
    const loader = new DeterministicExecutiveScenarioLoader(canonicalExecutiveScenarioRegistry);
    const first = loader.execute("cancelled-commitment", goldenRuntimeConfiguration);
    const second = loader.execute("cancelled-commitment", goldenRuntimeConfiguration);
    expect(first).toEqual(second);
    expect(first.status).toBe("passed");
    expect(first.assertions.every(({ passed }) => passed)).toBe(true);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.assertions)).toBe(true);
    expect(Object.isFrozen(first.runtimeResult)).toBe(true);
  });

  it("prevents loader failures from invoking runtime and reports assertion failures explicitly", () => {
    const loader = new DeterministicExecutiveScenarioLoader(canonicalExecutiveScenarioRegistry);
    expect(() => loader.execute("missing", goldenRuntimeConfiguration)).toThrow("unknown executive scenario");
    const failing = {
      ...cancelledCommitmentScenario,
      metadata: { ...cancelledCommitmentScenario.metadata, id: "failing-assertion" },
      assertions: [{ id: "explicit-failure", path: ["snapshot", "missing"], expected: "not-the-snapshot" }],
    };
    const report = new DeterministicExecutiveScenarioLoader(new CanonicalExecutiveScenarioRegistry([failing]))
      .execute("failing-assertion", goldenRuntimeConfiguration);
    expect(report.status).toBe("failed");
    expect(report.assertions).toEqual([{ assertionId: "explicit-failure", passed: false, expected: "not-the-snapshot", actual: null }]);
  });
});
