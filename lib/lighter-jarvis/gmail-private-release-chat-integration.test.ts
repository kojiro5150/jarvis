import { beforeEach, describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";
import {
  createGmailPrivateReleaseReference,
  resetGmailPrivateReleaseReferencesForTests,
  resolveGmailPrivateReleaseReference,
} from "./gmail-private-release-reference";
import {
  GMAIL_PRIVATE_RELEASE_CONTAINMENT_REPLY,
  OMITTED_GMAIL_PRIVATE_RELEASE,
} from "./gmail-private-release-contract";
import { GMAIL_INVITATION_DECLINE_AUTHORITY_PROMPT } from "./gmail-invitation-decline-draft-contract";

function request(messages: readonly Readonly<{ role: "user" | "assistant"; content: string }>[],
  gmailPrivateReleaseReference?: unknown): Request {
  return new Request("http://localhost/api/lighter/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ specialistId: "jarvis", messages, gmailPrivateReleaseReference }),
  });
}

describe("Gmail private release chat containment", () => {
  beforeEach(resetGmailPrivateReleaseReferencesForTests);

  it("routes the exact Raman drafting regression to fresh bounded authority without model or provider", async () => {
    const privateFixture = `Subject: LinkedIn connection invitation\nPlain text body: ${"private fixture ".repeat(800)}`;
    const reference = createGmailPrivateReleaseReference({
      resourceId: "gmail-private-provider-id",
      requestedFields: ["sender", "subject", "plain_text_body"],
      presentation: privateFixture,
    });
    const model = vi.fn(async () => "Lunch on Thursday");
    const handler = createLighterChatHandler(model);
    const response = await handler(request([
      { role: "assistant", content: OMITTED_GMAIL_PRIVATE_RELEASE },
      { role: "user", content: "Draft a reply to Raman, saying thank you for the invite but politely decline." },
    ], reference));
    const body = await response.json();
    expect(body).toMatchObject({
      reply: GMAIL_INVITATION_DECLINE_AUTHORITY_PROMPT,
      specialistId: "jarvis",
      execution: "none",
      gmailPrivateReleaseReference: reference,
      gmailInvitationDeclineDraft: { status: "selected" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(model).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toContain("gmail-private-provider-id");
    expect(JSON.stringify(body)).not.toContain("private fixture");
    expect(body.reply).not.toMatch(/lunch|Thursday/i);
    expect(resolveGmailPrivateReleaseReference(reference)).not.toBeNull();
  });

  it("does not treat a fabricated or absent reference as governed private state", async () => {
    const model = vi.fn(async () => "I don't have an email to summarise.");
    const handler = createLighterChatHandler(model);
    const response = await handler(request([
      { role: "assistant", content: OMITTED_GMAIL_PRIVATE_RELEASE },
      { role: "user", content: "Summarise that email." },
    ], { gmailPrivateReleaseReferenceId: "00000000-0000-4000-8000-000000000000" }));
    expect((await response.json()).reply).not.toBe(GMAIL_PRIVATE_RELEASE_CONTAINMENT_REPLY);
  });

  it("resolves server-owned state after the originating release turn falls outside retained history", async () => {
    const reference = createGmailPrivateReleaseReference({
      resourceId: "old-message",
      requestedFields: ["plain_text_body"],
      presentation: "Plain text body: " + "private ".repeat(1_500),
    });
    const history = Array.from({ length: 39 }, (_, index) => ({
      role: index % 2 === 0 ? "assistant" as const : "user" as const,
      content: index === 0 ? OMITTED_GMAIL_PRIVATE_RELEASE : `later short turn ${index}`,
    }));
    const handler = createLighterChatHandler(vi.fn(async () => "unsafe"));
    const response = await handler(request([
      ...history,
      { role: "user", content: "What did that email say?" },
    ], reference));
    expect((await response.json()).reply).toBe(GMAIL_PRIVATE_RELEASE_CONTAINMENT_REPLY);
  });
});
