import { describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";

const request = (content: string, extra: Record<string, unknown> = {}) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ specialistId: "jarvis", messages: [{ role: "user", content }], ...extra }),
});

describe("Gmail topic-search chat integration", () => {
  it("asks, confirms, searches by topic and publishes ordinal continuity without model access", async () => {
    const model = vi.fn(async () => "must not run");
    const searchByTopic = vi.fn(async () => ["newest"]);
    const gmailSearchDependencies = {
      createConnector: () => ({ search: vi.fn(async () => []) }),
      createTopicConnector: () => ({ searchByTopic }),
      createSubjectConnector: () => ({ retrieveMessage: vi.fn(async () => ({
        sender: "Rotary Club <club@example.org>", subject: "Rotary meeting", snippet: "MUST NOT LEAK",
      })) }),
      loadPolicy: async () => ({ policyVersion: "test-v1", rules: [{ id: "email",
        match: { connectorType: "email" as const }, processing: "external_processing_permitted" as const,
        admissibleFields: ["sender", "subject"] }] }),
    };
    const handler = createLighterChatHandler(model, undefined, undefined, gmailSearchDependencies);

    const ask = await (await handler(request("What was my last Rotary email?"))).json();
    expect(ask).toMatchObject({ reply: "Please explicitly confirm that I may search Gmail.",
      gmailSearchAuthority: { decision: "ASK" }, pendingAuthorizationReference: expect.any(Object) });
    expect(searchByTopic).not.toHaveBeenCalled();

    const allowed = await (await handler(request("yes", {
      pendingAuthorizationReference: ask.pendingAuthorizationReference,
    }))).json();
    expect(allowed).toMatchObject({
      reply: "Gmail messages matching “Rotary” (newest first):\n1. From: Rotary Club <club@example.org>\n   Subject: Rotary meeting",
      gmailSearchAuthority: { decision: "ALLOW" },
      gmailMessageListReference: { gmailMessageListReferenceId: expect.any(String) },
    });
    expect(JSON.stringify(allowed)).not.toContain("MUST NOT LEAK");
    expect(model).not.toHaveBeenCalled();
  });

  it.each([
    "What's my last email from Georgia?",
    "What’s my last email from Georgia?",
    "What is my latest email from Georgia?",
    "What was my last email from Georgia?",
  ])("routes the closed email-from topic variant through the existing authority path: %s", async utterance => {
    const model = vi.fn(async () => "must not run");
    const searchByTopic = vi.fn(async () => []);
    const handler = createLighterChatHandler(model, undefined, undefined, {
      createConnector: () => ({ search: vi.fn(async () => []) }),
      createTopicConnector: () => ({ searchByTopic }),
      createSubjectConnector: () => ({ retrieveMessage: vi.fn(async () => { throw new Error("must not read"); }) }),
      loadPolicy: async () => ({ policyVersion: "test-v1", rules: [] }),
    });

    const ask = await (await handler(request(utterance))).json();
    expect(ask).toMatchObject({
      reply: "Please explicitly confirm that I may search Gmail.",
      gmailSearchAuthority: { decision: "ASK" },
      pendingAuthorizationReference: expect.any(Object),
    });
    expect(searchByTopic).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });
});
