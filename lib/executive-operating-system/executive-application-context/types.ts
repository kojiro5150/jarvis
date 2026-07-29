import type { ExecutiveInteractionResult } from "../executive-interaction-processing";

export const EXECUTIVE_APPLICATION_CONTEXT_SCHEMA_VERSION =
  "executive-application-context-v1" as const;
export const EXECUTIVE_APPLICATION_CONTEXT_PROJECTOR_VERSION =
  "executive-application-context-projector-v1" as const;

export type ExecutiveApplicationInteractionMode = "INTERACTIVE" | "READ_ONLY";

/** The stable, application-neutral boundary projected from one interaction result. */
export interface ExecutiveApplicationContext {
  readonly applicationContextId: string;
  readonly schemaVersion: typeof EXECUTIVE_APPLICATION_CONTEXT_SCHEMA_VERSION;
  readonly projectorVersion: typeof EXECUTIVE_APPLICATION_CONTEXT_PROJECTOR_VERSION;
  readonly interactionResultId: ExecutiveInteractionResult["interactionResultId"];
  readonly readinessSummary: Readonly<{
    status: ExecutiveInteractionResult["interactionReadiness"];
    available: boolean;
  }>;
  readonly availableInteractionModes: readonly ExecutiveApplicationInteractionMode[];
  readonly availableChannels: ExecutiveInteractionResult["availableChannels"];
  readonly availableSpecialists: ExecutiveInteractionResult["specialistAvailabilitySummary"];
  readonly authoritySummary: ExecutiveInteractionResult["authoritySummary"];
  readonly applicationCapabilities: Readonly<{
    routingAvailable: boolean;
    invocationHandoffAvailable: boolean;
    routingPlanCount: number;
    invocationHandoffCount: number;
  }>;
  readonly publicationStatus: "PUBLISHED" | "SOURCE_INVALID";
  readonly metadata: Readonly<{
    owner: "ExecutiveApplicationContextProjector";
    sourcePublicationType: "ExecutiveInteractionResult";
    deterministic: true;
  }>;
}
