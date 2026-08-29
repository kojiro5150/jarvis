import { allRequiredTokensPresent, strictTokens } from "./strict-token-match";

export type GmailSenderIdentity = Readonly<{
  displayName: string | null;
  address: string;
}>;

export type GmailSenderIdentityResolution =
  | Readonly<{ status: "matched"; identity: GmailSenderIdentity }>
  | Readonly<{ status: "not_found" }>
  | Readonly<{ status: "ambiguous"; identities: readonly GmailSenderIdentity[] }>;

const REQUEST = /^(?:please\s+)?(?:find|show|get)\s+(?:me\s+)?(?:(?:the|my)\s+)?(?:email|emails|message|messages|mail)\s+from\s+(.+?)[?!.]?$/i;
const CLOSED_TEMPORAL_REFERENCE = /^(?:the\s+)?(?:last|past)\s+(?:day|24\s+hours?|week|7\s+days?)$/i;

export function parseNaturalLanguageGmailSenderReference(utterance: string): readonly string[] | null {
  const match = utterance.trim().match(REQUEST);
  if (!match) return null;
  const rawReference = match[1].trim();
  if (CLOSED_TEMPORAL_REFERENCE.test(rawReference)) return null;
  const terms = [...new Set(strictTokens(rawReference))];
  return terms.length > 0 && terms.length <= 8 ? Object.freeze(terms) : null;
}

export function parseGmailFromHeader(value: string): GmailSenderIdentity | null {
  const trimmed = value.normalize("NFKC").trim();
  if (!trimmed) return null;

  const angle = trimmed.match(/^(.*?)\s*<\s*([^<>\s]+@[^<>\s]+)\s*>\s*$/);
  if (angle) {
    const rawName = angle[1].trim().replace(/^"(.*)"$/, "$1").trim();
    return Object.freeze({
      displayName: rawName.length > 0 ? rawName : null,
      address: angle[2].toLowerCase(),
    });
  }

  if (/^[^\s<>]+@[^\s<>]+$/.test(trimmed)) {
    return Object.freeze({ displayName: null, address: trimmed.toLowerCase() });
  }

  return null;
}

function identityTokens(identity: GmailSenderIdentity): readonly string[] {
  return Object.freeze([
    ...strictTokens(identity.displayName ?? ""),
    ...strictTokens(identity.address),
  ]);
}

export function resolveGmailSenderIdentity(
  terms: readonly string[],
  evidence: readonly GmailSenderIdentity[],
): GmailSenderIdentityResolution {
  if (terms.length === 0) return Object.freeze({ status: "not_found" });

  const byAddress = new Map<string, GmailSenderIdentity>();
  for (const identity of evidence) {
    if (!allRequiredTokensPresent(terms, identityTokens(identity))) continue;
    const key = identity.address.toLowerCase();
    if (!byAddress.has(key)) byAddress.set(key, identity);
  }

  const identities = [...byAddress.values()];
  if (identities.length === 0) return Object.freeze({ status: "not_found" });
  if (identities.length === 1) return Object.freeze({ status: "matched", identity: identities[0] });

  return Object.freeze({
    status: "ambiguous",
    identities: Object.freeze(identities),
  });
}

export function renderGmailSenderIdentity(identity: GmailSenderIdentity): string {
  return identity.displayName
    ? `${identity.displayName} <${identity.address}>`
    : identity.address;
}
