import { Writable } from "node:stream";
import { Client } from "basic-ftp";
import { SaxesParser, type SaxesTagPlain } from "saxes";
import { CALENDAR_TIME_ZONE } from "@/lib/lighter-jarvis/calendar-read-window";
import {
  classifyWeatherRequest,
  type SupportedWeatherLocationKey,
  type WeatherQueryKind,
} from "@/lib/lighter-jarvis/weather-request-classifier";
import {
  createWeatherClarificationReference,
  type WeatherClarificationReference,
} from "@/lib/lighter-jarvis/weather-clarification-reference";

const PRODUCT_PATH = "/anon/gen/fwo/IDV10753.xml";
const PRODUCT_IDENTIFIER = "IDV10753";
const MAX_PRODUCT_BYTES = 2 * 1024 * 1024;

const SUPPORTED_LOCATIONS = {
  geelong: { aac: "VIC_PT025", name: "Geelong" },
  melbourne: { aac: "VIC_PT042", name: "Melbourne" },
} as const;

type QueryKind = WeatherQueryKind;
type LocationKey = SupportedWeatherLocationKey;
type ClassifiedQuery = { kind: QueryKind; locationKey: LocationKey };
type Values = Record<string, string[]>;
type Period = { start: string; end: string; elements: Values; texts: Values };
type Area = { aac: string; type: string; periods: Period[] };
type Product = { identifier: string; issueTime: string; expiryTime: string; areas: Area[] };

export type VictorianTomorrowWeatherDependencies = Readonly<{
  fetchProduct: () => Promise<string>;
  clock: () => Date;
}>;

export type VictorianTomorrowWeatherResult = Readonly<{
  handled: boolean;
  status?: "resolved" | "unavailable" | "unsupported_location" | "unsupported_timeframe" | "clarification_required" | "unresolved_weather_signal";
  reply?: string;
  diagnostic?: string;
  locationKey?: LocationKey;
  clarificationReference?: WeatherClarificationReference;
}>;

export type GeelongTomorrowWeatherDependencies = VictorianTomorrowWeatherDependencies;
export type GeelongTomorrowWeatherResult = VictorianTomorrowWeatherResult;

async function fetchBomProduct(): Promise<string> {
  const client = new Client(15_000);
  const chunks: Buffer[] = [];
  let size = 0;
  const destination = new Writable({
    write(chunk: Buffer | string, encoding, callback) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
      size += buffer.length;
      if (size > MAX_PRODUCT_BYTES) return callback(new Error("weather_product_too_large"));
      chunks.push(buffer);
      callback();
    },
  });
  try {
    await client.access({ host: "ftp.bom.gov.au", user: "anonymous", password: "anonymous@" });
    await client.downloadTo(destination, PRODUCT_PATH);
    return Buffer.concat(chunks).toString("utf8");
  } finally {
    client.close();
  }
}

export const defaultVictorianTomorrowWeatherDependencies: VictorianTomorrowWeatherDependencies = {
  fetchProduct: fetchBomProduct,
  clock: () => new Date(),
};

export const defaultGeelongTomorrowWeatherDependencies = defaultVictorianTomorrowWeatherDependencies;

function addValue(values: Values, type: string, value: string) {
  (values[type] ??= []).push(value.trim());
}

