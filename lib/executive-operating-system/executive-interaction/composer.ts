import { createHash } from "node:crypto";
import type { ExecutiveSession } from "../executive-session";
import {
  EXECUTIVE_INTERACTION_CHANNELS,
  EXECUTIVE_INTERACTION_CONTRACT_SCHEMA_VERSION,
  type ExecutiveInteractionContract,
} from "./types";

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

type ExecutiveInteractionContractBody = Omit<
  ExecutiveInteractionContract,
  "interactionContractId"
>;

function interactionContractId(body: ExecutiveInteractionContractBody): string {
  return `executive-interaction-contract:${createHash("sha256")
    .update(JSON.stringify(body))
    .digest("hex")}`;
}

function contractBody(session: ExecutiveSession): ExecutiveInteractionContractBody {
  return {
    schemaVersion: EXECUTIVE_INTERACTION_CONTRACT_SCHEMA_VERSION,
    createdAt: session.createdAt,
    sessionIdentityReference: {
      executiveSessionId: session.executiveSessionId,
    },
    executiveIdentityReference: {
      executiveStateSnapshotId: session.currentExecutiveIdentity.executiveStateSnapshotId,
    },
    interactionMode: session.interactionMode,
    channelAvailability: EXECUTIVE_INTERACTION_CHANNELS.map((channel) => ({
      channel,
      available: true as const,
    })),
    capabilityAvailability: {
      routingPlanReferences: [...session.activeExecutiveCapabilities.routingPlanReferences],
      invocationHandoffReferences: [
        ...session.activeExecutiveCapabilities.invocationHandoffReferences,
      ],
    },
    permittedSpecialistReferences: {
      activeSpecialistIdentity: session.specialistContext.activeSpecialistIdentity,
      specialistRoleReference: session.specialistContext.specialistRoleReference,
      specialistHandoffReference: session.specialistContext.specialistHandoffReference,
    },
    interactionConstraints: {
      mayExecute: false,
      mayRoute: false,
      mayPlan: false,
      mayReason: false,
      mayMutateSession: false,
      mayBypassFoundation: false,
    },
    authorityBoundaries: {
      humanAuthority: "FINAL",
      approvalBoundary: "EXPLICIT_APPROVAL_REQUIRED",
      runtimeOwner: "ConstitutionalRuntime",
      operationalOwner: "ExecutiveOperationalStateComposer",
      sessionOwner: "ExecutiveSessionComposer",
      grantsAdditionalAuthority: false,
    },
    runtimeCompletionReference: {
      executiveRunRecordId: session.runtimeCompletionReference.executiveRunRecordId,
      completedAt: session.runtimeCompletionReference.completedAt,
    },
    operationalStateReference: {
      executiveOperationalStateId: session.executiveOperationalStateId,
    },
    metadata: {
      owner: "ExecutiveInteractionContractComposer",
      sourcePublicationType: "ExecutiveSession",
      deterministic: true,
    },
  };
}

/**
 * Projects one Executive Session into the sole contract available to interfaces.
 * It accepts no operational state, runtime publication, engine, or interface state.
 */
export function composeExecutiveInteractionContract(
  session: ExecutiveSession,
): ExecutiveInteractionContract {
  const body = contractBody(session);
  return deepFreeze({
    interactionContractId: interactionContractId(body),
    ...body,
  });
}
