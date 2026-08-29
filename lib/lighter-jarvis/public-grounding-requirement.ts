const PRIVATE_SOURCE =
  /\b(?:calendar|gmail|e-?mail|emails|inbox|mailbox|drive)\b/i;

const EXPLICIT_PUBLIC_LOOKUP =
  /\b(?:search|look up|lookup|find|research|check)\b[\s\S]{0,80}\b(?:web|online|internet|news|research|paper|papers|publication|publications|ssrn)\b|\b(?:ssrn|news|weather|forecast)\b/i;

const FRESHNESS =
  /\b(?:current|currently|latest|today|tonight|tomorrow|now|right now|recent|recently|this week|this month|still|as of)\b/i;

const EXTERNAL_STATE =
  /\b(?:ceo|chair|president|prime minister|minister|price|cost|rate|version|release|policy|law|regulation|status|available|availability|open|closed|forecast|weather|news|schedule|result|results|ranking|rankings)\b/i;

const DIRECT_CURRENT_QUESTION =
  /^(?:who|what|which|when|where|how|is|are|has|have|does|do|will)\b/i;

/**
 * PUBLIC-KNOW-02 routing policy.
 *
 * This is intentionally system-owned and deterministic. The model is not
 * allowed to decide that its own memory is "fresh enough".
 *
 * The rule is biased toward grounding when wording touches explicit lookup or
 * current external state. Stable explanatory questions remain ordinary.
 */
export function requiresPublicGrounding(utterance: string): boolean {
  const normalized = utterance.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!normalized || PRIVATE_SOURCE.test(normalized)) return false;
  if (EXPLICIT_PUBLIC_LOOKUP.test(normalized)) return true;
  if (FRESHNESS.test(normalized) && (EXTERNAL_STATE.test(normalized) || DIRECT_CURRENT_QUESTION.test(normalized))) return true;
  return false;
}
