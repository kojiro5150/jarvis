import { randomUUID } from "node:crypto";

import type { CalendarMoveProposalSnapshot } from "./calendar-move-proposal-reference";
import {
  GOVERNANCE_EPHEMERAL_STATE_TTL_MS,
  createProductionGovernanceEphemeralStateStore,
  type GovernanceEphemeralStateStore,
} from "./governance-ephemeral-state";
import type {
  CalendarMoveAuthorizationReference,
  CalendarMoveAuthorizationResolution,
} from "./calendar-move-authorization";

const YES = /^(?:yes|yes,?\s+please|confirm|confirmed|proceed|go\s+ahead)[.!]?$/i;
const NO = /^(?:no|no,?\s+thanks|decline|cancel|never\s+mind)[.!]?$/i;
const CAPABILITY = "calendar.event.move";

function idOf(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const descriptor = Object.getOwnPropertyDescriptor(value, "calendarMoveAuthorizationReferenceId");
  return descriptor
    && "value" in descriptor
    && typeof descriptor.value === "string"
    && descriptor.value.trim()
    ? descriptor.value
    : null;
}

function proposalFromPayload(payload: unknown): CalendarMoveProposalSnapshot | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const value = payload as Record<string, unknown>;
  const stringFields = [
    "commitmentReference",
    "calendarId",
    "eventId",
    "expectedStart",
    "expectedEnd",
    "targetStart",
    "targetEnd",
    "observedAt",
  ] as const;
  if (stringFields.some(field => typeof value[field] !== "string" || !(value[field] as string).trim())) {
    return null;
  }
  if (typeof value.durationMinutes !== "number" || !Number.isFinite(value.durationMinutes) || value.durationMinutes <= 0) {
    return null;
  }
  if (
    !Number.isFinite(Date.parse(value.expectedStart as string))
    || !Number.isFinite(Date.parse(value.expectedEnd as string))
    || !Number.isFinite(Date.parse(value.targetStart as string))
    || !Number.isFinite(Date.parse(value.targetEnd as string))
    || !Number.isFinite(Date.parse(value.observedAt as string))
  ) return null;

  return Object.freeze({
    commitmentReference: value.commitmentReference as string,
    calendarId: value.calendarId as string,
    eventId: value.eventId as string,
    expectedStart: value.expectedStart as string,
    expectedEnd: value.expectedEnd as string,
    targetStart: value.targetStart as string,
    targetEnd: value.targetEnd as string,
    durationMinutes: value.durationMinutes,
    observedAt: value.observedAt as string,
  });
}

export async function createDurableCalendarMoveAuthorizationReference(
  proposal: CalendarMoveProposalSnapshot,
  dependencies: Readonly<{
    store?: GovernanceEphemeralStateStore | null;
    now?: Date;
  }> = {},
): Promise<CalendarMoveAuthorizationReference | null> {
  const store = dependencies.store ?? createProductionGovernanceEphemeralStateStore();
  const now = dependencies.now ?? new Date();
  if (!store || !Number.isFinite(now.getTime()) || !proposalFromPayload(proposal)) return null;

  const id = randomUUID();
  const persisted = await store.create({
    id,
    kind: "calendar_move_authorization",
    capability: CAPABILITY,
    payload: proposal,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + GOVERNANCE_EPHEMERAL_STATE_TTL_MS).toISOString(),
  });
  return persisted ? Object.freeze({ calendarMoveAuthorizationReferenceId: id }) : null;
}

export async function resolveDurableCalendarMoveAuthorization(
  input: Readonly<{
    reference: unknown;
    utterance: string;
    now?: Date;
  }>,
  dependencies: Readonly<{
    store?: GovernanceEphemeralStateStore | null;
  }> = {},
): Promise<CalendarMoveAuthorizationResolution> {
  const id = idOf(input.reference);
  if (!id) return Object.freeze({ status: "invalid", proposal: null });

  const store = dependencies.store ?? createProductionGovernanceEphemeralStateStore();
  const now = input.now ?? new Date();
  if (!store || !Number.isFinite(now.getTime())) {
    return Object.freeze({ status: "invalid", proposal: null });
  }

  if (!YES.test(input.utterance) && !NO.test(input.utterance)) {
    const read = await store.read({
      id,
      kind: "calendar_move_authorization",
      capability: CAPABILITY,
      now,
    });
    if (read.status === "consumed") return Object.freeze({ status: "consumed", proposal: null });
    return read.status === "active"
      ? Object.freeze({ status: "not_confirmed", proposal: null })
      : Object.freeze({ status: "invalid", proposal: null });
  }

  const consumed = await store.consume({
    id,
    kind: "calendar_move_authorization",
    capability: CAPABILITY,
    now,
  });
  if (consumed.status === "already_consumed") {
    return Object.freeze({ status: "consumed", proposal: null });
  }
  if (consumed.status !== "consumed") {
    return Object.freeze({ status: "invalid", proposal: null });
  }
  if (NO.test(input.utterance)) {
    return Object.freeze({ status: "declined", proposal: null });
  }

  const proposal = proposalFromPayload(consumed.payload);
  return proposal
    ? Object.freeze({ status: "confirmed", proposal })
    : Object.freeze({ status: "invalid", proposal: null });
}
