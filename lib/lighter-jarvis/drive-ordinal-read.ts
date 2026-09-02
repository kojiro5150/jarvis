import { proposeDriveRead } from "./drive-read-authority";
import {
  resolveGovernedResultSetOrdinal,
  type GovernedReferentialScopeReference,
  type GovernedResultSetReference,
} from "./governed-result-set-reference";
import { createPendingAuthorization, type PendingAuthorizationReference } from "./pending-authorization";

export type DriveOrdinalReadProposalResult = Readonly<{
  handled: boolean;
  reply?: string;
  pendingAuthorizationReference?: PendingAuthorizationReference | null;
  governedReferentialScopeReference?: GovernedReferentialScopeReference | null;
  governedResultSetReference?: GovernedResultSetReference | null;
}>;

const ORDINAL_REQUEST = /^(?:please\s+)?(?:read|open|show|summari[sz]e)\s+(?:me\s+)?(?:the\s+)?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+(?:st|nd|rd|th)?|one|two|three|four|five|six|seven|eight|nine|ten)(?:\s+(?:one|file|result|item|document))?[?!.]?$/i;
const SUPERSEDED_DRIVE_ORDINAL_REQUEST = /^(?:please\s+)?(?:read|open|show|summari[sz]e)\s+(?:me\s+)?(?:the\s+)?(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+(?:st|nd|rd|th)?|one|two|three|four|five|six|seven|eight|nine|ten)(?:\s+(?:one|file|result|item|document))?\s+from\s+(?:the\s+)?(?:earlier|previous|prior)\s+(?:(?:google\s+)?drive\s+(?:search|result)|[a-z0-9_-]+\s+search)[?!.]?$/i;

const ORDINAL_WORDS: Readonly<Record<string, number>> = Object.freeze({
  first: 1, one: 1,
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

export function resolveDriveOrdinalReadProposal(input: {
  readonly currentUserUtterance: string;
  readonly governedReferentialScopeReference?: unknown;
  readonly governedResultSetReference?: unknown;
}): DriveOrdinalReadProposalResult {
  const normalized = input.currentUserUtterance.normalize("NFKC").trim();
  if (SUPERSEDED_DRIVE_ORDINAL_REQUEST.test(normalized)) {
    return Object.freeze({
      handled: true,
      reply: "That earlier Drive result is no longer available. Please search Drive again.",
    });
  }
  const ordinal = requestedOrdinal(input.currentUserUtterance);
  if (ordinal === null) return Object.freeze({ handled: false });
  if (!Object.hasOwn(input, "governedReferentialScopeReference")
    || !Object.hasOwn(input, "governedResultSetReference")) {
    return Object.freeze({ handled: false });
  }

  const resolution = resolveGovernedResultSetOrdinal({
    scopeReference: input.governedReferentialScopeReference,
    resultSetReference: input.governedResultSetReference,
    referenceKind: "drive_file",
    ordinal,
  });

  if (resolution.status === "invalid" || resolution.status === "expired" || resolution.status === "absent") {
    return Object.freeze({
      handled: true,
      reply: "That recent Drive result is no longer available. Please search Drive again.",
      governedReferentialScopeReference: resolution.status === "invalid" ? null : input.governedReferentialScopeReference as GovernedReferentialScopeReference,
      governedResultSetReference: null,
    });
  }
  if (resolution.status === "out_of_range") {
    return Object.freeze({
      handled: true,
      reply: "That position is outside the bounded recent Drive result.",
      governedReferentialScopeReference: input.governedReferentialScopeReference as GovernedReferentialScopeReference,
      governedResultSetReference: input.governedResultSetReference as GovernedResultSetReference,
    });
  }

  if (resolution.status !== "resolved" || resolution.resourceId === null) {
    return Object.freeze({ handled: true, reply: "That recent Drive result is no longer available. Please search Drive again.", governedResultSetReference: null });
  }

  const operation = proposeDriveRead(resolution.resourceId);
  return Object.freeze({
    handled: true,
    reply: `I can read file ${resolution.ordinal} from the recent Drive result. Please explicitly confirm that I may read that exact Drive file.`,
    pendingAuthorizationReference: createPendingAuthorization(operation),
    governedReferentialScopeReference: input.governedReferentialScopeReference as GovernedReferentialScopeReference,
    governedResultSetReference: input.governedResultSetReference as GovernedResultSetReference,
  });
}
