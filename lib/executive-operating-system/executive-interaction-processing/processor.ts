import { createHash } from "node:crypto";
import {
  EXECUTIVE_INTERACTION_CHANNELS,
  EXECUTIVE_INTERACTION_CONTRACT_SCHEMA_VERSION,
  type ExecutiveInteractionChannel,
  type ExecutiveInteractionContract,
} from "../executive-interaction";
import {
  EXECUTIVE_INTERACTION_PROCESSOR_VERSION,
  EXECUTIVE_INTERACTION_RESULT_SCHEMA_VERSION,
  type ExecutiveInteractionResult,
  type InteractionReadiness,
  type InteractionValidationFinding,
} from "./types";

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function finding(code: string, message: string, affectedField: string): InteractionValidationFinding {
  return { code, severity: "ERROR", message, affectedField };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validate(contract: ExecutiveInteractionContract): InteractionValidationFinding[] {
  const value = contract as unknown as Record<string, unknown>;
  const findings: InteractionValidationFinding[] = [];
  if (value.schemaVersion !== EXECUTIVE_INTERACTION_CONTRACT_SCHEMA_VERSION) {
    findings.push(finding("UNSUPPORTED_SCHEMA_VERSION", "The interaction contract schema version is unsupported.", "schemaVersion"));
  }

  const channelsValid = Array.isArray(value.channelAvailability) &&
    value.channelAvailability.length === EXECUTIVE_INTERACTION_CHANNELS.length &&
    value.channelAvailability.every((entry, index) => isRecord(entry) &&
      entry.channel === EXECUTIVE_INTERACTION_CHANNELS[index] && entry.available === true);
  const capabilities = isRecord(value.capabilityAvailability) ? value.capabilityAvailability : {};
  const specialists = isRecord(value.permittedSpecialistReferences) ? value.permittedSpecialistReferences : {};
  const nullableString = (candidate: unknown) => candidate === null || typeof candidate === "string";
  if (typeof value.createdAt !== "string" || value.createdAt.length === 0 ||
      !["EXECUTIVE", "SPECIALIST", "OBSERVATION", "IDLE"].includes(value.interactionMode as string) ||
      !channelsValid || !Array.isArray(capabilities.routingPlanReferences) ||
      !capabilities.routingPlanReferences.every((reference) => typeof reference === "string") ||
      !Array.isArray(capabilities.invocationHandoffReferences) ||
      !capabilities.invocationHandoffReferences.every((reference) => typeof reference === "string") ||
      !nullableString(specialists.activeSpecialistIdentity) ||
      !nullableString(specialists.specialistRoleReference) ||
      !nullableString(specialists.specialistHandoffReference)) {
    findings.push(finding("INVALID_CONTRACT_INTEGRITY", "The interaction contract contains invalid canonical fields.", "contract"));
  }

  const metadata = isRecord(value.metadata) ? value.metadata : {};
  if (metadata.owner !== "ExecutiveInteractionContractComposer" ||
      metadata.sourcePublicationType !== "ExecutiveSession" || metadata.deterministic !== true) {
    findings.push(finding("INVALID_METADATA", "Deterministic contract metadata is invalid.", "metadata"));
  }

  const authority = isRecord(value.authorityBoundaries) ? value.authorityBoundaries : {};
  if (authority.humanAuthority !== "FINAL" ||
      authority.approvalBoundary !== "EXPLICIT_APPROVAL_REQUIRED" ||
      authority.runtimeOwner !== "ConstitutionalRuntime" ||
      authority.operationalOwner !== "ExecutiveOperationalStateComposer" ||
      authority.sessionOwner !== "ExecutiveSessionComposer" ||
      authority.grantsAdditionalAuthority !== false) {
    findings.push(finding("INVALID_AUTHORITY_BOUNDARIES", "Contract authority boundaries are invalid.", "authorityBoundaries"));
  }

  const constraints = isRecord(value.interactionConstraints) ? value.interactionConstraints : {};
  const constraintNames = ["mayExecute", "mayRoute", "mayPlan", "mayReason", "mayMutateSession", "mayBypassFoundation"];
  if (constraintNames.some((name) => constraints[name] !== false)) {
    findings.push(finding("INVALID_INTERACTION_CONSTRAINTS", "Interaction constraints exceed the processing boundary.", "interactionConstraints"));
  }

  const session = isRecord(value.sessionIdentityReference) ? value.sessionIdentityReference : {};
  const runtime = isRecord(value.runtimeCompletionReference) ? value.runtimeCompletionReference : {};
  const operational = isRecord(value.operationalStateReference) ? value.operationalStateReference : {};
  if (typeof session.executiveSessionId !== "string" || session.executiveSessionId.length === 0 ||
      typeof runtime.executiveRunRecordId !== "string" || runtime.executiveRunRecordId.length === 0 ||
      typeof runtime.completedAt !== "string" || runtime.completedAt.length === 0 ||
      typeof operational.executiveOperationalStateId !== "string" || operational.executiveOperationalStateId.length === 0) {
    findings.push(finding("INVALID_REQUIRED_REFERENCES", "One or more required lineage references are invalid.", "references"));
  }

  const contractId = value.interactionContractId;
  const { interactionContractId: ignored, ...body } = value;
  const expectedId = `executive-interaction-contract:${createHash("sha256").update(JSON.stringify(body)).digest("hex")}`;
  if (typeof contractId !== "string" || contractId !== expectedId) {
    findings.push(finding("INVALID_CONTRACT_IDENTITY", "The contract identity does not match its canonical body.", "interactionContractId"));
  }
  return findings;
}

function readiness(contract: ExecutiveInteractionContract, findings: readonly InteractionValidationFinding[]): InteractionReadiness {
  if (findings.length > 0) return "UNAVAILABLE";
  return contract.interactionMode === "OBSERVATION" || contract.interactionMode === "IDLE"
    ? "READ_ONLY"
    : "READY";
}

type ResultBody = Omit<ExecutiveInteractionResult, "interactionResultId">;

/** Validates and interprets one contract without consulting any earlier foundation layer. */
export function processExecutiveInteraction(contract: ExecutiveInteractionContract): ExecutiveInteractionResult {
  const findings = validate(contract);
  const valid = findings.length === 0;
  const channels = valid && Array.isArray(contract.channelAvailability)
    ? contract.channelAvailability
        .filter(({ channel, available }) => available === true && EXECUTIVE_INTERACTION_CHANNELS.includes(channel))
        .map(({ channel }) => channel as ExecutiveInteractionChannel)
    : [];
  const capabilities = valid && isRecord(contract.capabilityAvailability)
    ? contract.capabilityAvailability
    : { routingPlanReferences: [], invocationHandoffReferences: [] };
  const specialists: Record<string, unknown> = valid && isRecord(contract.permittedSpecialistReferences)
    ? contract.permittedSpecialistReferences
    : {};
  const authority: Record<string, unknown> = valid && isRecord(contract.authorityBoundaries) ? contract.authorityBoundaries : {};
  const constraints: Record<string, unknown> = valid && isRecord(contract.interactionConstraints) ? contract.interactionConstraints : {};
  const body: ResultBody = {
    schemaVersion: EXECUTIVE_INTERACTION_RESULT_SCHEMA_VERSION,
    interactionContractId: typeof contract.interactionContractId === "string" ? contract.interactionContractId : "",
    processorVersion: EXECUTIVE_INTERACTION_PROCESSOR_VERSION,
    interactionReadiness: readiness(contract, findings),
    availableChannels: channels,
    availableCapabilities: {
      routingPlanCount: Array.isArray(capabilities.routingPlanReferences) ? capabilities.routingPlanReferences.length : 0,
      invocationHandoffCount: Array.isArray(capabilities.invocationHandoffReferences) ? capabilities.invocationHandoffReferences.length : 0,
    },
    specialistAvailabilitySummary: {
      specialistAvailable: typeof specialists.activeSpecialistIdentity === "string",
      roleAvailable: typeof specialists.specialistRoleReference === "string",
      handoffAvailable: typeof specialists.specialistHandoffReference === "string",
    },
    authoritySummary: {
      humanAuthorityFinal: authority.humanAuthority === "FINAL",
      explicitApprovalRequired: authority.approvalBoundary === "EXPLICIT_APPROVAL_REQUIRED",
      executionPermitted: constraints.mayExecute === true,
      additionalAuthorityGranted: authority.grantsAdditionalAuthority === true,
    },
    processingStatus: valid ? "PROCESSED" : "VALIDATION_FAILED",
    validationFindings: findings,
    metadata: { owner: "ExecutiveInteractionProcessor", sourcePublicationType: "ExecutiveInteractionContract", deterministic: true },
  };
  return deepFreeze({
    interactionResultId: `executive-interaction-result:${createHash("sha256").update(JSON.stringify(body)).digest("hex")}`,
    ...body,
  });
}
