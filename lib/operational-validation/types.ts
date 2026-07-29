export const OPERATIONAL_VALIDATION_VERSION = "operational-validation-v1" as const;

export const SCENARIO_CATEGORIES = [
  "CURRENT_WORKING_DAY", "TOMORROW", "OVERLAPPING_COMMITMENTS", "NO_COMMITMENTS",
  "BUSY_AFTERNOON", "RECURRING_COMMITMENT", "CANCELLED_COMMITMENT",
  "DECLINED_VISIBLE_INVITATION", "ALL_DAY_COMMITMENT", "MIXED_MEETING_DURATIONS",
] as const;
export type ScenarioCategory = typeof SCENARIO_CATEGORIES[number];

export const COMPARISON_CLASSIFICATIONS = [
  "Equivalent", "Intentional Improvement", "Action Required", "Not Comparable",
] as const;
export type ComparisonClassification = typeof COMPARISON_CLASSIFICATIONS[number];

export const OUTCOME_REASONS = [
  "EXPECTED_MATCH", "INTENTIONAL_IMPROVEMENT", "KNOWN_LIMITATION",
  "EXTRACTION_NOT_COMPARABLE", "REQUIRES_INVESTIGATION",
] as const;
export type OutcomeReason = typeof OUTCOME_REASONS[number];

export const MIGRATION_RECOMMENDATIONS = ["Proceed", "Refine", "Defer"] as const;
export type MigrationRecommendation = typeof MIGRATION_RECOMMENDATIONS[number];

/** Deployment-owned record. It must only be persisted under the gitignored report directory. */
export interface OperationalScenarioRecord {
  readonly scenarioId: string;
  readonly scenarioCategory: ScenarioCategory;
  readonly validationDate: string;
  readonly executiveContextOutput: unknown;
  readonly availabilityEngineOutput: unknown;
  readonly calendarObservations: unknown;
  readonly legacyConversationalResponse: string;
  readonly extractedLegacyClaim: unknown;
  readonly eosClaim: unknown;
  readonly comparisonClassification: ComparisonClassification;
  readonly outcomeReason: OutcomeReason;
  readonly engineeringObservations: string;
  readonly migrationRecommendation: MigrationRecommendation;
  readonly matchedClaims: number;
  readonly comparedClaims: number;
}

export interface OperationalValidationInput {
  readonly runId: string;
  readonly scenarios: readonly OperationalScenarioRecord[];
}

export interface AnonymisedScenarioSummary {
  readonly scenarioId: string;
  readonly scenarioCategory: ScenarioCategory;
  readonly comparisonClassification: ComparisonClassification;
  readonly outcomeReason: OutcomeReason;
  readonly matchStatistics: Readonly<{ matched: number; compared: number }>;
  readonly migrationRecommendation: MigrationRecommendation;
}

export interface AnonymisedValidationSummary {
  readonly version: typeof OPERATIONAL_VALIDATION_VERSION;
  readonly validationDate: string;
  readonly scenarioCount: number;
  readonly scenarios: readonly AnonymisedScenarioSummary[];
  readonly matchStatistics: Readonly<{ matched: number; compared: number }>;
  readonly migrationRecommendation: MigrationRecommendation;
}
