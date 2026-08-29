import { describe, expect, it, vi } from "vitest";
import { resolveProductionGmailSearch } from "./production-gmail-search";
import { createPendingAuthorization, resolvePendingAuthorization } from "./pending-authorization";
import { proposeGmailRead } from "./gmail-read-authority";
import { proposeGmailSearch, proposeGmailSubjectList } from "./gmail-search-authority";

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
  it("requires confirmation before executing a natural-language proposal", async () => {
    const search = vi.fn(async () => ["one"]);
    const createConnector = vi.fn(() => ({ search }));
    const proposed = await resolveProductionGmailSearch({ currentUserUtterance: "Search my Gmail from the last day" }, { createConnector });
    expect(proposed).toMatchObject({ handled: true, decision: "ASK", reason: "explicit_gmail_search_not_established" });
    expect(proposed.pendingAuthorizationReference).toBeDefined();
    expect(createConnector).not.toHaveBeenCalled();

    const allowed = await resolveProductionGmailSearch({ currentUserUtterance: "Yes, please",
      pendingAuthorizationReference: proposed.pendingAuthorizationReference }, { createConnector });
    expect(allowed).toMatchObject({ handled: true, decision: "ALLOW", reason: "pending_authorization_confirmed", messageIds: ["one"] });
    expect(search).toHaveBeenCalledWith("1d", 5);
  });

  it("does not execute a declined proposal", async () => {
    const createConnector = vi.fn();
    const proposed = await resolveProductionGmailSearch({ currentUserUtterance: "Search my Gmail from the last week" }, { createConnector });
    expect(await resolveProductionGmailSearch({ currentUserUtterance: "No, thanks",
      pendingAuthorizationReference: proposed.pendingAuthorizationReference }, { createConnector }))
      .toMatchObject({ handled: true, decision: "DENY", reason: "pending_authorization_declined" });
    expect(createConnector).not.toHaveBeenCalled();
  });

  it("fails closed on replay and never repeats search acquisition", async () => {
    const search = vi.fn(async () => ["one"]); const createConnector = vi.fn(() => ({ search }));
    const reference = createPendingAuthorization(proposeGmailSearch("1d"));
    expect(await resolveProductionGmailSearch({ currentUserUtterance: "confirm", pendingAuthorizationReference: reference }, { createConnector }))
      .toMatchObject({ decision: "ALLOW", messageIds: ["one"] });
    expect(await resolveProductionGmailSearch({ currentUserUtterance: "confirm", pendingAuthorizationReference: reference }, { createConnector }))
      .toMatchObject({ decision: "ASK", reason: "pending_authorization_already_consumed" });
    expect(createConnector).toHaveBeenCalledOnce(); expect(search).toHaveBeenCalledOnce();
  });

  it("fails closed on a fabricated reference without acquisition", async () => {
    const createConnector = vi.fn();
    expect(await resolveProductionGmailSearch({ currentUserUtterance: "yes",
      pendingAuthorizationReference: { pendingAuthorizationId: "fabricated" } }, { createConnector }))
      .toMatchObject({ handled: true, decision: "ASK", reason: "pending_authorization_not_found" });
    expect(createConnector).not.toHaveBeenCalled();
  });

  it.each([
    ["gmail.read", () => createPendingAuthorization(proposeGmailRead({ resource: { resourceId: "message", connectorType: "email" },
      requestedFields: ["subject"], requestingRuntime: "test" }))],
    ["calendar.read", () => createPendingAuthorization(Object.freeze({ capability: "calendar.read", window: Object.freeze({
      start: "2026-08-25T00:00:00.000Z", end: "2026-09-01T00:00:00.000Z", timeZone: "Australia/Melbourne", period: "default" as const,
    }) }))],
  ] as const)("does not authorize or consume a pending %s operation", async (capability, makeReference) => {
    const createConnector = vi.fn(); const reference = makeReference();
    expect(await resolveProductionGmailSearch({ currentUserUtterance: "yes", pendingAuthorizationReference: reference }, { createConnector }))
      .toEqual({ handled: false });
    expect(createConnector).not.toHaveBeenCalled();
    expect(resolvePendingAuthorization({ currentUserUtterance: "yes", pendingAuthorizationReference: reference,
      expectedCapability: capability })).toMatchObject({ decision: "ALLOW", proposedOperation: { capability } });
  });

  it("does not let a search pending operation authorize Gmail read and leaves it available for search", async () => {
    const reference = createPendingAuthorization(proposeGmailSearch("7d"));
    expect(resolvePendingAuthorization({ currentUserUtterance: "yes", pendingAuthorizationReference: reference,
      expectedCapability: "gmail.read" })).toMatchObject({ decision: "ASK", reason: "pending_authorization_capability_mismatch" });
    const search = vi.fn(async () => []); const createConnector = vi.fn(() => ({ search }));
    expect(await resolveProductionGmailSearch({ currentUserUtterance: "yes", pendingAuthorizationReference: reference }, { createConnector }))
      .toMatchObject({ decision: "ALLOW", reason: "pending_authorization_confirmed" });
    expect(search).toHaveBeenCalledWith("7d", 5);
  });
  it("deterministically completes a confirmed subject-list operation without releasing other message fields", async () => {
    const search = vi.fn(async () => ["one", "two", "three", "four", "five", "six"]);
    const retrieveMessage = vi.fn(async (id: string) => ({ subject: `Subject ${id}`, snippet: `Snippet ${id}` }));
    const reference = createPendingAuthorization(proposeGmailSubjectList("7d"));
    const result = await resolveProductionGmailSearch({
      currentUserUtterance: "yes",
      pendingAuthorizationReference: reference,
    }, {
      createConnector: () => ({ search }),
      createSubjectConnector: () => ({ retrieveMessage }),
      loadPolicy: async () => ({
        policyVersion: "test-v1",
        rules: [{
          id: "email",
          match: { connectorType: "email" },
          processing: "external_processing_permitted",
          admissibleFields: ["subject"],
        }],
      }),
    });

    expect(result).toEqual({
      handled: true,
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
      messageIds: ["one", "two", "three", "four", "five"],
      reply: "Recent Gmail messages:\n- Subject one\n- Subject two\n- Subject three\n- Subject four\n- Subject five",
    });
    expect(search).toHaveBeenCalledWith("7d", 5);
    expect(retrieveMessage.mock.calls.map(([id]) => id)).toEqual(["one", "two", "three", "four", "five"]);
    expect(JSON.stringify(result)).not.toMatch(/Snippet|snippet/i);
  });

  it("fails the subject release closed when resource policy does not permit it", async () => {
    const search = vi.fn(async () => ["one"]);
    const retrieveMessage = vi.fn(async () => ({ subject: "Secret" }));
    const reference = createPendingAuthorization(proposeGmailSubjectList("1d"));
    const result = await resolveProductionGmailSearch({
      currentUserUtterance: "yes",
      pendingAuthorizationReference: reference,
    }, {
      createConnector: () => ({ search }),
      createSubjectConnector: () => ({ retrieveMessage }),
      loadPolicy: async () => null,
    });

    expect(result).toMatchObject({
      decision: "ALLOW",
      reason: "gmail_subject_list_policy_denied",
      reply: "I found recent Gmail messages, but I can't release their subjects under the current resource policy.",
    });
    expect(retrieveMessage).not.toHaveBeenCalled();
  });

});
