import { describe, expect, it } from "vitest";
import { ABSENCE_VOCABULARY, buildLighterSystemPrompt, getLighterSpecialist, LIGHTER_SPECIALISTS } from "./specialists";

describe("Lighter JARVIS specialist governance", () => {
  it("registers one JARVIS identity while retaining dormant specialist definitions", () => {
    expect(Object.keys(LIGHTER_SPECIALISTS)).toEqual(["jarvis", "dawnwatch", "oracle", "herald", "steve", "marcus", "gecko"]);
    expect(getLighterSpecialist("phdss")).toBeUndefined();
    expect(LIGHTER_SPECIALISTS.jarvis.purpose).toBe("Single governed conversational intelligence");
    const prompt = buildLighterSystemPrompt(LIGHTER_SPECIALISTS.jarvis);
    expect(prompt).toContain("single conversational intelligence");
    expect(prompt).toContain("do not narrate routing, delegation, specialist consultation");
    expect(prompt).not.toContain("propose_handoff");
  });

  it("inherits shared governance and the closed absence vocabulary", () => {
    expect(ABSENCE_VOCABULARY).toEqual(["none", "not_fetched", "not_authorised", "unknown"]);
    const expectedSharedInstructions = [
      "Use only these exact absence values when reporting a gap: none, not_fetched, not_authorised, unknown.",
      "Never claim ownership of deterministic facts such as existence, identity, provenance, or whether an action executed. You may interpret, frame, and advise.",
      "Fail closed: when identity, provenance, scope, or evidence is ambiguous, stop and ask the user or report the applicable absence value; never make a plausible guess.",
      "Keep your output attributable to this specialist. Do not blend another specialist's claims into your voice; label and preserve any handoff provenance.",
      "If work exceeds your scope, say so plainly and tell the user to select JARVIS to continue there. Do not explain how JARVIS's routing works, do not suggest specific phrasing to address JARVIS, and do not claim JARVIS observes, monitors, or has any visibility into this conversation, it does not. Never name any specific specialist, tool, or destination yourself, you have no hand-off mechanism, only JARVIS's routing tool does.",
      "Do not imply that selecting JARVIS, or any specialist reached through it, provides capability or data that does not exist in this system. State only that the request is out of scope here.",
    ];
    for (const specialist of Object.values(LIGHTER_SPECIALISTS).filter(({ id }) => id !== "jarvis")) {
      expect(specialist.instructions.slice(0, 6)).toEqual(expectedSharedInstructions);
    }
    expect(LIGHTER_SPECIALISTS.jarvis.instructions.slice(0, 3)).toEqual(expectedSharedInstructions.slice(0, 3));
  });

  it("does not tell non-JARVIS specialists to name a peer for out-of-scope work", () => {
    const peerIds = ["dawnwatch", "oracle", "herald", "steve", "marcus", "gecko"];
    for (const specialist of Object.values(LIGHTER_SPECIALISTS).filter(({ id }) => id !== "jarvis")) {
      const outOfScopeInstruction = specialist.instructions[4].toLowerCase();
      for (const peerId of peerIds) {
        expect(outOfScopeInstruction).not.toContain(peerId);
      }
      expect(outOfScopeInstruction).toContain("select jarvis to continue there");
      expect(outOfScopeInstruction).toContain("no hand-off mechanism");
      expect(specialist.instructions[5]).toContain("provides capability or data that does not exist");
    }
  });

  it("does not claim JARVIS monitors or observes direct specialist conversations", () => {
    for (const specialist of Object.values(LIGHTER_SPECIALISTS).filter(({ id }) => id !== "jarvis")) {
      const outOfScopeInstruction = specialist.instructions[4];
      expect(outOfScopeInstruction).toContain(
        "do not claim JARVIS observes, monitors, or has any visibility into this conversation, it does not",
      );
      expect(outOfScopeInstruction).not.toContain("JARVIS monitors the conversation");
      expect(outOfScopeInstruction).not.toContain("JARVIS observes the conversation");
    }
  });

  it("never puts a specific external tool name in any specialist's instructions", () => {
    for (const specialist of Object.values(LIGHTER_SPECIALISTS)) {
      const allText = specialist.instructions.join(" ").toLowerCase();
      expect(allText).not.toContain("cowork");
      expect(allText).not.toContain("codex");
    }

    const serializedSpecialists = JSON.stringify(LIGHTER_SPECIALISTS).toLowerCase();
    expect(serializedSpecialists).not.toContain("cowork");
    expect(serializedSpecialists).not.toContain("codex");
  });

  it("keeps JARVIS free of specialist handoff instructions", () => {
    const prompt = buildLighterSystemPrompt(LIGHTER_SPECIALISTS.jarvis);
    expect(prompt).not.toContain("propose_handoff");
    expect(prompt).not.toContain("DAWNWATCH");
    expect(prompt).not.toContain("ORACLE");
    expect(prompt).not.toContain("HERALD");
  });

  it("keeps DAWNWATCH briefs and STEVE implementation advice aligned with routing boundaries", () => {
    expect(LIGHTER_SPECIALISTS.dawnwatch.instructions[10]).toBe(
      "Do not append a suggestion to ask JARVIS to route elsewhere, or any other next-step recommendation, to a routine brief. The shared out-of-scope rule applies only when a request genuinely exceeds your scope, not as a closing recommendation on a plain existence report.",
    );
    expect(LIGHTER_SPECIALISTS.dawnwatch.purpose).toBe("Briefing presentation from supplied governed evidence");
    expect(LIGHTER_SPECIALISTS.dawnwatch.instructions[6]).toContain("no Calendar or Gmail acquisition capability");
    expect(LIGHTER_SPECIALISTS.steve.instructions[8]).toBe(
      "Stay at advice or a small self-contained snippet. For multi-file, multi-step, protected-file, or implementation work, say so plainly and note that a separate, dedicated tool for larger engineering work exists outside this chat; this is advice, not a proposed action here.",
    );
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

  it("limits GECKO explicitly to market and financial data", () => {
    const prompt = buildLighterSystemPrompt(LIGHTER_SPECIALISTS.gecko);
    expect(prompt).toContain("Your scope is market and financial data only");
    expect(prompt).toContain("server-supplied domain restriction");
    expect(prompt).toContain("H.10 series updates weekly on Monday through the prior Friday, not intraday");
  });
});
