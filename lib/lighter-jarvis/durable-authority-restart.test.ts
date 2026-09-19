import { describe, expect, it } from "vitest";

import {
  GOVERNANCE_EPHEMERAL_STATE_TTL_MS,
  type GovernanceEphemeralStateRow,
  type GovernanceEphemeralStateStore,
} from "./governance-ephemeral-state";
import {
  createDurablePendingAuthorization,
  resolveDurablePendingAuthorization,
} from "./durable-pending-authorization";
import {
  createDurableCalendarMoveAuthorizationReference,
  resolveDurableCalendarMoveAuthorization,
} from "./durable-calendar-move-authorization";

function sharedBackend() {
  const rows = new Map<string, GovernanceEphemeralStateRow>();

  const createStore = (): GovernanceEphemeralStateStore => Object.freeze({
    async create(input) {
      if (rows.has(input.id)) return false;
      rows.set(input.id, Object.freeze({
        id: input.id,
        kind: input.kind,
        capability: input.capability,
        payload: input.payload,
        status: "active",
        createdAt: input.createdAt,
        expiresAt: input.expiresAt,
      }));
      return true;
    },
    async read(input) {
      const row = rows.get(input.id);
      if (!row) return Object.freeze({ status: "not_found" as const, row: null });
      if (row.kind !== input.kind || (input.capability !== undefined && row.capability !== input.capability)) {
        return Object.freeze({ status: "mismatch" as const, row: null });
      }
      if (row.status === "consumed") return Object.freeze({ status: "consumed" as const, row: null });
      if (row.status === "revoked") return Object.freeze({ status: "revoked" as const, row: null });
      if (input.now.getTime() >= Date.parse(row.expiresAt)) {
        return Object.freeze({ status: "expired" as const, row: null });
      }
      return Object.freeze({ status: "active" as const, row });
    },
    async consume(input) {
      const row = rows.get(input.id);
      if (!row) return Object.freeze({ status: "not_found" as const, payload: null, expiresAt: null });
      if (row.kind !== input.kind || row.capability !== input.capability) {
        return Object.freeze({ status: "mismatch" as const, payload: null, expiresAt: row.expiresAt });
      }
      if (row.status === "consumed") {
        return Object.freeze({ status: "already_consumed" as const, payload: null, expiresAt: row.expiresAt });
      }
      if (row.status === "revoked") {
        return Object.freeze({ status: "revoked" as const, payload: null, expiresAt: row.expiresAt });
      }
      if (input.now.getTime() >= Date.parse(row.expiresAt)) {
        return Object.freeze({ status: "expired" as const, payload: null, expiresAt: row.expiresAt });
      }
      rows.set(input.id, Object.freeze({ ...row, status: "consumed" as const }));
      return Object.freeze({ status: "consumed" as const, payload: row.payload, expiresAt: row.expiresAt });
    },
  });

  return Object.freeze({
    createStore,
    revoke(id: string) {
      const row = rows.get(id);
      if (row) rows.set(id, Object.freeze({ ...row, status: "revoked" as const }));
    },
  });
}

const calendarReadOperation = Object.freeze({
  capability: "calendar.read" as const,
  window: Object.freeze({
    start: "2026-09-20T00:00:00.000Z",
    end: "2026-09-21T00:00:00.000Z",
    timeZone: "Australia/Melbourne",
    period: "today" as const,
  }),
});

const moveProposal = Object.freeze({
  commitmentReference: "google-calendar:calendar:primary:event:deep",
  calendarId: "primary",
  eventId: "deep",
  expectedStart: "2026-09-20T09:00:00.000Z",
  expectedEnd: "2026-09-20T10:30:00.000Z",
  targetStart: "2026-09-20T10:30:00.000Z",
  targetEnd: "2026-09-20T12:00:00.000Z",
  durationMinutes: 90,
  observedAt: "2026-09-20T08:00:00.000Z",
});