function parseProduct(xml: string): Product {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("weather_xml_declaration_forbidden");
  const product: Product = { identifier: "", issueTime: "", expiryTime: "", areas: [] };
  const parser = new SaxesParser({ xmlns: false });
  const stack: string[] = [];
  let area: Area | null = null;
  let period: Period | null = null;
  let valueType: string | null = null;
  let valueKind: "element" | "text" | null = null;
  let text = "";

  parser.on("doctype", () => { throw new Error("weather_xml_doctype_forbidden"); });
  parser.on("opentag", (tag: SaxesTagPlain) => {
    stack.push(tag.name);
    text = "";
    if (tag.name === "area") {
      area = { aac: tag.attributes.aac ?? "", type: tag.attributes.type ?? "", periods: [] };
      product.areas.push(area);
    } else if (tag.name === "forecast-period" && area) {
      period = { start: tag.attributes["start-time-local"] ?? "", end: tag.attributes["end-time-local"] ?? "", elements: {}, texts: {} };
      area.periods.push(period);
    } else if ((tag.name === "element" || tag.name === "text") && period) {
      valueType = tag.attributes.type ?? null;
      valueKind = tag.name;
      if (tag.name === "element" && valueType?.startsWith("air_temperature_") && tag.attributes.units !== "Celsius") {
        throw new Error("weather_temperature_units_invalid");
      }
    }
  });
  parser.on("text", value => { text += value; });
  parser.on("closetag", tag => {
    const name = tag.name;
    if (name === "identifier" && stack.join("/") === "product/amoc/identifier") product.identifier = text.trim();
    if (name === "issue-time-utc" && stack.join("/") === "product/amoc/issue-time-utc") product.issueTime = text.trim();
    if (name === "expiry-time" && stack.join("/") === "product/amoc/expiry-time") product.expiryTime = text.trim();
    if ((name === "element" || name === "text") && period && valueType && valueKind) {
      addValue(valueKind === "element" ? period.elements : period.texts, valueType, text);
      valueType = null;
      valueKind = null;
    }
    if (name === "forecast-period") period = null;
    if (name === "area") area = null;
    stack.pop();
    text = "";
  });
  parser.write(xml).close();
  return product;
}

function localParts(date: Date) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: CALENDAR_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date).filter(part => part.type !== "literal").map(part => [part.type, part.value]));
}

function shiftedDateKey(date: Date, days: number): string {
  const parts = localParts(date);
  const shifted = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + days, 12));
  return shifted.toISOString().slice(0, 10);
}

function isExactLocalDay(period: Period, target: string, next: string): boolean {
  const start = new Date(period.start);
  const end = new Date(period.end);
  if (!Number.isFinite(start.valueOf()) || !Number.isFinite(end.valueOf())) return false;
  const s = localParts(start);
  const e = localParts(end);
  return `${s.year}-${s.month}-${s.day}` === target && `${s.hour}:${s.minute}:${s.second}` === "00:00:00"
    && `${e.year}-${e.month}-${e.day}` === next && `${e.hour}:${e.minute}:${e.second}` === "00:00:00";
}

function one(values: Values, key: string): string | null {
  const matches = values[key] ?? [];
  if (matches.length > 1) throw new Error(`weather_duplicate_${key}`);
  return matches[0]?.trim() || null;
}

function temperature(period: Period, key: string): string | null {
  const value = one(period.elements, key);
  if (value === null) return null;
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) throw new Error(`weather_invalid_${key}`);
  return `${value}°C`;
}

function probability(period: Period): string | null {
  const value = one(period.texts, "probability_of_precipitation");
  if (value === null) return null;
  const match = /^(\d{1,3})%$/.exec(value);
  if (!match || Number(match[1]) > 100) throw new Error("weather_invalid_rain_probability");
  return value;
}

function issuePresentation(issue: Date): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: CALENDAR_TIME_ZONE, hour: "numeric", minute: "2-digit", hour12: true,
    weekday: "long", day: "numeric", month: "long",
  }).format(issue);
}

