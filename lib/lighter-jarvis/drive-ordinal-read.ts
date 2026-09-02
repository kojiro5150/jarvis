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

function requestedOrdinal(utterance: string): number | null {
  const normalized = utterance.normalize("NFKC").trim().toLowerCase();
  if (!/^(?:read|open|show|summari[sz]e)\b/.test(normalized)) return null;
  if (/\b(?:fifth|5th|five)\b/.test(normalized)) return 5;
  if (/\b(?:fourth|4th|four)\b/.test(normalized)) return 4;
  if (/\b(?:third|3rd|three)\b/.test(normalized)) return 3;
  if (/\b(?:second|2nd|two)\b/.test(normalized)) return 2;
  if (/\b(?:first|1st|one)\b/.test(normalized)) return 1;
  return null;
}

export function resolveDriveOrdinalReadProposal(input: {
  readonly currentUserUtterance: string;
  readonly governedReferentialScopeReference?: unknown;
  readonly governedResultSetReference?: unknown;
}): DriveOrdinalReadProposalResult {
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

  const operation = proposeDriveRead(resolution.resourceId);
  return Object.freeze({
    handled: true,
    reply: `I can read file ${resolution.ordinal} from the recent Drive result. Please explicitly confirm that I may read that exact Drive file.`,
    pendingAuthorizationReference: createPendingAuthorization(operation),
    governedReferentialScopeReference: input.governedReferentialScopeReference as GovernedReferentialScopeReference,
    governedResultSetReference: input.governedResultSetReference as GovernedResultSetReference,
  });
}