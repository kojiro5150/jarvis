export const GMAIL_SEARCH_CAPABILITY = "gmail.search" as const;
export const GMAIL_SEARCH_WINDOWS = Object.freeze(["1d", "7d"] as const);
export type GmailSearchWindow = typeof GMAIL_SEARCH_WINDOWS[number];

export type ProposedGmailSearchOperation = Readonly<{
  capability: typeof GMAIL_SEARCH_CAPABILITY;
  newerThan: GmailSearchWindow;
  maxResults: 5;
}>;

export type GmailSearchAuthorityDecision = Readonly<{
  capability: typeof GMAIL_SEARCH_CAPABILITY;
  decision: "ALLOW" | "ASK";
  reason: "explicit_gmail_search" | "explicit_gmail_search_not_established";
  authorityEvidence: readonly Readonly<{ source: "current_user_utterance"; utterance: string; basis: "explicit_gmail_search" }>[];
}>;

/** Creates only the two search operations admitted by the closed grammar. */
export function proposeGmailSearch(newerThan: GmailSearchWindow): ProposedGmailSearchOperation {
  if (!GMAIL_SEARCH_WINDOWS.includes(newerThan)) throw new Error("gmail.search requires newer_than:1d or newer_than:7d");
  return Object.freeze({ capability: GMAIL_SEARCH_CAPABILITY, newerThan, maxResults: 5 });
}

/** Authority comes exclusively from an exact match of the raw current utterance. */
export function evaluateGmailSearchAuthority(operation: ProposedGmailSearchOperation, currentUserUtterance: string): GmailSearchAuthorityDecision {
  const allowed = currentUserUtterance === `gmail.search [newer_than:${operation.newerThan}]`;
  return Object.freeze({ capability: GMAIL_SEARCH_CAPABILITY, decision: allowed ? "ALLOW" : "ASK",
    reason: allowed ? "explicit_gmail_search" : "explicit_gmail_search_not_established",
    authorityEvidence: allowed ? Object.freeze([Object.freeze({ source: "current_user_utterance", utterance: currentUserUtterance,
      basis: "explicit_gmail_search" as const })]) : Object.freeze([]) });
}
