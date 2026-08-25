import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createRetrievalAuditRecord,
  evaluateContentRetrievalPolicy,
  loadContentRetrievalPolicy,
  resolveReleasedFields,
  type ContentRetrievalPolicy,
  type ContentResource,
} from ".";

const resource: ContentResource = {
  resourceId: "message-1",
  connectorType: "email",
  senderIdentity: "person@partner.example",
  senderDomain: "partner.example",
  recipientIdentities: ["shared@example.com"],
};

const policy: ContentRetrievalPolicy = {
  policyVersion: "2026-07-29.1",
  rules: [
    {
      id: "shared-account-partner",
      match: { connectorType: "email", senderDomains: ["partner.example"], recipientIdentities: ["shared@example.com"] },
      processing: "external_processing_permitted",
      admissibleFields: ["plain_text_body", "subject"],
    },
    {
      id: "restricted-repository",
      match: { connectorType: "document", repositoryClassifications: ["restricted"] },
      processing: "retrieval_prohibited",
      admissibleFields: [],
    },
  ],
};

describe("content retrieval policy boundary", () => {
  it("is deterministic and records the exact policy version", () => {
    const first = evaluateContentRetrievalPolicy(resource, policy);
    expect(evaluateContentRetrievalPolicy(resource, policy)).toEqual(first);
    expect(first).toMatchObject({ decision: "external_processing_permitted", policyVersion: "2026-07-29.1", matchedRuleId: "shared-account-partner" });
  });

  it("fails closed for missing or invalid policy", () => {
    expect(evaluateContentRetrievalPolicy(resource, null)).toMatchObject({ decision: "retrieval_prohibited", reason: "missing_policy", policyVersion: null });
    expect(evaluateContentRetrievalPolicy(resource, { policyVersion: "", rules: [] })).toMatchObject({ decision: "retrieval_prohibited", reason: "invalid_policy" });
  });

  it("fails closed for unknown resources and unmatched known resources", () => {
    expect(evaluateContentRetrievalPolicy({ resourceId: "x", connectorType: "chat" }, policy).reason).toBe("unknown_resource");
    expect(evaluateContentRetrievalPolicy({ resourceId: "event", connectorType: "calendar" }, policy).reason).toBe("no_matching_rule");
  });

  it("honours explicit prohibitions", () => {
    const result = evaluateContentRetrievalPolicy({ resourceId: "doc", connectorType: "document", repositoryClassification: "restricted" }, policy);
    expect(result).toMatchObject({ decision: "retrieval_prohibited", admissibleFields: [] });
  });

  it("releases only admissible fields after raw external processing is permitted", () => {
    const evaluation = evaluateContentRetrievalPolicy(resource, policy);
    expect(resolveReleasedFields(evaluation, ["subject", "importance", "html_body", "subject"])).toEqual(["subject"]);
    expect(resolveReleasedFields({ ...evaluation, decision: "redacted_processing_only" }, ["subject"])).toEqual([]);
    expect(resolveReleasedFields({ ...evaluation, decision: "approved_environment_only" }, ["subject"])).toEqual([]);
  });

  it("rejects policies that admit connector significance", () => {
    const unsafe = { ...policy, rules: [{ ...policy.rules[0], admissibleFields: ["subject", "importance"] }] };
    expect(evaluateContentRetrievalPolicy(resource, unsafe).reason).toBe("invalid_policy");
  });

  it("creates content-free audit records for every attempt", () => {
    const evaluation = evaluateContentRetrievalPolicy(resource, policy);
    const request = { resource, requestedFields: ["subject", "html_body"], requestingRuntime: "future-conversation-runtime" };
    expect(createRetrievalAuditRecord({
      retrievalId: "retrieval-1", request, evaluation, releasedFields: ["subject"], transformationStatus: "not_required",
      timestamp: "2026-07-29T12:00:00.000Z", outcome: "permitted",
    })).toEqual({
      retrievalId: "retrieval-1", request, policyDecision: "external_processing_permitted", policyVersion: "2026-07-29.1",
      requestedFields: ["subject", "html_body"], releasedFields: ["subject"],
      transformationStatus: "not_required", requestingRuntime: "future-conversation-runtime",
      timestamp: "2026-07-29T12:00:00.000Z", outcome: "permitted",
    });
  });
});

describe("deployment configuration", () => {
  it("loads the real bounded development/demo Gmail policy", async () => {
    const configured = await loadContentRetrievalPolicy("config/content-retrieval-policy.dev.json");
    expect(configured).not.toBeNull();
    expect(evaluateContentRetrievalPolicy(resource, configured)).toMatchObject({
      policyVersion: "dev-demo-2026-08-25.1",
      decision: "external_processing_permitted",
      matchedRuleId: "dev-demo-identified-gmail-subject",
      admissibleFields: ["subject"],
    });
    expect(resolveReleasedFields(evaluateContentRetrievalPolicy(resource, configured), [
      "plain_text_body", "subject", "snippet",
    ])).toEqual(["subject"]);
  });

  it("loads explicit configuration and returns null for absent or malformed configuration", async () => {
    const directory = await mkdtemp(join(tmpdir(), "retrieval-policy-"));
    const valid = join(directory, "policy.json");
    const invalid = join(directory, "invalid.json");
    await writeFile(valid, JSON.stringify(policy));
    await writeFile(invalid, "not json");
    await expect(loadContentRetrievalPolicy(valid)).resolves.toEqual(policy);
    await expect(loadContentRetrievalPolicy(undefined)).resolves.toBeNull();
    await expect(loadContentRetrievalPolicy(invalid)).resolves.toBeNull();
  });

  it("protects normal local production policy paths from git add", () => {
    const ignored = execFileSync("git", ["check-ignore", "config/content-retrieval-policy.local.json"], { encoding: "utf8" }).trim();
    expect(ignored).toBe("config/content-retrieval-policy.local.json");
  });
});
