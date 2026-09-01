import { randomUUID } from "node:crypto";

import type {
  ExplicitUserContinuityCaptureRequest,
  UserContinuityCaptureClass,
} from "./user-continuity-capture-contract";

export const USER_CONTINUITY_CAPTURE_CLARIFICATION_TTL_MS = 15 * 60 * 1000;

export type UserContinuityCaptureClarificationReference = Readonly<{
  userContinuityCaptureClarificationReferenceId: string;
}>;

type StoredClarification = Readonly<{
  id: string;
  request: ExplicitUserContinuityCaptureRequest;
  statedAt: string;
  expiresAt: string;
}>;

const pending = new Map<string, StoredClarification>();

function idFrom(reference: unknown): string | null {
  if (typeof reference !== "object" || reference === null || Array.isArray(reference)) return null;
  const descriptor = Object.getOwnPropertyDescriptor(
    reference,
    "userContinuityCaptureClarificationReferenceId",
  );
  if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "string") return null;
  return descriptor.value;
}

export function createUserContinuityCaptureClarificationReference(input: Readonly<{
  request: ExplicitUserContinuityCaptureRequest;
  statedAt: string;
  now?: Date;
}>): UserContinuityCaptureClarificationReference | null {
  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || !Number.isFinite(Date.parse(input.statedAt))) return null;

  const id = randomUUID();
  pending.set(id, Object.freeze({
    id,
    request: input.request,
    statedAt: input.statedAt,
    expiresAt: new Date(now.getTime() + USER_CONTINUITY_CAPTURE_CLARIFICATION_TTL_MS).toISOString(),
  }));

  return Object.freeze({
    userContinuityCaptureClarificationReferenceId: id,
  });
}

export function consumeUserContinuityCaptureClarificationReference(input: Readonly<{
  reference: unknown;
  now?: Date;
}>): Readonly<{
  request: ExplicitUserContinuityCaptureRequest;
  statedAt: string;
}> | null {
  const id = idFrom(input.reference);
  if (!id) return null;

  const stored = pending.get(id);
  pending.delete(id);
  if (!stored) return null;

  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || now.getTime() >= Date.parse(stored.expiresAt)) return null;

  return Object.freeze({
    request: stored.request,
    statedAt: stored.statedAt,
  });
}

export function parseUserContinuityCaptureClassClarification(
  utterance: string,
): UserContinuityCaptureClass | null {
  const normalized = utterance.trim().toLowerCase();
  const aliases: Readonly<Record<string, UserContinuityCaptureClass>> = Object.freeze({
    "user assertion": "user_assertion",
    "assertion": "user_assertion",
    "preference": "preference",
    "plan": "plan",
    "commitment": "commitment",
    "decision": "decision",
  });
  return aliases[normalized] ?? null;
}
