export { recordOperationalValidation } from "./recorder";
export type { RecordOperationalValidationOptions } from "./recorder";
export { createAnonymisedValidationSummary, deriveEngineeringSummary, evaluateMigrationGate, renderValidationDashboard } from "./summary";
export { assembleMigrationRecommendationEvidence, determineMigrationRecommendation, validateProvenance } from "./summary";
export {
  COMPARISON_CLASSIFICATIONS, LEGACY_COMPARISON_STATUSES, MIGRATION_RECOMMENDATIONS, OPERATIONAL_VALIDATION_VERSION, OPERATOR_CONFIRMATIONS,
  OUTCOME_REASONS, SCENARIO_CATEGORIES, VALIDATION_CONNECTOR_SOURCES, VALIDATION_EXECUTION_SOURCES, VALIDATION_LEVELS, OAUTH_SESSION_STATES,
} from "./types";
export type {
  AnonymisedScenarioSummary, AnonymisedValidationSummary, ComparisonClassification,
  MigrationRecommendation, MigrationRecommendationBasis, MigrationRecommendationEvidence, AuthoritativeMigrationRecommendation, EngineeringSummary, ScenarioCoverage, OperationalScenarioRecord, OperationalValidationInput, ValidationProvenance,
  ValidationExecutionSource, ValidationConnectorSource, ValidationLevel, OAuthSessionState, OperatorConfirmation, EvidenceAttestation,
  OutcomeReason, ScenarioCategory, ValidationResult,
} from "./types";
export { runAuthenticatedOperationalValidation, deriveScenarios } from "./runner";
export type { OperationalRunnerDependencies, OperationalRunnerResult, BoundedCalendarConnector, LegacyComparisonAdapter } from "./runner";
