export const LEGACY_CLAIM_VALIDATOR_VERSION = "legacy-claim-validator-v1" as const;

export type ClaimType =
  | "unread-communication-count"
  | "commitments-overlap"
  | "next-commitment"
  | "current-commitment"
  | "availability"
  | "unsupported-factual-assertion";

export type LegacyClaim =
  | { readonly type: "unread-communication-count"; readonly value: number }
  | { readonly type: "commitments-overlap"; readonly value: boolean }
  | { readonly type: "next-commitment"; readonly value: string }
  | { readonly type: "current-commitment"; readonly value: string }
  | { readonly type: "availability"; readonly value: "available" | "busy" | "unknown" }
  | { readonly type: "unsupported-factual-assertion"; readonly value: string };

export type LegacyClaimExtraction =
  | { readonly status: "extracted"; readonly claim: LegacyClaim; readonly evidence: string }
  | { readonly status: "ambiguous"; readonly candidates: readonly LegacyClaim[]; readonly evidence: string }
  | { readonly status: "not-found"; readonly evidence: string }
  | { readonly status: "failed"; readonly reason: string };

/** EOS facts use the same discriminated value contract as extracted claims. */
export type EosClaim = LegacyClaim;

export type ComparisonOutcome =
  | "match"
  | "mismatch"
  | "legacy-claim-not-found"
  | "legacy-claim-ambiguous"
  | "legacy-extraction-failed"
  | "eos-claim-unavailable"
  | "not-comparable";

export interface ValidationRecord {
  readonly fixtureId: string;
  readonly runId: string;
  readonly timestamp: string;
  readonly validatorVersion: typeof LEGACY_CLAIM_VALIDATOR_VERSION;
  readonly eosClaim: EosClaim | null;
  readonly eosProvenance: readonly string[];
  readonly rawLegacyOutput: unknown;
  readonly extraction: LegacyClaimExtraction;
  readonly comparison: ComparisonOutcome;
}

export interface ValidationReport {
  readonly fixtureId: string;
  readonly records: readonly ValidationRecord[];
  readonly extractionSuccessRate: number;
  readonly distinctExtractedClaims: readonly LegacyClaim[];
  readonly contradictionCount: number;
  /** Null when no two extracted claims are available. */
  readonly withinLegacyConsistency: number | null;
  /** Only extracted, comparable claims form this denominator. */
  readonly agreementRate: number | null;
  readonly eosDeterministic: boolean;
}
