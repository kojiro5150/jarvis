import { describe, expect, it } from "vitest";
import { createSituationalAwareness } from "../executive-operating-system/situational-awareness/model";
import { createSituationalAwarenessSnapshot } from "../executive-operating-system/situational-awareness/lifecycle";
import { createProjectionArtifact } from "../executive-operating-system/situational-awareness/projection";
import { SituationalAwarenessEngine } from "../executive-operating-system/situational-awareness/assembly";
import type { ExecutiveStateSnapshot } from "../executive-operating-system/situational-awareness/assembly";
import { ExecutiveContextEngine, replayExecutiveContext } from ".";

const identity = { userId: "executive", displayName: "Executive" };
function sourceState(): ExecutiveStateSnapshot {
  const previousSnapshot = createSituationalAwarenessSnapshot({ snapshotId: "life-0", observedAt: "2035-04-01T08:00:00Z", state: createSituationalAwareness({ identity }) });
  const artifact = (sourceId: string, entities: Parameters<typeof createProjectionArtifact>[0]["entities"]) => createProjectionArtifact({
    entities, provenance: { sourceId, sourceKind: "other", adapterId: `fixture.${sourceId}`, projectedAt: "2035-04-01T09:00:00Z", availability: "available" }, validationState: "valid", metadata: {},
  });
  const role = { id: "role-1", name: "Director", status: "active" as const };
  const project = { id: "project-1", name: "Launch", status: "active" as const, roleIds: [role.id] };
  const result = new SituationalAwarenessEngine().assemble({
    artifacts: [
      artifact("source-b", { identity, roles: [role], projects: [project] }),
      artifact("source-a", { identity, commitments: [
        { id: "past", title: "Past", kind: "review", status: "completed", roleIds: [role.id], projectIds: [project.id], startsAt: "2035-04-01T09:00:00Z" },
        { id: "future", title: "Future", kind: "meeting", status: "scheduled", roleIds: [role.id], projectIds: [project.id], startsAt: "2035-04-01T11:00:00Z" },
      ], context: { workMode: "unknown", locationKind: "work" } }),
    ], previousSnapshot, snapshotId: "life-1", observedAt: "2035-04-01T10:00:00Z",
  });
  if (result.outcome !== "success") throw new Error(result.message);
  return result.snapshot;
}

describe("ExecutiveContextEngine constitutional package", () => {
  it("derives raw measures, explicit groups, structural conditions, and evidence", () => {
    const result = new ExecutiveContextEngine().derive({ sourceState: sourceState(), referenceTime: "2035-04-01T10:00:00Z" });
    expect(result.outcome).toBe("success");
    if (result.outcome !== "success") return;
    expect(result.snapshot.measures).toMatchObject({ totalArtifactCount: 2, commitmentCount: 2, projectCount: 1, roleCount: 1, sourceCount: 2, pastItemCount: 1, futureItemCount: 1, provenanceCoverage: 1 });
    expect(result.snapshot.relationshipGroups.map((x) => `${x.targetKind}:${x.targetId}`)).toEqual(["project:project-1", "role:role-1"]);
    expect(result.snapshot.deterministicConditions.map((x) => x.type).sort()).toEqual(["HAS_INFORMATION_GAPS", "HAS_MULTIPLE_SOURCES", "HAS_UNKNOWN_VALUES"]);
    expect(result.snapshot.calculationEvidence.find((x) => x.measureId === "commitmentCount")?.ruleId).toBe("context.measure.commitmentCount.v1");
  });

  it("replays with structural equality and is independent of source insertion order", () => {
    const input = { sourceState: sourceState(), referenceTime: "2035-04-01T10:00:00Z" };
    expect(replayExecutiveContext(input)).toEqual(replayExecutiveContext(input));
    const result = replayExecutiveContext(input);
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(Object.isFrozen(result.snapshot)).toBe(true);
      expect(Object.isFrozen(result.snapshot.calculationEvidence)).toBe(true);
      expect(result.snapshot.identity.contextId).toMatch(/^executive-context:[a-f0-9]{64}$/);
    }
  });

  it("uses the explicit reference time and never hides it from identity", () => {
    const source = sourceState(), engine = new ExecutiveContextEngine();
    const before = engine.derive({ sourceState: source, referenceTime: "2035-04-01T08:00:00Z" });
    const after = engine.derive({ sourceState: source, referenceTime: "2035-04-01T12:00:00Z" });
    expect(before.outcome).toBe("success"); expect(after.outcome).toBe("success");
    if (before.outcome === "success" && after.outcome === "success") {
      expect(before.snapshot.identity.contextId).not.toBe(after.snapshot.identity.contextId);
      expect(before.snapshot.measures.futureItemCount).toBe(2);
      expect(after.snapshot.measures.pastItemCount).toBe(2);
    }
  });

  it("fails atomically for invalid inputs and unsupported contracts", () => {
    const engine = new ExecutiveContextEngine(), source = sourceState();
    expect(engine.derive({ sourceState: source, referenceTime: "not-now" })).toMatchObject({ outcome: "failure", code: "INVALID_REFERENCE_TIME" });
    const unsupported = JSON.parse(JSON.stringify(source)); unsupported.metadata.assemblyVersion = "2.0.0";
    expect(engine.derive({ sourceState: unsupported, referenceTime: "2035-04-01T10:00:00Z" })).toMatchObject({ outcome: "failure", code: "UNSUPPORTED_VERSION" });
  });

  it("publishes no rankings, recommendations, or inferred relationships", () => {
    const result = new ExecutiveContextEngine().derive({ sourceState: sourceState(), referenceTime: "2035-04-01T10:00:00Z" });
    expect(result.outcome).toBe("success");
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/recommend|ranking|urgency|importance|priorityScore|inferredRelationship/i);
  });
});
