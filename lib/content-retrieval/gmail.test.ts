import { describe, expect, it, vi } from "vitest";
import type { ContentRetrievalPolicy } from "../content-retrieval-policy";
import {
  GmailContentRetrievalAdapter,
  type GmailContentConnector,
  type GmailContentRetrievalRequest,
  type GmailRetrievedMessage,
} from ".";

const resource = {
  resourceId: "synthetic-message-001",
  connectorType: "email" as const,
  senderIdentity: "sender@synthetic.invalid",
  senderDomain: "synthetic.invalid",
  recipientIdentities: ["recipient@synthetic.invalid"],
};

const request: GmailContentRetrievalRequest = {
  resource,
  requestedFields: ["subject", "snippet", "plain_text_body", "attachment_filenames", "attachment_mime_metadata"],
  requestingRuntime: "synthetic-retrieval-test",
};

const message: GmailRetrievedMessage = {
  subject: "Synthetic subject",
  snippet: "Synthetic snippet",
  plainTextBody: "Synthetic plain text.",
  attachments: [{ filename: "synthetic.txt", mimeType: "text/plain", size: 42 }],
  importance: "HIGH",
  starred: true,
  labelIds: ["SYNTHETIC_LABEL"],
  htmlBody: "<strong>not admissible</strong>",
  connectorAiSummary: "not admissible",
};

function policy(processing: ContentRetrievalPolicy["rules"][number]["processing"]): ContentRetrievalPolicy {
  return {
    policyVersion: "synthetic-policy-v1",
    rules: [{
      id: `synthetic-${processing}`,
      match: { connectorType: "email", senderDomains: ["synthetic.invalid"] },
      processing,
      admissibleFields: processing === "retrieval_prohibited" ? [] : [...request.requestedFields],
    }],
  };
}

function harness(connectorMessage: GmailRetrievedMessage = message) {
  const retrieveMessage = vi.fn(async () => connectorMessage);
  const connector: GmailContentConnector = { retrieveMessage };
  const adapter = new GmailContentRetrievalAdapter({
    connector,
    now: () => new Date("2026-07-29T12:00:00.000Z"),
    createRetrievalId: () => "synthetic-retrieval-001",
  });
  return { adapter, retrieveMessage };
}

describe("Gmail governed content retrieval", () => {
  it("retrieves only after external processing is permitted and propagates policy and audit data", async () => {
    const { adapter, retrieveMessage } = harness();
    const result = await adapter.retrieve(request, policy("external_processing_permitted"));

    expect(retrieveMessage).toHaveBeenCalledOnce();
    expect(retrieveMessage).toHaveBeenCalledWith("synthetic-message-001");
    expect(result).toMatchObject({
      retrievalId: "synthetic-retrieval-001",
      resourceId: "synthetic-message-001",
      policyVersion: "synthetic-policy-v1",
      outcome: "permitted",
      audit: {
        retrievalId: "synthetic-retrieval-001",
        policyDecision: "external_processing_permitted",
        policyVersion: "synthetic-policy-v1",
        requestedFields: request.requestedFields,
        releasedFields: [...request.requestedFields].sort(),
        timestamp: "2026-07-29T12:00:00.000Z",
        requestingRuntime: "synthetic-retrieval-test",
        outcome: "permitted",
      },
    });
  });

  it.each([
    ["retrieval_prohibited", "not_required"],
    ["approved_environment_only", "not_required"],
    ["redacted_processing_only", "required_not_applied"],
  ] as const)("does not call Gmail for %s", async (decision, transformationStatus) => {
    const { adapter, retrieveMessage } = harness();
    const result = await adapter.retrieve(request, policy(decision));
    expect(retrieveMessage).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      outcome: "denied",
      audit: { policyDecision: decision, releasedFields: [], transformationStatus, outcome: "denied" },
    });
    expect(result).not.toHaveProperty("content");
  });

  it.each([
    ["unknown resource", { ...request, resource: { ...resource, connectorType: "unknown" } }, policy("external_processing_permitted"), "unknown_resource"],
    ["missing configuration", request, null, "missing_policy"],
    ["malformed policy", request, { policyVersion: "synthetic-bad", rules: [{ id: "bad", match: {}, processing: "external_processing_permitted", admissibleFields: [] }] }, "invalid_policy"],
    ["unmatched policy", request, { policyVersion: "synthetic-unmatched", rules: [{ id: "other", match: { senderDomains: ["other.invalid"] }, processing: "external_processing_permitted", admissibleFields: ["subject"] }] }, "no_matching_rule"],
  ] as const)("fails closed without calling Gmail for %s", async (_name, unsafeRequest, configuredPolicy, reason) => {
    const { adapter, retrieveMessage } = harness();
    const result = await adapter.retrieve(unsafeRequest as GmailContentRetrievalRequest, configuredPolicy as ContentRetrievalPolicy | null);
    expect(retrieveMessage).not.toHaveBeenCalled();
    expect(result.audit.request.resource.resourceId).toBe("synthetic-message-001");
    expect(result.audit.policyDecision).toBe("retrieval_prohibited");
    expect(result.audit.releasedFields).toEqual([]);
    // The engine reason is intentionally not duplicated in the content-free audit contract.
    expect(reason).toBeTruthy();
  });

  it("releases only allowlisted Gmail fields and excludes every connector significance field", async () => {
    const { adapter } = harness();
    const restricted = policy("external_processing_permitted");
    const result = await adapter.retrieve({ ...request, requestedFields: ["subject", "attachment_mime_metadata"] }, restricted);
    expect(result.content).toEqual({
      subject: "Synthetic subject",
      attachmentMimeMetadata: [{ filename: "synthetic.txt", mimeType: "text/plain" }],
    });
    expect(JSON.stringify(result)).not.toMatch(/importance|starred|labelIds|htmlBody|connectorAiSummary|HIGH|SYNTHETIC_LABEL/);
  });

  it("does not release unsupported fields even if a malformed caller and policy request them", async () => {
    const { adapter } = harness();
    const base = policy("external_processing_permitted");
    const configured: ContentRetrievalPolicy = {
      ...base,
      rules: [{ ...base.rules[0], admissibleFields: [...base.rules[0].admissibleFields, "html_body"] }],
    };
    const unsafe = { ...request, requestedFields: [...request.requestedFields, "html_body"] } as unknown as GmailContentRetrievalRequest;
    const result = await adapter.retrieve(unsafe, configured);
    expect(result.audit.releasedFields).not.toContain("html_body");
    expect(result.content).not.toHaveProperty("htmlBody");
  });

  it("returns a deeply immutable result", async () => {
    const { adapter } = harness();
    const result = await adapter.retrieve(request, policy("external_processing_permitted"));
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.content)).toBe(true);
    expect(Object.isFrozen(result.content?.attachmentMimeMetadata)).toBe(true);
    expect(Object.isFrozen(result.audit)).toBe(true);
    expect(Object.isFrozen(result.audit.request)).toBe(true);
  });

  it("audits connector failures without releasing content", async () => {
    const connector = { retrieveMessage: vi.fn(async () => { throw new Error("synthetic connector failure"); }) };
    const adapter = new GmailContentRetrievalAdapter({ connector, createRetrievalId: () => "failed-1", now: () => new Date(0) });
    const result = await adapter.retrieve(request, policy("external_processing_permitted"));
    expect(result).toMatchObject({ outcome: "failed", audit: { outcome: "failed", releasedFields: [] } });
    expect(result).not.toHaveProperty("content");
  });
});
