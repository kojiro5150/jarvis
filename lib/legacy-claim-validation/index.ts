export { compareLegacyAndEos } from "./comparison";
export { extractLegacyUnreadCount } from "./extractor";
export { validateSyntheticLegacyRuns } from "./harness";
export type { SyntheticValidationFixture, ValidationHarnessOptions } from "./harness";
export { LEGACY_CLAIM_VALIDATOR_VERSION } from "./types";
export type {
  ClaimType, ComparisonOutcome, EosClaim, LegacyClaim, LegacyClaimExtraction,
  ValidationRecord, ValidationReport,
} from "./types";
