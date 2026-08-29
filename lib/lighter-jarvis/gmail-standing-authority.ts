export const GMAIL_STANDING_AUTHORITY_REPLY =
  "I can't establish permanent standing authority for Gmail from a conversational instruction. Gmail searches and reads require the applicable governed authorization for each operation.";

const STANDING_AUTHORITY =
  /\b(?:permanent|permanently|always|standing|ongoing|forever|whenever you want|any time|anytime)\b/i;
const AUTHORITY_GRANT =
  /\b(?:permission|approve|approval|authorize|authorise|authorized|authorised|allow|consent)\b/i;
const GMAIL =
  /\b(?:gmail|e-?mail|emails|inbox|mailbox)\b/i;
const PRIVATE_ACTION =
  /\b(?:read|search|check|open|access|retrieve|view|show)\b/i;

/**
 * Presentation-only containment for attempts to create standing Gmail
 * authority conversationally. This never creates, restores, or consumes
 * PendingAuthorization state.
 */
export function isGmailStandingAuthorityRequest(utterance: string): boolean {
  const normalized = utterance.normalize("NFKC");
  return GMAIL.test(normalized)
    && STANDING_AUTHORITY.test(normalized)
    && AUTHORITY_GRANT.test(normalized)
    && PRIVATE_ACTION.test(normalized);
}
