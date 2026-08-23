import { describe, expect, it } from "vitest";
import { ABSENCE_VOCABULARY, buildLighterSystemPrompt, getLighterSpecialist, LIGHTER_SPECIALISTS } from "./specialists";

describe("Lighter JARVIS specialist governance", () => {
  it("registers JARVIS and the six active specialists", () => {
    expect(Object.keys(LIGHTER_SPECIALISTS)).toEqual(["jarvis", "dawnwatch", "oracle", "herald", "steve", "marcus", "gecko"]);
    expect(getLighterSpecialist("phdss")).toBeUndefined();
    expect(LIGHTER_SPECIALISTS.jarvis.instructions.slice(-4)).toEqual([
      "Your role is orchestration, not expertise: interpret the user's intent, answer directly when no specialist's specific governed data or capability is needed, and propose a hand-off when the task clearly belongs to a specialist.",
      "A user's direct selection of a specialist always takes precedence over any routing you propose.",
      "To propose a hand-off, end your reply with exactly one line: ROUTE_TO: <specialist_id>, using the real lowercase id (dawnwatch, oracle, herald, steve, marcus, gecko). State the reason in plain language in your conversational reply before that line. Never emit this line when answering directly.",
      "A proposed hand-off is a suggestion only. Never claim or imply that it has taken effect; whether it happens is decided by the user, not by your output.",
    ]);
  });

  it("inherits shared governance and the closed absence vocabulary", () => {
    expect(ABSENCE_VOCABULARY).toEqual(["none", "not_fetched", "not_authorised", "unknown"]);
    for (const specialist of Object.values(LIGHTER_SPECIALISTS)) {
      const prompt = buildLighterSystemPrompt(specialist);
      expect(prompt).toContain("wait for confirmation");
      expect(prompt).toContain("none, not_fetched, not_authorised, unknown");
      expect(prompt).toContain("Do not blend");
    }
  });

  it("makes HERALD confirmation and exact recipient matching unconditional", () => {
    const prompt = buildLighterSystemPrompt(LIGHTER_SPECIALISTS.herald);
    expect(prompt).toContain("require an exact known contact/address match");
    expect(prompt).toContain("Require explicit confirmation of the specific draft every time");
    expect(prompt).toContain("Never send, create, or modify anything");
  });

  it("keeps MARCUS and GECKO invoked-only", () => {
    expect(LIGHTER_SPECIALISTS.marcus.invokedOnly).toBe(true);
    expect(LIGHTER_SPECIALISTS.gecko.invokedOnly).toBe(true);
  });
});