function targetPresentation(target: string): string {
  return new Intl.DateTimeFormat("en-AU", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" })
    .format(new Date(`${target}T12:00:00Z`));
}

function render(kind: QueryKind, locationName: string, period: Period, issue: Date, target: string): string {
  const min = temperature(period, "air_temperature_minimum");
  const max = temperature(period, "air_temperature_maximum");
  const precis = one(period.texts, "precis");
  const rain = probability(period);
  const provenance = `Bureau of Meteorology forecast issued ${issuePresentation(issue)}.`;
  const day = targetPresentation(target);
  if (kind === "temperature") {
    const detail = min && max ? `a minimum of ${min} and a maximum of ${max}`
      : min ? `a minimum of ${min}; the maximum is unavailable`
        : max ? `a maximum of ${max}; the minimum is unavailable`
          : "minimum and maximum temperatures unavailable";
    return `Tomorrow, ${day}, ${locationName} has ${detail}. ${provenance}`;
  }
  const pieces = [`Tomorrow, ${day}, ${locationName}: ${precis ?? "Conditions unavailable."}`];
  pieces.push(min ? `Minimum ${min}.` : "Minimum temperature unavailable.");
  pieces.push(max ? `Maximum ${max}.` : "Maximum temperature unavailable.");
  pieces.push(rain ? `Chance of rain: ${rain}.` : "Chance of rain unavailable.");
  const range = one(period.elements, "precipitation_range");
  if (range) pieces.push(`Possible rainfall: ${range}.`);
  pieces.push(provenance);
  return pieces.join(" ");
}

export async function resolveVictorianTomorrowWeather(
  utterance: string,
  dependencies: VictorianTomorrowWeatherDependencies = defaultVictorianTomorrowWeatherDependencies,
): Promise<VictorianTomorrowWeatherResult> {
  const classification = classifyWeatherRequest(utterance);
  if (classification.kind === "not_weather") return { handled: false };
  if (classification.kind === "unresolved_weather_signal") {
    return { handled: true, status: classification.kind,
      reply: "I detected possible weather wording, but not a complete forecast request. Could you clarify what you'd like?" };
  }
  if (classification.kind === "clarification_required") {
    const reply = classification.reason === "missing_location"
      ? "Please specify the location for the weather forecast."
      : "Please specify tomorrow for the deterministic weather forecast.";
    const clarificationReference = classification.reason === "missing_location"
      && classification.queryKind
      && classification.date === "tomorrow"
      ? createWeatherClarificationReference({
          queryKind: classification.queryKind,
          date: classification.date,
          now: dependencies.clock(),
        })
      : null;
    return {
      handled: true,
      status: classification.kind,
      reply,
      ...(clarificationReference ? { clarificationReference } : {}),
    };
  }
  if (classification.kind === "unsupported_timeframe") {
    return { handled: true, status: classification.kind,
      reply: "I currently have a deterministic Bureau of Meteorology forecast path for tomorrow only." };
  }
  if (classification.kind === "unsupported_location") {
    return { handled: true, status: classification.kind,
      reply: `I don't yet have a deterministic Bureau of Meteorology forecast for ${classification.location}.` };
  }
  const query: ClassifiedQuery = { kind: classification.queryKind, locationKey: classification.locationKey };
  const location = SUPPORTED_LOCATIONS[query.locationKey];
  try {
    const now = dependencies.clock();
    const product = parseProduct(await dependencies.fetchProduct());
    if (product.identifier !== PRODUCT_IDENTIFIER) throw new Error("weather_product_mismatch");
    const issue = new Date(product.issueTime);
    const expiry = new Date(product.expiryTime);
    if (!Number.isFinite(issue.valueOf()) || !Number.isFinite(expiry.valueOf())) throw new Error("weather_invalid_freshness");
    if (now < issue) throw new Error("weather_future_product");
    if (now >= expiry) throw new Error("weather_expired_product");
    const areas = product.areas.filter(candidate => candidate.aac === location.aac && candidate.type === "location");
    if (areas.length !== 1) throw new Error("weather_location_ambiguous");
    const target = shiftedDateKey(now, 1);
    const next = shiftedDateKey(now, 2);
    const periods = areas[0].periods.filter(period => isExactLocalDay(period, target, next));
    if (periods.length !== 1) throw new Error("weather_period_ambiguous");
    return { handled: true, status: "resolved", locationKey: query.locationKey,
      reply: render(query.kind, location.name, periods[0], issue, target) };
  } catch (error) {
    return { handled: true, status: "unavailable", locationKey: query.locationKey,
      reply: `I couldn't retrieve a current date-bound Bureau of Meteorology forecast for ${location.name} tomorrow.`,
      diagnostic: error instanceof Error ? error.message : "weather_unknown_failure" };
  }
}

export const resolveGeelongTomorrowWeather = resolveVictorianTomorrowWeather;
