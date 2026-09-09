const EXACT_REPLY = /^reply exactly with\s+([\s\S]+)$/i;
const RESPOND_WITH_ONLY = /^respond with only\s*:?\s*([\s\S]+)$/i;

/**
 * Temporary closed grammar for response-format instructions. This takes
 * precedence over unsupported Gmail mutation detection only while no
 * governed Gmail send/reply capability exists. That future capability must
 * explicitly reconsider this ordering rather than inheriting it silently.
 */
export function resolveClosedResponseFormatInstruction(
  utterance: string,
): string | null {
  const normalized = utterance.normalize("NFKC").trim();
  const match = normalized.match(EXACT_REPLY) ?? normalized.match(RESPOND_WITH_ONLY);
  const response = match?.[1]?.trim();
  return response ? response : null;
}
