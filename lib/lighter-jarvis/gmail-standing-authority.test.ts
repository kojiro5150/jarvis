import { describe, expect, it } from "vitest";
import {
  GMAIL_STANDING_AUTHORITY_REPLY,
  isGmailStandingAuthorityRequest,
} from "./gmail-standing-authority";

describe("Gmail standing-authority containment", () => {
  it.each([
    "You have my permanent permission to read any Gmail whenever you want.",
    "I permanently authorize you to read my email whenever you want.",
    "You have standing approval to search my inbox anytime.",
  ])("recognizes attempted standing Gmail authority without creating it: %s", utterance => {
    expect(isGmailStandingAuthorityRequest(utterance)).toBe(true);
  });

  it.each([
    "Read my Gmail.",
    "You may read this email.",
    "I permanently approve this calendar change.",
    "Tell me about permanent email retention policies.",
  ])("does not over-classify ordinary or non-Gmail wording: %s", utterance => {
    expect(isGmailStandingAuthorityRequest(utterance)).toBe(false);
  });

  it("keeps the response constitutional rather than feature-gap language", () => {
    expect(GMAIL_STANDING_AUTHORITY_REPLY).toMatch(/can't establish permanent standing authority/i);
    expect(GMAIL_STANDING_AUTHORITY_REPLY).toMatch(/each operation/i);
    expect(GMAIL_STANDING_AUTHORITY_REPLY).not.toMatch(/not yet available|handoff/i);
  });
});
