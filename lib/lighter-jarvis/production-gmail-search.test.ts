import { describe, expect, it, vi } from "vitest";
import { resolveProductionGmailSearch } from "./production-gmail-search";

describe("production gmail.search", () => {
  it.each(["1d", "7d"] as const)("performs bounded ID-only discovery for %s", async newerThan => {
    const search = vi.fn(async () => ["one", "two", "three", "four", "five", "six"]);
    const createConnector = vi.fn(() => ({ search }));
    const result = await resolveProductionGmailSearch({ currentUserUtterance: `gmail.search [newer_than:${newerThan}]` }, { createConnector });
    expect(result).toMatchObject({ handled: true, decision: "ALLOW", messageIds: ["one", "two", "three", "four", "five"] });
    expect(search).toHaveBeenCalledWith(newerThan, 5);
  });
  it.each(["gmail.search", "gmail.search newer_than:1d", "gmail.search [newer_than:2d]", "gmail.search [q:from:anyone]", "gmail.search [newer_than:1d] "])("rejects malformed syntax before connector construction: %s", async utterance => {
    const createConnector = vi.fn();
    expect(await resolveProductionGmailSearch({ currentUserUtterance: utterance }, { createConnector })).toMatchObject({ handled: true, reason: "invalid_gmail_search_syntax" });
    expect(createConnector).not.toHaveBeenCalled();
  });
  it("does not intercept gmail.read", async () => expect(await resolveProductionGmailSearch({ currentUserUtterance: "gmail.read id [subject]" }, { createConnector: vi.fn() })).toEqual({ handled: false }));
});
