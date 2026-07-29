import { createHash } from "node:crypto";
import type { ExecutiveRunRecord, ExecutiveRunPublicationReference } from "../runtime";
import { composeExecutiveSession } from "../executive-session/composer";
import { composeExecutiveInteractionContract } from "../executive-interaction/composer";
import { processExecutiveInteraction } from "../executive-interaction-processing/processor";
import {
  EXECUTIVE_OPERATIONAL_STATE_SCHEMA_VERSION,
  type ExecutiveOperationalResult,
  type ExecutiveOperationalState,
} from "./types";

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function publicationIds(
  runRecord: ExecutiveRunRecord,
  publicationType: string,
): readonly string[] {
  const reference: ExecutiveRunPublicationReference | undefined =
    runRecord.publicationReferences.find((candidate) => candidate.publicationType === publicationType);
  return reference?.status === "published" ? [...reference.publicationIds] : [];
}

function operationalStateId(runRecord: ExecutiveRunRecord): string {
  const identity = JSON.stringify({
    executiveRunRecordId: runRecord.executiveRunRecordId,
    operationalSchemaVersion: EXECUTIVE_OPERATIONAL_STATE_SCHEMA_VERSION,
    runtimeVersion: runRecord.runtimeIdentity.runtimeVersion,
  });
  return `executive-operational-state:${createHash("sha256").update(identity).digest("hex")}`;
}

/**
 * Projects the terminal constitutional publication into the Operational Layer.
 * This function consumes no runtime engine and retains only publication identities and run evidence.
 */
export function composeExecutiveOperationalState(
  runRecord: ExecutiveRunRecord,
): ExecutiveOperationalState {
  const capabilityRoutingPlanIds = publicationIds(runRecord, "ExecutiveCapabilityRoutingPlan");
  const capabilityInvocationHandoffIds = publicationIds(
    runRecord,
    "ExecutiveCapabilityInvocationHandoff",
  );
  const runtimeSucceeded = runRecord.outcome === "completed";

  return deepFreeze({
    operationalStateId: operationalStateId(runRecord),
    schemaVersion: EXECUTIVE_OPERATIONAL_STATE_SCHEMA_VERSION,
    executiveIdentity: {
      executiveStateSnapshotIds: publicationIds(runRecord, "ExecutiveStateSnapshot"),
    },
    operationalStatus: runtimeSucceeded ? "operational" : "runtime_failed",
    latestRun: {
      executiveRunRecordId: runRecord.executiveRunRecordId,
      runtimeCompletionTimestamp: runRecord.auditMetadata.publishedAt,
      disposition: runRecord.outcome,
    },
    capabilityAvailability: {
      status:
        capabilityRoutingPlanIds.length > 0 && capabilityInvocationHandoffIds.length > 0
          ? "available"
          : "unavailable",
      routingPlanIds: capabilityRoutingPlanIds,
      invocationHandoffIds: capabilityInvocationHandoffIds,
    },
    approvalState: {
      status: runRecord.authorityEvidence.approvalState,
      authorityValidationOutcome: runRecord.authorityEvidence.authorityValidationOutcome,
      authorityRequirementIds: [...runRecord.authorityEvidence.authorityRequirementIds],
      grantsApproval: false,
    },
    executionOutcome: {
      capabilityExecutionResultIds: publicationIds(runRecord, "CapabilityExecutionResult"),
      invocationDisposition: runRecord.executionEvidence.invocationDisposition,
      executionStatus: runRecord.executionEvidence.executionStatus,
      executionAttempted: runRecord.executionEvidence.executionAttempted,
      sideEffectAttempted: runRecord.executionEvidence.sideEffectAttempted,
      sideEffectConfirmed: runRecord.executionEvidence.sideEffectConfirmed,
    },
    situationalSummaryReferences: {
      executiveSituationSetIds: publicationIds(runRecord, "ExecutiveSituationSet"),
      situationAssessmentSetIds: publicationIds(runRecord, "SituationAssessmentSet"),
    },
    reasoningReferences: {
      executiveReasoningRecordIds: publicationIds(runRecord, "ExecutiveReasoningRecord"),
    },
    proposalReferences: {
      governedActionProposalSetIds: publicationIds(runRecord, "GovernedActionProposalSet"),
    },
    runtimeHealth: {
      status: runtimeSucceeded ? "healthy" : "failed",
      failureCount: runRecord.immutableFailures.length,
    },
    runtimeVersion: runRecord.runtimeIdentity.runtimeVersion,
    metadata: {
      owner: "ExecutiveOperationalStateComposer",
      sourcePublicationType: "ExecutiveRunRecord",
      deterministic: true,
    },
  });
}

export function composeExecutiveOperationalResult(
  executiveRunRecord: ExecutiveRunRecord,
): ExecutiveOperationalResult {
  const executiveOperationalState = composeExecutiveOperationalState(executiveRunRecord);
  const executiveSession = composeExecutiveSession(executiveOperationalState);
  const executiveInteractionContract = composeExecutiveInteractionContract(executiveSession);
  return deepFreeze({
    executiveRunRecord,
    executiveOperationalState,
    executiveSession,
    executiveInteractionContract,
    executiveInteractionResult: processExecutiveInteraction(executiveInteractionContract),
  });
}
