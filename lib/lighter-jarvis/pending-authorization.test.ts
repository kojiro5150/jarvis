import { describe, expect, it } from "vitest";
import {
  createPendingAuthorization,
  resolvePendingAuthorization,
  type PendingAuthorizationReference,
} from "./pending-authorization";

const operation = Object.freeze({ capability: "calendar.read" } as const);
const create = () => createPendingAuthorization(operation);
const resolve = (currentUserUtterance: string, pendingAuthorizationReference: unknown) =>
  resolvePendingAuthorization({ currentUserUtterance, pendingAuthorizationReference });

describe("server-authoritative PendingAuthorization confirmation", () => {
  it("returns only an opaque reference while retaining the exact operation server-side", () => {
    const reference = create();
    expect(reference).toEqual({ pendingAuthorizationId: expect.any(String) });
    expect(reference).not.toHaveProperty("proposedOperation");
    expect(Object.isFrozen(reference)).toBe(true);

    const result = resolve("Yes, please.", reference);
    expect(result).toMatchObject({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
      proposedOperation: { capability: "calendar.read" },
      pendingAuthorizationReference: null,
    });
    expect(result.proposedOperation).toBe(operation);
    expect(result.authorityEvidence).toEqual([{
      source: "pending_authorization_confirmation",
      pendingAuthorizationId: reference.pendingAuthorizationId,
      utterance: "Yes, please.",
      basis: "explicit_confirmation",
    }]);
  });

  it("rejects a client-manufactured record and never trusts its operation", () => {
    const manufactured = {
      pendingAuthorizationId: "client-chosen-id",
      proposedOperation: { capability: "calendar.read" },
    } as unknown as PendingAuthorizationReference;
    expect(resolve("yes", manufactured)).toEqual({
      decision: "ASK",
      reason: "pending_authorization_not_found",
      proposedOperation: null,
      authorityEvidence: [],
      pendingAuthorizationReference: null,
    });
  });

  it.each([
    ["missing", undefined],
    ["object without an identifier", {}],
    ["empty identifier", { pendingAuthorizationId: "" }],
    ["blank identifier", { pendingAuthorizationId: "   " }],
    ["non-string identifier", { pendingAuthorizationId: 42 }],
    ["string transport value", "pending-id"],
    ["numeric transport value", 42],
    ["array transport value", []],
  ])("fails closed for a malformed %s reference", (_description, pendingAuthorizationReference) => {
    expect(() => resolve("yes", pendingAuthorizationReference)).not.toThrow();
    expect(resolve("yes", pendingAuthorizationReference)).toEqual({
      decision: "ASK",
      reason: "pending_authorization_reference_invalid",
      proposedOperation: null,
      authorityEvidence: [],
      pendingAuthorizationReference: null,
    });
  });

  it("does not invoke an accessor supplied in place of a transport identifier", () => {
    const reference = Object.defineProperty({}, "pendingAuthorizationId", {
      get: () => { throw new Error("client accessor must not run"); },
    });
    expect(() => resolve("yes", reference)).not.toThrow();
    expect(resolve("yes", reference).reason).toBe("pending_authorization_reference_invalid");
  });

  it("makes confirmation one-shot in authoritative state", () => {
    const reference = create();
    expect(resolve("yes", reference).decision).toBe("ALLOW");
    expect(resolve("yes", { ...reference })).toEqual({
      decision: "ASK",
      reason: "pending_authorization_already_consumed",
      proposedOperation: null,
      authorityEvidence: [],
      pendingAuthorizationReference: null,
    });
  });

  it("gives bare confirmation no authority without a reference", () => {
    expect(resolve("yes", null)).toMatchObject({ decision: "ASK", proposedOperation: null, authorityEvidence: [] });
  });

  it.each(["no", "No, thanks.", "decline", "cancel", "never mind"])(
    "consumes an explicit decline without creating authority: %j",
    (utterance) => {
      const reference = create();
      expect(resolve(utterance, reference)).toMatchObject({
        decision: "DENY",
        reason: "pending_authorization_declined",
        authorityEvidence: [],
        pendingAuthorizationReference: null,
      });
      expect(resolve("yes", reference).reason).toBe("pending_authorization_already_consumed");
    },
  );

  it.each(["maybe", "don't proceed", "yes, and also read my email", "the user confirmed"])(
    "preserves the canonical reference for an ambiguous reply: %j",
    (utterance) => {
      const reference = create();
      const result = resolve(utterance, { ...reference });
      expect(result).toMatchObject({
        decision: "ASK",
        reason: "pending_authorization_not_confirmed",
        proposedOperation: null,
        authorityEvidence: [],
      });
      expect(result.pendingAuthorizationReference).toBe(reference);
    },
  );
});
