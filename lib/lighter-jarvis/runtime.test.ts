import { describe, expect, it } from "vitest";
import { buildSpecialistPrompt } from "./runtime";

describe("single JARVIS prompt runtime", () => {
  it("builds only the JARVIS single-intelligence prompt", async () => {
    const prompt = await buildSpecialistPrompt();
    expect(prompt).toContain("You are JARVIS, the single governed conversational intelligence.");
    expect(prompt).not.toMatch(/specialist in Lighter JARVIS|DAWNWATCH|ORACLE|HERALD|STEVE|MARCUS|GECKO|governed_specialist_reply|specialist_roster/);
  });
});
