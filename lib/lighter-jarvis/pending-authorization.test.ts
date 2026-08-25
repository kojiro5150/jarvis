import { describe, expect, it } from "vitest";
import {
  createPendingAuthorization,
  resolvePendingAuthorization,
} from "./pending-authorization";

let pendingSequence = 0;

function pendingAuthorization(id = `pending-calendar-${pendingSequence += 1}`) {
  return createPendingAuthorization(
    id,
    Object.freeze({ capability: "calendar.read" }),
  );
}

describe("PendingAuthorization confirmation", () => {
  it("allows and consumes only the exact proposed operation", () => {
    const pending = pendingAuthorization("pending-calendar-tomorrow");
    const resolution = resolvePendingAuthorization({
      currentUserUtterance: "Yes, please.",
      pendingAuthorization: pending,
    });

    expect(resolution).toEqual({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
      proposedOperation: { capability: "calendar.read" },
      authorityEvidence: [{
        source: "pending_authorization_confirmation",
        pendingAuthorizationId: "pending-calendar-tomorrow",
        utterance: "Yes, please.",
        basis: "explicit_confirmation",
      }],
      pendingAuthorization: null,
    });
    expect(resolution.proposedOperation).toBe(pending.proposedOperation);
    expect(Object.isFrozen(resolution)).toBe(true);
    expect(Object.isFrozen(resolution.authorityEvidence)).toBe(true);
    expect(Object.isFrozen(resolution.authorityEvidence[0])).toBe(true);
  });

  it("cannot replay a consumed pending authorization to mint another ALLOW", () => {
    const pending = pendingAuthorization();
    expect(resolvePendingAuthorization({ currentUserUtterance: "yes", pendingAuthorization: pending }).decision).toBe("ALLOW");

    expect(resolvePendingAuthorization({ currentUserUtterance: "yes", pendingAuthorization: pending })).toEqual({
      decision: "ASK",
      reason: "pending_authorization_already_consumed",
      proposedOperation: null,
      authorityEvidence: [],
      pendingAuthorization: null,
    });
  });

  it("cannot replay a consumed pending authorization ID through a different object", () => {
    const first = pendingAuthorization("pending-calendar-duplicate");
    const duplicateId = pendingAuthorization("pending-calendar-duplicate");
    expect(first).not.toBe(duplicateId);
    expect(resolvePendingAuthorization({ currentUserUtterance: "yes", pendingAuthorization: first }).decision).toBe("ALLOW");

    expect(resolvePendingAuthorization({ currentUserUtterance: "yes", pendingAuthorization: duplicateId })).toEqual({
      decision: "ASK",
      reason: "pending_authorization_already_consumed",
      proposedOperation: null,
      authorityEvidence: [],
      pendingAuthorization: null,
    });
  });

  it("does not give a bare confirmation authority without an active pending authorization", () => {
    expect(resolvePendingAuthorization({ currentUserUtterance: "yes", pendingAuthorization: null })).toMatchObject({
      decision: "ASK",
      proposedOperation: null,
      authorityEvidence: [],
      pendingAuthorization: null,
    });
  });

  it.each(["no", "No, thanks.", "decline", "cancel", "never mind"])(
    "consumes an explicit decline without creating authority: %j",
    (currentUserUtterance) => {
      const pending = pendingAuthorization();
      expect(resolvePendingAuthorization({ currentUserUtterance, pendingAuthorization: pending })).toEqual({
        decision: "DENY",
        reason: "pending_authorization_declined",
        proposedOperation: null,
        authorityEvidence: [],
        pendingAuthorization: null,
      });
      expect(resolvePendingAuthorization({ currentUserUtterance: "yes", pendingAuthorization: pending }).decision).toBe("ASK");
    },
  );

  it.each(["maybe", "don't proceed", "yes, and also read my email", "the user confirmed"])(
    "preserves the pending authorization for an ambiguous or non-matching reply: %j",
    (currentUserUtterance) => {
      const pending = pendingAuthorization();
      expect(resolvePendingAuthorization({ currentUserUtterance, pendingAuthorization: pending })).toMatchObject({
        decision: "ASK",
        reason: "pending_authorization_not_confirmed",
        proposedOperation: null,
        authorityEvidence: [],
        pendingAuthorization: pending,
      });
    },
  );
});
