import type { PublicWeatherRequest } from "./public-weather-request";

declare const GROUNDED_PUBLIC_WEATHER: unique symbol;

export type GroundedPublicWeatherEvidence = Readonly<{
  location: Readonly<{
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }>;
  forecast: Readonly<{
    date: string;
    temperatureMinC: number;
    temperatureMaxC: number;
    precipitationProbabilityMax: number;
    weatherCode: number;
  }>;
  provenance: Readonly<{
    provider: "open-meteo";
    retrievedAt: string;
    geocodingUrl: string;
    forecastUrl: string;
  }>;
  [GROUNDED_PUBLIC_WEATHER]: "grounded_public_weather";
}>;

export type PublicWeatherDependencies = Readonly<{
  fetch: typeof fetch;
  clock: () => Date;
}>;

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
export async function acquireGroundedPublicWeather(
  request: PublicWeatherRequest,
  dependencies: PublicWeatherDependencies = defaults,
): Promise<GroundedPublicWeatherEvidence | null> {
  const geocoding = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocoding.searchParams.set("name", request.location);
  geocoding.searchParams.set("count", "1");
  geocoding.searchParams.set("language", "en");
  geocoding.searchParams.set("format", "json");

  let geoResponse: Response;
  try {
    geoResponse = await dependencies.fetch(geocoding);
  } catch {
    return null;
  }
  if (!geoResponse.ok) return null;

  let geoJson: GeocodingResponse;
  try {
    geoJson = await geoResponse.json() as GeocodingResponse;
  } catch {
    return null;
  }
  const first = geoJson.results?.[0];
  if (!first) return null;

  const name = stringValue(first.name);
  const country = stringValue(first.country);
  const latitude = finiteNumber(first.latitude);
  const longitude = finiteNumber(first.longitude);
  const timezone = stringValue(first.timezone);
  if (!name || latitude === null || longitude === null || !timezone) return null;

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
    return null;
  }
  if (!forecastResponse.ok) return null;

  let forecastJson: ForecastResponse;
  try {
    forecastJson = await forecastResponse.json() as ForecastResponse;
  } catch {
    return null;
  }

  const times = stringArray(forecastJson.daily?.time);
  const min = numberArray(forecastJson.daily?.temperature_2m_min);
  const max = numberArray(forecastJson.daily?.temperature_2m_max);
  const rain = numberArray(forecastJson.daily?.precipitation_probability_max);
  const codes = numberArray(forecastJson.daily?.weather_code);
  if (!times || !min || !max || !rain || !codes) return null;
  const index = times.indexOf(targetDate);
  if (index < 0 || index >= min.length || index >= max.length || index >= rain.length || index >= codes.length) return null;

  return Object.freeze({
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
    provenance: Object.freeze({
      provider: "open-meteo" as const,
      retrievedAt: now.toISOString(),
      geocodingUrl: geocoding.toString(),
      forecastUrl: forecast.toString(),
    }),
  }) as GroundedPublicWeatherEvidence;
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
  evidence: GroundedPublicWeatherEvidence,
): string {
  const place = evidence.location.country
    ? `${evidence.location.name}, ${evidence.location.country}`
    : evidence.location.name;
  const period = request.period === "today" ? "today" : "tomorrow";
  return [
    `Grounded weather for ${place} ${period} (${evidence.forecast.date}, ${evidence.location.timezone}):`,
    `- Temperature: ${round(evidence.forecast.temperatureMinC)}°C to ${round(evidence.forecast.temperatureMaxC)}°C`,
    `- Maximum precipitation probability: ${round(evidence.forecast.precipitationProbabilityMax)}%`,
    `- Weather code: ${evidence.forecast.weatherCode}`,
    `Source: Open-Meteo forecast retrieved ${evidence.provenance.retrievedAt}`,
    evidence.provenance.forecastUrl,
  ].join("\n");
}
