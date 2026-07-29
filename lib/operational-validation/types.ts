export const OPERATIONAL_VALIDATION_VERSION = "operational-validation-v3" as const;

export const VALIDATION_EXECUTION_SOURCES = ["synthetic", "manual_observation", "recorded_replay", "authenticated_deployment", "mixed"] as const;
export const VALIDATION_CONNECTOR_SOURCES = ["fixture", "manual_ui_observation", "recorded_connector_output", "live_google_calendar", "mixed"] as const;
export const VALIDATION_LEVELS = ["framework", "exploratory", "replay", "operational"] as const;
export const OAUTH_SESSION_STATES = ["present", "absent", "not_applicable"] as const;
export const OPERATOR_CONFIRMATIONS = ["pending", "confirmed", "rejected"] as const;
export type ValidationExecutionSource = typeof VALIDATION_EXECUTION_SOURCES[number];
export type ValidationConnectorSource = typeof VALIDATION_CONNECTOR_SOURCES[number];
export type ValidationLevel = typeof VALIDATION_LEVELS[number];
export type OAuthSessionState = typeof OAUTH_SESSION_STATES[number];
export type OperatorConfirmation = typeof OPERATOR_CONFIRMATIONS[number];

export interface ValidationProvenance {
  readonly executionSource: ValidationExecutionSource;
  readonly connectorSource: ValidationConnectorSource;
  readonly validationLevel: ValidationLevel;
  readonly oauthSession: OAuthSessionState;
  readonly generatedBy: string;
  readonly generatedAt: string;
  readonly runnerVersion: string;
}

export interface EvidenceAttestation {
  readonly reportWritten: true;
  readonly challengeCompleted: true;
  readonly attestedAt: string;
  readonly confirmedAt: string;
  readonly confirmingOperator: string;
  readonly challengeId: string;
  readonly reportHash: string;
  readonly runnerVersion: string;
}

export const SCENARIO_CATEGORIES = ["CURRENT_WORKING_DAY", "TOMORROW", "OVERLAPPING_COMMITMENTS", "NO_COMMITMENTS", "BUSY_AFTERNOON", "RECURRING_COMMITMENT", "CANCELLED_COMMITMENT", "DECLINED_VISIBLE_INVITATION", "ALL_DAY_COMMITMENT", "MIXED_MEETING_DURATIONS"] as const;
export type ScenarioCategory = typeof SCENARIO_CATEGORIES[number];
export const COMPARISON_CLASSIFICATIONS = ["Equivalent", "Intentional Improvement", "Action Required", "Not Comparable", "Scenario Not Present"] as const;
export type ComparisonClassification = typeof COMPARISON_CLASSIFICATIONS[number];
export const OUTCOME_REASONS = ["EXPECTED_MATCH", "INTENTIONAL_IMPROVEMENT", "KNOWN_LIMITATION", "EXTRACTION_NOT_COMPARABLE", "REQUIRES_INVESTIGATION", "SCENARIO_NOT_PRESENT", "AUTHENTICATION_UNAVAILABLE", "EXECUTION_NOT_OPERATIONAL", "PROVENANCE_INSUFFICIENT", "MANUAL_OBSERVATION_ONLY", "REPLAY_ONLY", "MIXED_PROVENANCE", "OPERATOR_CONFIRMATION_PENDING"] as const;
export type OutcomeReason = typeof OUTCOME_REASONS[number];
export const MIGRATION_RECOMMENDATIONS = ["PROCEED", "REFINE", "DEFER", "NOT_ASSESSED"] as const;
export type MigrationRecommendation = typeof MIGRATION_RECOMMENDATIONS[number];
export const MIGRATION_RECOMMENDATION_BASES = ["SUFFICIENT_OPERATIONAL_EVIDENCE", "INSUFFICIENT_OPERATIONAL_COVERAGE", "LEGACY_COMPARISON_REQUIRED", "MATERIAL_IMPLEMENTATION_DEFECTS", "AUTHENTICATED_VALIDATION_INCOMPLETE"] as const;
export type MigrationRecommendationBasis = typeof MIGRATION_RECOMMENDATION_BASES[number];

export interface ScenarioCoverage {
  readonly present: number;
  readonly absent: number;
  readonly notComparable: number;
}
export interface MigrationRecommendationEvidence {
  readonly authenticatedExecution: boolean;
  readonly operatorAttested: boolean;
  readonly deterministicValidationCompleted: boolean;
  readonly validatedScenarioCount: number;
  readonly requiredScenarioCount: number;
  readonly scenarioCoverage: ScenarioCoverage;
  readonly legacyComparisonEnabled: boolean;
  readonly legacyComparisonExecuted: boolean;
  readonly implementationDefectsDetected: number;
}
export interface AuthoritativeMigrationRecommendation {
  readonly value: MigrationRecommendation;
  readonly basis: MigrationRecommendationBasis;
  readonly evidence: MigrationRecommendationEvidence;
}

export interface ValidationResult { readonly comparisonClassification: ComparisonClassification; readonly outcomeReason: OutcomeReason; }
export interface OperationalScenarioRecord extends ValidationResult {
  readonly scenarioId: string; readonly scenarioCategory: ScenarioCategory; readonly validationDate: string;
  readonly connectorEvidence: unknown; readonly canonicalProjection: unknown; readonly situationalAwareness: unknown;
  readonly availabilityComputation: unknown; readonly executiveRepresentation: unknown;
  readonly legacyClaim?: unknown; readonly extractionResult?: unknown; readonly comparisonResult?: unknown;
  readonly matchedClaims: number; readonly comparedClaims: number;
}
export interface OperationalValidationInput {
  readonly runId: string; readonly provenance: ValidationProvenance;
  readonly operatorConfirmation: OperatorConfirmation; readonly attestation?: EvidenceAttestation;
  readonly scenarios: readonly OperationalScenarioRecord[]; readonly retrievalWindow?: unknown;
  readonly deterministicValidationCompleted?: boolean; readonly legacyComparisonEnabled?: boolean; readonly legacyComparisonExecuted?: boolean;
}
export interface AnonymisedScenarioSummary extends ValidationResult { readonly scenarioId: string; readonly scenarioCategory: ScenarioCategory; readonly matchStatistics: Readonly<{matched:number; compared:number}>; }
export interface AnonymisedValidationSummary {
  readonly version: typeof OPERATIONAL_VALIDATION_VERSION; readonly runId: string; readonly generatedDate: string;
  readonly runnerVersion: string; readonly provenance: ValidationProvenance; readonly operatorConfirmation: OperatorConfirmation;
  readonly scenarioCount: number; readonly scenarios: readonly AnonymisedScenarioSummary[];
  readonly matchStatistics: Readonly<{matched:number; compared:number}>; readonly migrationRecommendation: AuthoritativeMigrationRecommendation;
}

export interface EngineeringSummary { readonly implementationQuality:"PASS"|"FAIL"|"NOT ASSESSED"; readonly evidenceSufficiency:"SUFFICIENT"|"LIMITED"|"NOT ASSESSED"; readonly migrationEvidence:"MIGRATION EVIDENCE SUFFICIENT"|"MORE OPERATIONAL COVERAGE REQUIRED"|"IMPLEMENTATION REMEDIATION REQUIRED"|"AUTHENTICATED VALIDATION REQUIRED"; }
