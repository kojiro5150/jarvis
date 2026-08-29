import { describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";

const request = (messages: unknown[]) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ specialistId: "jarvis", messages }),
});

describe("Sprint 3.180b live capability selection", () => {
  it("keeps weather public after a contained Calendar turn", async () => {
    const model = vi.fn(async (_systemPrompt: string, messages: { content: string }[]) => {
      const utterance = messages.at(-1)?.content ?? "";
      if (utterance === "Will it rain in Geelong tomorrow?") {
        return JSON.stringify({
          kind: "capability_request",
          capability: "public_information",
          operation: "lookup",
          subjectTerms: ["rain", "geelong"],
          temporalConstraint: "tomorrow",
          requestedOutput: "fact",
        });
      }
      return JSON.stringify({ kind: "ordinary_conversation" });
    });
    const handler = createLighterChatHandler(model);

    const response = await (await handler(request([
      { role: "user", content: "When am I next doing something on JARVIS?" },
      { role: "assistant", content: "I can check your Calendar for that, but I couldn't resolve the factual query safely from that wording." },
      { role: "user", content: "Will it rain in Geelong tomorrow?" },
    ]))).json();

    expect(response.reply).toBe(
      "I recognized that as a public-information request, but public lookup is not yet available in this runtime.",
    );
    expect(response).not.toHaveProperty("pendingAuthorizationReference");
    expect(model).toHaveBeenCalledTimes(1);
  });

  it("keeps identical weather wording public even when the selector declines it", async () => {
    const model = vi.fn(async () => JSON.stringify({ kind: "ordinary_conversation" }));
    const handler = createLighterChatHandler(model);

    const first = await (await handler(request([
      { role: "user", content: "Will it rain in Geelong tomorrow?" },
    ]))).json();
    const second = await (await handler(request([
      { role: "user", content: "Will it rain in Geelong tomorrow?" },
    ]))).json();

    expect(first.reply).toBe(
      "I recognized that as a public-information request, but public lookup is not yet available in this runtime.",
    );
    expect(second.reply).toBe(first.reply);
  });

  it("recognizes natural Gmail wording without pretending Gmail is unavailable", async () => {
    const model = vi.fn(async () => JSON.stringify({
      kind: "capability_request",
      capability: "gmail",
      operation: "search",
      subjectTerms: ["emails"],
      requestedOutput: "list",
    }));
    const handler = createLighterChatHandler(model);

    const response = await (await handler(request([
      { role: "user", content: "What are my last five emails?" },
    ]))).json();

    expect(response).toMatchObject({
      reply: "I can search Gmail for up to five messages from the last 7 days. Please explicitly confirm that I may do that.",
      gmailSearchAuthority: { decision: "ASK", reason: "explicit_gmail_search_not_established" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(response).not.toHaveProperty("messageIds");
    expect(model).toHaveBeenCalledTimes(1);
  });
});
