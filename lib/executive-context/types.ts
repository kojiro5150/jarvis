import type { CanonicalEntityKind, ExecutiveStateSnapshot } from "../executive-operating-system/situational-awareness/assembly";

export const EXECUTIVE_CONTEXT_CONTRACT_VERSION = "executive-context-snapshot-v1" as const;
export const EXECUTIVE_CONTEXT_ENGINE_VERSION = "1.0.0" as const;
export const EXECUTIVE_CONTEXT_RULE_VERSION = "1.0.0" as const;

export interface ExecutiveContextDerivationInput {
  readonly sourceState: ExecutiveStateSnapshot;
  /** Explicit time used by temporal rules. The engine never reads the system clock. */
  readonly referenceTime: string;
}

export interface ExecutiveContextIdentity {
  readonly contextId: string;
  readonly contractVersion: typeof EXECUTIVE_CONTEXT_CONTRACT_VERSION;
  readonly engineVersion: typeof EXECUTIVE_CONTEXT_ENGINE_VERSION;
  readonly ruleVersion: typeof EXECUTIVE_CONTEXT_RULE_VERSION;
}

export interface SourceStateIdentity {
  readonly snapshotId: string;
  readonly lifecycleSnapshotId: string;
  readonly previousLifecycleSnapshotId: string;
  readonly observedAt: string;
  readonly assemblyVersion: string;
  readonly canonicalContractVersion: string;
}

export interface CountMeasure {
  readonly measureId: string;
  readonly ruleId: string;
  readonly value: number;
  readonly inputIdentities: readonly string[];
}

export interface ExecutiveContextMeasures {
  readonly totalArtifactCount: number;
  readonly commitmentCount: number;
  readonly projectCount: number;
  readonly roleCount: number;
  readonly sourceCount: number;
  readonly conflictCount: number;
  readonly gapCount: number;
  readonly unknownValueCount: number;
  readonly relationshipCount: number;
  readonly pastItemCount: number;
  readonly currentItemCount: number;
  readonly futureItemCount: number;
  readonly provenanceCoverage: number;
}

export interface RelationshipGroup {
  readonly targetKind: "role" | "project";
  readonly targetId: string;
  readonly relationshipIds: readonly string[];
  readonly memberIds: readonly string[];
}

export interface SourceSummary {
  readonly sourceId: string;
  readonly artifactCount: number;
  readonly adapterIds: readonly string[];
}

export type DeterministicConditionType =
  | "EMPTY_EXECUTIVE_STATE" | "HAS_CONFLICTS" | "HAS_INFORMATION_GAPS"
  | "HAS_UNKNOWN_VALUES" | "HAS_MULTIPLE_SOURCES" | "HAS_UNRESOLVED_REFERENCES";

export interface DeterministicCondition {
  readonly conditionId: string;
  readonly type: DeterministicConditionType;
  readonly ruleId: string;
  readonly sourceSnapshotId: string;
  readonly observedAt: string;
  readonly supportingIdentities: readonly string[];
  readonly supportingValues: Readonly<Record<string, number | string | boolean>>;
}

export interface EntitySummary {
  readonly countsByKind: Readonly<Record<CanonicalEntityKind, number>>;
  readonly countsByLifecycle: readonly Readonly<{ kind: CanonicalEntityKind; lifecycle: string; count: number }>[];
}

export interface ExecutiveContextSnapshot {
  readonly identity: ExecutiveContextIdentity;
  readonly sourceStateIdentity: SourceStateIdentity;
  readonly observedAt: string;
  readonly referenceTime: string;
  readonly entitySummary: EntitySummary;
  readonly measures: ExecutiveContextMeasures;
  readonly relationshipGroups: readonly RelationshipGroup[];
  readonly sourceContext: readonly SourceSummary[];
  readonly conflictsByType: Readonly<Record<string, number>>;
  readonly gapsByType: Readonly<Record<string, number>>;
  readonly deterministicConditions: readonly DeterministicCondition[];
  readonly calculationEvidence: readonly CountMeasure[];
  readonly derivationMetadata: Readonly<{
    contractVersion: typeof EXECUTIVE_CONTEXT_CONTRACT_VERSION;
    engineVersion: typeof EXECUTIVE_CONTEXT_ENGINE_VERSION;
    ruleVersion: typeof EXECUTIVE_CONTEXT_RULE_VERSION;
  }>;
}

export type ExecutiveContextFailureStage = "input_validation" | "derivation" | "snapshot_validation";
export interface ExecutiveContextFailure {
  readonly outcome: "failure";
  readonly stage: ExecutiveContextFailureStage;
  readonly code: "INVALID_SOURCE_STATE" | "UNSUPPORTED_VERSION" | "INVALID_REFERENCE_TIME" | "INVALID_CONTEXT_SNAPSHOT";
  readonly rule: string;
  readonly message: string;
}
export interface ExecutiveContextSuccess { readonly outcome: "success"; readonly snapshot: ExecutiveContextSnapshot }
export type ExecutiveContextResult = ExecutiveContextSuccess | ExecutiveContextFailure;
