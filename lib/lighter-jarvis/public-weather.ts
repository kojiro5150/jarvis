import type { PublicWeatherRequest } from "./public-weather-request";
import type {
  PublicEvidenceProvenance,
  RetrievedWeatherPublicEvidence,
} from "@/lib/governance-core/public-grounding";

export type PublicWeatherDependencies = Readonly<{
  fetch: typeof fetch;
  clock: () => Date;
}>;

export type PublicWeatherGroundingFailureReason =
  | "geocoding_network_error"
  | "geocoding_http_error"
  | "geocoding_invalid_json"
  | "geocoding_no_result"
  | "geocoding_invalid_result"
  | "forecast_network_error"
  | "forecast_http_error"
  | "forecast_invalid_json"
  | "forecast_invalid_shape"
  | "forecast_target_date_missing";

export type PublicWeatherGroundingAttempt =
  | Readonly<{ status: "grounded"; evidence: RetrievedWeatherPublicEvidence }>
  | Readonly<{ status: "unavailable"; reason: PublicWeatherGroundingFailureReason }>;

const defaults: PublicWeatherDependencies = {
  fetch,
  clock: () => new Date(),
};

type GeocodingResponse = Readonly<{
  results?: readonly Readonly<{
    name?: unknown;
    country?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    timezone?: unknown;
  }>[];
}>;

type ForecastResponse = Readonly<{
  daily?: Readonly<{
    time?: unknown;
    temperature_2m_min?: unknown;
    temperature_2m_max?: unknown;
    precipitation_probability_max?: unknown;
    weather_code?: unknown;
  }>;
}>;

