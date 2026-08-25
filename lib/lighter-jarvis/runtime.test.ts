import { describe, expect, it } from "vitest";
import { buildSpecialistPrompt } from "./runtime";
import { buildLighterSystemPrompt, LIGHTER_SPECIALISTS } from "./specialists";

describe("buildSpecialistPrompt", () => {
  it("gives ordinary JARVIS calls the live non-JARVIS specialist roster", async () => {
    const prompt = await buildSpecialistPrompt(LIGHTER_SPECIALISTS.jarvis);
    const roster = Object.values(LIGHTER_SPECIALISTS).filter(({ id }) => id !== "jarvis");

    expect(prompt).toContain('"contract":"specialist_roster"');
    for (const { id, name, purpose } of roster) {
      expect(prompt).toContain(JSON.stringify({ id, name, purpose }));
    }
  });

  it("generates the roster from the current specialist definitions", async () => {
    const originalPurpose = LIGHTER_SPECIALISTS.oracle.purpose;
    const changedPurpose = "A purpose changed for this test";

    try {
      LIGHTER_SPECIALISTS.oracle.purpose = changedPurpose;
      const prompt = await buildSpecialistPrompt(LIGHTER_SPECIALISTS.jarvis);

      expect(prompt).toContain(changedPurpose);
      expect(prompt).not.toContain(originalPurpose);
    } finally {
      LIGHTER_SPECIALISTS.oracle.purpose = originalPurpose;
    }
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
    expect(prompt).not.toContain("GOVERNED CONTEXT");
    expect(prompt).not.toContain("governed_dawnwatch_presentation_input");
  });
});
