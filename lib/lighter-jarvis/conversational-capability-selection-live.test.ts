import { describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";
import type { ClaudeTool } from "../claude";

const request = (messages: unknown[]) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ specialistId: "jarvis", messages }),
});

function hasWebSearch(tools?: ClaudeTool[]): boolean {
  return tools?.some(tool => "type" in tool && tool.type === "web_search_20250305") ?? false;
}

describe("Sprint 3.180b live capability selection", () => {
  it("keeps weather public and lets ordinary JARVIS use native web search without authorization", async () => {
    const model = vi.fn(async (_systemPrompt: string, messages: { content: string }[], tools?: ClaudeTool[]) => {
      if (hasWebSearch(tools)) {
        return {
          content: [{ type: "text", text: "Tomorrow in Geelong: 17°C with a chance of showers." }],
          text: "Tomorrow in Geelong: 17°C with a chance of showers.",
        };
      }
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

    expect(response).toEqual({
      reply: "Tomorrow in Geelong: 17°C with a chance of showers.",
      specialistId: "jarvis",
      execution: "none",
    });
    expect(response).not.toHaveProperty("pendingAuthorizationReference");
    expect(model).toHaveBeenCalledTimes(2);
    expect(hasWebSearch(model.mock.calls[1][2])).toBe(true);
  });

  it("still exposes web search to ordinary JARVIS when the selector itself declines public capability", async () => {
    const model = vi.fn(async (_systemPrompt: string, _messages: { content: string }[], tools?: ClaudeTool[]) =>
      hasWebSearch(tools)
        ? {
            content: [{ type: "text", text: "Geelong's forecast is available from current web results." }],
            text: "Geelong's forecast is available from current web results.",
          }
        : JSON.stringify({ kind: "ordinary_conversation" }));
    const handler = createLighterChatHandler(model);

    const response = await (await handler(request([
      { role: "user", content: "Will it rain in Geelong tomorrow?" },
    ]))).json();

    expect(response.reply).toBe("Geelong's forecast is available from current web results.");
    expect(response).not.toHaveProperty("pendingAuthorizationReference");
    expect(model).toHaveBeenCalledTimes(2);
    expect(hasWebSearch(model.mock.calls[1][2])).toBe(true);
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
      reply: "I can retrieve the subjects of up to five recent Gmail messages from the last 7 days. Please explicitly confirm that I may do that.",
      gmailSearchAuthority: { decision: "ASK", reason: "explicit_gmail_search_not_established" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(response).not.toHaveProperty("messageIds");
    expect(model).toHaveBeenCalledTimes(1);
  });

  it("lets public research use the same native web-search-enabled JARVIS path", async () => {
    const model = vi.fn(async (_systemPrompt: string, _messages: { content: string }[], tools?: ClaudeTool[]) =>
      hasWebSearch(tools)
        ? {
            content: [{ type: "text", text: "I found current SSRN results and can summarize them." }],
            text: "I found current SSRN results and can summarize them.",
          }
        : JSON.stringify({
            kind: "capability_request",
            capability: "public_information",
            operation: "lookup",
            subjectTerms: ["ssrn"],
            requestedOutput: "summary",
          }));
    const handler = createLighterChatHandler(model);

    const response = await (await handler(request([
      { role: "user", content: "what can you tell me about Sam Hayward on SSRN?" },
    ]))).json();

    expect(response).toEqual({
      reply: "I found current SSRN results and can summarize them.",
      specialistId: "jarvis",
      execution: "none",
    });
    expect(response).not.toHaveProperty("pendingAuthorizationReference");
    expect(model).toHaveBeenCalledTimes(2);
    expect(hasWebSearch(model.mock.calls[1][2])).toBe(true);
  });

  it("returns a plain failure message when the web-enabled model invocation fails", async () => {
    const model = vi.fn(async (_systemPrompt: string, _messages: { content: string }[], tools?: ClaudeTool[]) => {
      if (hasWebSearch(tools)) throw new Error("web search unavailable");
      return JSON.stringify({
        kind: "capability_request",
        capability: "public_information",
        operation: "lookup",
      });
    });
    const handler = createLighterChatHandler(model);

    const response = await (await handler(request([
      { role: "user", content: "What's the weather in Geelong tomorrow?" },
    ]))).json();

    expect(response).toEqual({
      reply: "I couldn't retrieve the public information needed for that answer right now.",
      specialistId: "jarvis",
      execution: "none",
    });
    expect(model).toHaveBeenCalledTimes(2);
  });
});
