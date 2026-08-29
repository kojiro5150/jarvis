import { describe, expect, it } from "vitest";
import { buildSpecialistPrompt } from "./runtime";
import { buildLighterSystemPrompt, LIGHTER_SPECIALISTS } from "./specialists";

describe("buildSpecialistPrompt", () => {
  it("gives ordinary JARVIS calls a single-intelligence prompt with no specialist roster", async () => {
    const prompt = await buildSpecialistPrompt(LIGHTER_SPECIALISTS.jarvis);

    expect(prompt).toContain("You are JARVIS, the single governed conversational intelligence.");
    expect(prompt).not.toContain("specialist in Lighter JARVIS");
    expect(prompt).not.toContain('"contract":"specialist_roster"');
    expect(prompt).not.toContain("DAWNWATCH");
    expect(prompt).not.toContain("ORACLE");
    expect(prompt).not.toContain("HERALD");
    expect(prompt).not.toContain("STEVE");
    expect(prompt).not.toContain("MARCUS");
    expect(prompt).not.toContain("GECKO");
  });

  it("leaves relay-synthesis prompts without the routing roster", async () => {
    const reply = "The researched answer.";
    const prompt = await buildSpecialistPrompt(LIGHTER_SPECIALISTS.jarvis, {
      specialistId: "oracle",
      reply,
    });

    expect(prompt).toContain('"contract":"governed_specialist_reply"');
    expect(prompt).toContain(`"reply":"${reply}"`);
    expect(prompt).not.toContain('"contract":"specialist_roster"');
  });

  it("uses the ordinary non-private specialist prompt for DAWNWATCH", async () => {
    const prompt = await buildSpecialistPrompt(LIGHTER_SPECIALISTS.dawnwatch);

    expect(prompt).toBe(buildLighterSystemPrompt(LIGHTER_SPECIALISTS.dawnwatch));
    expect(prompt).toContain("specialist in Lighter JARVIS");
    expect(prompt).not.toContain("GOVERNED CONTEXT");
    expect(prompt).not.toContain("governed_dawnwatch_presentation_input");
  });
});
