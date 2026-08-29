import { proveExplicitGmailSearch } from "@/lib/governance-core/explicit-command-authority";
export const GMAIL_SEARCH_CAPABILITY = "gmail.search" as const;
export const GMAIL_SEARCH_WINDOWS = Object.freeze(["1d", "7d"] as const);
export type GmailSearchWindow = typeof GMAIL_SEARCH_WINDOWS[number];

export type ProposedGmailWindowSearchOperation = Readonly<{
  capability: typeof GMAIL_SEARCH_CAPABILITY;
  newerThan: GmailSearchWindow;
  maxResults: 5;
  /** Absent means the historical ID-only search. */
  resultMode?: "subject_list";
}>;

export type ProposedGmailSenderSearchOperation = Readonly<{
  capability: typeof GMAIL_SEARCH_CAPABILITY;
  senderTerms: readonly string[];
  maxResults: 5;
  identityScanLimit: 100;
  resultMode: "sender_match";
}>;

export type ProposedGmailSearchOperation =
  | ProposedGmailWindowSearchOperation
  | ProposedGmailSenderSearchOperation;

export type GmailSearchAuthorityDecision = Readonly<{
  capability: typeof GMAIL_SEARCH_CAPABILITY;
  decision: "ALLOW" | "ASK";
  reason: "explicit_gmail_search" | "explicit_gmail_search_not_established";
  authorityEvidence: readonly Readonly<{ source: "current_user_utterance"; utterance: string; basis: "explicit_gmail_search" }>[];
}>;

/** Creates only the two ID-only search operations admitted by the closed grammar. */
export function proposeGmailSearch(newerThan: GmailSearchWindow): ProposedGmailWindowSearchOperation {
  if (!GMAIL_SEARCH_WINDOWS.includes(newerThan)) throw new Error("gmail.search requires newer_than:1d or newer_than:7d");
  return Object.freeze({ capability: GMAIL_SEARCH_CAPABILITY, newerThan, maxResults: 5 });
}

/** Creates a bounded conversational factual-list proposal. It grants no authority. */
export function proposeGmailSubjectList(newerThan: GmailSearchWindow): ProposedGmailWindowSearchOperation {
  if (!GMAIL_SEARCH_WINDOWS.includes(newerThan)) throw new Error("gmail subject list requires newer_than:1d or newer_than:7d");
  return Object.freeze({ capability: GMAIL_SEARCH_CAPABILITY, newerThan, maxResults: 5, resultMode: "subject_list" });
}

/** Creates the bounded GS002A sender-resolution proposal. It grants no authority. */
export function proposeGmailSenderSearch(senderTerms: readonly string[]): ProposedGmailSenderSearchOperation {
  const terms = [...new Set(senderTerms.map(term => term.normalize("NFKC").trim().toLowerCase()))];
  if (terms.length === 0 || terms.length > 8 || terms.some(term => !/^[a-z0-9_-]+$/.test(term))) {
    throw new Error("gmail sender search requires 1-8 exact sender-reference tokens");
  }
  return Object.freeze({
    capability: GMAIL_SEARCH_CAPABILITY,
    senderTerms: Object.freeze(terms),
    maxResults: 5,
    identityScanLimit: 100,
    resultMode: "sender_match",
  });
}

/** Authority comes exclusively from an exact match of the raw current utterance. */
export function evaluateGmailSearchAuthority(operation: ProposedGmailSearchOperation, currentUserUtterance: string): GmailSearchAuthorityDecision {
  // The explicit command grammar remains ID-only time-window search. Subject
  // lists and GS002A sender searches require server-owned pending authorization
  // so natural-language interpretation never becomes authority.
  const authorityEvidence = proveExplicitGmailSearch(operation, currentUserUtterance);
  const allowed = authorityEvidence.length === 1;
  return Object.freeze({ capability: GMAIL_SEARCH_CAPABILITY, decision: allowed ? "ALLOW" : "ASK",
    reason: allowed ? "explicit_gmail_search" : "explicit_gmail_search_not_established",
    authorityEvidence });
}
