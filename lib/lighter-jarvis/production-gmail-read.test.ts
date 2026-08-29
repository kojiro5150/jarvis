import { describe, expect, it, vi } from "vitest";
import { loadContentRetrievalPolicy, type ContentRetrievalPolicy } from "../content-retrieval-policy";
import { resolveProductionGmailRead } from "./production-gmail-read";
import { createPendingAuthorization } from "./pending-authorization";
import { proposeGmailRead } from "./gmail-read-authority";
import { proposeCalendarRead } from "./calendar-read-proposal";

const policy: ContentRetrievalPolicy = { policyVersion: "test-v1", rules: [{
  id: "email", match: { connectorType: "email" }, processing: "external_processing_permitted",
  admissibleFields: ["subject", "snippet", "plain_text_body", "attachment_filenames", "attachment_mime_metadata"],
}] };

describe("production identified-message Gmail read", () => {
  it("uses the real development/demo policy to release an identified message subject", async () => {
    const retrieveMessage = vi.fn(async () => ({ subject: "Released subject", snippet: "Not released" }));
    const result = await resolveProductionGmailRead({
      currentUserUtterance: "gmail.read message-1 [subject]",
    }, {
      loadPolicy: () => loadContentRetrievalPolicy("config/content-retrieval-policy.dev.json"),
      createConnector: () => ({ retrieveMessage }),
    });
    expect(result).toMatchObject({ reply: "Subject: Released subject" });
    expect(result.reply).not.toContain("Not released");
    expect(retrieveMessage).toHaveBeenCalledWith("message-1");
  });

  it("uses the real development policy to deterministically release sender, subject, and plain-text body", async () => {
    const retrieveMessage = vi.fn(async () => ({
      sender: "Georgia <georgia@example.com>",
      subject: "Project update",
      plainTextBody: "Deterministic private body",
      snippet: "MUST NOT LEAK",
    }));
    const pendingAuthorizationReference = createPendingAuthorization(proposeGmailRead({
      resource: { resourceId: "message-1", connectorType: "email" as const },
      requestedFields: ["sender", "subject", "plain_text_body"] as const,
      requestingRuntime: "api-lighter-chat:gmail-ordinal-read",
    }));

    const result = await resolveProductionGmailRead({
      currentUserUtterance: "confirm",
      pendingAuthorizationReference,
    }, {
      loadPolicy: () => loadContentRetrievalPolicy("config/content-retrieval-policy.dev.json"),
      createConnector: () => ({ retrieveMessage }),
    });

    expect(result).toMatchObject({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
      reply: "From: Georgia <georgia@example.com>\nSubject: Project update\nPlain text body: Deterministic private body",
    });
    expect(result.reply).not.toContain("MUST NOT LEAK");
    expect(retrieveMessage).toHaveBeenCalledWith("message-1");
  });

  it("preserves the exact field binding and presents governed content deterministically", async () => {
    const retrieveMessage = vi.fn(async () => ({ subject: "Actual governed subject", snippet: "Private snippet" }));
    const createConnector = vi.fn(() => ({ retrieveMessage }));
    const result = await resolveProductionGmailRead({ currentUserUtterance: "gmail.read FMfcgzQhWBjNbnqsJbMxtJtvlSHKtFdH [subject]" }, {
      loadPolicy: vi.fn(async () => policy), createConnector,
    });
    expect(result).toEqual({ handled: true, decision: "ALLOW", reason: "explicit_gmail_read", reply: "Subject: Actual governed subject" });
    expect(retrieveMessage).toHaveBeenCalledWith("FMfcgzQhWBjNbnqsJbMxtJtvlSHKtFdH");
    expect(result.reply).not.toContain("Private snippet");
  });

  it.each([
    "gmail.read", "gmail.read message", "gmail.read message subject", "gmail.read message []",
    "gmail.read message [subject, subject]", "gmail.read message [subject,subject]", "gmail.read message [from]",
  ])("fails malformed syntax without policy or connector construction: %s", async (utterance) => {
    const loadPolicy = vi.fn(async () => policy); const createConnector = vi.fn();
    const result = await resolveProductionGmailRead({ currentUserUtterance: utterance }, { loadPolicy, createConnector });
    expect(result).toMatchObject({ handled: true, reason: "invalid_gmail_read_syntax" });
    expect(result.reply).toContain("gmail.read <message-id>");
    expect(loadPolicy).not.toHaveBeenCalled(); expect(createConnector).not.toHaveBeenCalled();
  });

  it("evaluates authority and resource policy before retrieval", async () => {
    const calls: string[] = [];
    const denied = { ...policy, rules: [{ ...policy.rules[0], processing: "retrieval_prohibited" as const }] };
    const retrieveMessage = vi.fn();
    const result = await resolveProductionGmailRead({ currentUserUtterance: "gmail.read message-1 [subject]" }, {
      loadPolicy: vi.fn(async () => { calls.push("policy"); return denied; }),
      createConnector: vi.fn(() => { calls.push("connector"); return { retrieveMessage }; }),
    });
    expect(calls).toEqual(["policy", "connector"]);
    expect(result).toMatchObject({ handled: true, decision: "ALLOW", reason: "resource_policy_denied" });
    expect(retrieveMessage).not.toHaveBeenCalled();
  });

  it("does not intercept discovery or natural-language Gmail requests", async () => {
    const dependencies = { loadPolicy: vi.fn(), createConnector: vi.fn() };
    await expect(resolveProductionGmailRead({ currentUserUtterance: "search Gmail for invoices" }, dependencies)).resolves.toEqual({ handled: false });
    await expect(resolveProductionGmailRead({ currentUserUtterance: "Read my latest email" }, dependencies)).resolves.toEqual({ handled: false });
  });

  it("confirms the exact server-stored Gmail operation, then rejects replay", async () => {
    const stored = { resource: { resourceId: "stored-message", connectorType: "email" as const },
      requestedFields: ["subject"] as const, requestingRuntime: "api-chat" };
    const pendingAuthorizationReference = createPendingAuthorization(proposeGmailRead(stored));
    const retrieveMessage = vi.fn(async () => ({ subject: "Stored subject" }));
    const dependencies = { loadPolicy: vi.fn(async () => policy), createConnector: vi.fn(() => ({ retrieveMessage })) };
    const confirmed = await resolveProductionGmailRead({ currentUserUtterance: "confirm", pendingAuthorizationReference }, dependencies);
    expect(confirmed).toMatchObject({ decision: "ALLOW", reason: "pending_authorization_confirmed", reply: "Subject: Stored subject" });
    expect(retrieveMessage).toHaveBeenCalledWith("stored-message");
    const replay = await resolveProductionGmailRead({ currentUserUtterance: "confirm", pendingAuthorizationReference }, dependencies);
    expect(replay).toMatchObject({ decision: "ASK", reason: "pending_authorization_already_consumed" });
    expect(retrieveMessage).toHaveBeenCalledOnce();
  });

  it("declines and fails fabricated references closed without acquisition", async () => {
    const stored = { resource: { resourceId: "stored-message", connectorType: "email" as const },
      requestedFields: ["subject"] as const, requestingRuntime: "api-chat" };
    const createConnector = vi.fn(); const loadPolicy = vi.fn();
    const declined = await resolveProductionGmailRead({ currentUserUtterance: "no",
      pendingAuthorizationReference: createPendingAuthorization(proposeGmailRead(stored)) }, { createConnector, loadPolicy });
    expect(declined).toMatchObject({ decision: "DENY", reason: "pending_authorization_declined" });
    const fabricated = await resolveProductionGmailRead({ currentUserUtterance: "confirm",
      pendingAuthorizationReference: { pendingAuthorizationId: "fabricated" } }, { createConnector, loadPolicy });
    expect(fabricated).toMatchObject({ decision: "ASK", reason: "pending_authorization_not_found" });
    expect(createConnector).not.toHaveBeenCalled(); expect(loadPolicy).not.toHaveBeenCalled();
  });

  it("leaves a Calendar pending reference untouched for Calendar handling", async () => {
    const calendar = proposeCalendarRead("What’s on tomorrow?", () => new Date("2026-08-25T00:00:00Z"));
    expect(calendar).not.toBeNull();
    const reference = createPendingAuthorization(calendar!);
    await expect(resolveProductionGmailRead({ currentUserUtterance: "confirm", pendingAuthorizationReference: reference },
      { createConnector: vi.fn(), loadPolicy: vi.fn() })).resolves.toEqual({ handled: false });
  });
});
