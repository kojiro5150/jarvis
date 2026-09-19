import { describe, expect, it } from "vitest";
import {
  classifyWeatherRequest,
  extractTrailingWeatherDate,
} from "@/lib/lighter-jarvis/weather-request-classifier";

describe("weather request classifier", () => {
  it.each([
    ["Temperature in Geelong tomorrow", "Temperature in Geelong", "tomorrow"],
    ["Sydney weather tomorrow", "Sydney weather", "tomorrow"],
    ["Weather for New York today", "Weather for New York", "today"],
    ["Melbourne forecast", "Melbourne forecast", null],
  ])("extracts one shared terminal date from %s", (input, core, date) => {
    expect(extractTrailingWeatherDate(input)).toEqual({ core, date });
  });

  it.each([
    ["What's the weather in Geelong tomorrow?", "forecast", "geelong"],
    ["What is the temperature in Melbourne tomorrow?", "temperature", "melbourne"],
    ["Temperature in Geelong tomorrow", "temperature", "geelong"],
    ["Melbourne weather tomorrow", "forecast", "melbourne"],
  ])("resolves supported semantic captures for %s", (input, queryKind, locationKey) => {
    expect(classifyWeatherRequest(input)).toEqual({
      kind: "resolved",
      queryKind,
      locationKey,
      date: "tomorrow",
    });
  });

  it.each([
    ["What's the weather in New York tomorrow?", "New York"],
    ["Will it rain in Paris tomorrow?", "Paris"],
    ["London forecast tomorrow", "London"],
    ["Temperature in Tokyo tomorrow", "Tokyo"],
    ["Sydney weather tomorrow", "Sydney"],
  ])("contains unsupported location %s without search fallback", (input, location) => {
    expect(classifyWeatherRequest(input)).toEqual({ kind: "unsupported_location", location });
  });

  it.each([
    ["Will it snow in Aspen?", "missing_date"],
    ["Melbourne weather", "missing_date"],
  ])("requires clarification for %s", (input, reason) => {
    expect(classifyWeatherRequest(input)).toEqual({ kind: "clarification_required", reason });
  });

  it("preserves the bounded tomorrow request when only location is missing", () => {
    expect(classifyWeatherRequest("Will it be windy tomorrow?")).toEqual({
      kind: "clarification_required",
      reason: "missing_location",
      queryKind: "forecast",
      date: "tomorrow",
    });
  });

  it.each([
    "rain check",
    "under the weather",
    "a windy road ahead",
    "The weather app crashed again",
    "I hope it doesn't rain on my wedding day",
    "Windy City is a nickname for Chicago",
  ])("contains incidental weather wording: %s", input => {
    expect(classifyWeatherRequest(input)).toEqual(expect.objectContaining({ kind: "unresolved_weather_signal" }));
  });

  it("documents the conservative lexical false positive", () => {
    expect(classifyWeatherRequest("Is windy a word?")).toEqual({
      kind: "clarification_required",
      reason: "missing_location",
    });
  });

  it.each([
    "weathering steel",
    "Tell me a joke.",
    "What is two plus two?",
  ])("leaves non-weather text outside the boundary: %s", input => {
    expect(classifyWeatherRequest(input)).toEqual({ kind: "not_weather" });
  });

  it("keeps an explicitly unsupported timeframe terminal", () => {
    expect(classifyWeatherRequest("Weather in Geelong today")).toEqual({
      kind: "unsupported_timeframe",
      date: "today",
    });
  });
});
