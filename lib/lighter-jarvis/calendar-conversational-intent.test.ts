import { describe, expect, it, vi } from "vitest";
import {
  CALENDAR_CONVERSATIONAL_INTENT_PROMPT,
  interpretCalendarConversationalIntent,
  isCalendarConversationalIntentCandidate,
  validateCalendarConversationalIntent,
} from "./calendar-conversational-intent";

describe("governed Calendar conversational intent", () => {
  it("does not invoke adaptive interpretation for already-deterministic Level-1 grammar", async () => {
    const model = vi.fn(async () => '{"kind":"next_title_match","terms":["jarvis"]}');
    expect(isCalendarConversationalIntentCandidate("When's my next JARVIS test?")).toBe(false);
    expect(await interpretCalendarConversationalIntent({
      utterance: "When's my next JARVIS test?",
      callModel: model,
    })).toBeNull();
    expect(model).not.toHaveBeenCalled();
  });

  it("interprets only the current utterance into a closed literal title query", async () => {
    const model = vi.fn(async (systemPrompt: string, messages: readonly { role: string; content: string }[]) => {
      expect(systemPrompt).toBe(CALENDAR_CONVERSATIONAL_INTENT_PROMPT);
      expect(messages).toEqual([
        { role: "user", content: "Can you tell me when the JARVIS test is again?" },
      ]);
      expect(systemPrompt).toMatch(/no Calendar data/i);
      expect(systemPrompt).toMatch(/no event titles/i);
      expect(systemPrompt).toMatch(/no conversation history/i);
      expect(systemPrompt).toMatch(/no authority state/i);
      return '{"kind":"next_title_match","terms":["jarvis","test"]}';
    });

    expect(await interpretCalendarConversationalIntent({
      utterance: "Can you tell me when the JARVIS test is again?",
      callModel: model,
    })).toEqual({ kind: "next_title_match", terms: ["jarvis", "test"] });
    expect(model).toHaveBeenCalledTimes(1);
  });

  it("rejects model-invented search terms not present in the utterance", () => {
    expect(validateCalendarConversationalIntent(
      "Can you tell me when the JARVIS thing is again?",
      { kind: "next_title_match", terms: ["testing"] },
    )).toBeNull();
  });

  it("rejects grammatical scaffolding as the proposed title anchor", () => {
    expect(validateCalendarConversationalIntent(
      "Can you tell me when the JARVIS test is again?",
      { kind: "next_title_match", terms: ["when"] },
    )).toBeNull();
  });

  it("rejects extra model fields outside the closed proposal schema", () => {
    expect(validateCalendarConversationalIntent(
      "Can you tell me when the JARVIS test is again?",
      { kind: "next_title_match", terms: ["jarvis", "test"], priority: "high" },
    )).toBeNull();
  });

  it("requires an explicit next-or-again cue", () => {
    expect(validateCalendarConversationalIntent(
      "Can you tell me when the JARVIS test is?",
      { kind: "next_title_match", terms: ["jarvis", "test"] },
    )).toBeNull();
  });

  it("keeps relational Level-2 meaning outside this interpreter contract", async () => {
    const model = vi.fn(async () => '{"kind":"unsupported"}');
    expect(isCalendarConversationalIntentCandidate("When am I next doing some work on JARVIS?")).toBe(true);
    expect(await interpretCalendarConversationalIntent({
      utterance: "When am I next doing some work on JARVIS?",
      callModel: model,
    })).toBeNull();
    expect(model).toHaveBeenCalledTimes(1);
  });

  it("lets non-Calendar conversational questions remain ordinary-model eligible when interpretation says unsupported", async () => {
    const model = vi.fn(async () => '{"kind":"unsupported"}');
    expect(isCalendarConversationalIntentCandidate("When will it rain again?")).toBe(true);
    expect(await interpretCalendarConversationalIntent({
      utterance: "When will it rain again?",
      callModel: model,
    })).toBeNull();
  });
});
