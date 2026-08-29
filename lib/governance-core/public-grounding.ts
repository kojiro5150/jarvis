/**
 * JARVIS public-grounding trust types.
 *
 * PUBLIC-GROUNDING-01:
 * Model-authored values are descriptive only. They may not inhabit
 * retrieved-public-evidence or public-provenance-bearing types.
 *
 * The brand is module-private. No generic evidence constructor is exported.
 * Provider adapters must validate their own real provider responses before
 * returning one of these types.
 */

declare const RETRIEVED_PUBLIC_EVIDENCE: unique symbol;
declare const PUBLIC_EVIDENCE_PROVENANCE: unique symbol;

export type PublicEvidenceKind = "weather" | "web_search";

export type PublicEvidenceProvenance = Readonly<{
  provider: string;
  retrievedAt: string;
  sourceUrl: string;
  supportingUrls?: readonly string[];
  [PUBLIC_EVIDENCE_PROVENANCE]: "public_evidence_provenance";
}>;

export type RetrievedPublicEvidence<
  TKind extends PublicEvidenceKind,
  TPayload,
> = Readonly<{
  kind: TKind;
  payload: TPayload;
  provenance: PublicEvidenceProvenance;
  [RETRIEVED_PUBLIC_EVIDENCE]: "retrieved_public_evidence";
}>;

export type WeatherPublicEvidencePayload = Readonly<{
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
}>;

export type RetrievedWeatherPublicEvidence =
  RetrievedPublicEvidence<"weather", WeatherPublicEvidencePayload>;
