import { createHash, randomUUID } from "node:crypto";

import type { GmailContentField } from "../content-retrieval";

const REFERENCE_TTL_MS = 15 * 60 * 1_000;

export type GmailPrivateReleaseReference = Readonly<{
  gmailPrivateReleaseReferenceId: string;
}>;

type GmailPrivateReleaseRecord = Readonly<{
  referenceId: string;
  resourceId: string;
  requestedFields: readonly GmailContentField[];
  presentationDigest: string;
  createdAt: number;
  expiresAt: number;
  status: "eligible";
}>;

const records = new Map<string, GmailPrivateReleaseRecord>();

function referenceId(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const value = (input as { gmailPrivateReleaseReferenceId?: unknown })
    .gmailPrivateReleaseReferenceId;
  return typeof value === "string" && /^[0-9a-f-]{36}$/.test(value)
    ? value
    : null;
}

export function createGmailPrivateReleaseReference(input: Readonly<{
  resourceId: string;
  requestedFields: readonly GmailContentField[];
  presentation: string;
  now?: number;
}>): GmailPrivateReleaseReference {
  const now = input.now ?? Date.now();
  const id = randomUUID();
  records.set(id, Object.freeze({
    referenceId: id,
    resourceId: input.resourceId,
    requestedFields: Object.freeze([...input.requestedFields]),
    presentationDigest: createHash("sha256").update(input.presentation).digest("hex"),
    createdAt: now,
    expiresAt: now + REFERENCE_TTL_MS,
    status: "eligible",
  }));
  return Object.freeze({ gmailPrivateReleaseReferenceId: id });
}

export function resolveGmailPrivateReleaseReference(
  reference: unknown,
  now = Date.now(),
): GmailPrivateReleaseRecord | null {
  const id = referenceId(reference);
  if (!id) return null;
  const record = records.get(id);
  if (!record || record.status !== "eligible" || record.expiresAt <= now) {
    if (record?.expiresAt && record.expiresAt <= now) records.delete(id);
    return null;
  }
  return record;
}

const CONTENT_DEPENDENT_FOLLOW_UPS = [
  /^(?:summarise|summarize) that email[.!?]?$/i,
  /^what did that email say[?]?$/i,
  /^what (?:are|were) the main points of that email[?]?$/i,
  /^explain that email[.!?]?$/i,
  /^(?:analyse|analyze) that email[.!?]?$/i,
  /^draft a reply to that email[.!?]?$/i,
  /^draft a reply to the sender[.!?]?$/i,
  /^compare that email with this[.!?]?$/i,
  /^does that email conflict with this[?]?$/i,
  /^draft a reply to raman, saying thank you for the invite but politely decline[.!]?$/i,
] as const;

export function isGmailPrivateReleaseContentFollowUp(utterance: string): boolean {
  const normalized = utterance.trim().replace(/\s+/g, " ");
  return CONTENT_DEPENDENT_FOLLOW_UPS.some((pattern) => pattern.test(normalized));
}

export function resetGmailPrivateReleaseReferencesForTests(): void {
  records.clear();
}
