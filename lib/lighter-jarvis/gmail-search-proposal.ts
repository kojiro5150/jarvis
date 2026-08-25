import { proposeGmailSearch, type ProposedGmailSearchOperation } from "./gmail-search-authority";

const GMAIL_SEARCH_REQUEST = /^(?:please\s+)?(?:search|check|look\s+(?:in|through))\s+(?:my\s+)?gmail\s+(?:for\s+)?(?:messages|emails|mail)?\s*(?:from|in|over)\s+(?:the\s+)?(?:last|past)\s+(day|24\s+hours?|week|7\s+days?)[?!.]?$/i;

/**
 * Recognises only a bounded, content-agnostic Gmail discovery request. The
 * resulting operation is a proposal, never authority to access Gmail.
 */
export function proposeNaturalLanguageGmailSearch(currentUserUtterance: string): ProposedGmailSearchOperation | null {
  const utterance = currentUserUtterance.trim();
  const match = utterance.match(GMAIL_SEARCH_REQUEST);
  if (!match) return null;
  return proposeGmailSearch(/week|7\s+days?/i.test(match[1]) ? "7d" : "1d");
}
