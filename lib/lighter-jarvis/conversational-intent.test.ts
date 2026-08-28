import { describe, expect, it } from "vitest";

import {
  validateConversationalIntentCandidate,
} from "./conversational-intent";

describe("Sprint 3.180a conversational intent envelope", () => {
  it.each([
    [
      {
        kind: "capability_request",
        capability: "calendar",
        operation: "read",
        subjectTerms: ["jarvis", "test"],
        temporalConstraint: "next_seven_days",
        requestedOutput: "fact",
      },
      {
        kind: "capability_request",
        capability: "calendar",
        operation: "read",
        subjectTerms: ["jarvis", "test"],
        temporalConstraint: "next_seven_days",
        requestedOutput: "fact",
      },
    ],
    [
      {
        kind: "capability_request",
        capability: "public_information",
        operation: "lookup",
        subjectTerms: ["weather", "geelong"],
        temporalConstraint: "tomorrow",
        requestedOutput: "fact",
      },
      {
        kind: "capability_request",
        capability: "public_information",
        operation: "lookup",
        subjectTerms: ["weather", "geelong"],
        temporalConstraint: "tomorrow",
        requestedOutput: "fact",
      },
    ],
    [
      { kind: "ordinary_conversation" },
      { kind: "ordinary_conversation" },
    ],
    [
      {
        kind: "unsupported",
        reasonClass: "private_semantic_resolution_required",
      },
      {
        kind: "unsupported",
        reasonClass: "private_semantic_resolution_required",
      },
    ],
  ])("accepts a closed valid candidate", (raw, expected) => {
    expect(validateConversationalIntentCandidate(raw)).toEqual(expected);
  });

  it.each([
    { kind: "capability_request", capability: "calendar", operation: "search" },
    { kind: "capability_request", capability: "public_information", operation: "read" },
    { kind: "capability_request", capability: "memory", operation: "read" },
    { kind: "capability_request", capability: "calendar", operation: "read", providerId: "secret" },
    { kind: "capability_request", capability: "drive", operation: "read", subjectTerms: [] },
    { kind: "capability_request", capability: "gmail", operation: "search", subjectTerms: ["hello world"] },
    { kind: "capability_request", capability: "gmail", operation: "search", temporalConstraint: "someday" },
    { kind: "capability_request", capability: "drive", operation: "read", requestedOutput: "raw_private_content" },
    { kind: "unsupported", reasonClass: "model_says_so" },
    { kind: "ordinary_conversation", authority: "ALLOW" },
    { kind: "execute", capability: "calendar", operation: "read" },
  ])("rejects authority, provider, schema, and enum widening: %#", raw => {
    expect(validateConversationalIntentCandidate(raw)).toBeNull();
  });

  it("normalizes only bounded subject tokens and freezes the validated candidate", () => {
    const candidate = validateConversationalIntentCandidate({
      kind: "capability_request",
      capability: "drive",
      operation: "search",
      subjectTerms: ["JARVIS", "Architecture", "JARVIS"],
      requestedOutput: "list",
    });

    expect(candidate).toEqual({
      kind: "capability_request",
      capability: "drive",
      operation: "search",
      subjectTerms: ["jarvis", "architecture"],
      requestedOutput: "list",
    });
    expect(Object.isFrozen(candidate)).toBe(true);
    if (candidate?.kind === "capability_request") {
      expect(Object.isFrozen(candidate.subjectTerms)).toBe(true);
    }
  });

  it("does not manufacture execution or authority fields", () => {
    const candidate = validateConversationalIntentCandidate({
      kind: "capability_request",
      capability: "gmail",
      operation: "read",
      subjectTerms: ["rachel"],
      requestedOutput: "summary",
    });

    expect(candidate).not.toHaveProperty("decision");
    expect(candidate).not.toHaveProperty("authority");
    expect(candidate).not.toHaveProperty("authorized");
    expect(candidate).not.toHaveProperty("resourceId");
    expect(candidate).not.toHaveProperty("providerId");
    expect(candidate).not.toHaveProperty("result");
  });
});
