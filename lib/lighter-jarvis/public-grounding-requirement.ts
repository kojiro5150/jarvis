const PRIVATE_SOURCE =
  /\b(?:calendar|gmail|e-?mail|emails|inbox|mailbox|drive)\b/i;

const EXPLICIT_PUBLIC_LOOKUP =
  /\b(?:search|look up|lookup|find|research|check)\b[\s\S]{0,80}\b(?:web|online|internet|news|research|paper|papers|publication|publications|ssrn)\b|\b(?:ssrn|news|weather|forecast)\b/i;

/**
 * PUBLIC-KNOW-02 forced-grounding categories.
 *
 * These rules are application-owned and deterministic. A model confidence
 * signal is not consulted and cannot downgrade one of these categories to
 * ordinary memory-based answering.
 */
export const FORCED_PUBLIC_GROUNDING_CATEGORIES = Object.freeze({
  current_role:
    /^(?:who(?:'s| is)|what(?:'s| is) the name of)\b[\s\S]{0,120}\b(?:ceo|chair|president|prime minister|minister)\b|\b(?:current|new|latest)\s+(?:ceo|chair|president|prime minister|minister)\b/i,
  price_or_rate:
    /\b(?:current|latest|today(?:'s)?|now)\b[\s\S]{0,80}\b(?:price|cost|rate|exchange rate|interest rate|cash rate)\b|^(?:what(?:'s| is)|how much is)\b[\s\S]{0,100}\b(?:price|cost|rate)\b/i,
  software_version_or_release:
    /\b(?:latest|current|newest)\b[\s\S]{0,100}\b(?:version|release)\b|^(?:what|which)\s+version\b/i,
  policy_or_law_status:
    /\b(?:policy|law|regulation|rule)\b[\s\S]{0,100}\b(?:still|current|active|in effect|valid|applies?)\b|\b(?:current|latest)\b[\s\S]{0,100}\b(?:policy|law|regulation)\b/i,
  live_event_or_result:
    /\b(?:latest|current|today|tonight|now|live|recent)\b[\s\S]{0,100}\b(?:news|event|events|score|scores|result|results|ranking|rankings|status)\b|\b(?:news|score|scores|result|results|ranking|rankings)\b[\s\S]{0,80}\b(?:today|tonight|now|live|latest|current)\b/i,
  weather_or_forecast:
    /\b(?:weather|forecast|rain|temperature)\b/i,
} as const);

export type ForcedPublicGroundingCategory =
  keyof typeof FORCED_PUBLIC_GROUNDING_CATEGORIES;

export function forcedPublicGroundingCategory(
  utterance: string,
): ForcedPublicGroundingCategory | null {
  const normalized = utterance.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!normalized || PRIVATE_SOURCE.test(normalized)) return null;
  for (const [category, pattern] of Object.entries(FORCED_PUBLIC_GROUNDING_CATEGORIES) as
    [ForcedPublicGroundingCategory, RegExp][]) {
    if (pattern.test(normalized)) return category;
  }
  return null;
}

/**
 * Public grounding is required by system policy, not model self-assessment.
 */
export function requiresPublicGrounding(utterance: string): boolean {
  const normalized = utterance.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!normalized || PRIVATE_SOURCE.test(normalized)) return false;
  return EXPLICIT_PUBLIC_LOOKUP.test(normalized)
    || forcedPublicGroundingCategory(normalized) !== null;
}
