import { describe, expect, it } from "vitest";
import type { ProductionGmailRecipientEvidence } from "../executive-context/gmail-production-evidence";
import type { NormalizedGmailObservation } from "../executive-operating-system/situational-awareness/projection/adapters/gmail/types";
import { publishGmailEvidence } from "./gmail-evidence-publisher";

const observation = (id = "provider-1", recipientEvidence: "available" | "unknown" = "available"): NormalizedGmailObservation => ({ messageId: `canonical-${id}`, sender: "sender@example.com", recipients: [], recipientEvidence, sentAt: "2026-01-01T10:00:00Z", references: [], provenance: { gmailMessageId: id, retrievedAt: "2026-01-02T10:00:00Z", hasAttachment: false, unread: false, multipart: false, htmlOnly: false } });
const bundle = (communications = [observation()]): ProductionGmailRecipientEvidence => ({ sourceId: "google-gmail", availability: "available", state: "available", communications });
describe("Gmail evidence publisher", () => {
  it("maps canonical metadata exactly and preserves order and unknown recipient state", () => {
    const input = bundle([observation("one", "unknown"), observation("two")]); const before = structuredClone(input); const result = publishGmailEvidence(input);
    expect(result.map(x => x.communicationReference)).toEqual(["google-gmail:message:one", "google-gmail:message:two"]);
    expect(result[0]).toEqual({ communicationReference: "google-gmail:message:one", recipientEvidenceReference: "google-gmail:message:one#recipient-evidence", sourceReference: { sourceId: "google-gmail", resourceId: "one", field: "communication_metadata", observedAt: "2026-01-02T10:00:00Z" }, provenanceReference: "google-gmail:message:one#provenance", retrievalTime: "2026-01-02T10:00:00Z", available: true, contentKind: "gmail_communication_metadata", compatibilityBoundary: "gmail_metadata_non_authoritative_conversation_context.v1", policyReference: "governed-gmail-conversational-metadata-disclosure.v2" });
    expect("contentDigest" in result[0]).toBe(false); expect(input).toEqual(before); expect(Object.isFrozen(result)).toBe(true); expect(Object.isFrozen(result[0])).toBe(true); expect(Object.isFrozen(result[0].sourceReference)).toBe(true); expect(publishGmailEvidence(structuredClone(input))).toEqual(result);
  });
  it("passes through only the canonical display name and never reparses sender", () => {
    const absent = publishGmailEvidence(bundle([{ ...observation(), sender: "Cassie Kozyrkov <decision@substack.com>" }]));
    expect(absent[0]).not.toHaveProperty("senderDisplayName");
    const canonical = publishGmailEvidence(bundle([{ ...observation(), sender: "Different Raw Value <different@example.com>", senderDisplayName: "Canonical Structured Value" }]));
    expect(canonical[0]).toHaveProperty("senderDisplayName", "Canonical Structured Value");
    expect(Object.keys(canonical[0]).filter(key => key === "policyReference")).toHaveLength(1);
  });
  it("fails closed for unavailable, noncanonical, missing identity, and missing retrieval time", () => {
    expect(publishGmailEvidence({ ...bundle(), availability: "unavailable" })).toEqual([]);
    expect(publishGmailEvidence({ ...bundle(), sourceId: "local" } as unknown as ProductionGmailRecipientEvidence)).toEqual([]);
    expect(publishGmailEvidence(bundle([{ ...observation(), provenance: { ...observation().provenance, gmailMessageId: "" } }]))).toEqual([]);
    expect(publishGmailEvidence(bundle([{ ...observation(), provenance: { ...observation().provenance, retrievedAt: undefined } } as unknown as ReturnType<typeof observation>]))).toEqual([]);
  });
});
