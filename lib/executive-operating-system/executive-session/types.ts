import type { ExecutiveOperationalState } from "../operational-state";

export const EXECUTIVE_SESSION_SCHEMA_VERSION = "executive-session-v1" as const;

export const EXECUTIVE_INTERACTION_MODES = [
  "EXECUTIVE",
  "SPECIALIST",
  "OBSERVATION",
  "IDLE",
] as const;

export type ExecutiveInteractionMode = (typeof EXECUTIVE_INTERACTION_MODES)[number];

/** Immutable references defining the context in which executive interaction occurs. */
export interface ExecutiveSession {
  readonly executiveSessionId: string;
  readonly schemaVersion: typeof EXECUTIVE_SESSION_SCHEMA_VERSION;
  readonly createdAt: string;
  readonly executiveOperationalStateId: string;
  readonly currentExecutiveIdentity: Readonly<{
    executiveStateSnapshotId: string | null;
  }>;
  readonly activeExecutiveObjectiveReference: string | null;
  readonly interactionMode: ExecutiveInteractionMode;
  readonly specialistContext: Readonly<{
    activeSpecialistIdentity: string | null;
    specialistRoleReference: string | null;
    specialistHandoffReference: string | null;
  }>;
  readonly activeExecutiveCapabilities: Readonly<{
    routingPlanReferences: readonly string[];
    invocationHandoffReferences: readonly string[];
  }>;
  readonly operationalHealthReference: Readonly<{
    executiveOperationalStateId: string;
    status: ExecutiveOperationalState["runtimeHealth"]["status"];
  }>;
  readonly runtimeCompletionReference: Readonly<{
    executiveRunRecordId: string;
    completedAt: string;
  }>;
  readonly metadata: Readonly<{
    owner: "ExecutiveSessionComposer";
    sourcePublicationType: "ExecutiveOperationalState";
    deterministic: true;
  }>;
}
