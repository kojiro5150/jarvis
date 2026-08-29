import { describe, expect, it } from "vitest";
import { parsePublicWeatherRequest } from "./public-weather-request";

describe("public weather request contract", () => {
  it.each([
    ["Will it rain in Geelong tomorrow?", { location: "Geelong", period: "tomorrow" }],
    ["What's the weather in Geelong tomorrow?", { location: "Geelong", period: "tomorrow" }],
    ["Weather in Melbourne today", { location: "Melbourne", period: "today" }],
    ["Forecast for Ballarat tomorrow.", { location: "Ballarat", period: "tomorrow" }],
  ] as const)("parses a bounded public weather request: %s", (utterance, expected) => {
    expect(parsePublicWeatherRequest(utterance)).toMatchObject({
      capability: "public_information.lookup",
      kind: "weather",
      ...expected,
    });
  });

  it.each([
    "What's happening in Geelong tomorrow?",
    "Tell me something about Geelong.",
    "Read my weather app.",
    "Will it rain tomorrow?",
    "Weather in <script>alert(1)</script>",
  ])("does not invent an unsupported public lookup scope: %s", utterance => {
    expect(parsePublicWeatherRequest(utterance)).toBeNull();
  });
});
