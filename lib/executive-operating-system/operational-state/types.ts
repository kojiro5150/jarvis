import type { ExecutiveRunRecord } from "../runtime";

export const EXECUTIVE_OPERATIONAL_STATE_SCHEMA_VERSION = "executive-operational-state-v1" as const;

export interface ExecutiveOperationalState {
  readonly operationalStateId: string;
  readonly schemaVersion: typeof EXECUTIVE_OPERATIONAL_STATE_SCHEMA_VERSION;
  readonly executiveIdentity: Readonly<{
    executiveStateSnapshotIds: readonly string[];
  }>;
  readonly operationalStatus: "operational" | "runtime_failed";
  readonly latestRun: Readonly<{
    executiveRunRecordId: string;
    runtimeCompletionTimestamp: string;
    disposition: ExecutiveRunRecord["outcome"];
  }>;
  readonly capabilityAvailability: Readonly<{
    status: "available" | "unavailable";
    routingPlanIds: readonly string[];
    invocationHandoffIds: readonly string[];
  }>;
  readonly approvalState: Readonly<{
    status: string;
    authorityValidationOutcome: string;
    authorityRequirementIds: readonly string[];
    grantsApproval: false;
  }>;
  readonly executionOutcome: Readonly<{
    capabilityExecutionResultIds: readonly string[];
    invocationDisposition: string;
    executionStatus: string;
    executionAttempted: boolean;
    sideEffectAttempted: boolean;
    sideEffectConfirmed: boolean;
  }>;
  readonly situationalSummaryReferences: Readonly<{
    executiveSituationSetIds: readonly string[];
    situationAssessmentSetIds: readonly string[];
  }>;
  readonly reasoningReferences: Readonly<{
    executiveReasoningRecordIds: readonly string[];
  }>;
  readonly proposalReferences: Readonly<{
    governedActionProposalSetIds: readonly string[];
  }>;
  readonly runtimeHealth: Readonly<{
    status: "healthy" | "failed";
    failureCount: number;
  }>;
  readonly runtimeVersion: string;
  readonly metadata: Readonly<{
    owner: "ExecutiveOperationalStateComposer";
    sourcePublicationType: "ExecutiveRunRecord";
    deterministic: true;
  }>;
}

export interface ExecutiveOperationalResult {
  readonly executiveRunRecord: ExecutiveRunRecord;
  readonly executiveOperationalState: ExecutiveOperationalState;
}
