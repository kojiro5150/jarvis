import type {
  OperationalCommitment, OperationalContext, OperationalIdentity, OperationalPriority,
  OperationalProject, OperationalRole, OperationalSourceId, OperationalSourceKind,
  OperationalSourceStatus, OperationalTimestamp, OperationalWaitingItem, OperationalWorkItem,
} from "../model";

export type SourceAvailability = OperationalSourceStatus;
export type ProjectionValidationState = "valid";

export interface Provenance {
  readonly sourceId: OperationalSourceId;
  readonly sourceKind: OperationalSourceKind;
  readonly adapterId: string;
  readonly projectedAt: OperationalTimestamp;
  readonly availability: SourceAvailability;
}

export interface ProjectionEntities {
  readonly identity: OperationalIdentity;
  readonly roles?: readonly OperationalRole[];
  readonly projects?: readonly OperationalProject[];
  readonly commitments?: readonly OperationalCommitment[];
  readonly waitingItems?: readonly OperationalWaitingItem[];
  readonly priorities?: readonly OperationalPriority[];
  readonly activeWork?: readonly OperationalWorkItem[];
  readonly context?: OperationalContext;
}

export interface ProjectionArtifact {
  readonly entities: ProjectionEntities;
  readonly provenance: Provenance;
  readonly validationState: ProjectionValidationState;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface ProjectionAdapter {
  readonly id: string;
  project(): ProjectionArtifact | Promise<ProjectionArtifact>;
}

export type MergeConflictClassification = "information" | "warning" | "error";

export interface MergeConflict {
  readonly entityType: keyof ProjectionEntities;
  readonly entityId: string;
  readonly sourceIds: readonly OperationalSourceId[];
  readonly classification: MergeConflictClassification;
  readonly diagnostic: string;
}

export interface MergeResult {
  readonly conflicts: readonly MergeConflict[];
  readonly validationState: ProjectionValidationState;
  readonly constructionReady: boolean;
}
