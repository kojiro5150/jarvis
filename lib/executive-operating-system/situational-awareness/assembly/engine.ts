import { createHash } from "node:crypto";
import { createSituationalAwareness } from "../model";
import { createSituationalAwarenessSnapshot } from "../lifecycle";
import { createProjectionArtifact, projectArtifacts } from "../projection";
import type { ProjectionArtifact } from "../projection";
import type {
  ArtifactObservation, AssemblyFailure, AssemblyFailureCode, AssemblyFailureStage,
  CanonicalEntityKind, ExecutiveStateSnapshot, ExplicitRelationship, InformationGap,
  SituationalAwarenessAssemblyInput, SituationalAwarenessAssemblyResult, StructuralConflict,
} from "./types";

const ASSEMBLY_VERSION = "1.0.0" as const;
const CONTRACT_VERSION = "projection-artifact-v1" as const;
const collections = ["roles", "projects", "commitments", "communications", "waitingItems", "priorities", "activeWork"] as const;
const kindByCollection: Record<typeof collections[number], CanonicalEntityKind> = {
  roles: "role", projects: "project", commitments: "commitment", communications: "communication", waitingItems: "waiting_item",
  priorities: "priority", activeWork: "active_work",
};
const rfc3339 = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;

function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort(compareText).map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function identity(kind: string, value: unknown): string {
  return `${kind}:${createHash("sha256").update(canonical(value), "utf8").digest("hex")}`;
}
function deepFreeze<T>(value: T, seen = new WeakSet<object>()): Readonly<T> {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value); Object.values(value as object).forEach((child) => deepFreeze(child, seen));
  return Object.freeze(value);
}
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function failure(stage: AssemblyFailureStage, code: AssemblyFailureCode, rule: string, message: string, snapshotId?: string): AssemblyFailure {
  return deepFreeze({ outcome: "failure", ...(snapshotId ? { snapshotId } : {}), stage, code, rule, message });
}
function validTimestamp(value: unknown): value is string {
  const match = typeof value === "string" ? rfc3339.exec(value) : null;
  const timestamp = typeof value === "string" ? value : "";
  const days = match ? new Date(Date.UTC(Number(timestamp.slice(0, 4)), Number(match[1]), 0)).getUTCDate() : 0;
  return Boolean(match && Number(match[2]) <= days && Number.isFinite(Date.parse(value as string)));
}
function artifactObservations(artifacts: readonly ProjectionArtifact[]): readonly ArtifactObservation[] {
  return artifacts.map((artifact) => ({ artifactId: identity("projection-artifact", artifact), artifact: clone(artifact) }))
    .sort((left, right) => compareText(left.artifactId, right.artifactId));
}
function relationships(artifacts: readonly ArtifactObservation[]): readonly ExplicitRelationship[] {
  const output: ExplicitRelationship[] = [];
  for (const { artifact } of artifacts) for (const collection of collections) {
    const sourceKind = kindByCollection[collection];
    for (const entity of artifact.entities[collection] ?? []) {
      if (!("roleIds" in entity)) continue;
      for (const targetId of entity.roleIds) output.push({ relationshipId: identity("relationship", [sourceKind, entity.id, "role", targetId]), sourceKind, sourceId: entity.id, targetKind: "role", targetId });
      if ("projectIds" in entity) for (const targetId of entity.projectIds) output.push({ relationshipId: identity("relationship", [sourceKind, entity.id, "project", targetId]), sourceKind, sourceId: entity.id, targetKind: "project", targetId });
    }
  }
  const unique = new Map(output.map((item) => [item.relationshipId, item]));
  return [...unique.values()].sort((left, right) => compareText(left.relationshipId, right.relationshipId));
}
function conflicts(artifacts: readonly ArtifactObservation[], observedAt: string): readonly StructuralConflict[] {
  const seen = new Map<string, { value: unknown; sources: string[] }>();
  const output: StructuralConflict[] = [];
  for (const { artifact } of artifacts) for (const collection of collections) for (const entity of artifact.entities[collection] ?? []) {
    const key = `${collection}:${entity.id}`, existing = seen.get(key);
    if (!existing) { seen.set(key, { value: entity, sources: [artifact.provenance.sourceId] }); continue; }
    if (canonical(existing.value) !== canonical(entity)) {
      const sourceIds = [...new Set([...existing.sources, artifact.provenance.sourceId])].sort(compareText);
      output.push({ conflictId: identity("conflict", [kindByCollection[collection], entity.id, sourceIds, observedAt]), type: "structural_conflict", entityKind: kindByCollection[collection], entityId: entity.id, rule: "same_identity_has_incompatible_canonical_values", sourceIds, observedAt });
    }
  }
  return output.sort((left, right) => compareText(left.conflictId, right.conflictId));
}
function gaps(state: ReturnType<typeof createSituationalAwareness>): readonly InformationGap[] {
  const output: InformationGap[] = [];
  if (state.context.workMode === "unknown") output.push({ gapId: identity("gap", "context.workMode"), type: "explicit_unknown", field: "context.workMode", rule: "canonical_value_is_explicitly_unknown" });
  if (state.context.locationKind === "unknown") output.push({ gapId: identity("gap", "context.locationKind"), type: "explicit_unknown", field: "context.locationKind", rule: "canonical_value_is_explicitly_unknown" });
  return output.sort((left, right) => compareText(left.gapId, right.gapId));
}
function orderState(state: ReturnType<typeof createSituationalAwareness>): ReturnType<typeof createSituationalAwareness> {
  const byId = <T extends { readonly id: string }>(items: readonly T[]) => [...items].sort((left, right) => compareText(left.id, right.id));
  return createSituationalAwareness({
    identity: state.identity, context: state.context,
    roles: byId(state.roles), projects: byId(state.projects), commitments: byId(state.commitments), communications: byId(state.communications),
    waitingItems: byId(state.waitingItems), priorities: byId(state.priorities), activeWork: byId(state.activeWork),
    sources: byId(state.sources),
  });
}

