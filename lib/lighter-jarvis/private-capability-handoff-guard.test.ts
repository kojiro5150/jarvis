import { describe, expect, it } from "vitest";
import {
  GMAIL_NO_PENDING_READ_AUTHORITY_REPLY,
  GMAIL_SELECTED_MESSAGE_READ_CONTAINMENT_REPLY,
  isAmbiguousGmailEvidenceFollowUp,
  isAmbiguousPrivateReadFollowUp,
  isUnsupportedGmailReadAuthorityContinuation,
} from "./private-capability-handoff-guard";

describe("private capability handoff deny-only classifier", () => {
  it.each(["read it", "open it", "show it", "summarize it", "19xlDULDXTH4jniT-6jnZ0Vdp4LETYlG4jfIoOr4TkPQ"])(
    "classifies a bounded ambiguous Drive read follow-up: %s",
    utterance => expect(isAmbiguousPrivateReadFollowUp(utterance)).toBe(true),
  );

  it.each(["research", "market", "calendar", "hello", "analysis"])(
    "does not classify an unrelated one-word request: %s",
    utterance => expect(isAmbiguousPrivateReadFollowUp(utterance)).toBe(false),
  );

  it.each([
    "One of my last five emails.",
    "One of my last 5 emails.",
    "One of those emails",
    "the first email",
    "that email",
    "Yes, the most recent email.",
    "the latest email",
    "open the newest email",
  ])("classifies a bounded ambiguous Gmail evidence follow-up: %s", utterance => {
    expect(isAmbiguousGmailEvidenceFollowUp(utterance)).toBe(true);
  });

  it.each([
    "What are my last five emails?",
    "Show me my last five emails.",
    "Tell me about email systems",
  ])("does not classify a fresh Gmail request or ordinary statement: %s", utterance => {
    expect(isAmbiguousGmailEvidenceFollowUp(utterance)).toBe(false);
  });

  it.each(["Do it.", "Yes.", "Confirm", "Go ahead", "Proceed"])(
    "classifies a bare Gmail read-authority continuation only after deterministic containment: %s",
    utterance => {
      const messages = [
        { role: "user" as const, content: "Yes, the most recent email." },
        { role: "assistant" as const, content: GMAIL_SELECTED_MESSAGE_READ_CONTAINMENT_REPLY },
        { role: "user" as const, content: utterance },
      ];
      expect(isUnsupportedGmailReadAuthorityContinuation(messages, utterance)).toBe(true);
    },
  );

  it("keeps repeated bare confirmation contained after the no-pending reply", () => {
    const messages = [
      { role: "assistant" as const, content: GMAIL_NO_PENDING_READ_AUTHORITY_REPLY },
      { role: "user" as const, content: "Yes." },
    ];
    expect(isUnsupportedGmailReadAuthorityContinuation(messages, "Yes.")).toBe(true);
  });

  it("does not classify the same bare wording without the deterministic Gmail containment predecessor", () => {
    const messages = [
      { role: "assistant" as const, content: "Sure — what would you like me to do?" },
      { role: "user" as const, content: "Do it." },
    ];
    expect(isUnsupportedGmailReadAuthorityContinuation(messages, "Do it.")).toBe(false);
  });

  it("requires at least twenty allowed provider-ID characters", () => {
    expect(isAmbiguousPrivateReadFollowUp("Abcdefghijklmnopqrs")).toBe(false);
    expect(isAmbiguousPrivateReadFollowUp("Abcdefghijklmnopqrst")).toBe(true);
    expect(isAmbiguousPrivateReadFollowUp("Abcdefghijklmnopqrs!")).toBe(false);
  });
});
