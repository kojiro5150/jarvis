import { describe, expect, it, vi } from "vitest";

import {
  isConversationalCapabilitySelectionCandidate,
  selectConversationalCapability,
  validateSelectedConversationalIntent,
} from "./conversational-capability-selector";

describe("conversational capability selection", () => {
  it.each([
    ["Will it rain in Geelong tomorrow?", true],
    ["What are my last five emails?", true],
    ["Search my Drive for JARVIS.", true],
    ["When is my next meeting?", false],
    ["Tell me a joke.", false],
  ])("gates likely capability turns: %s", (utterance, expected) => {
    expect(isConversationalCapabilitySelectionCandidate(utterance)).toBe(expected);
  });

  it("classifies a public weather request", async () => {
    const model = vi.fn(async () => JSON.stringify({
      kind: "capability_request",
      capability: "public_information",
      operation: "lookup",
      subjectTerms: ["rain", "geelong"],
      temporalConstraint: "tomorrow",
      requestedOutput: "fact",
    }));
    const selected = await selectConversationalCapability({
      utterance: "Will it rain in Geelong tomorrow?",
      callModel: model,
    });
    expect(selected).toMatchObject({
      kind: "capability_request",
      capability: "public_information",
      operation: "lookup",
    });
    expect(selected).not.toHaveProperty("result");
  });

  it("classifies a private Gmail request without execution state", async () => {
    const model = vi.fn(async () => JSON.stringify({
      kind: "capability_request",
      capability: "gmail",
      operation: "search",
      subjectTerms: ["emails"],
      requestedOutput: "list",
    }));
    const selected = await selectConversationalCapability({
      utterance: "What are my last five emails?",
      callModel: model,
    });
    expect(selected).toMatchObject({
      kind: "capability_request",
      capability: "gmail",
      operation: "search",
    });
    expect(selected).not.toHaveProperty("decision");
  });

  it("rejects invented subject terms", () => {
    expect(validateSelectedConversationalIntent("Will it rain in Geelong tomorrow?", {
      kind: "capability_request",
      capability: "public_information",
      operation: "lookup",
      subjectTerms: ["melbourne"],
    })).toBeNull();
  });

  it("deterministically retains public-information class when the model declines it", async () => {
    const model = vi.fn(async () => JSON.stringify({ kind: "ordinary_conversation" }));
    await expect(selectConversationalCapability({
      utterance: "Will it rain in Geelong tomorrow?",
      callModel: model,
    })).resolves.toEqual({
      kind: "capability_request",
      capability: "public_information",
      operation: "lookup",
    });
  });

  it("deterministically retains Gmail class when model output is invalid", async () => {
    const model = vi.fn(async () => "ordinary prose");
    await expect(selectConversationalCapability({
      utterance: "What are my last five emails?",
      callModel: model,
    })).resolves.toEqual({
      kind: "capability_request",
      capability: "gmail",
      operation: "search",
    });
  });

  it("rejects a contradictory model capability and keeps the explicit Drive class", async () => {
    const model = vi.fn(async () => JSON.stringify({
      kind: "capability_request",
      capability: "gmail",
      operation: "search",
    }));
    await expect(selectConversationalCapability({
      utterance: "Please read my Drive report.",
      callModel: model,
    })).resolves.toEqual({
      kind: "capability_request",
      capability: "drive",
      operation: "read",
    });
  });

  it("can represent Calendar selection", () => {
    expect(validateSelectedConversationalIntent("When is my next meeting?", {
      kind: "capability_request",
      capability: "calendar",
      operation: "read",
      subjectTerms: ["meeting"],
      requestedOutput: "fact",
    })).toMatchObject({
      kind: "capability_request",
      capability: "calendar",
      operation: "read",
    });
  });
});
