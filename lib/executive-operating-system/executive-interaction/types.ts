import type { ExecutiveSession } from "../executive-session";

export const EXECUTIVE_INTERACTION_CONTRACT_SCHEMA_VERSION =
  "executive-interaction-contract-v1" as const;

export const EXECUTIVE_INTERACTION_CHANNELS = [
  "CHAT",
  "VOICE",
  "DASHBOARD",
  "AUTOMATION",
  "API",
] as const;

export type ExecutiveInteractionChannel = (typeof EXECUTIVE_INTERACTION_CHANNELS)[number];

/** The canonical, immutable boundary consumed by every executive interface. */
export interface ExecutiveInteractionContract {
  readonly interactionContractId: string;
  readonly schemaVersion: typeof EXECUTIVE_INTERACTION_CONTRACT_SCHEMA_VERSION;
  readonly createdAt: string;
  readonly sessionIdentityReference: Readonly<{
    executiveSessionId: string;
  }>;
  readonly executiveIdentityReference: ExecutiveSession["currentExecutiveIdentity"];
  readonly interactionMode: ExecutiveSession["interactionMode"];
  readonly channelAvailability: readonly Readonly<{
    channel: ExecutiveInteractionChannel;
    available: true;
  }>[];
  readonly capabilityAvailability: Readonly<{
    routingPlanReferences: readonly string[];
    invocationHandoffReferences: readonly string[];
  }>;
  readonly permittedSpecialistReferences: Readonly<{
    activeSpecialistIdentity: string | null;
    specialistRoleReference: string | null;
    specialistHandoffReference: string | null;
  }>;
  readonly interactionConstraints: Readonly<{
    mayExecute: false;
    mayRoute: false;
    mayPlan: false;
    mayReason: false;
    mayMutateSession: false;
    mayBypassFoundation: false;
  }>;
  readonly authorityBoundaries: Readonly<{
    humanAuthority: "FINAL";
    approvalBoundary: "EXPLICIT_APPROVAL_REQUIRED";
    runtimeOwner: "ConstitutionalRuntime";
    operationalOwner: "ExecutiveOperationalStateComposer";
    sessionOwner: "ExecutiveSessionComposer";
    grantsAdditionalAuthority: false;
  }>;
  readonly runtimeCompletionReference: ExecutiveSession["runtimeCompletionReference"];
  readonly operationalStateReference: Readonly<{
    executiveOperationalStateId: string;
  }>;
  readonly metadata: Readonly<{
    owner: "ExecutiveInteractionContractComposer";
    sourcePublicationType: "ExecutiveSession";
    deterministic: true;
  }>;
}
