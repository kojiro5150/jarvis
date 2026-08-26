export const DRIVE_SEARCH_CAPABILITY = "drive.search" as const;

export type ProposedDriveSearchOperation = Readonly<{
  capability: typeof DRIVE_SEARCH_CAPABILITY;
  name: string;
  maxResults: 5;
}>;

export function proposeDriveSearch(name: string): ProposedDriveSearchOperation {
  if (!name || name.trim() !== name || /[\r\n]/.test(name)) throw new Error("drive.search requires one exact file-name query");
  return Object.freeze({ capability: DRIVE_SEARCH_CAPABILITY, name, maxResults: 5 });
}

/** Authority derives only from the untouched, exact command utterance. */
export function evaluateDriveSearchAuthority(operation: ProposedDriveSearchOperation, currentUserUtterance: string) {
  const allowed = currentUserUtterance === `drive.search ${operation.name}`;
  return Object.freeze({
    capability: DRIVE_SEARCH_CAPABILITY,
    decision: allowed ? "ALLOW" as const : "DENY" as const,
    reason: allowed ? "explicit_drive_search" as const : "explicit_drive_search_not_established" as const,
    authorityEvidence: allowed ? Object.freeze([Object.freeze({ source: "current_user_utterance" as const,
      utterance: currentUserUtterance, basis: "explicit_drive_search" as const })]) : Object.freeze([]),
  });
}
