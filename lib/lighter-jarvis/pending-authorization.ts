import type { ProposedOperation } from "./calendar-read-authority";

export type PendingAuthorizationScope = Readonly<{
  requestedLimit: number;
  horizonDays: number;
}>;

/** One active, bounded operation waiting for the user's confirmation. */
export type PendingAuthorization = Readonly<{
  id: string;
  proposedOperation: ProposedOperation;
  scope: PendingAuthorizationScope;
}>;

export type PendingAuthorizationConfirmationEvidence = Readonly<{
  source: "pending_authorization_confirmation";
  pendingAuthorizationId: string;
  utterance: string;
  basis: "explicit_confirmation";
}>;

export type PendingAuthorizationResolution = Readonly<{
  decision: "ALLOW" | "ASK";
  reason: "pending_authorization_confirmed" | "pending_authorization_not_confirmed";
  proposedOperation: ProposedOperation | null;
  scope: PendingAuthorizationScope | null;
  authorityEvidence: readonly PendingAuthorizationConfirmationEvidence[];
  /** Null means that the exact pending authorization was consumed. */
  pendingAuthorization: PendingAuthorization | null;
}>;

const EXPLICIT_CONFIRMATION = /^(?:yes|yes,?\s+please|confirm|confirmed|proceed|go\s+ahead)[.!]?$/i;

/**
 * Resolves confirmation solely from the raw current utterance and the active
 * pending authorization. A caller cannot supply a confirmation flag, an
 * authority decision, or an operation different from the pending operation.
 */
export function resolvePendingAuthorization(input: {
  readonly currentUserUtterance: string;
  readonly pendingAuthorization: PendingAuthorization | null;
}): PendingAuthorizationResolution {
  const pending = input.pendingAuthorization;
  const confirmed = pending !== null && EXPLICIT_CONFIRMATION.test(input.currentUserUtterance.trim());

  if (!confirmed) {
    return Object.freeze({
      decision: "ASK",
      reason: "pending_authorization_not_confirmed",
      proposedOperation: null,
      scope: null,
      authorityEvidence: Object.freeze([]),
      pendingAuthorization: pending,
    });
  }

  return Object.freeze({
    decision: "ALLOW",
    reason: "pending_authorization_confirmed",
    proposedOperation: pending.proposedOperation,
    scope: pending.scope,
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
