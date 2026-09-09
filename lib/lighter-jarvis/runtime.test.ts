import { describe, expect, it } from "vitest";
import {
  areValidMessages,
  buildSpecialistPrompt,
  compactModelTranscript,
  MAX_MODEL_MESSAGES,
  MAX_RETAINED_HISTORY_MESSAGES,
} from "./runtime";

describe("single JARVIS prompt runtime", () => {
  it("builds only the JARVIS single-intelligence prompt", async () => {
    const prompt = await buildSpecialistPrompt();
    expect(prompt).toContain("You are JARVIS, the single governed conversational intelligence.");
    expect(prompt).not.toMatch(/specialist in Lighter JARVIS|DAWNWATCH|ORACLE|HERALD|STEVE|MARCUS|GECKO|governed_specialist_reply|specialist_roster/);
  });
});


describe("deterministic model transcript compaction", () => {
  const transcript = (length: number) => Array.from({ length }, (_, index) => ({
    role: index === length - 1 || index % 2 === 0 ? "user" as const : "assistant" as const,
    content: `message ${index + 1}`,
  }));

  it("reserves exactly one of 40 slots for the incoming turn", () => {
    expect(MAX_MODEL_MESSAGES).toBe(40);
    expect(MAX_RETAINED_HISTORY_MESSAGES).toBe(39);
    expect(areValidMessages(compactModelTranscript(transcript(40)))).toBe(true);
  });

  it("mechanically retains the newest 39 history messages and incoming turn in chronological order", () => {
    const original = transcript(50);
    const compacted = compactModelTranscript(original);

    expect(compacted).toHaveLength(40);
    expect(compacted.map(message => message.content)).toEqual(
      Array.from({ length: 40 }, (_, index) => `message ${index + 11}`),
    );
    expect(compacted.at(-1)).toEqual({ role: "user", content: "message 50" });
    expect(original).toHaveLength(50);
  });

  it("copies short valid transcripts without changing their content or order", () => {
    const original = transcript(3);
    const compacted = compactModelTranscript(original);

    expect(compacted).toEqual(original);
    expect(compacted).not.toBe(original);
  });
});
