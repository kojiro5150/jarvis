import type { RetrievedWeatherPublicEvidence } from "@/lib/governance-core/public-grounding";
import type { PublicLookupRequest } from "./public-lookup-request";
import {
  acquireGroundedPublicWeather,
  type PublicWeatherDependencies,
} from "./public-weather";

export const PUBLIC_GROUNDING_UNAVAILABLE_REPLY =
  "I couldn't establish current public evidence for that request, so I won't substitute an unsupported answer from model memory.";

export type PublicGroundingExecution =
  | Readonly<{
      status: "grounded";
      request: Extract<PublicLookupRequest, { kind: "weather" }>;
      evidence: RetrievedWeatherPublicEvidence;
    }>
  | Readonly<{
      status: "unavailable";
      request: PublicLookupRequest;
    }>;

export type PublicGroundingDependencies = Readonly<{
  weather?: PublicWeatherDependencies;
}>;

/**
 * Provider-neutral public grounding executor.
 *
 * Unsupported providers fail closed. They never fall through to ordinary
 * model answering for a request that system policy has already classified as
 * requiring current external evidence.
 */
export async function executePublicGrounding(
  request: PublicLookupRequest,
  dependencies: PublicGroundingDependencies = {},
): Promise<PublicGroundingExecution> {
  if (request.kind === "weather") {
    const evidence = await acquireGroundedPublicWeather(request, dependencies.weather);
    return evidence
      ? Object.freeze({ status: "grounded" as const, request, evidence })
      : Object.freeze({ status: "unavailable" as const, request });
  }

  return Object.freeze({ status: "unavailable" as const, request });
}
