import { describe, expect, it } from "vitest";
import { createProjectionArtifact } from "../projection";
import { createSituationalAwarenessSnapshot } from "../lifecycle";
import { createSituationalAwareness } from "../model";
import type { ProjectionArtifact } from "../projection";
import { SituationalAwarenessEngine } from "./engine";

function artifact(sourceId: string, entities: ProjectionArtifact["entities"]): ProjectionArtifact {
  return createProjectionArtifact({
    entities,
    provenance: { sourceId, sourceKind: "other", adapterId: `fixture.${sourceId}`, projectedAt: "2035-04-01T09:00:00Z", availability: "available" },
    validationState: "valid",
    metadata: { fixture: sourceId },
  });
}
const identity = { userId: "executive", displayName: "Executive" };
const previousSnapshot = createSituationalAwarenessSnapshot({ snapshotId: "boundary-0", observedAt: "2035-04-01T08:00:00Z", state: createSituationalAwareness({ identity }) });
const lifecycle = { snapshotId: "boundary-1", observedAt: "2035-04-01T10:00:00Z", previousSnapshot };

describe("SituationalAwarenessEngine", () => {
  it("assembles stable canonical ordering, provenance, and only explicit relationships", () => {
    const project = { id: "project-z", name: "Zeta", status: "active" as const, roleIds: ["role-z"] };
    const role = { id: "role-z", name: "Director", status: "active" as const };
    const commitment = { id: "commitment-a", title: "Review", kind: "review" as const, status: "scheduled" as const, roleIds: [role.id], projectIds: [project.id], startsAt: "2035-04-02T10:00:00Z" };
    const first = artifact("z-source", { identity, roles: [role], projects: [project] });
    const second = artifact("a-source", { identity, commitments: [commitment], context: { workMode: "unknown", locationKind: "work" } });
    const engine = new SituationalAwarenessEngine();
    const result = engine.assemble({ artifacts: [first, second], ...lifecycle });
    expect(result.outcome).toBe("success");
    if (result.outcome !== "success") return;
    expect(result.snapshot.metadata.sourceIds).toEqual(["a-source", "z-source"]);
    expect(result.snapshot.relationships.map(({ sourceId, targetKind, targetId }) => `${sourceId}:${targetKind}:${targetId}`).sort()).toEqual([
      "commitment-a:project:project-z", "commitment-a:role:role-z", "project-z:role:role-z",
    ]);
    expect(result.snapshot.relationships.map(({ relationshipId }) => relationshipId)).toEqual([...result.snapshot.relationships.map(({ relationshipId }) => relationshipId)].sort());
    expect(result.snapshot.gaps.map(({ field }) => field)).toEqual(["context.workMode"]);
    expect(result.snapshot.conflicts).toEqual([]);
    expect(engine.assemble({ artifacts: [second, first], ...lifecycle })).toEqual(result);
  });

  it("returns stable atomic failures for duplicate artifacts and malformed input", () => {
    const item = artifact("source", { identity });
    const engine = new SituationalAwarenessEngine();
    expect(engine.assemble({ artifacts: [item, item], ...lifecycle })).toMatchObject({ outcome: "failure", stage: "input_validation", code: "DUPLICATE_ARTIFACT_ID" });
    expect(engine.assemble({ artifacts: [{ ...item, validationState: "invalid" } as never], ...lifecycle })).toMatchObject({ outcome: "failure", stage: "input_validation", code: "INVALID_PROJECTION_ARTIFACT" });
  });

  it("detects incompatible same-identity observations without choosing a winner", () => {
    const commitment = { id: "same", title: "First", kind: "meeting" as const, status: "scheduled" as const, roleIds: [], projectIds: [] };
    const result = new SituationalAwarenessEngine().assemble({ artifacts: [
      artifact("one", { identity, commitments: [commitment] }),
      artifact("two", { identity, commitments: [{ ...commitment, title: "Second" }] }),
    ], ...lifecycle });
    expect(result).toMatchObject({ outcome: "failure", stage: "conflict_detection", code: "STRUCTURAL_CONFLICT", rule: "same_identity_has_incompatible_canonical_values" });
  });

  it("distinguishes unresolved required references from explicit unknown gaps", () => {
    const result = new SituationalAwarenessEngine().assemble({ artifacts: [artifact("source", { identity, commitments: [{ id: "c", title: "Review", kind: "review", status: "scheduled", roleIds: [], projectIds: ["absent"] }] })], ...lifecycle });
    expect(result).toMatchObject({ outcome: "failure", stage: "relationship_resolution", code: "UNRESOLVED_REQUIRED_REFERENCE" });
  });

  it("publishes a recursively immutable defensive copy", () => {
    const source = artifact("source", { identity });
    const result = new SituationalAwarenessEngine().assemble({ artifacts: [source], ...lifecycle });
    expect(result.outcome).toBe("success");
    if (result.outcome !== "success") return;
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(Object.isFrozen(result.snapshot.artifacts[0].artifact.entities.identity)).toBe(true);
    expect(result.snapshot.artifacts[0].artifact).not.toBe(source);
  });

  it("publishes communications independently without relationships, inference, or conflict semantics", () => {
    const communication = { id: "message-b", sender: "director@example.com", recipients: ["team@example.com"], sentAt: "2035-04-01T08:30:00Z", subject: "Status", references: [] };
    const earlier = { ...communication, id: "message-a", sentAt: "2035-04-01T08:00:00Z" };
    const result = new SituationalAwarenessEngine().assemble({ artifacts: [artifact("mail", { identity, communications: [communication, earlier] })], ...lifecycle });
    expect(result.outcome).toBe("success");
    if (result.outcome !== "success") return;
    expect(result.snapshot.state.communications.map(({ id }) => id)).toEqual(["message-a", "message-b"]);
    expect(result.snapshot.state.commitments).toEqual([]);
    expect(result.snapshot.state.waitingItems).toEqual([]);
    expect(result.snapshot.state.priorities).toEqual([]);
    expect(result.snapshot.state.projects).toEqual([]);
    expect(result.snapshot.state.activeWork).toEqual([]);
    expect(result.snapshot.relationships).toEqual([]);
    expect(result.snapshot.conflicts).toEqual([]);
    expect(Object.isFrozen(result.snapshot.state.communications)).toBe(true);
    expect(Object.isFrozen(result.snapshot.state.communications[0].recipients)).toBe(true);
  });
});
