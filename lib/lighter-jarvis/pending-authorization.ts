import { randomUUID } from "node:crypto";

import type { ProposedCalendarReadOperation } from "./calendar-read-authority";
import type { ProposedGmailReadOperation } from "./gmail-read-authority";
import type { ProposedGmailSearchOperation } from "./gmail-search-authority";
import type { ProposedDriveSearchOperation } from "./drive-search-authority";

type ProposedOperation = ProposedCalendarReadOperation | ProposedGmailReadOperation | ProposedGmailSearchOperation | ProposedDriveSearchOperation;

/**
 * An opaque, non-authoritative handle that may cross the client boundary.
 * Possessing (or manufacturing) a handle is not proof that a pending
 * authorization exists; resolution always consults server-owned state.
 */
export type PendingAuthorizationReference = Readonly<{
  pendingAuthorizationId: string;
}>;

type PendingAuthorization = Readonly<{
  id: string;
  proposedOperation: ProposedOperation;
  reference: PendingAuthorizationReference;
  status: "active" | "consumed";
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
    | "pending_authorization_already_consumed"
    | "pending_authorization_reference_invalid"
    | "pending_authorization_not_found"
    | "pending_authorization_capability_mismatch";
  proposedOperation: ProposedOperation | null;
  authorityEvidence: readonly PendingAuthorizationConfirmationEvidence[];
  pendingAuthorizationReference: PendingAuthorizationReference | null;
}>;

// This registry is deliberately module-private. A reference supplied by a
// caller never becomes an authorization record and never supplies an operation.
const pendingAuthorizations = new Map<string, PendingAuthorization>();
const EXPLICIT_CONFIRMATION = /^(?:yes|yes,?\s+please|confirm|confirmed|proceed|go\s+ahead)[.!]?$/i;
const EXPLICIT_DECLINE = /^(?:no|no,?\s+thanks|decline|cancel|never\s+mind)[.!]?$/i;

/** Creates server-owned pending state and returns only its non-authoritative reference. */
export function createPendingAuthorization(
  proposedOperation: ProposedOperation,
): PendingAuthorizationReference {
  const id = randomUUID();
  const reference = Object.freeze({ pendingAuthorizationId: id });
  pendingAuthorizations.set(id, Object.freeze({ id, proposedOperation, reference, status: "active" }));
  return reference;
}

/**
 * Resolves a client-carried reference against server-owned pending state.
 * Fields on the caller's object other than the identifier are never read.
 */
export function resolvePendingAuthorization(input: {
  readonly currentUserUtterance: string;
  readonly pendingAuthorizationReference?: unknown;
  readonly expectedCapability?: ProposedOperation["capability"];
}): PendingAuthorizationResolution {
  const suppliedReference = input.pendingAuthorizationReference;
  if (suppliedReference === null) {
    return resolution("ASK", "pending_authorization_not_confirmed", null);
  }
  if (!isPendingAuthorizationReference(suppliedReference)) {
    return resolution("ASK", "pending_authorization_reference_invalid", null);
  }

  const pending = pendingAuthorizations.get(suppliedReference.pendingAuthorizationId);
  if (pending === undefined) {
    return resolution("ASK", "pending_authorization_not_found", null);
  }
  if (input.expectedCapability !== undefined && pending.proposedOperation.capability !== input.expectedCapability) {
    return resolution("ASK", "pending_authorization_capability_mismatch", pending.reference);
  }
  if (pending.status === "consumed") {
    return resolution("ASK", "pending_authorization_already_consumed", null);
  }

  const utterance = input.currentUserUtterance.trim();
  if (EXPLICIT_CONFIRMATION.test(utterance)) {
    consume(pending);
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
      pendingAuthorizationReference: null,
    });
  }

  if (EXPLICIT_DECLINE.test(utterance)) {
    consume(pending);
    return resolution("DENY", "pending_authorization_declined", null);
  }

  return resolution("ASK", "pending_authorization_not_confirmed", pending.reference);
}

function isPendingAuthorizationReference(value: unknown): value is PendingAuthorizationReference {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const id = Object.getOwnPropertyDescriptor(value, "pendingAuthorizationId");
  return id !== undefined && "value" in id && typeof id.value === "string" && id.value.trim().length > 0;
}

function consume(pending: PendingAuthorization): void {
  pendingAuthorizations.set(pending.id, Object.freeze({ ...pending, status: "consumed" }));
}

function resolution(
  decision: "ASK" | "DENY",
  reason: Exclude<PendingAuthorizationResolution["reason"], "pending_authorization_confirmed">,
  pendingAuthorizationReference: PendingAuthorizationReference | null,
): PendingAuthorizationResolution {
  return Object.freeze({
    decision,
    reason,
    proposedOperation: null,
    authorityEvidence: Object.freeze([]),
    pendingAuthorizationReference,
  });
}
