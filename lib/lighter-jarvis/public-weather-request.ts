export type PublicWeatherPeriod = "today" | "tomorrow";

export type PublicWeatherRequest = Readonly<{
  capability: "public_information.lookup";
  kind: "weather";
  location: string;
  period: PublicWeatherPeriod;
}>;

const FORMS = Object.freeze([
  /^what(?:'s| is) the weather in (.+?)(?: (today|tomorrow))?[?!.]?$/i,
  /^weather in (.+?)(?: (today|tomorrow))?[?!.]?$/i,
  /^what(?:'s| is) the forecast (?:for|in) (.+?)(?: (today|tomorrow))?[?!.]?$/i,
  /^forecast (?:for|in) (.+?)(?: (today|tomorrow))?[?!.]?$/i,
  /^will it rain in (.+?)(?: (today|tomorrow))?[?!.]?$/i,
]);

function cleanLocation(value: string): string | null {
  const normalized = value.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!normalized || normalized.length > 100) return null;
  if (!/^[\p{L}\p{N} .,'’()-]+$/u.test(normalized)) return null;
  return normalized;
}

/**
 * Deterministic public-weather request parser.
 *
 * This establishes scope only. It creates no authority, evidence, provenance,
 * or factual claim.
 */
export function parsePublicWeatherRequest(utterance: string): PublicWeatherRequest | null {
  const normalized = utterance.normalize("NFKC").replace(/[‘’]/g, "'").trim();
  for (const form of FORMS) {
    const match = normalized.match(form);
    if (!match) continue;
    const location = cleanLocation(match[1]);
    if (!location) return null;
    return Object.freeze({
      capability: "public_information.lookup" as const,
      kind: "weather" as const,
      location,
      period: (match[2]?.toLowerCase() === "today" ? "today" : "tomorrow") as PublicWeatherPeriod,
    });
  }
  return null;
}