function localIsoDate(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addIsoDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberArray(value: unknown): readonly number[] | null {
  if (!Array.isArray(value) || value.some(item => finiteNumber(item) === null)) return null;
  return value as readonly number[];
}

function stringArray(value: unknown): readonly string[] | null {
  if (!Array.isArray(value) || value.some(item => typeof item !== "string")) return null;
  return value as readonly string[];
}

/**
 * Acquires a fresh structured public forecast and returns a branded evidence
 * value only after location, target-date alignment, and required fields pass
 * deterministic validation.
 */
export async function acquireGroundedPublicWeatherWithDiagnostics(
  request: PublicWeatherRequest,
  dependencies: PublicWeatherDependencies = defaults,
): Promise<PublicWeatherGroundingAttempt> {
  const geocoding = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocoding.searchParams.set("name", request.location);
  geocoding.searchParams.set("count", "1");
  geocoding.searchParams.set("language", "en");
  geocoding.searchParams.set("format", "json");

  let geoResponse: Response;
  try {
    geoResponse = await dependencies.fetch(geocoding);
  } catch {
    return Object.freeze({ status: "unavailable" as const, reason: "geocoding_network_error" as const });
  }
  if (!geoResponse.ok) {
    return Object.freeze({ status: "unavailable" as const, reason: "geocoding_http_error" as const });
  }

  let geoJson: GeocodingResponse;
  try {
    geoJson = await geoResponse.json() as GeocodingResponse;
  } catch {
    return Object.freeze({ status: "unavailable" as const, reason: "geocoding_invalid_json" as const });
  }
  const first = geoJson.results?.[0];
  if (!first) {
    return Object.freeze({ status: "unavailable" as const, reason: "geocoding_no_result" as const });
  }

  const name = stringValue(first.name);
  const country = stringValue(first.country);
  const latitude = finiteNumber(first.latitude);
  const longitude = finiteNumber(first.longitude);
  const timezone = stringValue(first.timezone);
  if (!name || latitude === null || longitude === null || !timezone) {
    return Object.freeze({ status: "unavailable" as const, reason: "geocoding_invalid_result" as const });
  }

  const now = dependencies.clock();
  const today = localIsoDate(now, timezone);
  const targetDate = request.period === "today" ? today : addIsoDays(today, 1);

  const forecast = new URL("https://api.open-meteo.com/v1/forecast");
  forecast.searchParams.set("latitude", String(latitude));
  forecast.searchParams.set("longitude", String(longitude));
  forecast.searchParams.set("daily", "temperature_2m_min,temperature_2m_max,precipitation_probability_max,weather_code");
  forecast.searchParams.set("timezone", timezone);
  forecast.searchParams.set("forecast_days", "3");

  let forecastResponse: Response;
  try {
    forecastResponse = await dependencies.fetch(forecast);
  } catch {
    return Object.freeze({ status: "unavailable" as const, reason: "forecast_network_error" as const });
  }
  if (!forecastResponse.ok) {
    return Object.freeze({ status: "unavailable" as const, reason: "forecast_http_error" as const });
  }

  let forecastJson: ForecastResponse;
  try {
    forecastJson = await forecastResponse.json() as ForecastResponse;
  } catch {
    return Object.freeze({ status: "unavailable" as const, reason: "forecast_invalid_json" as const });
  }

  const times = stringArray(forecastJson.daily?.time);
  const min = numberArray(forecastJson.daily?.temperature_2m_min);
  const max = numberArray(forecastJson.daily?.temperature_2m_max);
  const rain = numberArray(forecastJson.daily?.precipitation_probability_max);
  const codes = numberArray(forecastJson.daily?.weather_code);
  if (!times || !min || !max || !rain || !codes) {
    return Object.freeze({ status: "unavailable" as const, reason: "forecast_invalid_shape" as const });
  }
  const index = times.indexOf(targetDate);
  if (index < 0 || index >= min.length || index >= max.length || index >= rain.length || index >= codes.length) {
    return Object.freeze({ status: "unavailable" as const, reason: "forecast_target_date_missing" as const });
  }

  const provenance = Object.freeze({
    provider: "open-meteo",
    retrievedAt: now.toISOString(),
    sourceUrl: forecast.toString(),
    supportingUrls: Object.freeze([geocoding.toString()]),
  }) as PublicEvidenceProvenance;

  const evidence = Object.freeze({
    kind: "weather" as const,
    payload: Object.freeze({
      location: Object.freeze({
        name,
        ...(country ? { country } : {}),
        latitude,
        longitude,
        timezone,
      }),
      forecast: Object.freeze({
        date: targetDate,
        temperatureMinC: min[index],
        temperatureMaxC: max[index],
        precipitationProbabilityMax: rain[index],
        weatherCode: codes[index],
      }),
    }),
    provenance,
  }) as RetrievedWeatherPublicEvidence;

  return Object.freeze({ status: "grounded" as const, evidence });
}

export async function acquireGroundedPublicWeather(
  request: PublicWeatherRequest,
  dependencies: PublicWeatherDependencies = defaults,
): Promise<RetrievedWeatherPublicEvidence | null> {
  const result = await acquireGroundedPublicWeatherWithDiagnostics(request, dependencies);
  return result.status === "grounded" ? result.evidence : null;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Deterministic presentation from grounded evidence. No model-authored current
 * weather claim is required for the first public-grounding proof.
 */
export function renderGroundedPublicWeather(
  request: PublicWeatherRequest,
  evidence: RetrievedWeatherPublicEvidence,
): string {
  const place = evidence.payload.location.country
    ? `${evidence.payload.location.name}, ${evidence.payload.location.country}`
    : evidence.payload.location.name;
  const period = request.period === "today" ? "today" : "tomorrow";
  return [
    `Grounded weather for ${place} ${period} (${evidence.payload.forecast.date}, ${evidence.payload.location.timezone}):`,
    `- Temperature: ${round(evidence.payload.forecast.temperatureMinC)}°C to ${round(evidence.payload.forecast.temperatureMaxC)}°C`,
    `- Maximum precipitation probability: ${round(evidence.payload.forecast.precipitationProbabilityMax)}%`,
    `- Weather code: ${evidence.payload.forecast.weatherCode}`,
    `Source: Open-Meteo forecast retrieved ${evidence.provenance.retrievedAt}`,
    evidence.provenance.sourceUrl,
  ].join("\n");
}
