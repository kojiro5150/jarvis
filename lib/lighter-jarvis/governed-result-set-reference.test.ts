import { describe, expect, it } from "vitest";
import {
  GOVERNED_RESULT_SET_REFERENCE_MAX_SUBSEQUENT_USER_TURNS,
  GOVERNED_RESULT_SET_REFERENCE_TTL_MS,
  advanceGovernedReferentialScopeUserTurn,
  closeGovernedReferentialScope,
  createGovernedReferentialScopeReference,
  createGovernedResultSetReference,
  resolveGovernedResultSetOrdinal,
  resolveGovernedResultSetReference,
} from "./governed-result-set-reference";

const make = (input: {
  scopeReference: unknown;
  referentialClass?: "gmail.latest_messages" | "calendar.factual_items" | "drive.search_results";
  ids?: readonly string[];
  now?: Date;
}) => createGovernedResultSetReference({
  scopeReference: input.scopeReference,
  referentialClass: input.referentialClass ?? "gmail.latest_messages",
  orderedResourceIds: input.ids ?? ["id-a", "id-b", "id-c"],
  originatingOperation: "gmail.search subject_list newer_than=7d max=5",
  ...(input.now ? { now: input.now } : {}),
});

describe("server-owned governed result-set references", () => {
  it("returns opaque scope/result handles while keeping ordered resource identities server-side", () => {
    const scope = createGovernedReferentialScopeReference();
    const result = make({ scopeReference: scope })!;

    expect(Object.keys(scope)).toEqual(["governedReferentialScopeId"]);
    expect(Object.keys(result)).toEqual(["governedResultSetReferenceId"]);
    expect(JSON.stringify(scope)).not.toContain("id-a");
    expect(JSON.stringify(result)).not.toContain("id-a");

    const stored = resolveGovernedResultSetReference({ scopeReference: scope, resultSetReference: result });
    expect(stored).toMatchObject({
      capability: "gmail",
      resultSetType: "ordered_resources",
      referentialClass: "gmail.latest_messages",
      supportedReferenceKinds: ["gmail_message"],
      orderedResourceIds: ["id-a", "id-b", "id-c"],
      originatingOperation: "gmail.search subject_list newer_than=7d max=5",
      remainingReferenceTurns: GOVERNED_RESULT_SET_REFERENCE_MAX_SUBSEQUENT_USER_TURNS,
      supersededBy: null,
    });
    expect(Object.isFrozen(stored)).toBe(true);
    expect(Object.isFrozen(stored!.orderedResourceIds)).toBe(true);
    expect(Object.isFrozen(stored!.supportedReferenceKinds)).toBe(true);
  });

  it("derives capability and compatible reference kinds from the closed referential class", () => {
    const scope = createGovernedReferentialScopeReference();
    const gmail = make({ scopeReference: scope, referentialClass: "gmail.latest_messages" })!;
    const calendar = make({ scopeReference: scope, referentialClass: "calendar.factual_items", ids: ["event-1"] })!;
    const drive = make({ scopeReference: scope, referentialClass: "drive.search_results", ids: ["file-1"] })!;

    expect(resolveGovernedResultSetReference({ scopeReference: scope, resultSetReference: gmail }))
      .toMatchObject({ capability: "gmail", supportedReferenceKinds: ["gmail_message"] });
    expect(resolveGovernedResultSetReference({ scopeReference: scope, resultSetReference: calendar }))
      .toMatchObject({ capability: "calendar", supportedReferenceKinds: ["calendar_item"] });
    expect(resolveGovernedResultSetReference({ scopeReference: scope, resultSetReference: drive }))
      .toMatchObject({ capability: "drive", supportedReferenceKinds: ["drive_file"] });
  });

  it("resolves ordinal identity from exact preserved ordering without changing the set", () => {
    const scope = createGovernedReferentialScopeReference();
    const result = make({ scopeReference: scope, ids: ["message-1", "message-2", "message-3"] })!;

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: result,
      referenceKind: "gmail_message",
      ordinal: 2,
    })).toMatchObject({
      status: "resolved",
      resourceId: "message-2",
      ordinal: 2,
      resultSet: { orderedResourceIds: ["message-1", "message-2", "message-3"] },
    });
  });

  it("classifies a positive ordinal beyond the stored set as out_of_range without fallback", () => {
    const scope = createGovernedReferentialScopeReference();
    const result = make({ scopeReference: scope, ids: ["a", "b", "c"] })!;

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: result,
      referenceKind: "gmail_message",
      ordinal: 5,
    })).toMatchObject({ status: "out_of_range", resourceId: null, ordinal: 5 });
  });

  it("treats malformed ordinals and fabricated/cross-scope handles as invalid", () => {
    const scopeA = createGovernedReferentialScopeReference();
    const scopeB = createGovernedReferentialScopeReference();
    const result = make({ scopeReference: scopeA })!;

    for (const ordinal of [0, -1, 1.5, Number.NaN]) {
      expect(resolveGovernedResultSetOrdinal({
        scopeReference: scopeA,
        resultSetReference: result,
        referenceKind: "gmail_message",
        ordinal,
      }).status).toBe("invalid");
    }

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scopeA,
      resultSetReference: { governedResultSetReferenceId: "fabricated", orderedResourceIds: ["forged"] },
      referenceKind: "gmail_message",
      ordinal: 1,
    }).status).toBe("invalid");

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scopeB,
      resultSetReference: result,
      referenceKind: "gmail_message",
      ordinal: 1,
    }).status).toBe("invalid");
  });

  it("ignores forged client-carried fields on a genuine opaque result reference", () => {
    const scope = createGovernedReferentialScopeReference();
    const result = make({ scopeReference: scope, ids: ["real-1", "real-2"] })!;

    const forged = {
      governedResultSetReferenceId: result.governedResultSetReferenceId,
      orderedResourceIds: ["forged"],
      referentialClass: "drive.search_results",
    };
    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: forged,
      referenceKind: "gmail_message",
      ordinal: 1,
    })).toMatchObject({ status: "resolved", resourceId: "real-1" });
  });

  it("uses structural reference-kind compatibility and never semantic/recency substitution", () => {
    const scope = createGovernedReferentialScopeReference();
    const gmail = make({ scopeReference: scope })!;

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: gmail,
      referenceKind: "calendar_item",
      ordinal: 1,
    })).toMatchObject({ status: "absent", resourceId: null });
  });

  it("supersedes only successful same-class results in the same referential scope", () => {
    const scope = createGovernedReferentialScopeReference();
    const gmailA = make({ scopeReference: scope, ids: ["old"] })!;
    const calendar = make({ scopeReference: scope, referentialClass: "calendar.factual_items", ids: ["event"] })!;
    const gmailB = make({ scopeReference: scope, ids: ["new"] })!;

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: gmailA,
      referenceKind: "gmail_message",
      ordinal: 1,
    })).toMatchObject({ status: "absent" });

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: gmailB,
      referenceKind: "gmail_message",
      ordinal: 1,
    })).toMatchObject({ status: "resolved", resourceId: "new" });

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: calendar,
      referenceKind: "calendar_item",
      ordinal: 1,
    })).toMatchObject({ status: "resolved", resourceId: "event" });
  });

  it("lets an empty successful same-class set supersede an older non-empty set", () => {
    const scope = createGovernedReferentialScopeReference();
    const old = make({ scopeReference: scope, ids: ["stale"] })!;
    const empty = make({ scopeReference: scope, ids: [] })!;

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: old,
      referenceKind: "gmail_message",
      ordinal: 1,
    }).status).toBe("absent");

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: empty,
      referenceKind: "gmail_message",
      ordinal: 1,
    }).status).toBe("out_of_range");
  });

  it("preserves earlier state when no later governed result set is produced", () => {
    const scope = createGovernedReferentialScopeReference();
    const earlier = make({ scopeReference: scope, ids: ["still-valid"] })!;

    // A failed connector/operation creates no result-set reference at all.
    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: earlier,
      referenceKind: "gmail_message",
      ordinal: 1,
    })).toMatchObject({ status: "resolved", resourceId: "still-valid" });
  });

  it("uses the exact 15-minute half-open expiry boundary", () => {
    const scope = createGovernedReferentialScopeReference();
    const created = new Date("2026-08-29T05:00:00.000Z");
    const result = make({ scopeReference: scope, now: created })!;

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: result,
      referenceKind: "gmail_message",
      ordinal: 1,
      now: new Date(created.getTime() + GOVERNED_RESULT_SET_REFERENCE_TTL_MS - 1),
    }).status).toBe("resolved");

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: result,
      referenceKind: "gmail_message",
      ordinal: 1,
      now: new Date(created.getTime() + GOVERNED_RESULT_SET_REFERENCE_TTL_MS),
    }).status).toBe("expired");
  });

  it("allows the first six subsequent user turns and expires before the seventh", () => {
    const scope = createGovernedReferentialScopeReference();
    const now = new Date("2026-08-29T05:00:00.000Z");
    const result = make({ scopeReference: scope, now })!;

    for (let turn = 1; turn <= GOVERNED_RESULT_SET_REFERENCE_MAX_SUBSEQUENT_USER_TURNS; turn += 1) {
      expect(advanceGovernedReferentialScopeUserTurn(scope)).toBe(true);
      expect(resolveGovernedResultSetOrdinal({
        scopeReference: scope,
        resultSetReference: result,
        referenceKind: "gmail_message",
        ordinal: 1,
        now,
      })).toMatchObject({
        status: "resolved",
        resultSet: { remainingReferenceTurns: GOVERNED_RESULT_SET_REFERENCE_MAX_SUBSEQUENT_USER_TURNS - turn },
      });
    }

    expect(advanceGovernedReferentialScopeUserTurn(scope)).toBe(true);
    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: result,
      referenceKind: "gmail_message",
      ordinal: 1,
      now,
    }).status).toBe("expired");
  });

  it("closing a genuine scope invalidates its result sets, while fabricated closure cannot affect them", () => {
    const scope = createGovernedReferentialScopeReference();
    const result = make({ scopeReference: scope })!;

    expect(closeGovernedReferentialScope({ governedReferentialScopeId: "fabricated" })).toBe(false);
    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: result,
      referenceKind: "gmail_message",
      ordinal: 1,
    }).status).toBe("resolved");

    expect(closeGovernedReferentialScope(scope)).toBe(true);
    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: result,
      referenceKind: "gmail_message",
      ordinal: 1,
    }).status).toBe("invalid");
  });

  it("rejects invalid creation input without mutating existing same-class state", () => {
    const scope = createGovernedReferentialScopeReference();
    const existing = make({ scopeReference: scope, ids: ["kept"] })!;

    expect(make({ scopeReference: scope, ids: ["duplicate", "duplicate"] })).toBeNull();
    expect(createGovernedResultSetReference({
      scopeReference: scope,
      referentialClass: "gmail.latest_messages",
      orderedResourceIds: ["new"],
      originatingOperation: "   ",
    })).toBeNull();

    expect(resolveGovernedResultSetOrdinal({
      scopeReference: scope,
      resultSetReference: existing,
      referenceKind: "gmail_message",
      ordinal: 1,
    })).toMatchObject({ status: "resolved", resourceId: "kept" });
  });

  it("contains no connector, model, pending-authority, chat-history or rendered-prose dependency", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/lighter-jarvis/governed-result-set-reference.ts", "utf8"));

    for (const forbidden of [
      "callClaude",
      "createConnector",
      "retrieveMessage",
      "PendingAuthorization",
      "pendingAuthorizationReference",
      "messages:",
      "Recent Gmail messages:",
      "Calendar factual result:",
      "Drive files:",
    ]) expect(source).not.toContain(forbidden);
  });
});
