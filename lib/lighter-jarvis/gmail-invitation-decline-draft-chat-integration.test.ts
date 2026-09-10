import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContentRetrievalPolicy } from "../content-retrieval-policy";
import { createLighterChatHandler } from "./chat-handler";
import { createGmailPrivateReleaseReference, resetGmailPrivateReleaseReferencesForTests } from "./gmail-private-release-reference";
import type { GmailInvitationDeclineDraftDependencies } from "./gmail-invitation-decline-drafting";
import { GMAIL_INVITATION_DECLINE_AUTHORITY_PROMPT } from "./gmail-invitation-decline-draft-contract";

const request = (messages: readonly { role: "user" | "assistant"; content: string }[], extra: Record<string, unknown> = {}) =>
  new Request("http://localhost/api/lighter/chat", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ specialistId: "jarvis", messages, ...extra }) });

describe("Gmail invitation-decline drafting chat integration", () => {
  beforeEach(resetGmailPrivateReleaseReferencesForTests);

  it("performs the exact two-turn authority and re-read flow without ordinary-model history", async () => {
    const connectorRead = vi.fn(async () => ({ sender: "Raman Bhola <raman@example.invalid>", subject: "LinkedIn invitation",
      plainTextBody: "I would like to invite you to connect on LinkedIn." }));
    const draftingModel = vi.fn<GmailInvitationDeclineDraftDependencies["callDraftModel"]>(async () => JSON.stringify({
      sender: "Raman Bhola <raman@example.invalid>", subject: "LinkedIn invitation",
      draft: "Hi Raman, thank you for the invitation. I appreciate it, but I must politely decline.",
    }));
    const policy: ContentRetrievalPolicy = { policyVersion: "test", rules: [{ id: "gmail", match: { connectorType: "email" },
      processing: "external_processing_permitted", admissibleFields: ["sender", "subject", "plain_text_body"] }] };
    const deps: GmailInvitationDeclineDraftDependencies = { createConnector: () => ({ retrieveMessage: connectorRead }),
      loadPolicy: async () => policy, callDraftModel: draftingModel };
    const ordinaryModel = vi.fn(async () => "unsafe ordinary reply");
    const handler = createLighterChatHandler(ordinaryModel, undefined, undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined, deps);
    const release = createGmailPrivateReleaseReference({ resourceId: "exact-message-id",
      requestedFields: ["sender", "subject", "plain_text_body"], presentation: "synthetic oversized release" });
    const instruction = "Draft a reply to Raman, saying thank you for the invite but politely decline.";

    const ask = await (await handler(request([{ role: "user", content: instruction }], { gmailPrivateReleaseReference: release }))).json();
    expect(ask).toMatchObject({ reply: GMAIL_INVITATION_DECLINE_AUTHORITY_PROMPT,
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
      gmailInvitationDeclineDraft: { status: "selected" } });
    expect(connectorRead).not.toHaveBeenCalled();
    expect(draftingModel).not.toHaveBeenCalled();

    const drafted = await (await handler(request([
      { role: "user", content: instruction },
      { role: "assistant", content: ask.reply },
      { role: "user", content: "yes" },
    ], { gmailPrivateReleaseReference: release, pendingAuthorizationReference: ask.pendingAuthorizationReference }))).json();
    expect(connectorRead).toHaveBeenCalledExactlyOnceWith("exact-message-id");
    expect(draftingModel).toHaveBeenCalledOnce();
    expect(draftingModel.mock.calls[0][1]).toEqual({ source: "gmail_invitation_decline_draft",
      sender: "Raman Bhola <raman@example.invalid>", subject: "LinkedIn invitation",
      plainTextBody: "I would like to invite you to connect on LinkedIn." });
    expect(drafted).toMatchObject({ gmailInvitationDeclineDraft: { status: "drafted" },
      gmailInvitationDeclineDraftRelease: true, pendingAuthorizationReference: null });
    expect(drafted.reply).not.toMatch(/lunch|Thursday/i);
    expect(drafted.reply).toContain("This message has not been sent.");
    expect(ordinaryModel).not.toHaveBeenCalled();
    expect(JSON.stringify(drafted)).not.toContain("exact-message-id");
  });
});