describe("durable authority restart and one-shot invariants", () => {
  it("resolves pending authority from a separate runtime instance and keeps consumption terminal", async () => {
    const backend = sharedBackend();
    const createdAt = new Date("2026-09-20T08:00:00.000Z");
    const reference = await createDurablePendingAuthorization(calendarReadOperation, {
      store: backend.createStore(),
      now: createdAt,
    });
    expect(reference).not.toBeNull();

    const afterRestart = await resolveDurablePendingAuthorization({
      currentUserUtterance: "yes",
      pendingAuthorizationReference: reference,
      expectedCapability: "calendar.read",
      now: new Date("2026-09-20T08:01:00.000Z"),
    }, { store: backend.createStore() });

    expect(afterRestart).toMatchObject({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
      proposedOperation: { capability: "calendar.read" },
    });

    const replayAfterAnotherRestart = await resolveDurablePendingAuthorization({
      currentUserUtterance: "yes",
      pendingAuthorizationReference: reference,
      expectedCapability: "calendar.read",
      now: new Date("2026-09-20T08:02:00.000Z"),
    }, { store: backend.createStore() });

    expect(replayAfterAnotherRestart).toMatchObject({
      decision: "ASK",
      reason: "pending_authorization_already_consumed",
    });
  });

  it("preserves expiry and revocation across runtime instances", async () => {
    const backend = sharedBackend();
    const createdAt = new Date("2026-09-20T08:00:00.000Z");

    const expired = await createDurablePendingAuthorization(calendarReadOperation, {
      store: backend.createStore(),
      now: createdAt,
    });
    expect(expired).not.toBeNull();
    expect(await resolveDurablePendingAuthorization({
      currentUserUtterance: "yes",
      pendingAuthorizationReference: expired,
      expectedCapability: "calendar.read",
      now: new Date(createdAt.getTime() + GOVERNANCE_EPHEMERAL_STATE_TTL_MS),
    }, { store: backend.createStore() })).toMatchObject({
      decision: "ASK",
      reason: "pending_authorization_expired",
    });

    const revoked = await createDurablePendingAuthorization(calendarReadOperation, {
      store: backend.createStore(),
      now: createdAt,
    });
    expect(revoked).not.toBeNull();
    backend.revoke(revoked!.pendingAuthorizationId);
    expect(await resolveDurablePendingAuthorization({
      currentUserUtterance: "yes",
      pendingAuthorizationReference: revoked,
      expectedCapability: "calendar.read",
      now: new Date("2026-09-20T08:01:00.000Z"),
    }, { store: backend.createStore() })).toMatchObject({
      decision: "ASK",
      reason: "pending_authorization_revoked",
    });
  });

  it("allows exactly one concurrent consumer of one pending authorization", async () => {
    const backend = sharedBackend();
    const reference = await createDurablePendingAuthorization(calendarReadOperation, {
      store: backend.createStore(),
      now: new Date("2026-09-20T08:00:00.000Z"),
    });
    expect(reference).not.toBeNull();

    const results = await Promise.all([
      resolveDurablePendingAuthorization({
        currentUserUtterance: "yes",
        pendingAuthorizationReference: reference,
        expectedCapability: "calendar.read",
        now: new Date("2026-09-20T08:01:00.000Z"),
      }, { store: backend.createStore() }),
      resolveDurablePendingAuthorization({
        currentUserUtterance: "yes",
        pendingAuthorizationReference: reference,
        expectedCapability: "calendar.read",
        now: new Date("2026-09-20T08:01:00.000Z"),
      }, { store: backend.createStore() }),
    ]);

    expect(results.filter(result => result.decision === "ALLOW")).toHaveLength(1);
    expect(results.filter(result => result.reason === "pending_authorization_already_consumed")).toHaveLength(1);
  });

  it("reconstructs Calendar move authority from durable snapshot rather than the proposal Map", async () => {
    const backend = sharedBackend();
    const reference = await createDurableCalendarMoveAuthorizationReference(moveProposal, {
      store: backend.createStore(),
      now: new Date("2026-09-20T08:00:00.000Z"),
    });
    expect(reference).not.toBeNull();

    const resolved = await resolveDurableCalendarMoveAuthorization({
      reference,
      utterance: "confirm",
      now: new Date("2026-09-20T08:01:00.000Z"),
    }, { store: backend.createStore() });

    expect(resolved).toEqual({
      status: "confirmed",
      proposal: moveProposal,
    });

    expect(await resolveDurableCalendarMoveAuthorization({
      reference,
      utterance: "confirm",
      now: new Date("2026-09-20T08:02:00.000Z"),
    }, { store: backend.createStore() })).toEqual({
      status: "consumed",
      proposal: null,
    });
  });
});
