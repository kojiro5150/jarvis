import { beforeEach, describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";
import {
  GMAIL_PRIVATE_RELEASE_CONTAINMENT_REPLY,
  OMITTED_GMAIL_PRIVATE_RELEASE,
} from "./gmail-private-release-contract";
import {
  createGmailPrivateReleaseReference,
  resetGmailPrivateReleaseReferencesForTests,
} from "./gmail-private-release-reference";

function request(
  utterance: string,
  options: Readonly<{
    priorAssistant?: string;
    gmailPrivateReleaseReference?: unknown;
  }> = {},
): Request {
  return new Request("http://localhost/api/lighter/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      specialistId: "jarvis",
      messages: [
        ...(options.priorAssistant
          ? [{ role: "assistant" as const, content: options.priorAssistant }]
          : []),
        { role: "user", content: utterance },
      ],
      ...(options.gmailPrivateReleaseReference
        ? { gmailPrivateReleaseReference: options.gmailPrivateReleaseReference }
        : {}),
    }),
  });
}

describe("response-format precedence over Gmail mutation classification", () => {
  beforeEach(resetGmailPrivateReleaseReferencesForTests);

  it("1. echoes Reply exactly with Gmail control test complete", async () => {
    const model = vi.fn();
    const response = await createLighterChatHandler(model)(request(
      "Reply exactly with Gmail control test complete.",
    ));
    expect(await response.json()).toEqual({
      reply: "Gmail control test complete.",
      specialistId: "jarvis",
      execution: "none",
    });
    expect(model).not.toHaveBeenCalled();
  });

  it("2. echoes Respond with only email test complete", async () => {
    const model = vi.fn();
    const response = await createLighterChatHandler(model)(request(
      "Respond with only: email test complete.",
    ));
    expect((await response.json()).reply).toBe("email test complete.");
    expect(model).not.toHaveBeenCalled();
  });

  it("3. preserves containment for Reply to my emails", async () => {
    const response = await createLighterChatHandler(vi.fn())(request(
      "Reply to my emails.",
    ));
    expect((await response.json()).reply).toBe(
      "I recognized that as a Gmail action request, but a governed Gmail action path for that operation is not yet available.",
    );
  });

  it("4. preserves containment for Reply to that Gmail message", async () => {
    const response = await createLighterChatHandler(vi.fn())(request(
      "Reply to that Gmail message.",
    ));
    expect((await response.json()).reply).toBe(
      "I recognized that as a Gmail action request, but a governed Gmail action path for that operation is not yet available.",
    );
  });

  it("5. preserves private-release containment for Draft a reply to that email with a valid reference", async () => {
    const reference = createGmailPrivateReleaseReference({
      resourceId: "private-message",
      requestedFields: ["plain_text_body"],
      presentation: "Plain text body: " + "private ".repeat(1_500),
    });
    const model = vi.fn();
    const response = await createLighterChatHandler(model)(request(
      "Draft a reply to that email.",
      { priorAssistant: OMITTED_GMAIL_PRIVATE_RELEASE,
        gmailPrivateReleaseReference: reference },
    ));
    expect((await response.json()).reply).toBe(GMAIL_PRIVATE_RELEASE_CONTAINMENT_REPLY);
    expect(model).not.toHaveBeenCalled();
  });

  it("6. preserves unsupported Gmail-action containment for Draft a reply to that email without a valid reference", async () => {
    const response = await createLighterChatHandler(vi.fn())(request(
      "Draft a reply to that email.",
    ));
    expect((await response.json()).reply).toBe(
      "I recognized that as a Gmail action request, but a governed Gmail action path for that operation is not yet available.",
    );
  });
});
