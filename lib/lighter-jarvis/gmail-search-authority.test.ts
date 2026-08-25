import { describe, expect, it } from "vitest";
import { evaluateGmailSearchAuthority, proposeGmailSearch } from "./gmail-search-authority";

describe("gmail.search authority", () => {
  it.each(["1d", "7d"] as const)("allows only the exact raw %s command", newerThan => {
    const operation = proposeGmailSearch(newerThan);
    expect(evaluateGmailSearchAuthority(operation, `gmail.search [newer_than:${newerThan}]`)).toMatchObject({ decision: "ALLOW", reason: "explicit_gmail_search" });
    expect(evaluateGmailSearchAuthority(operation, ` gmail.search [newer_than:${newerThan}]`)).toMatchObject({ decision: "ASK" });
  });
  it("is a distinct capability from gmail.read", () => expect(proposeGmailSearch("1d").capability).toBe("gmail.search"));
});
