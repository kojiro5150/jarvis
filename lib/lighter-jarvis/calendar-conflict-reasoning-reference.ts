import { randomUUID } from "node:crypto";

import type { GoldenScenarioGateKObservation } from "../governed-conversation/golden-scenario-calendar-conflict-gate-k";

export const CALENDAR_CONFLICT_REASONING_REFERENCE_TTL_MS = 15 * 60 * 1000;
export const CALENDAR_CONFLICT_REASONING_MAX_SUBSEQUENT_USER_TURNS = 6;

export type CalendarConflictReasoningReference = Readonly<{
  calendarConflictReasoningReferenceId: string;
}>;

type StoredCalendarConflictReasoning = Readonly<{
  id: string;
  reference: CalendarConflictReasoningReference;
  observation: GoldenScenarioGateKObservation;
  createdAt: string;
  expiresAt: string;
  subsequentUserTurns: number;
  supersededBy: string | null;
}>;

export type CalendarConflictReasoningResolution =
  | Readonly<{ status: "resolved"; observation: GoldenScenarioGateKObservation }>
  | Readonly<{ status: "expired" | "invalid" | "absent"; observation: null }>;

const store = new Map<string, StoredCalendarConflictReasoning>();

function isReference(value: unknown): value is CalendarConflictReasoningReference {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const descriptor = Object.getOwnPropertyDescriptor(value, "calendarConflictReasoningReferenceId");
  return Boolean(
    descriptor
    && "value" in descriptor
    && typeof descriptor.value === "string"
    && descriptor.value.trim().length > 0,
  );
}

function cloneObservation(observation: GoldenScenarioGateKObservation): GoldenScenarioGateKObservation {
  return Object.freeze({
    observedAt: observation.observedAt,
    addedPendingInvitation: Object.freeze({ ...observation.addedPendingInvitation }),
    existingDeepWorkCommitment: Object.freeze({ ...observation.existingDeepWorkCommitment }),
    overlapStart: observation.overlapStart,
    overlapEnd: observation.overlapEnd,
    overlapMinutes: observation.overlapMinutes,
  });
}

function storedFrom(reference: unknown): StoredCalendarConflictReasoning | null {
  if (!isReference(reference)) return null;
  return store.get(reference.calendarConflictReasoningReferenceId) ?? null;
}

export function createCalendarConflictReasoningReference(input: {
  readonly observation: GoldenScenarioGateKObservation;
  readonly previousReference?: unknown;
  readonly now?: Date;
}): CalendarConflictReasoningReference | null {
  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime())) return null;

  const id = randomUUID();
  const reference = Object.freeze({ calendarConflictReasoningReferenceId: id });

  const previous = input.previousReference === undefined ? null : storedFrom(input.previousReference);
  if (previous && previous.supersededBy === null) {
    store.set(previous.id, Object.freeze({ ...previous, supersededBy: id }));
  }

  store.set(id, Object.freeze({
    id,
    reference,
    observation: cloneObservation(input.observation),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CALENDAR_CONFLICT_REASONING_REFERENCE_TTL_MS).toISOString(),
    subsequentUserTurns: 0,
    supersededBy: null,
  }));
  return reference;
}

export function advanceCalendarConflictReasoningReferenceUserTurn(reference: unknown): boolean {
  const stored = storedFrom(reference);
  if (!stored || stored.supersededBy !== null) return false;
  store.set(stored.id, Object.freeze({
    ...stored,
    subsequentUserTurns: stored.subsequentUserTurns + 1,
  }));
  return true;
}

export function resolveCalendarConflictReasoningReference(input: {
  readonly reference: unknown;
  readonly now?: Date;
}): CalendarConflictReasoningResolution {
  if (input.reference === undefined || input.reference === null) {
    return Object.freeze({ status: "absent", observation: null });
  }
  const stored = storedFrom(input.reference);
  if (!stored) return Object.freeze({ status: "invalid", observation: null });
  if (stored.supersededBy !== null) return Object.freeze({ status: "absent", observation: null });

  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime())) return Object.freeze({ status: "invalid", observation: null });

  if (now.getTime() >= Date.parse(stored.expiresAt)
      || stored.subsequentUserTurns > CALENDAR_CONFLICT_REASONING_MAX_SUBSEQUENT_USER_TURNS) {
    return Object.freeze({ status: "expired", observation: null });
  }

  return Object.freeze({
    status: "resolved",
    observation: cloneObservation(stored.observation),
  });
}
