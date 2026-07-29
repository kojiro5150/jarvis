import type { ComparisonOutcome, EosClaim, LegacyClaimExtraction } from "./types";

export function compareLegacyAndEos(
  extraction: LegacyClaimExtraction,
  eosClaim: EosClaim | null,
): ComparisonOutcome {
  if (extraction.status === "failed") return "legacy-extraction-failed";
  if (extraction.status === "ambiguous") return "legacy-claim-ambiguous";
  if (extraction.status === "not-found") return "legacy-claim-not-found";
  if (eosClaim === null) return "eos-claim-unavailable";
  if (extraction.claim.type !== eosClaim.type) return "not-comparable";
  return extraction.claim.value === eosClaim.value ? "match" : "mismatch";
}
