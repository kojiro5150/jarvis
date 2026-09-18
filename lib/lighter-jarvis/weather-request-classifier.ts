const WEATHER_SIGNAL = /\b(?:weather|forecast|rain|showers?|temperature|snow|wind(?:y)?)\b/i;
const WEATHER_QUESTION_OPENING = /^(?:what(?:'s|’s| is| will)|when|where|how|will|is|are|do|does|can|could|should)\b/i;
const WEATHER_REQUEST_OPENING = /^(?:tell|show|give|check|find|get)\s+(?:me\s+)?/i;
const LOCATION_TEXT = String.raw`[\p{L}][\p{L}\p{M} .'-]{0,79}`;
const WEATHER_FIRST_SHORTHAND = new RegExp(
  String.raw`^(?<kind>weather|forecast|temperature)(?:\s+(?:in|for))?\s+(?<location>${LOCATION_TEXT})$`,
  "iu",
);
const LOCATION_FIRST_SHORTHAND = new RegExp(
  String.raw`^(?<location>${LOCATION_TEXT})\s+(?<kind>weather|forecast|temperature)$`,
  "iu",
);
const WHAT_WEATHER_QUESTION = new RegExp(
  String.raw`^what(?:'s|’s| is| will be)\s+the\s+(?<kind>weather|temperature)(?:\s+be)?\s+in\s+(?<location>${LOCATION_TEXT})$`,
  "iu",
);
const TRAILING_LOCATION = new RegExp(String.raw`\b(?:in|for|at)\s+(?<location>${LOCATION_TEXT})$`, "iu");

export type SupportedWeatherDate = "today" | "tomorrow";
export type WeatherQueryKind = "forecast" | "temperature";
export type SupportedWeatherLocationKey = "geelong" | "melbourne";

export type WeatherRequestClassification =
  | Readonly<{ kind: "not_weather" }>
  | Readonly<{ kind: "unresolved_weather_signal"; signal: string }>
  | Readonly<{ kind: "clarification_required"; reason: "missing_date" | "missing_location" }>
  | Readonly<{ kind: "unsupported_timeframe"; date: "today" }>
  | Readonly<{ kind: "unsupported_location"; location: string }>
  | Readonly<{
      kind: "resolved";
      queryKind: WeatherQueryKind;
      locationKey: SupportedWeatherLocationKey;
      date: "tomorrow";
    }>;

export function extractTrailingWeatherDate(input: string): Readonly<{
  core: string;
  date: SupportedWeatherDate | null;
}> {
  const normalized = input.normalize("NFKC").trim().replace(/[?!.]+$/, "").trim();
  const match = normalized.match(/(?:^|\s)(today|tomorrow)$/i);
  if (!match || match.index === undefined) return Object.freeze({ core: normalized, date: null });
  return Object.freeze({
    core: normalized.slice(0, match.index).trim(),
    date: match[1].toLowerCase() as SupportedWeatherDate,
  });
}

function queryKind(value: string | undefined): WeatherQueryKind {
  return value?.toLowerCase() === "temperature" ? "temperature" : "forecast";
}

function normalizedLocation(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isPlausibleLocation(value: string): boolean {
  const tokens = value.toLowerCase().split(/\s+/).filter(Boolean);
  const structuralWords = new Set(["a", "an", "at", "by", "for", "in", "of", "on", "the", "to", "under"]);
  return tokens.length > 0 && tokens.some(token => !structuralWords.has(token));
}

function structuredRequest(core: string): Readonly<{ queryKind: WeatherQueryKind; location: string | null }> | null {
  const exactQuestion = WHAT_WEATHER_QUESTION.exec(core);
  if (exactQuestion?.groups?.location) {
    return Object.freeze({
      queryKind: queryKind(exactQuestion.groups.kind),
      location: normalizedLocation(exactQuestion.groups.location),
    });
  }

  const weatherFirst = WEATHER_FIRST_SHORTHAND.exec(core);
  if (weatherFirst?.groups?.location && isPlausibleLocation(weatherFirst.groups.location)) {
    return Object.freeze({
      queryKind: queryKind(weatherFirst.groups.kind),
      location: normalizedLocation(weatherFirst.groups.location),
    });
  }

  const locationFirst = LOCATION_FIRST_SHORTHAND.exec(core);
  if (locationFirst?.groups?.location && isPlausibleLocation(locationFirst.groups.location)) {
    return Object.freeze({
      queryKind: queryKind(locationFirst.groups.kind),
      location: normalizedLocation(locationFirst.groups.location),
    });
  }

  const requestShaped = WEATHER_QUESTION_OPENING.test(core) || WEATHER_REQUEST_OPENING.test(core);
  if (!requestShaped) return null;
  const trailingLocation = TRAILING_LOCATION.exec(core)?.groups?.location;
  return Object.freeze({
    queryKind: /\btemperature\b/i.test(core) ? "temperature" : "forecast",
    location: trailingLocation ? normalizedLocation(trailingLocation) : null,
  });
}

export function classifyWeatherRequest(utterance: string): WeatherRequestClassification {
  const { core, date } = extractTrailingWeatherDate(utterance);
  const signal = WEATHER_SIGNAL.exec(core)?.[0] ?? WEATHER_SIGNAL.exec(utterance)?.[0];
  if (!signal) return Object.freeze({ kind: "not_weather" });

  const request = structuredRequest(core);
  if (!request) return Object.freeze({ kind: "unresolved_weather_signal", signal: signal.toLowerCase() });
  if (!request.location) return Object.freeze({ kind: "clarification_required", reason: "missing_location" });
  if (date === null) return Object.freeze({ kind: "clarification_required", reason: "missing_date" });
  if (date === "today") return Object.freeze({ kind: "unsupported_timeframe", date });

  const location = request.location.toLowerCase();
  if (location !== "geelong" && location !== "melbourne") {
    return Object.freeze({ kind: "unsupported_location", location: request.location });
  }
  return Object.freeze({
    kind: "resolved",
    queryKind: request.queryKind,
    locationKey: location,
    date,
  });
}

export const WEATHER_REQUEST_SIGNAL = WEATHER_SIGNAL;
