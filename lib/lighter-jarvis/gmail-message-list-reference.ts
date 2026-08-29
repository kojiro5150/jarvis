import { randomUUID } from "node:crypto";

export const GMAIL_MESSAGE_LIST_REFERENCE_TTL_MS = 15 * 60 * 1000;

export type GmailMessageListReference = Readonly<{
  gmailMessageListReferenceId: string;
}>;

type StoredMessageList = Readonly<{
  id: string;
  reference: GmailMessageListReference;
  messageIds: readonly string[];
  createdAt: string;
  expiresAt: string;
}>;

const store = new Map<string, StoredMessageList>();

function isReference(value: unknown): value is GmailMessageListReference {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const descriptor = Object.getOwnPropertyDescriptor(value, "gmailMessageListReferenceId");
  return Boolean(
    descriptor
    && "value" in descriptor
    && typeof descriptor.value === "string"
    && descriptor.value.trim().length > 0,
  );
}

export function createGmailMessageListReference(input: {
  readonly messageIds: readonly string[];
  readonly now?: Date;
}): GmailMessageListReference | null {
  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || input.messageIds.length === 0 || input.messageIds.length > 5) return null;
  if (input.messageIds.some(id => typeof id !== "string" || !id.trim())) return null;

  const id = randomUUID();
  const reference = Object.freeze({ gmailMessageListReferenceId: id });
  store.set(id, Object.freeze({
    id,
    reference,
    messageIds: Object.freeze([...input.messageIds]),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + GMAIL_MESSAGE_LIST_REFERENCE_TTL_MS).toISOString(),
  }));
  return reference;
}

export type GmailOrdinalSelection =
  | Readonly<{ status: "matched"; resourceId: string; ordinal: number; reference: GmailMessageListReference }>
  | Readonly<{ status: "unsupported" | "invalid" | "expired" | "out_of_range"; reference: GmailMessageListReference | null }>;

function requestedOrdinal(utterance: string): number | null {
  const normalized = utterance.normalize("NFKC").trim().toLowerCase();
  if (!/^(?:read|open|show|summari[sz]e)\b/.test(normalized)) return null;
  if (/\b(?:most recent|latest|first|1st|one)\b/.test(normalized)) return 1;
  if (/\b(?:second|2nd|two)\b/.test(normalized)) return 2;
  if (/\b(?:third|3rd|three)\b/.test(normalized)) return 3;
  if (/\b(?:fourth|4th|four)\b/.test(normalized)) return 4;
  if (/\b(?:fifth|5th|five)\b/.test(normalized)) return 5;
  return null;
}

export function resolveGmailMessageListReference(input: {
  readonly reference: unknown;
  readonly currentUserUtterance: string;
  readonly now?: Date;
}): GmailOrdinalSelection {
  const ordinal = requestedOrdinal(input.currentUserUtterance);
  if (ordinal === null) return Object.freeze({ status: "unsupported", reference: isReference(input.reference) ? input.reference : null });
  if (!isReference(input.reference)) return Object.freeze({ status: "invalid", reference: null });

  const stored = store.get(input.reference.gmailMessageListReferenceId);
  if (!stored) return Object.freeze({ status: "invalid", reference: null });

  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || now.getTime() >= Date.parse(stored.expiresAt)) {
    store.delete(stored.id);
    return Object.freeze({ status: "expired", reference: null });
  }
  const resourceId = stored.messageIds[ordinal - 1];
  if (!resourceId) return Object.freeze({ status: "out_of_range", reference: stored.reference });
  return Object.freeze({ status: "matched", resourceId, ordinal, reference: stored.reference });
}
