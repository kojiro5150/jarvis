const UNBOUND_ORDINAL_REFERENCE = /^\s*(?:read|open|show|summari[sz]e)\s+(?:the\s+)?(?:most\s+recent|latest|first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th)\s+one[.!]?\s*$/i;

/**
 * Capability-neutral fallback for a referential command after bounded
 * conversation state has been lost.
 *
 * This grammar is deliberately narrow: it recognizes explicit ordinal
 * anaphora ("the first one"), not ordinary capability requests such as
 * "read my latest email" or "show me my last five emails".
 */
export function isUnboundOrdinalReferenceUtterance(
  utterance: string,
): boolean {
  return UNBOUND_ORDINAL_REFERENCE.test(utterance.normalize("NFKC"));
}

export const UNBOUND_ORDINAL_REFERENCE_REPLY =
  "I don’t have a current bounded result that this ordinal reference can refer to. Please retrieve the relevant list again.";
