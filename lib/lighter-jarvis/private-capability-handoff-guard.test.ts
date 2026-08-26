import { describe, expect, it } from "vitest";
import { isAmbiguousPrivateReadFollowUp } from "./private-capability-handoff-guard";

describe("private capability handoff deny-only classifier", () => {
  it.each(["read it", "open it", "show it", "summarize it", "19xlDULDXTH4jniT-6jnZ0Vdp4LETYlG4jfIoOr4TkPQ"])(
    "classifies a bounded ambiguous Drive read follow-up: %s",
    utterance => expect(isAmbiguousPrivateReadFollowUp(utterance)).toBe(true),
  );

  it.each(["research", "market", "calendar", "hello", "analysis"])(
    "does not classify an unrelated one-word request: %s",
    utterance => expect(isAmbiguousPrivateReadFollowUp(utterance)).toBe(false),
  );

  it("requires at least twenty allowed provider-ID characters", () => {
    expect(isAmbiguousPrivateReadFollowUp("Abcdefghijklmnopqrs")).toBe(false);
    expect(isAmbiguousPrivateReadFollowUp("Abcdefghijklmnopqrst")).toBe(true);
    expect(isAmbiguousPrivateReadFollowUp("Abcdefghijklmnopqrs!")).toBe(false);
  });
});
