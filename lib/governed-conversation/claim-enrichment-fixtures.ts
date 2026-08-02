import type { GmailProductionAcquisition } from "../connectors/google/gmail";
import type { MemoryStore } from "../memory/schema";
import type { GovernedClaimSet } from "./claim-\u0062oundary-types";
import { cassieBoundaryInput } from "./claim-\u0062oundary-fixtures";
import type { GovernedEvidenceResolver, ResolvedCommunicationAddressAssertion } from "./claim-enrichment-types";
import type { GovernedCommunicationEvidenceInput } from "./projection-composer";
import type { GovernedSourceEvidenceAssemblyInput } from "./source-evidence-assembly";

export const CLAIM_ENRICHMENT_FIXTURE_MARKER = "SYNTHETIC_CLAIM_ENRICHMENT_FIXTURE_NOT_OPERATIONAL_EVIDENCE" as const;
export const CASSIE_ADDRESS = "cassie@example.com";
export const CASSIE_ENTITY_ID = "person:cassie";
export const ENRICHMENT_TIME = "2026-08-01T12:00:00.000Z";
const gmail: GmailProductionAcquisition = Object.freeze({ messages: [], observedAt: ENRICHMENT_TIME, snapshotId: "google-gmail:cassie-snapshot", observations: Object.freeze([{ id: "cassie-message-1", retrievedAt: ENRICHMENT_TIME, internalDate: "1785585600000", payload: { headers: [{ name: "Message-ID", value: "<cassie-message-1@example.com>" }, { name: "From", value: CASSIE_ADDRESS }, { name: "To", value: "operator@example.com" }, { name: "Date", value: "Sat, 1 Aug 2026 12:00:00 +0000" }] } }]) });
const memory: MemoryStore = { priorities: [], projects: [], signals: [], calendar: [], gmailThreads: [], driveFiles: [], updatedAt: ENRICHMENT_TIME };

export const cassieAssemblyInput = (): GovernedSourceEvidenceAssemblyInput => ({
  gmail: { connector: { acquireRecent: async () => gmail }, limit: 5 },
  calendar: { connector: { source: "google", listUpcoming: async () => [] }, clock: () => new Date(ENRICHMENT_TIME), requestedLimit: 5, horizonDays: 7 },
  memory: { read: async () => memory },
  connectorAvailability: { observedAt: ENRICHMENT_TIME, results: [{ connectorId: "calendar", source: "google", connected: true }, { connectorId: "gmail", source: "google", connected: true }, { connectorId: "drive", source: "local", connected: false }] },
});

export const claimParametersFromCassieEvaluation = (claimSet: GovernedClaimSet, extractedParameters: readonly { readonly segmentId: string; readonly name: string; readonly value: string }[]) => Object.freeze(Object.fromEntries(claimSet.segmentLinks.flatMap(link => { const entity = extractedParameters.find(item => item.segmentId === link.segmentId && item.name === "entityId"); return entity ? [[link.claimId, Object.freeze({ entityId: entity.value })]] : []; })));

export function resolverForAddress(address = CASSIE_ADDRESS): GovernedEvidenceResolver {
  return Object.freeze({ resolveCommunicationEvidence: (evidence: GovernedCommunicationEvidenceInput) => Object.freeze([Object.freeze<ResolvedCommunicationAddressAssertion>({ evidenceReference: evidence.communicationReference, sourceReference: evidence.sourceReference, entityId: CASSIE_ENTITY_ID, address, provenanceReference: evidence.provenanceReference, observedAt: evidence.retrievalTime, available: evidence.available, policyReference: evidence.policyReference, fieldCoverage: "complete", scopeComplete: true, fresh: true })]) });
}
export { cassieBoundaryInput };
