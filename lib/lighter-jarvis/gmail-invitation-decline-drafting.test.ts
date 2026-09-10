import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContentRetrievalPolicy } from "../content-retrieval-policy";
import { createGmailPrivateReleaseReference, resetGmailPrivateReleaseReferencesForTests } from "./gmail-private-release-reference";
import { resolveGmailInvitationDeclineDraft, type GmailInvitationDeclineDraftDependencies } from "./gmail-invitation-decline-drafting";
import { GMAIL_INVITATION_DECLINE_AUTHORITY_PROMPT, GMAIL_INVITATION_DECLINE_PROCESSING_LIMIT, GMAIL_INVITATION_DECLINE_UNAVAILABLE } from "./gmail-invitation-decline-draft-contract";

const instruction = "Draft a reply to Raman, saying thank you for the invite but politely decline.";
const permittedPolicy: ContentRetrievalPolicy = {
  policyVersion: "test-v1",
  rules: [{ id: "email", match: { connectorType: "email" }, processing: "external_processing_permitted", admissibleFields: ["sender", "subject", "plain_text_body"] }],
};

function release(body = "LinkedIn invitation") {
  return createGmailPrivateReleaseReference({
    resourceId: "gmail-message-1",
    requestedFields: ["sender", "subject", "plain_text_body"],
    presentation: `From: Raman Bhola <raman@example.invalid>\nSubject: Invitation\nPlain text body: ${body}`,
  });
}

function dependencies(body = "LinkedIn invitation", model = vi.fn(async () => JSON.stringify({
  sender: "Raman Bhola <raman@example.invalid>", subject: "Invitation",
  draft: "Hi Raman, thank you for the invitation. I appreciate it, but I must politely decline.",
}))): GmailInvitationDeclineDraftDependencies {
  return {
    createConnector: () => ({ retrieveMessage: vi.fn(async () => ({
      sender: "Raman Bhola <raman@example.invalid>", subject: "Invitation", plainTextBody: body,
    })) }),
    loadPolicy: async () => permittedPolicy,
    callDraftModel: model,
  };
}

async function propose(reference: unknown, deps: GmailInvitationDeclineDraftDependencies) {
  return resolveGmailInvitationDeclineDraft({ currentUserUtterance: instruction, gmailPrivateReleaseReference: reference }, deps);
}

describe("governed Gmail invitation-decline drafting", () => {
  beforeEach(resetGmailPrivateReleaseReferencesForTests);

  it("creates fresh purpose-bound authority without reading or calling the model", async () => {
    const deps = dependencies();
    const result = await propose(release(), deps);
    expect(result).toMatchObject({ handled: true, status: "selected", reply: GMAIL_INVITATION_DECLINE_AUTHORITY_PROMPT,
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) } });
    expect(deps.callDraftModel).not.toHaveBeenCalled();
  });

  it("re-reads the exact message once and returns a grounded proposed draft", async () => {
    const deps = dependencies();
    const selected = await propose(release(), deps);
    const result = await resolveGmailInvitationDeclineDraft({ currentUserUtterance: "yes", pendingAuthorizationReference: selected.pendingAuthorizationReference }, deps);
    expect(result).toMatchObject({ handled: true, status: "drafted", draftRelease: true, pendingAuthorizationReference: null });
    expect(result.reply).toContain("thank you for the invitation");
    expect(result.reply).toContain("This message has not been sent.");
    expect(JSON.stringify(result)).not.toContain("gmail-message-1");
    const repeated = await resolveGmailInvitationDeclineDraft({ currentUserUtterance: "yes", pendingAuthorizationReference: selected.pendingAuthorizationReference }, deps);
    expect(repeated.status).not.toBe("drafted");
    expect(deps.callDraftModel).toHaveBeenCalledOnce();
  });

  it("rejects the historical fabricated lunch and Thursday details", async () => {
    const model = vi.fn(async () => JSON.stringify({ sender: "Raman Bhola <raman@example.invalid>", subject: "Invitation",
      draft: "Thank you for the invitation, but I decline lunch on Thursday." }));
    const deps = dependencies("LinkedIn invitation", model);
    const selected = await propose(release(), deps);
    const result = await resolveGmailInvitationDeclineDraft({ currentUserUtterance: "yes", pendingAuthorizationReference: selected.pendingAuthorizationReference }, deps);
    expect(result).toMatchObject({ status: "failed", reply: GMAIL_INVITATION_DECLINE_UNAVAILABLE });
  });

  it("fails before model invocation above the 16,000-code-unit admission bound", async () => {
    const body = "x".repeat(16_000);
    const deps = dependencies(body);
    const selected = await propose(release(body), deps);
    const result = await resolveGmailInvitationDeclineDraft({ currentUserUtterance: "yes", pendingAuthorizationReference: selected.pendingAuthorizationReference }, deps);
    expect(result).toMatchObject({ status: "failed", reply: GMAIL_INVITATION_DECLINE_PROCESSING_LIMIT });
    expect(deps.callDraftModel).not.toHaveBeenCalled();
  });

  it("treats a named addressee as a post-read constraint, never a selector", async () => {
    const model = vi.fn(async () => "unsafe");
    const deps: GmailInvitationDeclineDraftDependencies = {
      ...dependencies("LinkedIn invitation", model),
      createConnector: () => ({ retrieveMessage: vi.fn(async () => ({
        sender: "Georgia McDonald <georgia@example.invalid>", subject: "Invitation", plainTextBody: "LinkedIn invitation",
      })) }),
    };
    const selected = await propose(release(), deps);
    const result = await resolveGmailInvitationDeclineDraft({ currentUserUtterance: "yes", pendingAuthorizationReference: selected.pendingAuthorizationReference }, deps);
    expect(result.reply).toContain("named addressee does not match");
    expect(model).not.toHaveBeenCalled();
  });
});
