import type { ExecutiveStateSnapshot } from "../executive-operating-system/situational-awareness/assembly";

export const EXECUTIVE_CONTEXT_CONTRACT_VERSION = "executive-context-v1" as const;
export const EXECUTIVE_CONTEXT_ENGINE_VERSION = "1.0.0" as const;

export interface ExecutiveContextDerivationInput {
  readonly sourceSnapshot: ExecutiveStateSnapshot;
  /** Explicit time used for age calculations. The engine never reads the system clock. */
  readonly referenceTime: string;
}

export interface ContextMeasureEvidence {
  readonly evidenceId: string;
  readonly rule: string;
  readonly inputIdentities: readonly string[];
  readonly inputValues: Readonly<Record<string, number | string>>;
  readonly outputValue: number;
  readonly ruleVersion: "1.0.0";
}

export interface ContextEntitySummary {
  readonly totalEntityCount: number;
  readonly roleCount: number;
  readonly projectCount: number;
  readonly commitmentCount: number;
  readonly waitingItemCount: number;
  readonly explicitPriorityCount: number;
  readonly activeWorkCount: number;
}

export interface ContextRelationshipGroup {
  readonly targetId: string;
  readonly relationshipIds: readonly string[];
  readonly sourceIds: readonly string[];
}

export interface ContextRelationshipSummary {
  readonly totalRelationshipCount: number;
  readonly byRole: readonly ContextRelationshipGroup[];
  readonly byProject: readonly ContextRelationshipGroup[];
}

export interface ContextSourceSummary {
  readonly sourceCount: number;
  readonly sourceIds: readonly string[];
  readonly artifactsBySource: Readonly<Record<string, number>>;
  readonly adapterIds: readonly string[];
  readonly completeProvenanceCount: number;
  readonly provenanceCoverage: number;
  readonly oldestObservationAgeMilliseconds: number | null;
  readonly newestObservationAgeMilliseconds: number | null;
}

export interface ContextRecordSummary {
  readonly totalCount: number;
  readonly recordIds: readonly string[];
  readonly byType: Readonly<Record<string, number>>;
}

export type ExecutiveContextConditionType =
  | "EMPTY_EXECUTIVE_STATE" | "HAS_CONFLICTS" | "HAS_INFORMATION_GAPS"
  | "HAS_UNKNOWN_VALUES" | "HAS_MULTIPLE_SOURCES";

export interface ExecutiveContextCondition {
  readonly conditionId: string;
  readonly type: ExecutiveContextConditionType;
  readonly rule: string;
  readonly supportingCanonicalIdentities: readonly string[];
  readonly supportingValues: Readonly<Record<string, number | string | boolean>>;
  readonly sourceSnapshotId: string;
  readonly observedAt: string;
}

export interface ExecutiveContextSnapshot {
  readonly contextId: string;
  readonly sourceStateIdentity: {
    readonly snapshotId: string;
    readonly contractVersion: "projection-artifact-v1";
    readonly observedAt: string;
    readonly lifecycleSnapshotId: string;
    readonly previousLifecycleSnapshotId: string;
    readonly assemblyVersion: "1.0.0";
  };
  readonly observedAt: string;
  readonly referenceTime: string;
  readonly lifecycle: {
    readonly lifecycleSnapshotId: string;
    readonly previousLifecycleSnapshotId: string;
  };
  readonly entitySummary: ContextEntitySummary;
  readonly relationshipContext: ContextRelationshipSummary;
  readonly sourceContext: ContextSourceSummary;
  readonly conflictContext: ContextRecordSummary;
  readonly gapContext: ContextRecordSummary;
  readonly deterministicConditions: readonly ExecutiveContextCondition[];
  readonly calculationEvidence: readonly ContextMeasureEvidence[];
  readonly derivationMetadata: {
    readonly contractVersion: typeof EXECUTIVE_CONTEXT_CONTRACT_VERSION;
    readonly engineVersion: typeof EXECUTIVE_CONTEXT_ENGINE_VERSION;
    readonly ruleVersion: "1.0.0";
  };
}

export type ExecutiveContextFailureStage =
  | "input_validation" | "derivation" | "condition_construction"
  | "context_identity" | "context_validation" | "configuration";
export type ExecutiveContextFailureCode =
  | "SOURCE_SNAPSHOT_VALIDATION_FAILURE" | "UNSUPPORTED_CONTRACT_VERSION"
  | "DERIVATION_FAILURE" | "CONDITION_CONSTRUCTION_FAILURE"
  | "CONTEXT_IDENTITY_FAILURE" | "CONTEXT_VALIDATION_FAILURE" | "CONFIGURATION_FAILURE";

export interface ExecutiveContextFailure {
  readonly outcome: "failure";
  readonly stage: ExecutiveContextFailureStage;
  readonly code: ExecutiveContextFailureCode;
  readonly rule: string;
  readonly message: string;
  readonly sourceSnapshotId?: string;
}
export interface ExecutiveContextSuccess { readonly outcome: "success"; readonly snapshot: ExecutiveContextSnapshot; }
export type ExecutiveContextResult = ExecutiveContextSuccess | ExecutiveContextFailure;
