import { describe, expect, it } from "vitest";
import {
  isUnboundOrdinalReferenceUtterance,
  UNBOUND_ORDINAL_REFERENCE_REPLY,
} from "./unbound-reference";

describe("capability-neutral unbound ordinal reference", () => {
  it.each([
    "Read the first one.",
    "Open the second one.",
    "Show the fifth one.",
    "Summarize the most recent one.",
  ])("detects a read-like ordinal follow-up: %s", (utterance) => {
    expect(isUnboundOrdinalReferenceUtterance(utterance)).toBe(true);
  });

  it.each([
    "What is first principles thinking?",
    "I have one question.",
    "Calendar tomorrow",
    "Read my email",
  ])("does not classify ordinary non-referential language: %s", (utterance) => {
    expect(isUnboundOrdinalReferenceUtterance(utterance)).toBe(false);
  });

  it("uses capability-neutral recovery language", () => {
    expect(UNBOUND_ORDINAL_REFERENCE_REPLY).not.toMatch(/gmail|calendar|drive/i);
  });
});
