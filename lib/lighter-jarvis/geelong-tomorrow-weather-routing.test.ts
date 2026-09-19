import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "@/lib/lighter-jarvis/chat-handler";

function request(content: string, extra: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/lighter/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ specialistId: "jarvis", messages: [{ role: "user", content }], ...extra }),
  });
}

function handler(model: ReturnType<typeof vi.fn>, fetchProduct: () => Promise<string>) {
  return createLighterChatHandler(model as Parameters<typeof createLighterChatHandler>[0], undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined, {
      fetchProduct,
      clock: () => new Date("2026-09-18T03:00:00Z"),
    });
}

describe("Geelong tomorrow weather routing", () => {
  it("short-circuits model and web search for the frozen deterministic request", async () => {
    const model = vi.fn();
    const xml = `<product><amoc><identifier>IDV10753</identifier><issue-time-utc>2026-09-17T23:45:37Z</issue-time-utc><expiry-time>2026-09-18T23:45:37Z</expiry-time></amoc><forecast><area aac="VIC_PT025" type="location"><forecast-period start-time-local="2026-09-19T00:00:00+10:00" end-time-local="2026-09-20T00:00:00+10:00"><element type="air_temperature_minimum" units="Celsius">13</element><element type="air_temperature_maximum" units="Celsius">24</element><text type="precis">Sunny.</text><text type="probability_of_precipitation">10%</text></forecast-period></area></forecast></product>`;
    const response = await handler(model, vi.fn(async () => xml))(request("What's the weather in Geelong tomorrow?"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({
      execution: "none",
      geelongTomorrowWeather: { status: "resolved" },
    }));
    expect(model).not.toHaveBeenCalled();
  });

  it("fails closed without calling the model when FTP acquisition fails", async () => {
    const model = vi.fn();
    const response = await handler(model, vi.fn(async () => { throw new Error("ftp unavailable"); }))
      (request("What's the temperature in Geelong tomorrow?"));
    expect(await response.json()).toEqual(expect.objectContaining({
      reply: "I couldn't retrieve a current date-bound Bureau of Meteorology forecast for Geelong tomorrow.",
      geelongTomorrowWeather: { status: "unavailable", diagnostic: "ftp unavailable" },
    }));
    expect(model).not.toHaveBeenCalled();
  });
});

describe("Melbourne tomorrow weather routing", () => {
  const xml = `<product><amoc><identifier>IDV10753</identifier><issue-time-utc>2026-09-17T23:45:37Z</issue-time-utc><expiry-time>2026-09-18T23:45:37Z</expiry-time></amoc><forecast><area aac="VIC_PT042" type="location"><forecast-period start-time-local="2026-09-19T00:00:00+10:00" end-time-local="2026-09-20T00:00:00+10:00"><element type="air_temperature_minimum" units="Celsius">13</element><element type="air_temperature_maximum" units="Celsius">25</element><text type="precis">Sunny.</text><text type="probability_of_precipitation">10%</text></forecast-period></area></forecast></product>`;

  it("short-circuits model and web search for the frozen Melbourne request", async () => {
    const model = vi.fn();
    const response = await handler(model, vi.fn(async () => xml))(request("What's the weather in Melbourne tomorrow?"));
    expect(await response.json()).toEqual(expect.objectContaining({
      reply: expect.stringContaining("Melbourne: Sunny. Minimum 13°C. Maximum 25°C."),
      execution: "none",
      melbourneTomorrowWeather: { status: "resolved" },
    }));
    expect(model).not.toHaveBeenCalled();
  });

  it("fails closed under the Melbourne response key without model fallback", async () => {
    const model = vi.fn();
    const response = await handler(model, vi.fn(async () => { throw new Error("ftp unavailable"); }))
      (request("What's the temperature in Melbourne tomorrow?"));
    expect(await response.json()).toEqual(expect.objectContaining({
      reply: "I couldn't retrieve a current date-bound Bureau of Meteorology forecast for Melbourne tomorrow.",
      melbourneTomorrowWeather: { status: "unavailable", diagnostic: "ftp unavailable" },
    }));
    expect(model).not.toHaveBeenCalled();
  });
});

describe("unsupported weather containment", () => {
  it.each([
    ["What's the weather in New York tomorrow?", "New York"],
    ["Will it rain in Paris tomorrow?", "Paris"],
    ["London forecast tomorrow", "London"],
    ["Temperature in Tokyo tomorrow", "Tokyo"],
    ["What's the weather in Sydney tomorrow?", "Sydney"],
  ])("fails closed for %s without model, web search, or BOM acquisition", async (utterance, location) => {
    const model = vi.fn();
    const fetchProduct = vi.fn(async () => "unused");
    const response = await handler(model, fetchProduct)(request(utterance));
    expect(await response.json()).toEqual(expect.objectContaining({
      reply: `I don't yet have a deterministic Bureau of Meteorology forecast for ${location}.`,
      execution: "none",
      weatherRouting: { status: "unsupported_location" },
    }));
    expect(model).not.toHaveBeenCalled();
    expect(fetchProduct).not.toHaveBeenCalled();
  });

  it.each([
    ["Will it snow in Aspen?", "Please specify tomorrow for the deterministic weather forecast."],
    ["Will it be windy tomorrow?", "Please specify the location for the weather forecast."],
    ["a windy road ahead", "I detected possible weather wording, but not a complete forecast request. Could you clarify what you'd like?"],
  ])("keeps incomplete or incidental weather terminal for %s", async (utterance, reply) => {
    const model = vi.fn();
    const fetchProduct = vi.fn(async () => "unused");
    const response = await handler(model, fetchProduct)(request(utterance));
    expect(await response.json()).toEqual(expect.objectContaining({ reply, execution: "none" }));
    expect(model).not.toHaveBeenCalled();
    expect(fetchProduct).not.toHaveBeenCalled();
  });


  it("binds an exact location-only follow-up to the original wind request without web fallback", async () => {
    const model = vi.fn();
    const fetchProduct = vi.fn(async () => "unused");
    const post = handler(model, fetchProduct);

    const clarification = await (await post(request("Will it be windy tomorrow?"))).json();
    expect(clarification).toEqual(expect.objectContaining({
      reply: "Please specify the location for the weather forecast.",
      weatherRouting: { status: "clarification_required" },
      weatherClarificationReference: expect.objectContaining({
        weatherClarificationReferenceId: expect.any(String),
      }),
    }));

    const resolved = await (await post(request("geelong", {
      weatherClarificationReference: clarification.weatherClarificationReference,
    }))).json();
    expect(resolved).toEqual(expect.objectContaining({
      reply: "I have a deterministic Bureau of Meteorology forecast path for Geelong tomorrow, but verified wind detail is not yet available on that governed path.",
      geelongTomorrowWeather: { status: "unsupported_detail" },
      weatherClarificationReference: null,
    }));
    expect(fetchProduct).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  it("treats a location-less weather question as clarification, not as a fabricated location", async () => {
    const model = vi.fn();
    const fetchProduct = vi.fn(async () => "unused");
    const response = await handler(model, fetchProduct)(request("What's the weather tomorrow?"));
    expect(await response.json()).toEqual(expect.objectContaining({
      reply: "Please specify the location for the weather forecast.",
      weatherRouting: { status: "clarification_required" },
      weatherClarificationReference: expect.objectContaining({
        weatherClarificationReferenceId: expect.any(String),
      }),
    }));
    expect(fetchProduct).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  it("repairs an unsupported location with a fresh weather-only continuation", async () => {
    const model = vi.fn();
    const fetchProduct = vi.fn(async () => "unused");
    const post = handler(model, fetchProduct);

    const clarification = await (await post(request("Will it be windy tomorrow?"))).json();
    const firstReference = clarification.weatherClarificationReference;

    const repair = await (await post(request("Chillon.", {
      weatherClarificationReference: firstReference,
    }))).json();
    expect(repair).toEqual(expect.objectContaining({
      reply: "I don't yet have a deterministic Bureau of Meteorology forecast for Chillon. Please specify Geelong or Melbourne.",
      weatherRouting: { status: "unsupported_location" },
      weatherClarificationReference: expect.objectContaining({
        weatherClarificationReferenceId: expect.any(String),
      }),
    }));
    expect(repair.weatherClarificationReference.weatherClarificationReferenceId)
      .not.toBe(firstReference.weatherClarificationReferenceId);

    const corrected = await (await post(request("Geelong.", {
      weatherClarificationReference: repair.weatherClarificationReference,
    }))).json();
    expect(corrected).toEqual(expect.objectContaining({
      reply: "I have a deterministic Bureau of Meteorology forecast path for Geelong tomorrow, but verified wind detail is not yet available on that governed path.",
      geelongTomorrowWeather: { status: "unsupported_detail" },
      weatherClarificationReference: null,
    }));
    expect(fetchProduct).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  it("consumes the weather clarification reference once and never falls through to the model", async () => {
    const model = vi.fn();
    const fetchProduct = vi.fn(async () => "unused");
    const post = handler(model, fetchProduct);

    const clarification = await (await post(request("Will it be windy tomorrow?"))).json();
    const reference = clarification.weatherClarificationReference;

    const first = await (await post(request("not a location?", {
      weatherClarificationReference: reference,
    }))).json();
    expect(first).toEqual(expect.objectContaining({
      weatherRouting: { status: "clarification_reference_not_location" },
      weatherClarificationReference: null,
    }));

    const second = await (await post(request("geelong", {
      weatherClarificationReference: reference,
    }))).json();
    expect(second).toEqual(expect.objectContaining({
      weatherRouting: { status: "clarification_reference_invalid" },
      weatherClarificationReference: null,
    }));
    expect(fetchProduct).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  it("leaves weathering steel outside weather containment", async () => {
    const model = vi.fn(async () => ({ content: [], text: "Ordinary answer." }));
    const fetchProduct = vi.fn(async () => "unused");
    const response = await handler(model, fetchProduct)(request("What is weathering steel?"));
    expect((await response.json()).reply).toBe("Ordinary answer.");
    expect(model).toHaveBeenCalled();
    expect(fetchProduct).not.toHaveBeenCalled();
  });
});
