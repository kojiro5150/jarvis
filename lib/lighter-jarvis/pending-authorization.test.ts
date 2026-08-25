import { describe, expect, it } from "vitest";
import {
  resolvePendingAuthorization,
  type PendingAuthorization,
} from "./pending-authorization";

const pending: PendingAuthorization = Object.freeze({
  id: "pending-calendar-tomorrow",
  proposedOperation: Object.freeze({ capability: "calendar.read" }),
  scope: Object.freeze({ requestedLimit: 10, horizonDays: 1 }),
});

describe("PendingAuthorization confirmation", () => {
  it("allows and consumes only the exact pending operation", () => {
    const resolution = resolvePendingAuthorization({
      currentUserUtterance: "Yes, please.",
      pendingAuthorization: pending,
    });

    expect(resolution).toEqual({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
      proposedOperation: { capability: "calendar.read" },
      scope: { requestedLimit: 10, horizonDays: 1 },
      authorityEvidence: [{
        source: "pending_authorization_confirmation",
        pendingAuthorizationId: "pending-calendar-tomorrow",
        utterance: "Yes, please.",
        basis: "explicit_confirmation",
      }],
      pendingAuthorization: null,
    });
    expect(resolution.proposedOperation).toBe(pending.proposedOperation);
    expect(resolution.scope).toBe(pending.scope);
    expect(Object.isFrozen(resolution)).toBe(true);
    expect(Object.isFrozen(resolution.authorityEvidence)).toBe(true);
    expect(Object.isFrozen(resolution.authorityEvidence[0])).toBe(true);
  });

  it("does not give a bare confirmation authority without an active pending authorization", () => {
    expect(resolvePendingAuthorization({
      currentUserUtterance: "yes",
      pendingAuthorization: null,
    })).toEqual({
      decision: "ASK",
      reason: "pending_authorization_not_confirmed",
      proposedOperation: null,
      scope: null,
      authorityEvidence: [],
      pendingAuthorization: null,
    });
  });

  it.each([
    "no",
    "maybe",
    "don't proceed",
    "yes, and also read my email",
    "the user confirmed",
  ])("does not derive confirmation from %j", (currentUserUtterance) => {
    const resolution = resolvePendingAuthorization({ currentUserUtterance, pendingAuthorization: pending });

    expect(resolution).toMatchObject({
      decision: "ASK",
      reason: "pending_authorization_not_confirmed",
      proposedOperation: null,
      scope: null,
      authorityEvidence: [],
      pendingAuthorization: pending,
    });
  });
});
