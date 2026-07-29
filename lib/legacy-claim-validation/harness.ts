import { compareLegacyAndEos } from "./comparison";
import { extractLegacyUnreadCount } from "./extractor";
import {
  LEGACY_CLAIM_VALIDATOR_VERSION,
  type EosClaim,
  type LegacyClaim,
  type ValidationRecord,
  type ValidationReport,
} from "./types";

export interface SyntheticValidationFixture {
  readonly fixtureId: string;
  readonly eosProvenance: readonly string[];
  readonly legacyRuns: readonly unknown[];
  /** Re-evaluated per run so accidental EOS non-determinism is observable. */
  readonly deriveEosClaim: () => EosClaim | null;
}

export interface ValidationHarnessOptions {
  readonly now?: () => string;
}

function key(claim: LegacyClaim | EosClaim | null): string {
  return claim === null ? "null" : JSON.stringify([claim.type, claim.value]);
}

/** Runs only against explicitly supplied synthetic outputs; it is not wired to /api/chat. */
export function validateSyntheticLegacyRuns(
  fixture: SyntheticValidationFixture,
  options: ValidationHarnessOptions = {},
): ValidationReport {
  const now = options.now ?? (() => new Date().toISOString());
  const records: ValidationRecord[] = fixture.legacyRuns.map((rawLegacyOutput, index) => {
    const eosClaim = fixture.deriveEosClaim();
    const extraction = extractLegacyUnreadCount(rawLegacyOutput);
    return {
      fixtureId: fixture.fixtureId,
      runId: `${fixture.fixtureId}:legacy:${index + 1}`,
      timestamp: now(),
      validatorVersion: LEGACY_CLAIM_VALIDATOR_VERSION,
      eosClaim,
      eosProvenance: [...fixture.eosProvenance],
      rawLegacyOutput,
      extraction,
      comparison: compareLegacyAndEos(extraction, eosClaim),
    };
  });
  const extracted = records.flatMap((record) => record.extraction.status === "extracted" ? [record.extraction.claim] : []);
  const distinct = [...new Map(extracted.map((claim) => [key(claim), claim])).values()];
  const comparable = records.filter((record) => record.comparison === "match" || record.comparison === "mismatch");
  const modalCount = extracted.length === 0 ? 0 : Math.max(...distinct.map((claim) => extracted.filter((item) => key(item) === key(claim)).length));
  return {
    fixtureId: fixture.fixtureId,
    records,
    extractionSuccessRate: records.length === 0 ? 0 : extracted.length / records.length,
    distinctExtractedClaims: distinct,
    contradictionCount: Math.max(0, distinct.length - 1),
    withinLegacyConsistency: extracted.length < 2 ? null : modalCount / extracted.length,
    agreementRate: comparable.length === 0 ? null : comparable.filter((record) => record.comparison === "match").length / comparable.length,
    eosDeterministic: new Set(records.map((record) => key(record.eosClaim))).size <= 1,
  };
}
