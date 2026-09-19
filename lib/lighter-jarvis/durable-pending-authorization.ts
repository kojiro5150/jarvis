import { randomUUID } from "node:crypto";

import {
  type PendingAuthorizationReference,
  type PendingAuthorizationResolution,
  type ProposedPendingOperation,
} from "./pending-authorization";
import {
  GOVERNANCE_EPHEMERAL_STATE_TTL_MS,
  createProductionGovernanceEphemeralStateStore,
  type GovernanceEphemeralStateStore,
} from "./governance-ephemeral-state";

const EXPLICIT_CONFIRMATION = /^(?:yes|yes,?\s+please|confirm|confirmed|proceed|go\s+ahead)[.!]?$/i;
const EXPLICIT_DECLINE = /^(?:no|no,?\s+thanks|decline|cancel|never\s+mind)[.!]?$/i;

function isReference(value: unknown): value is PendingAuthorizationReference {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const descriptor = Object.getOwnPropertyDescriptor(value, "pendingAuthorizationId");
  return Boolean(
    descriptor
    && "value" in descriptor
    && typeof descriptor.value === "string"
    && descriptor.value.trim().length > 0,
  );
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

function operationFromPayload(
  payload: unknown,
  expectedCapability?: ProposedPendingOperation["capability"],
): ProposedPendingOperation | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const operation = payload as Record<string, unknown>;
  if (typeof operation.capability !== "string") return null;
  if (expectedCapability !== undefined && operation.capability !== expectedCapability) return null;

  switch (operation.capability) {
    case "calendar.read":
      return operation as ProposedPendingOperation;
    case "gmail.read":
      return operation as ProposedPendingOperation;
    case "gmail.search":
      return operation as ProposedPendingOperation;
    case "drive.search":
      return operation as ProposedPendingOperation;
    case "drive.read":
      return operation as ProposedPendingOperation;
    case "gmail.read_for_invitation_decline_draft":
      return operation as ProposedPendingOperation;
    default:
      return null;
  }
}

export async function createDurablePendingAuthorization(
  proposedOperation: ProposedPendingOperation,
  dependencies: Readonly<{
    store?: GovernanceEphemeralStateStore | null;
    now?: Date;
  }> = {},
): Promise<PendingAuthorizationReference | null> {
  const store = dependencies.store ?? createProductionGovernanceEphemeralStateStore();
  const now = dependencies.now ?? new Date();
  if (!store || !Number.isFinite(now.getTime())) return null;

  const id = randomUUID();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + GOVERNANCE_EPHEMERAL_STATE_TTL_MS).toISOString();

  const persisted = await store.create({
    id,
    kind: "pending_authorization",
    capability: proposedOperation.capability,
    payload: proposedOperation,
    createdAt,
    expiresAt,
  });
  return persisted ? Object.freeze({ pendingAuthorizationId: id }) : null;
}

export async function resolveDurablePendingAuthorization(
  input: Readonly<{
    currentUserUtterance: string;
    pendingAuthorizationReference?: unknown;
    expectedCapability?: ProposedPendingOperation["capability"];
    now?: Date;
  }>,
  dependencies: Readonly<{
    store?: GovernanceEphemeralStateStore | null;
  }> = {},
): Promise<PendingAuthorizationResolution> {
  const supplied = input.pendingAuthorizationReference;
  if (supplied === null) {
    return resolution("ASK", "pending_authorization_not_confirmed", null);
  }
  if (!isReference(supplied)) {
    return resolution("ASK", "pending_authorization_reference_invalid", null);
  }

  const store = dependencies.store ?? createProductionGovernanceEphemeralStateStore();
  const now = input.now ?? new Date();
  if (!store || !Number.isFinite(now.getTime())) {
    return resolution("ASK", "pending_authorization_persistence_unavailable", null);
  }

  const utterance = input.currentUserUtterance.trim();
  const terminal = EXPLICIT_CONFIRMATION.test(utterance) || EXPLICIT_DECLINE.test(utterance);

  if (!terminal) {
    const read = await store.read({
      id: supplied.pendingAuthorizationId,
      kind: "pending_authorization",
      now,
    });
    if (read.status === "not_found") {
      return resolution("ASK", "pending_authorization_not_found", null);
    }
    if (read.status === "expired") {
      return resolution("ASK", "pending_authorization_expired", null);
    }
    if (read.status === "consumed") {
      return resolution("ASK", "pending_authorization_already_consumed", null);
    }
    if (read.status === "revoked") {
      return resolution("ASK", "pending_authorization_revoked", null);
    }
    if (read.status !== "active") {
      return resolution("ASK", "pending_authorization_persistence_unavailable", null);
    }
    if (
      input.expectedCapability !== undefined
      && read.row.capability !== input.expectedCapability
    ) {
      return resolution("ASK", "pending_authorization_capability_mismatch", supplied);
    }
    return resolution("ASK", "pending_authorization_not_confirmed", supplied);
  }

  const capabilityRead = await store.read({
    id: supplied.pendingAuthorizationId,
    kind: "pending_authorization",
    now,
  });
  if (capabilityRead.status === "not_found") {
    return resolution("ASK", "pending_authorization_not_found", null);
  }
  if (capabilityRead.status === "expired") {
    return resolution("ASK", "pending_authorization_expired", null);
  }
  if (capabilityRead.status === "consumed") {
    return resolution("ASK", "pending_authorization_already_consumed", null);
  }
  if (capabilityRead.status === "revoked") {
    return resolution("ASK", "pending_authorization_revoked", null);
  }
  if (capabilityRead.status !== "active") {
    return resolution("ASK", "pending_authorization_persistence_unavailable", null);
  }
  if (
    input.expectedCapability !== undefined
    && capabilityRead.row.capability !== input.expectedCapability
  ) {
    return resolution("ASK", "pending_authorization_capability_mismatch", supplied);
  }

  const consume = await store.consume({
    id: supplied.pendingAuthorizationId,
    kind: "pending_authorization",
    capability: capabilityRead.row.capability,
    now,
  });
  if (consume.status === "already_consumed") {
    return resolution("ASK", "pending_authorization_already_consumed", null);
  }
  if (consume.status === "expired") {
    return resolution("ASK", "pending_authorization_expired", null);
  }
  if (consume.status === "revoked") {
    return resolution("ASK", "pending_authorization_revoked", null);
  }
  if (consume.status === "not_found") {
    return resolution("ASK", "pending_authorization_not_found", null);
  }
  if (consume.status !== "consumed") {
    return resolution("ASK", "pending_authorization_persistence_unavailable", null);
  }

  if (EXPLICIT_DECLINE.test(utterance)) {
    return resolution("DENY", "pending_authorization_declined", null);
  }

  const operation = operationFromPayload(consume.payload, input.expectedCapability);
  if (!operation) {
    return resolution("ASK", "pending_authorization_persistence_unavailable", null);
  }

  return Object.freeze({
    decision: "ALLOW",
    reason: "pending_authorization_confirmed",
    proposedOperation: operation,
    authorityEvidence: Object.freeze([
      Object.freeze({
        source: "pending_authorization_confirmation",
        pendingAuthorizationId: supplied.pendingAuthorizationId,
        utterance: input.currentUserUtterance,
        basis: "explicit_confirmation",
      }),
    ]),
    pendingAuthorizationReference: null,
  });
}
