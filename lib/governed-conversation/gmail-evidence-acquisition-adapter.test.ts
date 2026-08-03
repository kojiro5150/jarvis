import { describe, expect, it, vi } from "vitest";
import type { GmailProductionAcquisition } from "../connectors/google/gmail";
import { acquireGovernedGmailEvidence } from "./gmail-evidence-acquisition-adapter";

const acquisition = (observations: GmailProductionAcquisition["observations"] = [Object.freeze({
  id: "provider-1", threadId: "thread-1", internalDate: "1767261600000", retrievedAt: "2026-01-02T10:00:00.000Z",
  payload: { headers: [{ name: "Message-ID", value: "<canonical@example.com>" }, { name: "From", value: "Sender <sender@example.com>" }, { name: "To", value: "recipient@example.com" }, { name: "Date", value: "Thu, 1 Jan 2026 10:00:00 +0000" }] },
})]): GmailProductionAcquisition => Object.freeze({ messages: [], observations: Object.freeze(observations), observedAt: "2026-01-02T10:00:00.000Z", snapshotId: "google-gmail:snapshot" });

describe("Gmail acquisition adapter", () => {
  it("runs canonical acquisition, projection, and unchanged publisher without mutation", async () => {
    const value = acquisition(); const before = structuredClone(value); const acquireRecent = vi.fn().mockResolvedValue(value);
    const result = await acquireGovernedGmailEvidence({ connector: { acquireRecent }, limit: 5 });
    expect(acquireRecent).toHaveBeenCalledWith(5); expect(value).toEqual(before); expect(result.status).toBe("available");
    expect(result.evidence[0]).toMatchObject({ communicationReference: "google-gmail:message:provider-1", retrievalTime: "2026-01-02T10:00:00.000Z", senderDisplayName: "Sender", policyReference: "governed-gmail-conversational-metadata-disclosure.v2", compatibilityBoundary: "gmail_metadata_non_authoritative_conversation_context.v1" });
    expect(result.evidence[0]).not.toHaveProperty("contentDigest");
  });
  it("distinguishes successful emptiness from unavailable acquisition", async () => {
    expect((await acquireGovernedGmailEvidence({ connector: { acquireRecent: async () => acquisition([]) } })).status).toBe("available");
    const failed = await acquireGovernedGmailEvidence({ connector: { acquireRecent: async () => { throw new Error("provider secret"); } } });
    expect(failed).toEqual({ status: "unavailable", evidence: [], failureReason: "gmail_acquisition_unavailable" }); expect(JSON.stringify(failed)).not.toContain("secret");
  });
  it("keeps a bare mailbox display name absent through canonical acquisition and publication", async () => {
    const bare = acquisition([{
      ...acquisition().observations[0],
      payload: { headers: acquisition().observations[0].payload?.headers?.map(header => header.name === "From" ? { ...header, value: "decision@substack.com" } : header) },
    }]);
    const result = await acquireGovernedGmailEvidence({ connector: { acquireRecent: async () => bare } });
    expect(result.evidence[0]).not.toHaveProperty("senderDisplayName");
  });
});
