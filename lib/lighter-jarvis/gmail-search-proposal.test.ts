import { describe, expect, it } from "vitest";
import { evaluateGmailSearchAuthority } from "./gmail-search-authority";
import { proposeNaturalLanguageGmailSearch } from "./gmail-search-proposal";

describe("gmail.search natural-language proposal boundary", () => {
  it.each([
    ["Search my Gmail from the last day", "1d"],
    ["Please search Gmail for messages from the past 24 hours.", "1d"],
    ["Check my Gmail over the last week", "7d"],
    ["Look through Gmail mail from the past 7 days!", "7d"],
  ] as const)("proposes a bounded search without granting authority: %s", (utterance, newerThan) => {
    const proposal = proposeNaturalLanguageGmailSearch(utterance);
    expect(proposal).toEqual({ capability: "gmail.search", newerThan, maxResults: 5 });
    expect(evaluateGmailSearchAuthority(proposal!, utterance)).toEqual({
      capability: "gmail.search", decision: "ASK", reason: "explicit_gmail_search_not_established", authorityEvidence: [],
    });
  });

  it.each([
    "Search Gmail for messages from Alice from the last day",
    "Search Gmail for invoices from the last week",
    "Search my email from the last month",
    "Read my Gmail from the last day",
    "What's in my Gmail?",
    "gmail.search [q:from:anyone]",
  ])("does not propose broader or ambiguous Gmail access: %s", utterance => {
    expect(proposeNaturalLanguageGmailSearch(utterance)).toBeNull();
  });
});
