/**
 * Public Grounding Core.
 *
 * Public information is not private authority. The trust question is whether
 * a current/external claim is actually grounded in retrieved evidence.
 *
 * PUBLIC-GROUNDING-01:
 * Model-authored text is never RetrievedPublicEvidence.
 */

declare const RETRIEVED_PUBLIC_EVIDENCE: unique symbol;

export type PublicEvidenceKind = "weather";

export type PublicEvidenceProvenance = Readonly<{
  provider: string;
  retrievedAt: string;
  sourceUrl: string;
  supportingUrls?: readonly string[];
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

/**
 * No generic public-evidence constructor is exported.
 *
 * Each provider adapter must earn a source-specific trusted constructor after
 * validating its own response semantics. This keeps arbitrary model text or
 * application objects from being promoted into evidence through a generic
 * helper.
 */
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

/**
 * Source-specific trusted boundary for validated weather provider output.
 * Keep this constructor narrow: it accepts only the exact structured shape
 * produced after adapter validation, never model-authored prose.
 */
export function establishRetrievedWeatherEvidence(input: Readonly<{
  payload: WeatherPublicEvidencePayload;
  provenance: PublicEvidenceProvenance;
}>): RetrievedWeatherPublicEvidence {
  return Object.freeze({
    kind: "weather" as const,
    payload: input.payload,
    provenance: input.provenance,
  }) as RetrievedWeatherPublicEvidence;
}
