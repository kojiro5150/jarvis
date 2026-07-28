import { createHash } from "node:crypto";
import type { ExecutiveOperationalState } from "../operational-state";
import {
  EXECUTIVE_SESSION_SCHEMA_VERSION,
  type ExecutiveInteractionMode,
  type ExecutiveSession,
} from "./types";

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function sessionId(state: ExecutiveOperationalState): string {
  const identity = JSON.stringify({
    executiveOperationalStateId: state.operationalStateId,
    sessionSchemaVersion: EXECUTIVE_SESSION_SCHEMA_VERSION,
  });
  return `executive-session:${createHash("sha256").update(identity).digest("hex")}`;
}

function interactionMode(state: ExecutiveOperationalState): ExecutiveInteractionMode {
  if (state.runtimeHealth.status === "failed") return "OBSERVATION";
  if (state.proposalReferences.governedActionProposalSetIds.length === 0) return "IDLE";
  return "EXECUTIVE";
}

/**
 * Projects one Operational Layer state into one Interaction Layer context.
 * It deliberately accepts no runtime publication or runtime engine.
 */
export function composeExecutiveSession(state: ExecutiveOperationalState): ExecutiveSession {
  return deepFreeze({
    executiveSessionId: sessionId(state),
    schemaVersion: EXECUTIVE_SESSION_SCHEMA_VERSION,
    createdAt: state.latestRun.runtimeCompletionTimestamp,
    executiveOperationalStateId: state.operationalStateId,
    currentExecutiveIdentity: {
      executiveStateSnapshotId: state.executiveIdentity.executiveStateSnapshotIds[0] ?? null,
    },
    activeExecutiveObjectiveReference:
      state.proposalReferences.governedActionProposalSetIds[0] ?? null,
    interactionMode: interactionMode(state),
    specialistContext: {
      activeSpecialistIdentity: null,
      specialistRoleReference: null,
      specialistHandoffReference: null,
    },
    activeExecutiveCapabilities: {
      routingPlanReferences: [...state.capabilityAvailability.routingPlanIds],
      invocationHandoffReferences: [...state.capabilityAvailability.invocationHandoffIds],
    },
    operationalHealthReference: {
      executiveOperationalStateId: state.operationalStateId,
      status: state.runtimeHealth.status,
    },
    runtimeCompletionReference: {
      executiveRunRecordId: state.latestRun.executiveRunRecordId,
      completedAt: state.latestRun.runtimeCompletionTimestamp,
    },
    metadata: {
      owner: "ExecutiveSessionComposer",
      sourcePublicationType: "ExecutiveOperationalState",
      deterministic: true,
    },
  });
}
