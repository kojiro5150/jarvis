import { randomUUID } from "node:crypto";

export const CALENDAR_ADVICE_REFERENCE_TTL_MS = 15 * 60 * 1000;
export const CALENDAR_ADVICE_REFERENCE_MAX_SUBSEQUENT_USER_TURNS = 6;

export type CalendarAdviceReference = Readonly<{ calendarAdviceReferenceId: string }>;

export type CalendarAdviceSnapshot = Readonly<{
  recommendationType: "keep_invitation_move_deep_work_to_candidate";
  sourceCommitmentReference: string;
  candidateStart: string;
  candidateEnd: string;
  durationMinutes: number;
  preferenceKind: "prefer_keep_invitation_if_full_deep_work_preserved_later";
  observedAt: string;
  createdAt: string;
  expiresAt: string;
  remainingReferenceTurns: number;
}>;

type StoredAdvice = Readonly<{
  id: string;
  reference: CalendarAdviceReference;
  recommendationType: "keep_invitation_move_deep_work_to_candidate";
  sourceCommitmentReference: string;
  candidateStart: string;
  candidateEnd: string;
  durationMinutes: number;
  preferenceKind: "prefer_keep_invitation_if_full_deep_work_preserved_later";
  observedAt: string;
  createdAt: string;
  expiresAt: string;
  subsequentUserTurns: number;
}>;

const advice = new Map<string, StoredAdvice>();

function storedFrom(reference: unknown): StoredAdvice | null {
  if (typeof reference !== "object" || reference === null || Array.isArray(reference)) return null;
  const descriptor = Object.getOwnPropertyDescriptor(reference, "calendarAdviceReferenceId");
  if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "string") return null;
  return advice.get(descriptor.value) ?? null;
}

function snapshot(stored: StoredAdvice): CalendarAdviceSnapshot {
  return Object.freeze({
    recommendationType: stored.recommendationType,
    sourceCommitmentReference: stored.sourceCommitmentReference,
    candidateStart: stored.candidateStart,
    candidateEnd: stored.candidateEnd,
    durationMinutes: stored.durationMinutes,
    preferenceKind: stored.preferenceKind,
    observedAt: stored.observedAt,
    createdAt: stored.createdAt,
    expiresAt: stored.expiresAt,
    remainingReferenceTurns: Math.max(0, CALENDAR_ADVICE_REFERENCE_MAX_SUBSEQUENT_USER_TURNS - stored.subsequentUserTurns),
  });
}

export function createCalendarAdviceReference(input: {
  readonly sourceCommitmentReference: string;
  readonly candidateStart: string;
  readonly candidateEnd: string;
  readonly durationMinutes: number;
  readonly observedAt: string;
  readonly now?: Date;
}): CalendarAdviceReference | null {
  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || !input.sourceCommitmentReference || !Number.isFinite(input.durationMinutes) || input.durationMinutes <= 0) return null;
  const id = randomUUID();
  const reference = Object.freeze({ calendarAdviceReferenceId: id });
  advice.set(id, Object.freeze({
    id, reference,
    recommendationType: "keep_invitation_move_deep_work_to_candidate" as const,
    sourceCommitmentReference: input.sourceCommitmentReference,
    candidateStart: input.candidateStart,
    candidateEnd: input.candidateEnd,
    durationMinutes: input.durationMinutes,
    preferenceKind: "prefer_keep_invitation_if_full_deep_work_preserved_later" as const,
    observedAt: input.observedAt,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CALENDAR_ADVICE_REFERENCE_TTL_MS).toISOString(),
    subsequentUserTurns: 0,
  }));
  return reference;
}

export function advanceCalendarAdviceReferenceUserTurn(reference: unknown): boolean {
  const stored = storedFrom(reference);
  if (!stored) return false;
  advice.set(stored.id, Object.freeze({ ...stored, subsequentUserTurns: stored.subsequentUserTurns + 1 }));
  return true;
}

export function resolveCalendarAdviceReference(input: { readonly reference: unknown; readonly now?: Date }): CalendarAdviceSnapshot | null {
  const stored = storedFrom(input.reference);
  if (!stored) return null;
  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || now.getTime() >= Date.parse(stored.expiresAt) || stored.subsequentUserTurns > CALENDAR_ADVICE_REFERENCE_MAX_SUBSEQUENT_USER_TURNS) return null;
  return snapshot(stored);
}