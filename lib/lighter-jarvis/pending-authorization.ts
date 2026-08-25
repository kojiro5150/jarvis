import type { ProposedOperation } from "./calendar-read-authority";

const activePendingAuthorization: unique symbol = Symbol("activePendingAuthorization");

/** One active authorization bound to the exact proposed operation awaiting confirmation. */
export type PendingAuthorization = Readonly<{
  id: string;
  proposedOperation: ProposedOperation;
  readonly [activePendingAuthorization]: true;
}>;

export type PendingAuthorizationConfirmationEvidence = Readonly<{
  source: "pending_authorization_confirmation";
  pendingAuthorizationId: string;
  utterance: string;
  basis: "explicit_confirmation";
}>;

export type PendingAuthorizationResolution = Readonly<{
  decision: "ALLOW" | "ASK" | "DENY";
  reason:
    | "pending_authorization_confirmed"
    | "pending_authorization_declined"
    | "pending_authorization_not_confirmed"
    | "pending_authorization_already_consumed";
  proposedOperation: ProposedOperation | null;
  authorityEvidence: readonly PendingAuthorizationConfirmationEvidence[];
  pendingAuthorization: PendingAuthorization | null;
}>;

const consumedPendingAuthorizations = new WeakSet<PendingAuthorization>();
const EXPLICIT_CONFIRMATION = /^(?:yes|yes,?\s+please|confirm|confirmed|proceed|go\s+ahead)[.!]?$/i;
const EXPLICIT_DECLINE = /^(?:no|no,?\s+thanks|decline|cancel|never\s+mind)[.!]?$/i;

/** Creates the only public representation accepted as an active pending authorization. */
export function createPendingAuthorization(
  id: string,
  proposedOperation: ProposedOperation,
): PendingAuthorization {
  return Object.freeze({
    id,
    proposedOperation,
    [activePendingAuthorization]: true as const,
  });
}

/**
 * Resolves confirmation or decline solely from the raw current utterance and
 * active pending authorization. Confirmation and decline each consume the
 * value; a consumed value cannot mint a later ALLOW even if retained by a
 * caller and submitted again.
 */
export function resolvePendingAuthorization(input: {
  readonly currentUserUtterance: string;
  readonly pendingAuthorization: PendingAuthorization | null;
}): PendingAuthorizationResolution {
  const pending = input.pendingAuthorization;

  if (pending !== null && consumedPendingAuthorizations.has(pending)) {
    return resolution("ASK", "pending_authorization_already_consumed", null);
  }

  const utterance = input.currentUserUtterance.trim();

  if (pending !== null && EXPLICIT_CONFIRMATION.test(utterance)) {
    consumedPendingAuthorizations.add(pending);
    return Object.freeze({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
      proposedOperation: pending.proposedOperation,
      authorityEvidence: Object.freeze([
        Object.freeze({
          source: "pending_authorization_confirmation",
          pendingAuthorizationId: pending.id,
          utterance: input.currentUserUtterance,
          basis: "explicit_confirmation",
        }),
      ]),
      pendingAuthorization: null,
    });
  }

  if (pending !== null && EXPLICIT_DECLINE.test(utterance)) {
    consumedPendingAuthorizations.add(pending);
    return resolution("DENY", "pending_authorization_declined", null);
  }

  return resolution("ASK", "pending_authorization_not_confirmed", pending);
}

function resolution(
  decision: "ASK" | "DENY",
  reason: Exclude<PendingAuthorizationResolution["reason"], "pending_authorization_confirmed">,
  pendingAuthorization: PendingAuthorization | null,
): PendingAuthorizationResolution {
  return Object.freeze({
    decision,
    reason,
    proposedOperation: null,
    authorityEvidence: Object.freeze([]),
    pendingAuthorization,
  });
}
