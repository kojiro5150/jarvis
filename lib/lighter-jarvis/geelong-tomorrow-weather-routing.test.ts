import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "@/lib/lighter-jarvis/chat-handler";

function request(content: string) {
  return new Request("http://localhost/api/lighter/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ specialistId: "jarvis", messages: [{ role: "user", content }] }),
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
