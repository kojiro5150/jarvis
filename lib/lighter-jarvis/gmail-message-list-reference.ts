import { randomUUID } from "node:crypto";

import { resolveGmailSenderIdentity, type GmailSenderIdentity } from "./gmail-sender-identity";
import { strictTokens } from "./strict-token-match";

export const GMAIL_MESSAGE_LIST_REFERENCE_TTL_MS = 15 * 60 * 1000;

export type GmailMessageListReference = Readonly<{
  gmailMessageListReferenceId: string;
}>;

type StoredMessageResource = Readonly<{
  messageId: string;
  senderIdentity: GmailSenderIdentity | null;
}>;

type StoredMessageList = Readonly<{
  id: string;
  reference: GmailMessageListReference;
  resources: readonly StoredMessageResource[];
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
  readonly senderIdentities?: readonly (GmailSenderIdentity | null)[];
  readonly now?: Date;
}): GmailMessageListReference | null {
  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || input.messageIds.length === 0 || input.messageIds.length > 5) return null;
  if (input.messageIds.some(id => typeof id !== "string" || !id.trim())) return null;
  if (input.senderIdentities && input.senderIdentities.length !== input.messageIds.length) return null;

  const resources = input.messageIds.map((messageId, index) => {
    const identity = input.senderIdentities?.[index] ?? null;
    return Object.freeze({
      messageId,
      senderIdentity: identity
        ? Object.freeze({ displayName: identity.displayName, address: identity.address.toLowerCase() })
        : null,
    });
  });

  const id = randomUUID();
  const reference = Object.freeze({ gmailMessageListReferenceId: id });
  store.set(id, Object.freeze({
    id,
    reference,
    resources: Object.freeze(resources),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + GMAIL_MESSAGE_LIST_REFERENCE_TTL_MS).toISOString(),
  }));
  return reference;
}

export type GmailNamedMessageSelection =
  | Readonly<{ status: "matched"; resourceId: string; ordinal: number; reference: GmailMessageListReference }>
  | Readonly<{ status: "unsupported" | "invalid" | "expired" | "not_found" | "ambiguous"; reference: GmailMessageListReference | null }>;

const NAMED_MESSAGE_REQUEST =
  /^(?:please\s+)?(?:read|open|show|summari[sz]e)\s+(?:me\s+)?(?:the\s+)?(?:email|message|mail)\s+from\s+(.+?)[?!.]?$/i;

function requestedSenderTerms(utterance: string): readonly string[] | null {
  const match = utterance.normalize("NFKC").trim().match(NAMED_MESSAGE_REQUEST);
  if (!match) return null;
  const terms = [...new Set(strictTokens(match[1]))];
  return terms.length > 0 && terms.length <= 8 ? Object.freeze(terms) : null;
}

export function resolveGmailMessageListSenderReference(input: {
  readonly reference: unknown;
  readonly currentUserUtterance: string;
  readonly now?: Date;
}): GmailNamedMessageSelection {
  const terms = requestedSenderTerms(input.currentUserUtterance);
  if (!terms) return Object.freeze({
    status: "unsupported",
    reference: isReference(input.reference) ? input.reference : null,
  });
  if (!isReference(input.reference)) return Object.freeze({ status: "invalid", reference: null });

  const stored = store.get(input.reference.gmailMessageListReferenceId);
  if (!stored) return Object.freeze({ status: "invalid", reference: null });

  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || now.getTime() >= Date.parse(stored.expiresAt)) {
    store.delete(stored.id);
    return Object.freeze({ status: "expired", reference: null });
  }

  const matches = stored.resources
    .map((resource, index) => ({ resource, index }))
    .filter(({ resource }) => resource.senderIdentity
      && resolveGmailSenderIdentity(terms, [resource.senderIdentity]).status === "matched");

  if (matches.length === 0) {
    return Object.freeze({ status: "not_found", reference: stored.reference });
  }
  if (matches.length > 1) {
    return Object.freeze({ status: "ambiguous", reference: stored.reference });
  }

  const match = matches[0];
  return Object.freeze({
    status: "matched",
    resourceId: match.resource.messageId,
    ordinal: match.index + 1,
    reference: stored.reference,
  });
}

export type GmailOrdinalSelection =
  | Readonly<{ status: "matched"; resourceId: string; ordinal: number; reference: GmailMessageListReference }>
  | Readonly<{ status: "unsupported" | "invalid" | "expired" | "out_of_range"; reference: GmailMessageListReference | null }>;

const ORDINAL_REQUEST = /^(?:please\s+)?(?:read|open|show|summari[sz]e)\s+(?:me\s+)?(?:the\s+)?(most\s+recent|latest|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+(?:st|nd|rd|th)?|one|two|three|four|five|six|seven|eight|nine|ten)(?:\s+(?:one|email|message|mail|result|item))?[?!.]?$/i;

const ORDINAL_WORDS: Readonly<Record<string, number>> = Object.freeze({
  "most recent": 1, latest: 1, first: 1, one: 1,
  second: 2, two: 2,
  third: 3, three: 3,
  fourth: 4, four: 4,
  fifth: 5, five: 5,
  sixth: 6, six: 6,
  seventh: 7, seven: 7,
  eighth: 8, eight: 8,
  ninth: 9, nine: 9,
  tenth: 10, ten: 10,
});

function requestedOrdinal(utterance: string): number | null {
  const normalized = utterance.normalize("NFKC").trim().toLowerCase();
  const match = normalized.match(ORDINAL_REQUEST);
  if (!match) return null;
  const token = match[1];
  const wordOrdinal = ORDINAL_WORDS[token];
  if (wordOrdinal !== undefined) return wordOrdinal;
  const numeric = Number.parseInt(token, 10);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
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
  const resourceId = stored.resources[ordinal - 1]?.messageId;
  if (!resourceId) return Object.freeze({ status: "out_of_range", reference: stored.reference });
  return Object.freeze({ status: "matched", resourceId, ordinal, reference: stored.reference });
}
