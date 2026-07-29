import type { ExecutiveInteractionChannel, ExecutiveInteractionContract } from "../executive-interaction";

export const EXECUTIVE_INTERACTION_RESULT_SCHEMA_VERSION =
  "executive-interaction-result-v1" as const;
export const EXECUTIVE_INTERACTION_PROCESSOR_VERSION =
  "executive-interaction-processor-v1" as const;

export type InteractionReadiness = "READY" | "READ_ONLY" | "UNAVAILABLE";
export type InteractionValidationSeverity = "ERROR";

export interface InteractionValidationFinding {
  readonly code: string;
  readonly severity: InteractionValidationSeverity;
  readonly message: string;
  readonly affectedField: string;
}

/** A reference-only, deterministic projection of one interaction contract. */
export interface ExecutiveInteractionResult {
  readonly interactionResultId: string;
  readonly schemaVersion: typeof EXECUTIVE_INTERACTION_RESULT_SCHEMA_VERSION;
  readonly interactionContractId: ExecutiveInteractionContract["interactionContractId"];
  readonly processorVersion: typeof EXECUTIVE_INTERACTION_PROCESSOR_VERSION;
  readonly interactionReadiness: InteractionReadiness;
  readonly availableChannels: readonly ExecutiveInteractionChannel[];
  readonly availableCapabilities: Readonly<{
    routingPlanCount: number;
    invocationHandoffCount: number;
  }>;
  readonly specialistAvailabilitySummary: Readonly<{
    specialistAvailable: boolean;
    roleAvailable: boolean;
    handoffAvailable: boolean;
  }>;
  readonly authoritySummary: Readonly<{
    humanAuthorityFinal: boolean;
    explicitApprovalRequired: boolean;
    executionPermitted: boolean;
    additionalAuthorityGranted: boolean;
  }>;
  readonly processingStatus: "PROCESSED" | "VALIDATION_FAILED";
  readonly validationFindings: readonly InteractionValidationFinding[];
  readonly metadata: Readonly<{
    owner: "ExecutiveInteractionProcessor";
    sourcePublicationType: "ExecutiveInteractionContract";
    deterministic: true;
  }>;
}
