import { describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";

const request = (messages: unknown[]) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ specialistId: "jarvis", messages }),
});

const groundedWeatherDependencies = {
  fetch: vi.fn(async (input: RequestInfo | URL) => {
    const url = input.toString();
    if (url.includes("geocoding-api.open-meteo.com")) {
      return new Response(JSON.stringify({
        results: [{
          name: "Geelong",
          country: "Australia",
          latitude: -38.1471,
          longitude: 144.3607,
          timezone: "Australia/Melbourne",
        }],
      }), { status: 200 });
    }
    return new Response(JSON.stringify({
      daily: {
        time: ["2026-08-30", "2026-08-31", "2026-09-01"],
        temperature_2m_min: [9.1, 8.4, 7.9],
        temperature_2m_max: [16.2, 17.8, 18.1],
        precipitation_probability_max: [20, 65, 40],
        weather_code: [3, 61, 2],
      },
    }), { status: 200 });
  }) as typeof fetch,
  clock: () => new Date("2026-08-30T06:00:00.000Z"),
};

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
    const handler = createLighterChatHandler(model, undefined, undefined, undefined, undefined, undefined, undefined, { weather: groundedWeatherDependencies });

    const response = await (await handler(request([
      { role: "user", content: "When am I next doing something on JARVIS?" },
      { role: "assistant", content: "I can check your Calendar for that, but I couldn't resolve the factual query safely from that wording." },
      { role: "user", content: "Will it rain in Geelong tomorrow?" },
    ]))).json();

    expect(response).toMatchObject({
      execution: "public_information.weather.lookup",
      publicGrounding: {
        status: "grounded",
        kind: "weather",
        provider: "open-meteo",
        forecastDate: "2026-08-31",
      },
    });
    expect(response.reply).toContain("Grounded weather for Geelong, Australia tomorrow");
    expect(response.reply).toContain("Maximum precipitation probability: 65%");
    expect(response).not.toHaveProperty("pendingAuthorizationReference");
    expect(model).not.toHaveBeenCalled();
  });

  it("keeps identical weather wording public even when the selector declines it", async () => {
    const model = vi.fn(async () => JSON.stringify({ kind: "ordinary_conversation" }));
    const handler = createLighterChatHandler(model, undefined, undefined, undefined, undefined, undefined, undefined, { weather: groundedWeatherDependencies });

    const first = await (await handler(request([
      { role: "user", content: "Will it rain in Geelong tomorrow?" },
    ]))).json();
    const second = await (await handler(request([
      { role: "user", content: "Will it rain in Geelong tomorrow?" },
    ]))).json();

    expect(first.publicGrounding).toMatchObject({ status: "grounded", provider: "open-meteo" });
    expect(first.reply).toContain("Grounded weather for Geelong, Australia tomorrow");
    expect(second.reply).toBe(first.reply);
    expect(first).not.toHaveProperty("pendingAuthorizationReference");
    expect(second).not.toHaveProperty("pendingAuthorizationReference");
    expect(model).not.toHaveBeenCalled();
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
  it("contains SSRN research as unsupported public lookup before ordinary conversation", async () => {
    const model = vi.fn(async () => JSON.stringify({
      kind: "ordinary_conversation",
    }));
    const handler = createLighterChatHandler(model);

    const response = await (await handler(request([
      { role: "user", content: "what can you tell me about Sam Hayward on SSRN?" },
    ]))).json();

    expect(response).toEqual({
      reply: "I couldn't establish current public evidence for that request, so I won't substitute an unsupported answer from model memory.",
      specialistId: "jarvis",
      execution: "none",
      publicGrounding: { status: "unavailable", kind: "web_search" },
    });
    expect(response).not.toHaveProperty("pendingAuthorizationReference");
    expect(model).not.toHaveBeenCalled();
  });

  it("does not turn yes after unavailable SSRN lookup into fake authority", async () => {
    const model = vi.fn(async () => "That request cannot be authorized through an ordinary model response.");
    const handler = createLighterChatHandler(model);

    const response = await (await handler(request([
      { role: "user", content: "what can you tell me about Sam Hayward on SSRN?" },
      { role: "assistant", content: "I recognized that as a public-information request, but public lookup is not yet available in this runtime." },
      { role: "user", content: "yes" },
    ]))).json();

    expect(response).toEqual({
      reply: "I recognized that as a public-information request, but public lookup is not yet available in this runtime.",
      specialistId: "jarvis",
      execution: "none",
    });
    expect(model).not.toHaveBeenCalled();
  });

});
