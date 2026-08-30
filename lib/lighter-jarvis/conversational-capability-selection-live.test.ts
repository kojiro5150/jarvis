import { describe, expect, it, vi } from "vitest";

import { anchorPublicInformationModelTurn, buildPublicTemporalGuidance, createLighterChatHandler } from "./chat-handler";
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
  it("anchors public relative dates to the user's Melbourne local calendar date", () => {
    const guidance = buildPublicTemporalGuidance(new Date("2026-08-30T01:15:00.000Z"));

    expect(guidance).toContain("Time zone: Australia/Melbourne.");
    expect(guidance).toContain("Local time now: 11:15 am.");
    expect(guidance).toContain("Yesterday: Saturday 29 August 2026.");
    expect(guidance).toContain("Today: Sunday 30 August 2026.");
    expect(guidance).toContain("Tomorrow: Monday 31 August 2026.");
    expect(guidance).toContain("Do not derive today/tomorrow from the server clock");
    expect(guidance).toContain("match each reported condition, probability, temperature, warning, or time window to the exact target local date");
    expect(guidance).toContain("Do not attach an adjacent day's forecast details to the requested date.");
  });

  it("injects the exact resolved local date into the model-only weather turn", () => {
    const messages = anchorPublicInformationModelTurn(
      [{ role: "user", content: "what's the weather in Geelong tomorrow?" }],
      new Date("2026-08-30T01:15:00.000Z"),
    );

    expect(messages[0].content).toContain("what's the weather in Geelong tomorrow?");
    expect(messages[0].content).toContain("Resolved public-information target date: Monday 31 August 2026.");
    expect(messages[0].content).toContain("Do not use adjacent-day or mismatched-period details.");
  });

  it("carries exact relative-date grounding into non-weather public information turns", () => {
    const messages = anchorPublicInformationModelTurn(
      [{ role: "user", content: "what public events are happening in Geelong tomorrow?" }],
      new Date("2026-08-30T01:15:00.000Z"),
    );

    expect(messages[0].content).toContain("Resolved public-information target date: Monday 31 August 2026.");
    expect(messages[0].content).toContain("Preserve the exact named entity, location, and requested attribute");
    expect(messages[0].content).toContain("say so rather than inferring or fabricating it");
  });

  it("does not treat an incidental freshness word as a public freshness request", () => {
    const messages = anchorPublicInformationModelTurn(
      [{ role: "user", content: "latest raw utterance" }],
      new Date("2026-08-30T01:15:00.000Z"),
    );

    expect(messages).toEqual([{ role: "user", content: "latest raw utterance" }]);
  });

  it("adds authoritative freshness verification to current-version public queries", () => {
    const messages = anchorPublicInformationModelTurn(
      [{ role: "user", content: "what is the latest stable version of Node.js?" }],
      new Date("2026-08-30T01:15:00.000Z"),
    );

    expect(messages[0].content).toContain("Freshness-sensitive public-information request as of Sunday 30 August 2026.");
    expect(messages[0].content).toContain("current authoritative or canonical source");
    expect(messages[0].content).toContain("verify that no newer authoritative result supersedes it");
    expect(messages[0].content).toContain("older release page, article, snippet, or mention is not sufficient proof of currentness");
    expect(messages[0].content).toContain("compare them and discard superseded candidates");
    expect(messages[0].content).toContain("preserve the source taxonomy explicitly");
  });

  it("requires freshness synthesis to reject superseded candidates and preserve source categories", async () => {
    const model = vi.fn(async (systemPrompt: string, messages: { content: string }[], tools?: ClaudeTool[]) => {
      if (hasWebSearch(tools)) {
        expect(systemPrompt).toContain("Once a newer or otherwise superseding candidate is established");
        expect(systemPrompt).toContain("if a project distinguishes Current from LTS, report both relevant categories");
        expect(messages.at(-1)?.content).toContain("compare them and discard superseded candidates");
        expect(messages.at(-1)?.content).toContain("preserve the source taxonomy explicitly");
        return {
          content: [{ type: "text", text: "Node.js 26.8.1 is Current; Node.js 24.20.0 is the latest LTS release." }],
          text: "Node.js 26.8.1 is Current; Node.js 24.20.0 is the latest LTS release.",
        };
      }
      return JSON.stringify({
        kind: "capability_request",
        capability: "public_information",
        operation: "lookup",
        subjectTerms: ["node.js", "latest", "stable", "version"],
        requestedOutput: "fact",
      });
    });
    const handler = createLighterChatHandler(model);

    const response = await (await handler(request([
      { role: "user", content: "what is the latest stable version of Node.js?" },
    ]))).json();

    expect(response).toEqual({
      reply: "Node.js 26.8.1 is Current; Node.js 24.20.0 is the latest LTS release.",
      specialistId: "jarvis",
      execution: "none",
    });
    expect(hasWebSearch(model.mock.calls.at(-1)?.[2])).toBe(true);
  });

  it("keeps weather public and lets ordinary JARVIS use native web search without authorization", async () => {
    const model = vi.fn(async (systemPrompt: string, messages: { content: string }[], tools?: ClaudeTool[]) => {
      if (hasWebSearch(tools)) {
        expect(systemPrompt).toContain("Current user-local temporal anchor for public information:");
        expect(systemPrompt).toContain("Time zone: Australia/Melbourne.");
        expect(messages.at(-1)?.content).toContain("Resolved public-information target date: Monday 31 August 2026.");
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

  it("does not ask permission before public web search when JARVIS lacks specific public information", async () => {
    const model = vi.fn(async (systemPrompt: string, _messages: { content: string }[], tools?: ClaudeTool[]) => {
      if (hasWebSearch(tools)) {
        expect(systemPrompt).toContain("search the web immediately");
        expect(systemPrompt).toContain("Do not ask the user whether they want you to search the public web");
        return {
          content: [{ type: "text", text: "Miss Food Fairy is a public food blog and creator presence." }],
          text: "Miss Food Fairy is a public food blog and creator presence.",
        };
      }
      return JSON.stringify({ kind: "ordinary_conversation" });
    });
    const handler = createLighterChatHandler(model);

    const response = await (await handler(request([
      { role: "user", content: "what do you know about Miss Food Fairy?" },
    ]))).json();

    expect(response).toEqual({
      reply: "Miss Food Fairy is a public food blog and creator presence.",
      specialistId: "jarvis",
      execution: "none",
    });
    expect(response.reply).not.toMatch(/would you like me to search/i);
    expect(response).not.toHaveProperty("pendingAuthorizationReference");
    expect(model).toHaveBeenCalledTimes(1);
    expect(hasWebSearch(model.mock.calls[0][2])).toBe(true);
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
