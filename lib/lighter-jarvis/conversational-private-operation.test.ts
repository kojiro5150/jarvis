import { describe, expect, it } from "vitest";

import { materializeConversationalPrivateOperation } from "./conversational-private-operation";

describe("materializeConversationalPrivateOperation", () => {
  it("materializes a bounded Gmail search with the existing 7d/max-5 server policy", () => {
    expect(materializeConversationalPrivateOperation({
      kind: "capability_request",
      capability: "gmail",
      operation: "search",
      requestedOutput: "list",
    })).toEqual({
      capability: "gmail.search",
      newerThan: "7d",
      maxResults: 5,
    });
  });

  it("narrows an explicit today constraint to the existing 1d window", () => {
    expect(materializeConversationalPrivateOperation({
      kind: "capability_request",
      capability: "gmail",
      operation: "search",
      temporalConstraint: "today",
    })).toEqual({
      capability: "gmail.search",
      newerThan: "1d",
      maxResults: 5,
    });
  });

  it.each(["tomorrow", "next_week"] as const)(
    "rejects a Gmail search temporal constraint that the existing operation cannot represent: %s",
    temporalConstraint => {
      expect(materializeConversationalPrivateOperation({
        kind: "capability_request",
        capability: "gmail",
        operation: "search",
        temporalConstraint,
      })).toBeNull();
    },
  );

  it("ignores only closed Gmail source nouns emitted as subject terms", () => {
    expect(materializeConversationalPrivateOperation({
      kind: "capability_request",
      capability: "gmail",
      operation: "search",
      subjectTerms: ["emails"],
      requestedOutput: "list",
    })).toEqual({
      capability: "gmail.search",
      newerThan: "7d",
      maxResults: 5,
    });
  });

  it("rejects subject terms rather than silently widening Gmail search semantics", () => {
    expect(materializeConversationalPrivateOperation({
      kind: "capability_request",
      capability: "gmail",
      operation: "search",
      subjectTerms: ["rachel"],
    })).toBeNull();
  });

  it.each([
    { kind: "capability_request", capability: "gmail", operation: "read" },
    { kind: "capability_request", capability: "drive", operation: "search" },
    { kind: "capability_request", capability: "calendar", operation: "read" },
  ] as const)("does not materialize an unearned private operation: %j", intent => {
    expect(materializeConversationalPrivateOperation(intent)).toBeNull();
  });
});
