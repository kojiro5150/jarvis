import { describe, expect, it } from "vitest";
import { authorizeGmailCapability } from "./gmail-authority";

const request = {
  operation: "governed_gmail_retrieval" as const,
  request: { resource: { connectorType: "email" as const, resourceId: "message-1", senderDomain: "example.test" },
    requestedFields: ["subject", "plain_text_body"] as const, requestingRuntime: "api-chat" },
};

describe("exact gmail.read authority", () => {
  it("allows only an exact operation utterance", () => {
    const result = authorizeGmailCapability({ capability: request,
      currentUserUtterance: "gmail.read message-1 [subject,plain_text_body]" });
    expect(result).toMatchObject({ decision: "ALLOW", operation: { capability: "gmail.read", resourceId: "message-1",
      requestedFields: ["subject", "plain_text_body"] } });
  });

  it("stores the exact operation for opaque confirmation and ignores replacement request parameters", () => {
    const pending = authorizeGmailCapability({ capability: request, currentUserUtterance: "please read that email" });
    expect(pending).toMatchObject({ decision: "ASK", operation: null,
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) } });
    const confirmed = authorizeGmailCapability({ currentUserUtterance: "confirm", capability: { ...request,
      request: { ...request.request, resource: { ...request.request.resource, resourceId: "attacker-choice" }, requestedFields: ["snippet"] },
      pendingAuthorizationReference: pending.pendingAuthorizationReference } });
    expect(confirmed).toMatchObject({ decision: "ALLOW", operation: { resourceId: "message-1",
      requestedFields: ["subject", "plain_text_body"], request: { resource: { resourceId: "message-1" } } } });
  });

  it("does not authorize a manufactured pending reference", () => {
    expect(authorizeGmailCapability({ currentUserUtterance: "confirm", capability: { ...request,
      pendingAuthorizationReference: { pendingAuthorizationId: "manufactured" } } })).toMatchObject({ decision: "ASK", operation: null });
  });
});
