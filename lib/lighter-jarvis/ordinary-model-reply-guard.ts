/**
 * Ordinary model text is presentation, never authority machinery. Keep the
 * guard content-derived: neither the model nor the client may label text as a
 * genuine authority response.
 */
export const NEUTRALIZED_ORDINARY_AUTHORITY_REPLY =
  "That request cannot be authorized through an ordinary model response.";

const INTERNAL_HISTORY_MARKERS = [
  "[Governed private result omitted from ordinary model context.]",
  "[Prior governed Gmail read request omitted from ordinary model context.]",
] as const;

const PRIVATE_SOURCE = /\b(?:calendar|gmail|e-?mail|inbox)\b/i;
const CONFIRMATION_REQUEST = /(?:\b(?:confirm|confirmation|permission|authorize|authorise|approval|consent)\b|\b(?:may|can)\s+I\b|\b(?:reply|respond|say)\s+["'“”]?(?:yes|confirm|approve|allow)\b)/i;
const PRIVATE_ACCESS = /\b(?:access|read|search|retrieve|check|view|show|look(?:ing)?\s+(?:at|through|in)|connect(?:ing)?\s+to)\b/i;

export function presentsPrivateAuthorityConfirmation(content: string): boolean {
  return PRIVATE_SOURCE.test(content)
    && CONFIRMATION_REQUEST.test(content)
    && PRIVATE_ACCESS.test(content);
}

/** Applies only to text returned by an ordinary model invocation. */
export function guardOrdinaryModelReply(content: string): string {
  if (presentsPrivateAuthorityConfirmation(content)) {
    return NEUTRALIZED_ORDINARY_AUTHORITY_REPLY;
  }

  let guarded = content;
  for (const marker of INTERNAL_HISTORY_MARKERS) guarded = guarded.replaceAll(marker, "");
  guarded = guarded.trim();
  return guarded || NEUTRALIZED_ORDINARY_AUTHORITY_REPLY;
}
