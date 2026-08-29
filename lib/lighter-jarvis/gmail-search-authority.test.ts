import { describe, expect, it } from "vitest";
import { evaluateGmailSearchAuthority, proposeGmailSearch, proposeGmailSubjectList } from "./gmail-search-authority";

describe("gmail.search authority", () => {
  it.each(["1d", "7d"] as const)("allows only the exact raw %s command", newerThan => {
    const operation = proposeGmailSearch(newerThan);
    expect(evaluateGmailSearchAuthority(operation, `gmail.search [newer_than:${newerThan}]`)).toMatchObject({ decision: "ALLOW", reason: "explicit_gmail_search" });
    expect(evaluateGmailSearchAuthority(operation, ` gmail.search [newer_than:${newerThan}]`)).toMatchObject({ decision: "ASK" });
  });
  it("never treats the ID-only command as authority for subject metadata", () => {
    const operation = proposeGmailSubjectList("7d");
    expect(evaluateGmailSearchAuthority(operation, "gmail.search [newer_than:7d]")).toMatchObject({
      decision: "ASK",
      reason: "explicit_gmail_search_not_established",
    });
  });

  it("is a distinct capability from gmail.read", () => expect(proposeGmailSearch("1d").capability).toBe("gmail.search"));
});
