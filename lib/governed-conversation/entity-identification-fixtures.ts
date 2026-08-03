import type { GmailProductionAcquisition } from "../connectors/google/gmail";
import type { MemoryStore } from "../memory/schema";
import { evaluateClaimBoundary } from "./claim-\u0062oundary-engine";
import type { ExtractedParameter } from "./claim-\u0062oundary-types";
import type { EntityIdentificationEngineInput } from "./entity-identification-types";
import type { GovernedCommunicationEvidenceInput } from "./projection-composer";
import { assembleGovernedSourceEvidence, type GovernedSourceEvidenceAssemblyInput, type GovernedSourceEvidenceAssemblyResult } from "./source-evidence-assembly";

export const ENTITY_IDENTIFICATION_FIXTURE_MARKER = "SYNTHETIC_ENTITY_IDENTIFICATION_FIXTURE_NOT_OPERATIONAL_EVIDENCE" as const;
export const ENTITY_IDENTIFICATION_TIME = "2026-08-01T12:00:00.000Z";

const memory: MemoryStore = { priorities: [], projects: [], signals: [], calendar: [], gmailThreads: [], driveFiles: [], updatedAt: ENTITY_IDENTIFICATION_TIME };

function acquisition(displayNames: readonly string[]): GmailProductionAcquisition {
  const observations = displayNames.map((name, index) => ({
    id: `entity-message-${index + 1}`,
    retrievedAt: ENTITY_IDENTIFICATION_TIME,
    internalDate: "1785585600000",
    payload: { headers: [
      { name: "Message-ID", value: `<entity-message-${index + 1}@example.com>` },
      { name: "From", value: `${name} <sender-${index + 1}@example.com>` },
      { name: "To", value: "operator@example.com" },
      { name: "Date", value: "Sat, 1 Aug 2026 12:00:00 +0000" },
    ] },
  }));
  return Object.freeze({ messages: [], observedAt: ENTITY_IDENTIFICATION_TIME, snapshotId: "google-gmail:entity-identification-snapshot", observations });
}

export function entityIdentificationAssemblyInput(displayNames: readonly string[]): GovernedSourceEvidenceAssemblyInput {
  return {
    gmail: { connector: { acquireRecent: async () => acquisition(displayNames) }, limit: 5 },
    calendar: { connector: { source: "google", listUpcoming: async () => [] }, clock: () => new Date(ENTITY_IDENTIFICATION_TIME), requestedLimit: 5, horizonDays: 7 },
    memory: { read: async () => memory },
    connectorAvailability: { observedAt: ENTITY_IDENTIFICATION_TIME, results: [] },
  };
}

export function realCassieParameter(): { parameter: ExtractedParameter; claimBoundaryEvaluationReference: string; recognizedIntentReference: string } {
  const boundary = evaluateClaimBoundary({ text: "What's Cassie's email?", threadId: "thread:entity-identification", requestId: "request:entity-identification", exchangeId: "exchange:entity-identification", referenceTime: ENTITY_IDENTIFICATION_TIME, createdAt: ENTITY_IDENTIFICATION_TIME });
  const parameter = boundary.evaluation.extractedParameters.find(item => item.name === "personName");
  if (!parameter) throw new Error("Cassie Claim Boundary fixture did not produce a personName parameter");
  return { parameter, claimBoundaryEvaluationReference: boundary.evaluation.claimBoundaryEvaluationId, recognizedIntentReference: boundary.evaluation.matchedRuleIds[0] };
}

export async function assembledEntityIdentificationEvidence(displayNames: readonly string[]): Promise<GovernedSourceEvidenceAssemblyResult> {
  return assembleGovernedSourceEvidence(entityIdentificationAssemblyInput(displayNames));
}

export function entityIdentificationInput(
  assembled: GovernedSourceEvidenceAssemblyResult,
  overrides: Partial<EntityIdentificationEngineInput> = {},
): EntityIdentificationEngineInput {
  const boundary = realCassieParameter();
  return {
    parameter: boundary.parameter,
    communicationEvidence: assembled.communicationEvidence,
    gmailSourceResult: assembled.sourceResults.gmail,
    threadId: "thread:entity-identification",
    requestId: "request:entity-identification",
    exchangeId: "exchange:entity-identification",
    claimBoundaryEvaluationReference: boundary.claimBoundaryEvaluationReference,
    recognizedIntentReference: boundary.recognizedIntentReference,
    createdAt: ENTITY_IDENTIFICATION_TIME,
    ...overrides,
  };
}

export function evidenceWithDisplay(evidence: GovernedCommunicationEvidenceInput, senderDisplayName: string, suffix = senderDisplayName): GovernedCommunicationEvidenceInput {
  return Object.freeze({ ...evidence, senderDisplayName, communicationReference: `${evidence.communicationReference}:${suffix}`, provenanceReference: `${evidence.provenanceReference}:${suffix}`, sourceReference: { ...evidence.sourceReference, resourceId: `${evidence.sourceReference.resourceId}:${suffix}` } });
}
