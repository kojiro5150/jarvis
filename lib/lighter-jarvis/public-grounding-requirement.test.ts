import { describe, expect, it } from "vitest";
import {
  forcedPublicGroundingCategory,
  requiresPublicGrounding,
} from "./public-grounding-requirement";

describe("PUBLIC-KNOW-02 deterministic grounding requirement", () => {
  it.each([
    ["Who is the current CEO of OpenAI?", "current_role"],
    ["Who is the CEO of Microsoft?", "current_role"],
    ["What's the current cash rate?", "price_or_rate"],
    ["What is the latest USD exchange rate?", "price_or_rate"],
    ["What's the latest version of Next.js?", "software_version_or_release"],
    ["Which version of Node is current?", "software_version_or_release"],
    ["Is this policy still in effect?", "policy_or_law_status"],
    ["What is the current regulation on this?", "policy_or_law_status"],
    ["What is the latest news on OpenAI?", "live_event_or_result"],
    ["What are the live results today?", "live_event_or_result"],
    ["What's the weather in Geelong tomorrow?", "weather_or_forecast"],
  ] as const)("forces grounding for %s", (utterance, category) => {
    expect(forcedPublicGroundingCategory(utterance)).toBe(category);
    expect(requiresPublicGrounding(utterance)).toBe(true);
  });

  it.each([
    "Explain photosynthesis.",
    "What does a CEO do?",
    "Explain what an interest rate is.",
    "Why do software versions exist?",
    "Summarize utilitarianism.",
  ])("keeps stable explanatory knowledge on ordinary reasoning: %s", utterance => {
    expect(forcedPublicGroundingCategory(utterance)).toBeNull();
    expect(requiresPublicGrounding(utterance)).toBe(false);
  });

  it.each([
    "What's on my calendar tomorrow?",
    "Read my latest email.",
    "Search my Drive for the current policy.",
  ])("never steals a private-source request into public grounding: %s", utterance => {
    expect(requiresPublicGrounding(utterance)).toBe(false);
  });
});