/** Deterministically assembles canonical observations; it performs no acquisition or interpretation. */
export class SituationalAwarenessEngine {
  assemble(input: SituationalAwarenessAssemblyInput): SituationalAwarenessAssemblyResult {
    if (!input || typeof input !== "object" || !Array.isArray(input.artifacts) || input.artifacts.length === 0 || !input.previousSnapshot || typeof input.snapshotId !== "string" || input.snapshotId.trim() === "" || !validTimestamp(input.observedAt)) {
      return failure("input_validation", "INVALID_ASSEMBLY_INPUT", "valid_projection_artifact_set_lifecycle", "assembly input requires artifacts, a non-empty snapshotId, and an RFC 3339 observedAt");
    }
    try {
      const previous = createSituationalAwarenessSnapshot(input.previousSnapshot);
      if (Date.parse(input.observedAt) < Date.parse(previous.observedAt)) throw new Error("observedAt precedes the previous lifecycle snapshot");
    } catch (error) { return failure("input_validation", "INVALID_ASSEMBLY_INPUT", "valid_projection_artifact_set_lifecycle", error instanceof Error ? error.message : "invalid previous lifecycle snapshot", input.snapshotId); }
    let observations: readonly ArtifactObservation[];
    try { observations = artifactObservations(input.artifacts.map((artifact) => createProjectionArtifact(artifact))); }
    catch (error) { return failure("input_validation", "INVALID_PROJECTION_ARTIFACT", "canonical_projection_artifact", error instanceof Error ? error.message : "invalid projection artifact", input.snapshotId); }
    const duplicateId = observations.find((item, index) => observations[index - 1]?.artifactId === item.artifactId)?.artifactId;
    if (duplicateId) return failure("input_validation", "DUPLICATE_ARTIFACT_ID", "unique_canonical_artifact_identity", `duplicate canonical artifact identity: ${duplicateId}`, input.snapshotId);
    const detectedConflicts = conflicts(observations, input.observedAt);
    if (detectedConflicts.length > 0) return failure("conflict_detection", "STRUCTURAL_CONFLICT", detectedConflicts[0].rule, `structural conflict for ${detectedConflicts[0].entityKind}: ${detectedConflicts[0].entityId}`, input.snapshotId);
    let state;
    try { state = orderState(projectArtifacts(observations.map(({ artifact }) => artifact))); }
    catch (error) {
      const message = error instanceof Error ? error.message : "relationship resolution failed";
      return failure("relationship_resolution", "UNRESOLVED_REQUIRED_REFERENCE", "all_required_explicit_references_resolve", message, input.snapshotId);
    }
    const explicitRelationships = relationships(observations), informationGaps = gaps(state);
    const provenance = observations.map(({ artifact }) => clone(artifact.provenance)).sort((left, right) => compareText(left.sourceId, right.sourceId));
    const metadata = { assemblyVersion: ASSEMBLY_VERSION, canonicalContractVersion: CONTRACT_VERSION, artifactCount: observations.length, relationshipCount: explicitRelationships.length, conflictCount: 0, gapCount: informationGaps.length, sourceIds: provenance.map(({ sourceId }) => sourceId) };
    const snapshotId = identity("executive-state-snapshot", { assemblyVersion: ASSEMBLY_VERSION, observedAt: input.observedAt, lifecycleSnapshotId: input.snapshotId, previousLifecycleSnapshotId: input.previousSnapshot.snapshotId, artifacts: observations.map(({ artifactId }) => artifactId) });
    const snapshot: ExecutiveStateSnapshot = { snapshotId, lifecycleSnapshotId: input.snapshotId, previousLifecycleSnapshotId: input.previousSnapshot.snapshotId, observedAt: input.observedAt, state: clone(state), artifacts: observations, relationships: explicitRelationships, conflicts: [], gaps: informationGaps, provenance, metadata };
    try {
      const replayedState = createSituationalAwareness(snapshot.state);
      if (canonical(replayedState) !== canonical(state) || metadata.artifactCount !== snapshot.artifacts.length) throw new Error("snapshot canonical content is inconsistent");
    } catch (error) { return failure("snapshot_validation", "INVALID_SNAPSHOT", "canonical_snapshot_consistency", error instanceof Error ? error.message : "invalid snapshot", input.snapshotId); }
    return deepFreeze({ outcome: "success", snapshot: clone(snapshot) });
  }
}
