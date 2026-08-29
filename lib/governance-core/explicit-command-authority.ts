import type { ProposedGmailReadOperation } from "@/lib/lighter-jarvis/gmail-read-authority";
import type { ProposedGmailSearchOperation } from "@/lib/lighter-jarvis/gmail-search-authority";
import type { ProposedDriveSearchOperation } from "@/lib/lighter-jarvis/drive-search-authority";
import type { DriveReadOperation } from "@/lib/lighter-jarvis/drive-read-authority";

export type ExplicitCommandAuthorityEvidence<TBasis extends string> = Readonly<{
  source: "current_user_utterance";
  utterance: string;
  basis: TBasis;
}>;

function evidence<TBasis extends string>(
  allowed: boolean,
  utterance: string,
  basis: TBasis,
): readonly ExplicitCommandAuthorityEvidence<TBasis>[] {
  return allowed
    ? Object.freeze([Object.freeze({ source: "current_user_utterance" as const, utterance, basis })])
    : Object.freeze([]);
}

export function proveExplicitGmailRead(
  operation: ProposedGmailReadOperation,
  currentUserUtterance: string,
) {
  const expected = `gmail.read ${operation.resourceId} [${operation.requestedFields.join(",")}]`;
  return evidence(currentUserUtterance.trim() === expected, currentUserUtterance, "explicit_gmail_read" as const);
}

export function proveExplicitGmailSearch(
  operation: ProposedGmailSearchOperation,
  currentUserUtterance: string,
) {
  const allowed = "newerThan" in operation
    && operation.resultMode === undefined
    && currentUserUtterance === `gmail.search [newer_than:${operation.newerThan}]`;
  return evidence(allowed, currentUserUtterance, "explicit_gmail_search" as const);
}

export function proveExplicitDriveSearch(
  operation: ProposedDriveSearchOperation,
  currentUserUtterance: string,
) {
  return evidence(
    currentUserUtterance === `drive.search ${operation.name}`,
    currentUserUtterance,
    "explicit_drive_search" as const,
  );
}

export function proveExplicitDriveRead(
  operation: DriveReadOperation,
  currentUserUtterance: string,
) {
  return evidence(
    currentUserUtterance === `drive.read ${operation.fileId} [${operation.contentMode}]`,
    currentUserUtterance,
    "explicit_drive_read" as const,
  );
}
