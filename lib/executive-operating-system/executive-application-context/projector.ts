import { createHash } from "node:crypto";
import {
  EXECUTIVE_INTERACTION_RESULT_SCHEMA_VERSION,
  type ExecutiveInteractionResult,
} from "../executive-interaction-processing";
import {
  EXECUTIVE_APPLICATION_CONTEXT_PROJECTOR_VERSION,
  EXECUTIVE_APPLICATION_CONTEXT_SCHEMA_VERSION,
  type ExecutiveApplicationContext,
  type ExecutiveApplicationInteractionMode,
} from "./types";

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function hasCanonicalIdentity(result: ExecutiveInteractionResult): boolean {
  const { interactionResultId, ...body } = result;
  const expected = `executive-interaction-result:${createHash("sha256").update(JSON.stringify(body)).digest("hex")}`;
  return interactionResultId === expected;
}

function isValidSource(result: ExecutiveInteractionResult): boolean {
  return result.schemaVersion === EXECUTIVE_INTERACTION_RESULT_SCHEMA_VERSION &&
    result.processingStatus === "PROCESSED" &&
    result.validationFindings.length === 0 &&
    result.metadata.owner === "ExecutiveInteractionProcessor" &&
    result.metadata.sourcePublicationType === "ExecutiveInteractionContract" &&
    result.metadata.deterministic === true &&
    hasCanonicalIdentity(result);
}

type ContextBody = Omit<ExecutiveApplicationContext, "applicationContextId">;

/** Projects one interaction result without consulting or reconstructing an earlier layer. */
export function projectExecutiveApplicationContext(
  result: ExecutiveInteractionResult,
): ExecutiveApplicationContext {
  const valid = isValidSource(result);
  const readiness = valid ? result.interactionReadiness : "UNAVAILABLE";
  const modes: readonly ExecutiveApplicationInteractionMode[] = readiness === "READY"
    ? ["INTERACTIVE"]
    : readiness === "READ_ONLY" ? ["READ_ONLY"] : [];
  const capabilities = valid
    ? result.availableCapabilities
    : { routingPlanCount: 0, invocationHandoffCount: 0 };
  const body: ContextBody = {
    schemaVersion: EXECUTIVE_APPLICATION_CONTEXT_SCHEMA_VERSION,
    projectorVersion: EXECUTIVE_APPLICATION_CONTEXT_PROJECTOR_VERSION,
    interactionResultId: typeof result.interactionResultId === "string" ? result.interactionResultId : "",
    readinessSummary: { status: readiness, available: readiness !== "UNAVAILABLE" },
    availableInteractionModes: modes,
    availableChannels: valid ? [...result.availableChannels] : [],
    availableSpecialists: valid
      ? { ...result.specialistAvailabilitySummary }
      : { specialistAvailable: false, roleAvailable: false, handoffAvailable: false },
    authoritySummary: valid
      ? { ...result.authoritySummary }
      : { humanAuthorityFinal: false, explicitApprovalRequired: false, executionPermitted: false, additionalAuthorityGranted: false },
    applicationCapabilities: {
      routingAvailable: capabilities.routingPlanCount > 0,
      invocationHandoffAvailable: capabilities.invocationHandoffCount > 0,
      routingPlanCount: capabilities.routingPlanCount,
      invocationHandoffCount: capabilities.invocationHandoffCount,
    },
    publicationStatus: valid ? "PUBLISHED" : "SOURCE_INVALID",
    metadata: {
      owner: "ExecutiveApplicationContextProjector",
      sourcePublicationType: "ExecutiveInteractionResult",
      deterministic: true,
    },
  };
  return deepFreeze({
    applicationContextId: `executive-application-context:${createHash("sha256").update(JSON.stringify(body)).digest("hex")}`,
    ...body,
  });
}
