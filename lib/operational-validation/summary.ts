import { COMPARISON_CLASSIFICATIONS, MIGRATION_RECOMMENDATIONS, OAUTH_SESSION_STATES, OPERATIONAL_VALIDATION_VERSION, OPERATOR_CONFIRMATIONS, OUTCOME_REASONS, SCENARIO_CATEGORIES, VALIDATION_CONNECTOR_SOURCES, VALIDATION_EXECUTION_SOURCES, VALIDATION_LEVELS, type AnonymisedValidationSummary, type MigrationRecommendation, type OperationalValidationInput, type OperatorConfirmation, type ValidationProvenance, type ValidationResult } from "./types";

const combinations = {
  synthetic: ["fixture", "framework", "not_applicable"],
  manual_observation: ["manual_ui_observation", "exploratory", "not_applicable"],
  recorded_replay: ["recorded_connector_output", "replay", "not_applicable"],
  authenticated_deployment: ["live_google_calendar", "operational", "present"],
  mixed: ["mixed", "exploratory", "not_applicable"],
} as const;
const iso = (value: string) => typeof value === "string" && Number.isFinite(Date.parse(value));
const required = (value: string, label: string) => { if (!value?.trim()) throw new Error(`${label} is required`); };

export function validateProvenance(value: ValidationProvenance): void {
  if (!value) throw new Error("provenance is required");
  if (!VALIDATION_EXECUTION_SOURCES.includes(value.executionSource) || !VALIDATION_CONNECTOR_SOURCES.includes(value.connectorSource) || !VALIDATION_LEVELS.includes(value.validationLevel) || !OAUTH_SESSION_STATES.includes(value.oauthSession)) throw new Error("invalid provenance vocabulary");
  const expected = combinations[value.executionSource];
  if (value.connectorSource !== expected[0] || value.validationLevel !== expected[1] || value.oauthSession !== expected[2]) throw new Error(`inconsistent provenance for ${value.executionSource}`);
  required(value.generatedBy, "generatedBy"); required(value.runnerVersion, "runnerVersion");
  if (!iso(value.generatedAt)) throw new Error("generatedAt must be an ISO timestamp");
}

export function determineMigrationRecommendation(provenance: ValidationProvenance, operatorConfirmation: OperatorConfirmation, results: readonly ValidationResult[], attestation?: OperationalValidationInput["attestation"]): MigrationRecommendation {
  try { validateProvenance(provenance); } catch { return "NOT_ASSESSED"; }
  if (provenance.executionSource !== "authenticated_deployment" || operatorConfirmation !== "confirmed") return "NOT_ASSESSED";
  if (!attestation?.reportWritten || !attestation.challengeCompleted || attestation.runnerVersion !== provenance.runnerVersion || !iso(attestation.attestedAt) || !iso(attestation.confirmedAt) || !attestation.confirmingOperator || !/^[a-f0-9]{64}$/.test(attestation.reportHash)) return "NOT_ASSESSED";
  if (results.some((r) => r.comparisonClassification === "Action Required")) return "DEFER";
  if (results.some((r) => r.comparisonClassification === "Intentional Improvement" || r.comparisonClassification === "Not Comparable")) return "REFINE";
  return "PROCEED";
}

export function createAnonymisedValidationSummary(input: OperationalValidationInput): AnonymisedValidationSummary {
  required(input.runId, "runId"); validateProvenance(input.provenance);
  if (!OPERATOR_CONFIRMATIONS.includes(input.operatorConfirmation)) throw new Error("invalid operator confirmation");
  if (!input.scenarios.length) throw new Error("at least one scenario is required");
  const ids = new Set<string>();
  for (const s of input.scenarios) {
    required(s.scenarioId, "scenarioId"); if (ids.has(s.scenarioId)) throw new Error("duplicate scenarioId"); ids.add(s.scenarioId);
    if (!SCENARIO_CATEGORIES.includes(s.scenarioCategory) || !COMPARISON_CLASSIFICATIONS.includes(s.comparisonClassification) || !OUTCOME_REASONS.includes(s.outcomeReason)) throw new Error("invalid scenario vocabulary");
    if (s.outcomeReason === "SCENARIO_NOT_PRESENT" && s.comparisonClassification !== "Scenario Not Present") throw new Error("scenario absence classification mismatch");
    if (!Number.isSafeInteger(s.matchedClaims) || !Number.isSafeInteger(s.comparedClaims) || s.matchedClaims < 0 || s.comparedClaims < s.matchedClaims) throw new Error("invalid match statistics");
  }
  const recommendation = determineMigrationRecommendation(input.provenance, input.operatorConfirmation, input.scenarios, input.attestation);
  if (!MIGRATION_RECOMMENDATIONS.includes(recommendation)) throw new Error("invalid recommendation");
  return { version: OPERATIONAL_VALIDATION_VERSION, runId: input.runId, generatedDate: input.provenance.generatedAt.slice(0,10), runnerVersion: input.provenance.runnerVersion, provenance: input.provenance, operatorConfirmation: input.operatorConfirmation, scenarioCount: input.scenarios.length, scenarios: input.scenarios.map(s => ({scenarioId:s.scenarioId,scenarioCategory:s.scenarioCategory,comparisonClassification:s.comparisonClassification,outcomeReason:s.outcomeReason,matchStatistics:{matched:s.matchedClaims,compared:s.comparedClaims}})), matchStatistics:{matched:input.scenarios.reduce((n,s)=>n+s.matchedClaims,0),compared:input.scenarios.reduce((n,s)=>n+s.comparedClaims,0)}, migrationRecommendation: recommendation };
}
