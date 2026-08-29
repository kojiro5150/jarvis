import { randomUUID } from "node:crypto";

import {
  renderGmailSenderIdentity,
  resolveGmailSenderIdentity,
  type GmailSenderIdentity,
} from "./gmail-sender-identity";
import { strictTokens } from "./strict-token-match";

export const GMAIL_SENDER_DISAMBIGUATION_REFERENCE_TTL_MS = 15 * 60 * 1000;
export const GMAIL_SENDER_DISAMBIGUATION_MAX_FAILED_REFINEMENTS = 2;

export type GmailSenderDisambiguationReference = Readonly<{
  gmailSenderDisambiguationReferenceId: string;
}>;

type StoredSenderDisambiguation = Readonly<{
  id: string;
  reference: GmailSenderDisambiguationReference;
  identities: readonly GmailSenderIdentity[];
  maxResults: 5;
  createdAt: string;
  expiresAt: string;
  failedRefinements: number;
  status: "active" | "consumed";
}>;

export type GmailSenderDisambiguationResolution =
  | Readonly<{ status: "matched"; identity: GmailSenderIdentity; maxResults: 5; reference: null }>
  | Readonly<{ status: "ambiguous" | "not_found"; identities: readonly GmailSenderIdentity[]; reference: GmailSenderDisambiguationReference | null }>
  | Readonly<{ status: "invalid" | "expired" | "consumed"; identities: readonly GmailSenderIdentity[]; reference: null }>;

const store = new Map<string, StoredSenderDisambiguation>();

function isReference(value: unknown): value is GmailSenderDisambiguationReference {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const descriptor = Object.getOwnPropertyDescriptor(value, "gmailSenderDisambiguationReferenceId");
  return Boolean(
    descriptor
    && "value" in descriptor
    && typeof descriptor.value === "string"
    && descriptor.value.trim().length > 0,
  );
}

function cloneIdentity(identity: GmailSenderIdentity): GmailSenderIdentity {
  return Object.freeze({ displayName: identity.displayName, address: identity.address });
}

function cloneIdentities(identities: readonly GmailSenderIdentity[]): readonly GmailSenderIdentity[] {
  return Object.freeze(identities.map(cloneIdentity));
}

function storedFrom(reference: unknown): StoredSenderDisambiguation | null {
  if (!isReference(reference)) return null;
  return store.get(reference.gmailSenderDisambiguationReferenceId) ?? null;
}

export function createGmailSenderDisambiguationReference(input: {
  readonly identities: readonly GmailSenderIdentity[];
  readonly maxResults: 5;
  readonly now?: Date;
}): GmailSenderDisambiguationReference | null {
  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || input.identities.length < 2 || input.maxResults !== 5) return null;

  const byAddress = new Map<string, GmailSenderIdentity>();
  for (const identity of input.identities) {
    const address = identity.address.normalize("NFKC").trim().toLowerCase();
    if (!address) return null;
    if (!byAddress.has(address)) byAddress.set(address, cloneIdentity({ ...identity, address }));
  }
  if (byAddress.size < 2) return null;

  const id = randomUUID();
  const reference = Object.freeze({ gmailSenderDisambiguationReferenceId: id });
  store.set(id, Object.freeze({
    id,
    reference,
    identities: cloneIdentities([...byAddress.values()]),
    maxResults: 5,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + GMAIL_SENDER_DISAMBIGUATION_REFERENCE_TTL_MS).toISOString(),
    failedRefinements: 0,
    status: "active",
  }));
  return reference;
}

export function resolveGmailSenderDisambiguationReference(input: {
  readonly reference: unknown;
  readonly currentUserUtterance: string;
  readonly now?: Date;
}): GmailSenderDisambiguationResolution {
  const stored = storedFrom(input.reference);
  if (!stored) return Object.freeze({ status: "invalid", identities: Object.freeze([]), reference: null });
  if (stored.status === "consumed") {
    return Object.freeze({ status: "consumed", identities: cloneIdentities(stored.identities), reference: null });
  }

  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || now.getTime() >= Date.parse(stored.expiresAt)) {
    store.set(stored.id, Object.freeze({ ...stored, status: "consumed" }));
    return Object.freeze({ status: "expired", identities: cloneIdentities(stored.identities), reference: null });
  }

  const terms = [...new Set(strictTokens(input.currentUserUtterance))];
  if (terms.length === 0 || terms.length > 8) {
    return fail(stored, "not_found");
  }

  const resolution = resolveGmailSenderIdentity(terms, stored.identities);
  if (resolution.status === "matched") {
    store.set(stored.id, Object.freeze({ ...stored, status: "consumed" }));
    return Object.freeze({
      status: "matched",
      identity: cloneIdentity(resolution.identity),
      maxResults: stored.maxResults,
      reference: null,
    });
  }
  return fail(stored, resolution.status);
}

function fail(
  stored: StoredSenderDisambiguation,
  status: "ambiguous" | "not_found",
): GmailSenderDisambiguationResolution {
  return Object.freeze({
    status,
    identities: cloneIdentities(stored.identities),
    reference: stored.reference,
  });
}

export function renderGmailSenderDisambiguationCandidates(
  identities: readonly GmailSenderIdentity[],
): string {
  return identities.map(identity => `- ${renderGmailSenderIdentity(identity)}`).join("\n");
}
