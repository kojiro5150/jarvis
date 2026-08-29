import { describe, expect, it, vi } from "vitest";
import { acquireGroundedPublicWeather, renderGroundedPublicWeather } from "./public-weather";
import { parsePublicWeatherRequest } from "./public-weather-request";

const request = parsePublicWeatherRequest("Will it rain in Geelong tomorrow?")!;

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("grounded public weather", () => {
  it("acquires structured current evidence with explicit provenance and no authority object", async () => {
    const calls: string[] = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      calls.push(url);
      if (url.includes("geocoding-api.open-meteo.com")) {
        return jsonResponse({
          results: [{
            name: "Geelong",
            country: "Australia",
            latitude: -38.1471,
            longitude: 144.3607,
            timezone: "Australia/Melbourne",
          }],
        });
      }
      return jsonResponse({
        daily: {
          time: ["2026-08-30", "2026-08-31", "2026-09-01"],
          temperature_2m_min: [9.1, 8.4, 7.9],
          temperature_2m_max: [16.2, 17.8, 18.1],
          precipitation_probability_max: [20, 65, 40],
          weather_code: [3, 61, 2],
        },
      });
    });

    const evidence = await acquireGroundedPublicWeather(request, {
      fetch: fetchMock as typeof fetch,
      clock: () => new Date("2026-08-30T06:00:00.000Z"),
    });

    expect(evidence).toMatchObject({
      kind: "weather",
      payload: {
        location: { name: "Geelong", country: "Australia", timezone: "Australia/Melbourne" },
        forecast: {
          date: "2026-08-31",
          temperatureMinC: 8.4,
          temperatureMaxC: 17.8,
          precipitationProbabilityMax: 65,
          weatherCode: 61,
        },
      },
      provenance: {
        provider: "open-meteo",
        retrievedAt: "2026-08-30T06:00:00.000Z",
        sourceUrl: expect.stringContaining("api.open-meteo.com/v1/forecast"),
      },
    });
    expect(calls).toHaveLength(2);
    expect(calls[0]).toContain("name=Geelong");
    expect(calls[1]).toContain("forecast_days=3");

    const reply = renderGroundedPublicWeather(request, evidence!);
    expect(reply).toContain("Grounded weather for Geelong, Australia tomorrow");
    expect(reply).toContain("Maximum precipitation probability: 65%");
    expect(reply).toContain("Source: Open-Meteo forecast retrieved 2026-08-30T06:00:00.000Z");
    expect(reply).toContain("https://api.open-meteo.com/v1/forecast");
  });

  it.each([
    [jsonResponse({}, 503), null],
    [jsonResponse({ results: [] }), null],
  ])("fails closed when public grounding cannot be established", async (firstResponse, expected) => {
    const fetchMock = vi.fn(async () => firstResponse);
    await expect(acquireGroundedPublicWeather(request, {
      fetch: fetchMock as typeof fetch,
      clock: () => new Date("2026-08-30T06:00:00.000Z"),
    })).resolves.toBe(expected);
  });

  it("rejects malformed forecast arrays rather than fabricating a claim", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({
        results: [{
          name: "Geelong",
          country: "Australia",
          latitude: -38.1471,
          longitude: 144.3607,
          timezone: "Australia/Melbourne",
        }],
      }))
      .mockResolvedValueOnce(jsonResponse({
        daily: {
          time: ["2026-08-31"],
          temperature_2m_min: ["not-a-number"],
          temperature_2m_max: [17.8],
          precipitation_probability_max: [65],
          weather_code: [61],
        },
      }));

    await expect(acquireGroundedPublicWeather(request, {
      fetch: fetchMock as typeof fetch,
      clock: () => new Date("2026-08-30T06:00:00.000Z"),
    })).resolves.toBeNull();
  });
});
