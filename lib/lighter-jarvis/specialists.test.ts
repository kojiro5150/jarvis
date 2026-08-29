import { describe, expect, it } from "vitest";
import { ABSENCE_VOCABULARY, buildLighterSystemPrompt, getLighterSpecialist, LIGHTER_SPECIALISTS } from "./specialists";

describe("single JARVIS runtime identity", () => {
  it("registers only JARVIS", () => {
    expect(Object.keys(LIGHTER_SPECIALISTS)).toEqual(["jarvis"]);
    expect(getLighterSpecialist("jarvis")).toBe(LIGHTER_SPECIALISTS.jarvis);
    expect(getLighterSpecialist("oracle")).toBeUndefined();
    expect(getLighterSpecialist("dawnwatch")).toBeUndefined();
    expect(getLighterSpecialist("gecko")).toBeUndefined();
  });

  it("keeps the closed absence vocabulary and single-intelligence prompt", () => {
    expect(ABSENCE_VOCABULARY).toEqual(["none", "not_fetched", "not_authorised", "unknown"]);
    const prompt = buildLighterSystemPrompt();
    expect(prompt).toContain("You are JARVIS, the single governed conversational intelligence.");
    expect(prompt).toContain("do not narrate routing, delegation, specialist consultation");
    expect(prompt).not.toMatch(/DAWNWATCH|ORACLE|HERALD|STEVE|MARCUS|GECKO|propose_handoff/);
  });
});
