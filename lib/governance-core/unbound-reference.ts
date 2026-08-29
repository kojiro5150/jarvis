const ORDINAL_REFERENCE = /\b(?:most recent|latest|first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|one|two|three|four|five)\b/i;
const READ_LIKE = /^\s*(?:read|open|show|summari[sz]e)\b/i;

/**
 * Capability-neutral fallback for a referential command after bounded
 * conversation state has been lost. It does not guess which capability or
 * resource the user meant.
 */
export function isUnboundOrdinalReferenceUtterance(
  utterance: string,
): boolean {
  const normalized = utterance.normalize("NFKC").trim();
  return READ_LIKE.test(normalized) && ORDINAL_REFERENCE.test(normalized);
}

export const UNBOUND_ORDINAL_REFERENCE_REPLY =
  "I don’t have a current bounded result that this ordinal reference can refer to. Please retrieve the relevant list again.";
