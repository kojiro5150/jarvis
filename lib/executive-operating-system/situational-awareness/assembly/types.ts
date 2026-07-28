import type { ProjectionArtifact, Provenance } from "../projection";
import type { SituationalAwareness } from "../model";
import type { SituationalAwarenessSnapshot } from "../lifecycle";

/** The unchanged lifecycle fields required from the existing ProjectionArtifactSet. */
export interface SituationalAwarenessAssemblyInput {
  readonly artifacts: readonly ProjectionArtifact[];
  readonly previousSnapshot: SituationalAwarenessSnapshot;
  readonly snapshotId: string;
  readonly observedAt: string;
}

export type CanonicalEntityKind =
  | "role" | "project" | "commitment" | "waiting_item" | "priority" | "active_work";

export interface ExplicitRelationship {
  readonly relationshipId: string;
  readonly sourceKind: CanonicalEntityKind;
  readonly sourceId: string;
  readonly targetKind: "role" | "project";
  readonly targetId: string;
}

export interface StructuralConflict {
  readonly conflictId: string;
  readonly type: "structural_conflict";
  readonly entityKind: CanonicalEntityKind;
  readonly entityId: string;
  readonly rule: "same_identity_has_incompatible_canonical_values";
  readonly sourceIds: readonly string[];
  readonly observedAt: string;
}

export interface InformationGap {
  readonly gapId: string;
  readonly type: "explicit_unknown";
  readonly field: "context.workMode" | "context.locationKind";
  readonly rule: "canonical_value_is_explicitly_unknown";
}

export interface ArtifactObservation {
  readonly artifactId: string;
  readonly artifact: ProjectionArtifact;
}

export interface ExecutiveStateSnapshotMetadata {
  readonly assemblyVersion: "1.0.0";
  readonly canonicalContractVersion: "projection-artifact-v1";
  readonly artifactCount: number;
  readonly relationshipCount: number;
  readonly conflictCount: number;
  readonly gapCount: number;
  readonly sourceIds: readonly string[];
}

/** Canonical, descriptive publication boundary between projection and interpretation. */
export interface ExecutiveStateSnapshot {
  readonly snapshotId: string;
  readonly lifecycleSnapshotId: string;
  readonly previousLifecycleSnapshotId: string;
  readonly observedAt: string;
  readonly state: SituationalAwareness;
  readonly artifacts: readonly ArtifactObservation[];
  readonly relationships: readonly ExplicitRelationship[];
  readonly conflicts: readonly StructuralConflict[];
  readonly gaps: readonly InformationGap[];
  readonly provenance: readonly Provenance[];
  readonly metadata: ExecutiveStateSnapshotMetadata;
}

export type AssemblyFailureStage =
  | "input_validation" | "relationship_resolution" | "conflict_detection" | "snapshot_validation";
export type AssemblyFailureCode =
  | "INVALID_ASSEMBLY_INPUT" | "INVALID_PROJECTION_ARTIFACT" | "DUPLICATE_ARTIFACT_ID"
  | "UNRESOLVED_REQUIRED_REFERENCE" | "STRUCTURAL_CONFLICT" | "INVALID_SNAPSHOT";

export interface AssemblyFailure {
  readonly outcome: "failure";
  readonly snapshotId?: string;
  readonly stage: AssemblyFailureStage;
  readonly code: AssemblyFailureCode;
  readonly rule: string;
  readonly message: string;
}

export interface AssemblySuccess {
  readonly outcome: "success";
  readonly snapshot: ExecutiveStateSnapshot;
}

export type SituationalAwarenessAssemblyResult = AssemblySuccess | AssemblyFailure;
