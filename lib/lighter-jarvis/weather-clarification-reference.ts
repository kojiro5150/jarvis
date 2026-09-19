import { randomUUID } from "node:crypto";

import type { SupportedWeatherDate, WeatherQueryKind } from "./weather-request-classifier";

export const WEATHER_CLARIFICATION_REFERENCE_TTL_MS = 15 * 60 * 1000;

export type WeatherClarificationReference = Readonly<{
  weatherClarificationReferenceId: string;
}>;

type StoredWeatherClarification = Readonly<{
  id: string;
  queryKind: WeatherQueryKind;
  date: SupportedWeatherDate;
  expiresAt: string;
}>;

export type WeatherClarificationResolution =
  | Readonly<{
      status: "matched";
      queryKind: WeatherQueryKind;
      date: SupportedWeatherDate;
      location: string;
    }>
  | Readonly<{ status: "invalid" | "expired" | "not_location" }>;

const pending = new Map<string, StoredWeatherClarification>();

function idFrom(reference: unknown): string | null {
  if (typeof reference !== "object" || reference === null || Array.isArray(reference)) return null;
  const descriptor = Object.getOwnPropertyDescriptor(reference, "weatherClarificationReferenceId");
  if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "string") return null;
  return descriptor.value.trim() || null;
}

function exactLocationOnly(utterance: string): string | null {
  const normalized = utterance.normalize("NFKC").trim().replace(/[?!.]+$/, "").trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > 80) return null;
  if (!/^[\p{L}][\p{L}\p{M} .'-]{0,79}$/u.test(normalized)) return null;
  const tokens = normalized.toLowerCase().split(/\s+/);
  const disallowed = new Set([
    "yes", "no", "not", "please", "thanks", "thank",
    "weather", "forecast", "tomorrow", "today", "location",
  ]);
  if (tokens.some(token => disallowed.has(token))) return null;
  return normalized;
}

export function createWeatherClarificationReference(input: Readonly<{
  queryKind: WeatherQueryKind;
  date: SupportedWeatherDate;
  now?: Date;
}>): WeatherClarificationReference | null {
  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime())) return null;

  const id = randomUUID();
  pending.set(id, Object.freeze({
    id,
    queryKind: input.queryKind,
    date: input.date,
    expiresAt: new Date(now.getTime() + WEATHER_CLARIFICATION_REFERENCE_TTL_MS).toISOString(),
  }));
  return Object.freeze({ weatherClarificationReferenceId: id });
}

export function consumeWeatherClarificationReference(input: Readonly<{
  reference: unknown;
  currentUserUtterance: string;
  now?: Date;
}>): WeatherClarificationResolution {
  const id = idFrom(input.reference);
  if (!id) return Object.freeze({ status: "invalid" });

  const stored = pending.get(id);
  pending.delete(id);
  if (!stored) return Object.freeze({ status: "invalid" });

  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime()) || now.getTime() >= Date.parse(stored.expiresAt)) {
    return Object.freeze({ status: "expired" });
  }

  const location = exactLocationOnly(input.currentUserUtterance);
  if (!location) return Object.freeze({ status: "not_location" });

  return Object.freeze({
    status: "matched",
    queryKind: stored.queryKind,
    date: stored.date,
    location,
  });
}
