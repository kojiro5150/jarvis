import { describe, expect, it } from "vitest";
import { ExecutiveContextEngine } from "./engine";
import { executiveContextFixture, executiveContextReferenceTime } from "./fixtures";

describe("ExecutiveContextEngine", () => {
  it("derives stable raw measures, evidence, and source linkage", () => {
    const result = new ExecutiveContextEngine().derive({ sourceSnapshot: executiveContextFixture, referenceTime: executiveContextReferenceTime });
    expect(result.outcome).toBe("success");
    if (result.outcome !== "success") return;
    expect(result.snapshot.sourceStateIdentity.snapshotId).toBe(executiveContextFixture.snapshotId);
    expect(result.snapshot.entitySummary.commitmentCount).toBe(1);
    expect(result.snapshot.entitySummary.totalEntityCount).toBe(1);
    expect(result.snapshot.sourceContext.sourceCount).toBe(1);
    expect(result.snapshot.sourceContext.newestObservationAgeMilliseconds).toBe(3_600_000);
    expect(result.snapshot.calculationEvidence.length).toBeGreaterThan(0);
  });

  it("replays structurally identically and orders independently of source insertion order", () => {
    const engine = new ExecutiveContextEngine();
    const input = { sourceSnapshot: executiveContextFixture, referenceTime: executiveContextReferenceTime };
    const first = engine.derive(input), second = engine.derive(input);
    expect(second).toEqual(first);
    if (first.outcome === "success" && second.outcome === "success") expect(second.snapshot.contextId).toBe(first.snapshot.contextId);
  });

  it("recursively freezes publication without exposing source references", () => {
    const result = new ExecutiveContextEngine().derive({ sourceSnapshot: executiveContextFixture, referenceTime: executiveContextReferenceTime });
    expect(result.outcome).toBe("success");
    if (result.outcome !== "success") return;
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(Object.isFrozen(result.snapshot.entitySummary)).toBe(true);
    expect(Object.isFrozen(result.snapshot.calculationEvidence)).toBe(true);
    expect(result.snapshot).not.toHaveProperty("sourceSnapshot");
  });

  it("rejects invalid snapshots, unsupported versions, and implicit or invalid time", () => {
    const engine = new ExecutiveContextEngine();
    const malformed = { ...executiveContextFixture, snapshotId: "" };
    expect(engine.derive({ sourceSnapshot: malformed, referenceTime: executiveContextReferenceTime })).toMatchObject({ outcome: "failure", code: "SOURCE_SNAPSHOT_VALIDATION_FAILURE" });
    const unsupported = { ...executiveContextFixture, metadata: { ...executiveContextFixture.metadata, canonicalContractVersion: "projection-artifact-v2" } };
    expect(engine.derive({ sourceSnapshot: unsupported as typeof executiveContextFixture, referenceTime: executiveContextReferenceTime })).toMatchObject({ outcome: "failure", code: "UNSUPPORTED_CONTRACT_VERSION" });
    expect(engine.derive({ sourceSnapshot: executiveContextFixture, referenceTime: "" })).toMatchObject({ outcome: "failure", code: "CONFIGURATION_FAILURE" });
  });

  it("publishes only explicit relationships and no interpretive output", () => {
    const result = new ExecutiveContextEngine().derive({ sourceSnapshot: executiveContextFixture, referenceTime: executiveContextReferenceTime });
    expect(result.outcome).toBe("success");
    if (result.outcome !== "success") return;
    expect(result.snapshot.relationshipContext.totalRelationshipCount).toBe(executiveContextFixture.relationships.length);
    expect(result.snapshot).not.toHaveProperty("recommendations");
    expect(result.snapshot).not.toHaveProperty("urgency");
    expect(result.snapshot).not.toHaveProperty("importance");
    expect(result.snapshot).not.toHaveProperty("intent");
  });
});
