import { parsePublicWeatherRequest } from "./public-weather-request";
import { requiresPublicGrounding } from "./public-grounding-requirement";

export type PublicLookupRequest =
  | Readonly<{
      capability: "public_information.lookup";
      kind: "weather";
      utterance: string;
      location: string;
      period: "today" | "tomorrow";
    }>
  | Readonly<{
      capability: "public_information.lookup";
      kind: "web_search";
      utterance: string;
    }>;

/**
 * Materializes a public-information intent into a closed server-owned request.
 * It does not create evidence or a factual answer.
 */
export function materializePublicLookupRequest(utterance: string): PublicLookupRequest | null {
  const weather = parsePublicWeatherRequest(utterance);
  if (weather) {
    return Object.freeze({
      ...weather,
      utterance,
    });
  }
  if (!requiresPublicGrounding(utterance)) return null;
  return Object.freeze({
    capability: "public_information.lookup" as const,
    kind: "web_search" as const,
    utterance,
  });
}
