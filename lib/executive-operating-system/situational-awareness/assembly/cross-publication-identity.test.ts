import { describe, expect, it } from "vitest";
import { compareSituationalAwarenessSnapshots, createSituationalAwarenessSnapshot } from "../lifecycle";
import { createSituationalAwareness } from "../model";
import { createProjectionArtifact, projectArtifacts } from "../projection";
import type { ProjectionArtifact, ProjectionEntities } from "../projection";
import { SituationalAwarenessEngine } from "./engine";

const sharedId = "shared-publication-id";
const identity = { userId: "identity-probe", displayName: "Identity Probe" };
const commitment = {
  id: sharedId,
  title: "Review the operating plan",
  kind: "review" as const,
  status: "scheduled" as const,
  roleIds: [],
  projectIds: [],
  startsAt: "2036-03-15T10:00:00Z",
};
const communication = {
  id: sharedId,
  sender: "director@example.com",
  recipients: ["team@example.com"],
  sentAt: "2036-03-15T09:00:00Z",
  subject: "Operating plan",
  references: [],
};

function artifact(sourceId: string, entities: ProjectionEntities): ProjectionArtifact {
  return createProjectionArtifact({
    entities,
    provenance: {
      sourceId,
      sourceKind: "other",
      adapterId: `probe.${sourceId}`,
      projectedAt: "2036-03-15T09:30:00Z",
      availability: "available",
    },
    validationState: "valid",
    metadata: { probe: "cross-publication-identity" },
  });
}

const commitmentArtifact = artifact("commitment-source", { identity, commitments: [commitment] });
const communicationArtifact = artifact("communication-source", { identity, communications: [communication] });
const previousSnapshot = createSituationalAwarenessSnapshot({
  snapshotId: "identity-probe-before",
  observedAt: "2036-03-15T08:00:00Z",
  state: createSituationalAwareness({ identity }),
});
const assemblyInput = {
  artifacts: [commitmentArtifact, communicationArtifact],
  previousSnapshot,
  snapshotId: "identity-probe-current",
  observedAt: "2036-03-15T10:00:00Z",
} as const;

describe("cross-publication identity probe", () => {
  it("preserves an identical identifier in independent collections through projection, assembly, and replay", () => {
    const projected = projectArtifacts(assemblyInput.artifacts);
    expect(projected.commitments.find(({ id }) => id === sharedId)).toEqual(commitment);
    expect(projected.communications.find(({ id }) => id === sharedId)).toEqual(communication);

    const engine = new SituationalAwarenessEngine();
    const assembled = engine.assemble(assemblyInput);
    expect(assembled.outcome).toBe("success");
    if (assembled.outcome !== "success") return;
    expect(assembled.snapshot.state.commitments).toEqual([commitment]);
    expect(assembled.snapshot.state.communications).toEqual([communication]);
    expect(assembled.snapshot.relationships).toEqual([]);
    expect(assembled.snapshot.conflicts).toEqual([]);

    const replayInput = JSON.parse(JSON.stringify(assemblyInput)) as typeof assemblyInput;
    const replayed = engine.assemble(replayInput);
    expect(replayed).toEqual(assembled);
    if (replayed.outcome !== "success") return;
    expect(replayed.snapshot.snapshotId).toBe(assembled.snapshot.snapshotId);
  });

  it("compares and isolates the same identifier within its publication collection", () => {
    const before = createSituationalAwarenessSnapshot({
      snapshotId: "identity-probe-snapshot-before",
      observedAt: "2036-03-15T10:00:00Z",
      state: createSituationalAwareness({ identity, commitments: [commitment], communications: [communication] }),
    });
    const changedCommitment = { ...commitment, title: "Review the revised operating plan" };
    const mutableCommunication = JSON.parse(JSON.stringify(communication)) as typeof communication;
    const after = createSituationalAwarenessSnapshot({
      snapshotId: "identity-probe-snapshot-after",
      observedAt: "2036-03-15T11:00:00Z",
      state: createSituationalAwareness({
        identity,
        commitments: [changedCommitment],
        communications: [mutableCommunication],
      }),
    });

    mutableCommunication.subject = "Mutated after snapshot construction";
    const comparison = compareSituationalAwarenessSnapshots(before, after);

    expect(comparison.changes.commitments).toEqual([{
      type: "modified",
      id: sharedId,
      previous: commitment,
      current: changedCommitment,
    }]);
    expect(comparison.changes.communications).toEqual([]);
    expect(comparison.summary).toEqual({ added: 0, removed: 0, modified: 1, unchanged: 3, totalChanged: 1 });
    expect(after.state.communications[0]).toEqual(communication);
    expect(after.state.communications[0].subject).not.toBe(mutableCommunication.subject);
  });
});
