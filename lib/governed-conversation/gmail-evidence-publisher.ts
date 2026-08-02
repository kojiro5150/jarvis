import type { ProductionGmailRecipientEvidence } from "../executive-context/gmail-production-evidence";
import type { GovernedCommunicationEvidenceInput } from "./projection-composer";

export const GMAIL_CONVERSATIONAL_COMPATIBILITY_BOUNDARY = "gmail_metadata_non_authoritative_conversation_context.v1";
export const GMAIL_CONVERSATIONAL_DISCLOSURE_POLICY = "governed-gmail-conversational-metadata-disclosure.v1";
export const GMAIL_CONVERSATIONAL_CONTENT_KIND = "gmail_communication_metadata";
export const GMAIL_CONVERSATIONAL_SOURCE_ID = "google-gmail";
export const GMAIL_CONVERSATIONAL_SOURCE_FIELD = "communication_metadata";

const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const timestamp = (value: unknown): value is string => nonempty(value) && Number.isFinite(Date.parse(value));

export function publishGmailEvidence(input: ProductionGmailRecipientEvidence): readonly GovernedCommunicationEvidenceInput[] {
  if (input.sourceId !== GMAIL_CONVERSATIONAL_SOURCE_ID || input.availability !== "available") return Object.freeze([]);
  return Object.freeze(input.communications.flatMap(observation => {
    const id = observation.provenance?.gmailMessageId;
    const retrievedAt = observation.provenance?.retrievedAt;
    if (!nonempty(id) || !timestamp(retrievedAt) || !nonempty(observation.messageId) || observation.recipientEvidence == null) return [];
    const communicationReference = `${GMAIL_CONVERSATIONAL_SOURCE_ID}:message:${id}`;
    return [Object.freeze({
      communicationReference,
      recipientEvidenceReference: `${communicationReference}#recipient-evidence`,
      sourceReference: Object.freeze({ sourceId: GMAIL_CONVERSATIONAL_SOURCE_ID, resourceId: id, field: GMAIL_CONVERSATIONAL_SOURCE_FIELD, observedAt: retrievedAt }),
      provenanceReference: `${communicationReference}#provenance`, retrievalTime: retrievedAt, available: true,
      contentKind: GMAIL_CONVERSATIONAL_CONTENT_KIND, compatibilityBoundary: GMAIL_CONVERSATIONAL_COMPATIBILITY_BOUNDARY,
      policyReference: GMAIL_CONVERSATIONAL_DISCLOSURE_POLICY,
    })];
  }));
}
