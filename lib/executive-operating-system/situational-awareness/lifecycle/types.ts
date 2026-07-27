import type {
  OperationalCommitment,
  OperationalContext,
  OperationalIdentity,
  OperationalPriority,
  OperationalProject,
  OperationalRole,
  OperationalSourceState,
  OperationalWaitingItem,
  OperationalWorkItem,
  SituationalAwareness,
} from "../model";

/** A canonical Situational Awareness state captured at an explicit observation boundary. */
export interface SituationalAwarenessSnapshot {
  readonly snapshotId: string;
  readonly observedAt: string;
  readonly state: SituationalAwareness;
}

export interface SituationalAwarenessSnapshotInput {
  readonly snapshotId: string;
  readonly observedAt: string;
  readonly state: SituationalAwareness;
}

export type ScalarChange<T> =
  | { readonly type: "added"; readonly current: T }
  | { readonly type: "removed"; readonly previous: T }
  | { readonly type: "modified"; readonly previous: T; readonly current: T };

export type EntityChange<T> =
  | { readonly type: "added"; readonly id: string; readonly current: T }
  | { readonly type: "removed"; readonly id: string; readonly previous: T }
  | { readonly type: "modified"; readonly id: string; readonly previous: T; readonly current: T };

export interface ChangeCounts {
  readonly added: number;
  readonly removed: number;
  readonly modified: number;
  readonly unchanged: number;
  readonly totalChanged: number;
}

export interface SituationalAwarenessChanges {
  readonly identity: ScalarChange<OperationalIdentity> | null;
  readonly context: ScalarChange<OperationalContext> | null;
  readonly roles: readonly EntityChange<OperationalRole>[];
  readonly projects: readonly EntityChange<OperationalProject>[];
  readonly commitments: readonly EntityChange<OperationalCommitment>[];
  readonly waitingItems: readonly EntityChange<OperationalWaitingItem>[];
  readonly priorities: readonly EntityChange<OperationalPriority>[];
  readonly activeWork: readonly EntityChange<OperationalWorkItem>[];
  readonly sources: readonly EntityChange<OperationalSourceState>[];
}

export interface SituationalAwarenessChangeSet {
  readonly previousSnapshotId: string;
  readonly currentSnapshotId: string;
  readonly previousObservedAt: string;
  readonly currentObservedAt: string;
  readonly changes: SituationalAwarenessChanges;
  readonly summary: ChangeCounts;
}
