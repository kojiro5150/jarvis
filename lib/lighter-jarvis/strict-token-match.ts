/** Shared strict token-containment primitive for governed Level-1 matching. */
export function allRequiredTokensPresent(
  requiredTerms: readonly string[],
  candidateTokens: readonly string[],
): boolean {
  if (requiredTerms.length === 0) return false;
  const candidate = new Set(candidateTokens);
  return requiredTerms.every(term => candidate.has(term));
}

/** NFKC, case-folded, exact alphanumeric tokenization. No stemming or fuzzy matching. */
export function strictTokens(value: string): readonly string[] {
  return Object.freeze(
    value
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean),
  );
}
