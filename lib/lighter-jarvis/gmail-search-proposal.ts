import {
  proposeGmailSearch,
  proposeGmailSenderSearch,
  type ProposedGmailSearchOperation,
} from "./gmail-search-authority";
import { parseNaturalLanguageGmailSenderReference } from "./gmail-sender-identity";

const GMAIL_SEARCH_REQUEST = /^(?:please\s+)?(?:search|check|look\s+(?:in|through))\s+(?:my\s+)?(?:gmail|email|emails|inbox)\s+(?:for\s+)?(?:messages|emails|mail)?\s*(?:from|in|over|for)\s+(?:the\s+)?(?:last|past)\s+(day|24\s+hours?|week|7\s+days?)[?!.]?$/i;

/**
 * Recognises only bounded, high-confidence Gmail discovery requests. The
 * resulting operation is a proposal, never authority to access Gmail.
 */
export function proposeNaturalLanguageGmailSearch(currentUserUtterance: string): ProposedGmailSearchOperation | null {
  const utterance = currentUserUtterance.trim();
  const timeWindow = utterance.match(GMAIL_SEARCH_REQUEST);
  if (timeWindow) {
    return proposeGmailSearch(/week|7\s+days?/i.test(timeWindow[1]) ? "7d" : "1d");
  }

  const senderTerms = parseNaturalLanguageGmailSenderReference(utterance);
  return senderTerms ? proposeGmailSenderSearch(senderTerms) : null;
}
