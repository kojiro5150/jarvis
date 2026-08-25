import { describe, expect, it, vi } from "vitest";
import type { ContentRetrievalPolicy } from "../content-retrieval-policy";
import { createSituationalAwareness, type OperationalCommitment } from "../executive-operating-system/situational-awareness/model";
import { parseChatCapabilityRequest, routeChatCapability } from ".";

const connector = () => ({ retrieveMessage: vi.fn(async () => ({
  subject: "Synthetic subject", plainTextBody: "Synthetic body", importance: "connector-only",
})) });
const permitted: ContentRetrievalPolicy = { policyVersion: "synthetic-v1", rules: [{
  id: "synthetic-email", match: { connectorType: "email", senderDomains: ["synthetic.invalid"] },
  processing: "external_processing_permitted", admissibleFields: ["subject", "plain_text_body"],
}] };
const dependencies = (gmailConnector = connector(), policy: ContentRetrievalPolicy | null = permitted) => ({
  gmailConnector, loadPolicy: vi.fn(async () => policy),
});

const commitment = (id: string, startsAt?: string, dueAt?: string): OperationalCommitment => ({
  id, title: id, kind: "meeting", status: "scheduled", roleIds: [], projectIds: [],
  ...(startsAt ? { startsAt } : {}), ...(dueAt ? { dueAt } : {}),
});
const executiveRequest = {
  operation: "executive_context" as const,
  snapshot: { snapshotId: "synthetic-snapshot", observedAt: "2026-07-29T08:00:00Z", state: createSituationalAwareness({
    identity: { userId: "synthetic-user", displayName: "Synthetic Executive" },
    commitments: [commitment("active", "2026-07-29T09:00:00Z", "2026-07-29T11:00:00Z"), commitment("unknown", undefined, "2026-07-29T12:00:00Z")],
    communications: [{ id: "synthetic-message", sender: "sender@synthetic.invalid", recipients: ["user@synthetic.invalid"], sentAt: "2026-07-29T07:00:00Z", references: [] }],
  }) },
  computationWindow: { currentInstant: "2026-07-29T10:00:00Z", start: "2026-07-29T08:00:00Z", end: "2026-07-29T14:00:00Z" },
};
const gmailRequest = { operation: "governed_gmail_retrieval" as const, request: {
  resource: { resourceId: "synthetic-message", connectorType: "email" as const, senderDomain: "synthetic.invalid" },
  requestedFields: ["subject", "plain_text_body"] as const, requestingRuntime: "api-chat",
}, currentUserUtterance: "gmail.read synthetic-message [subject,plain_text_body]" };

describe("explicit chat capability routing", () => {
  it("derives immutable ExecutiveContext through AvailabilityEngine without Gmail content", async () => {
    const deps = dependencies();
    const result = await routeChatCapability(executiveRequest, deps);
    expect(result).toMatchObject({ operation: "executive_context", outcome: "success", context: {
      commitments: { totalCount: 2, activeCommitmentIds: ["active"] }, communications: { totalCount: 1 },
      provenance: { situationalAwareness: { snapshotId: "synthetic-snapshot" }, availability: { engine: "availability" } },
      unknowns: expect.arrayContaining([{ kind: "unread_state_unavailable", field: "communications.unreadCount" }]),
    } });
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.outcome === "success" && Object.isFrozen(result.context.commitments)).toBe(true);
    expect(deps.gmailConnector.retrieveMessage).not.toHaveBeenCalled();
    expect(deps.loadPolicy).not.toHaveBeenCalled();
  });

  it("returns a bounded context failure", async () => {
    const malformed = { ...executiveRequest, computationWindow: { ...executiveRequest.computationWindow, currentInstant: "not-an-instant" } };
    await expect(routeChatCapability(malformed, dependencies())).resolves.toMatchObject({ operation: "executive_context", outcome: "failed" });
  });

  it("routes one identified message through the governed adapter and excludes connector significance", async () => {
    const deps = dependencies();
    const result = await routeChatCapability(gmailRequest, deps);
    expect(deps.gmailConnector.retrieveMessage).toHaveBeenCalledWith("synthetic-message");
    expect(result).toMatchObject({ outcome: "permitted", result: { policyVersion: "synthetic-v1", content: { subject: "Synthetic subject", plainTextBody: "Synthetic body" }, audit: { policyVersion: "synthetic-v1" } } });
    expect(result.outcome === "permitted" && result.result.content).not.toHaveProperty("importance");
  });

  it.each(["retrieval_prohibited", "approved_environment_only", "redacted_processing_only"] as const)("fails closed for %s", async (processing) => {
    const gmail = connector();
    const policy: ContentRetrievalPolicy = { policyVersion: "deny-v1", rules: [{ ...permitted.rules[0], processing }] };
    const result = await routeChatCapability(gmailRequest, dependencies(gmail, policy));
    expect(result).toMatchObject({ outcome: "denied", result: { audit: { policyDecision: processing, outcome: "denied" } } });
    expect(gmail.retrieveMessage).not.toHaveBeenCalled();
  });

  it("rejects malformed and unrestricted operations at the explicit boundary", () => {
    expect(parseChatCapabilityRequest({ messages: [{ role: "user", content: "ordinary chat" }] })).toBeNull();
    expect(parseChatCapabilityRequest({ operation: "search_gmail", query: "anything" })).toBeNull();
    expect(() => parseChatCapabilityRequest({ operation: "governed_gmail_retrieval", request: { resource: { connectorType: "email" }, requestedFields: [] } })).toThrow(/identified/);
  });
});
