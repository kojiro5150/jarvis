import {
  COMPARISON_CLASSIFICATIONS, MIGRATION_RECOMMENDATIONS, OPERATIONAL_VALIDATION_VERSION,
  OUTCOME_REASONS, SCENARIO_CATEGORIES, type AnonymisedValidationSummary,
  type OperationalValidationInput, type OutcomeReason, type ComparisonClassification,
} from "./types";

const allowedReasons: Readonly<Record<ComparisonClassification, readonly OutcomeReason[]>> = {
  Equivalent: ["EXPECTED_MATCH"],
  "Intentional Improvement": ["INTENTIONAL_IMPROVEMENT"],
  "Action Required": ["KNOWN_LIMITATION", "REQUIRES_INVESTIGATION"],
  "Not Comparable": ["EXTRACTION_NOT_COMPARABLE"],
};

function required(value: string, label: string): void {
  if (value.trim().length === 0) throw new Error(`${label} is required`);
}

export function createAnonymisedValidationSummary(input: OperationalValidationInput): AnonymisedValidationSummary {
  required(input.runId, "runId");
  if (input.scenarios.length === 0) throw new Error("at least one operational scenario is required");
  const ids = new Set<string>();
  for (const scenario of input.scenarios) {
    required(scenario.scenarioId, "scenarioId");
    if (ids.has(scenario.scenarioId)) throw new Error(`duplicate scenarioId: ${scenario.scenarioId}`);
    ids.add(scenario.scenarioId);
    if (!SCENARIO_CATEGORIES.includes(scenario.scenarioCategory)) throw new Error("invalid scenario category");
    if (!COMPARISON_CLASSIFICATIONS.includes(scenario.comparisonClassification)) throw new Error("invalid classification");
    if (!OUTCOME_REASONS.includes(scenario.outcomeReason)) throw new Error("invalid outcome reason");
    if (!allowedReasons[scenario.comparisonClassification].includes(scenario.outcomeReason)) {
      throw new Error(`outcome reason does not match classification: ${scenario.scenarioId}`);
    }
    if (!MIGRATION_RECOMMENDATIONS.includes(scenario.migrationRecommendation)) throw new Error("invalid recommendation");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scenario.validationDate)) throw new Error("validationDate must be YYYY-MM-DD");
    if (!Number.isSafeInteger(scenario.matchedClaims) || !Number.isSafeInteger(scenario.comparedClaims)
      || scenario.matchedClaims < 0 || scenario.comparedClaims < scenario.matchedClaims) {
      throw new Error(`invalid match statistics: ${scenario.scenarioId}`);
    }
  }
  const dates = [...new Set(input.scenarios.map(({ validationDate }) => validationDate))];
  if (dates.length !== 1) throw new Error("all scenarios in a run must share a validationDate");
  const rank = { Proceed: 0, Refine: 1, Defer: 2 } as const;
  const migrationRecommendation = input.scenarios.reduce<"Proceed" | "Refine" | "Defer">((result, scenario) =>
    rank[scenario.migrationRecommendation] > rank[result] ? scenario.migrationRecommendation : result, "Proceed");
  return {
    version: OPERATIONAL_VALIDATION_VERSION,
    validationDate: dates[0],
    scenarioCount: input.scenarios.length,
    scenarios: input.scenarios.map((scenario) => ({
      scenarioId: scenario.scenarioId,
      scenarioCategory: scenario.scenarioCategory,
      comparisonClassification: scenario.comparisonClassification,
      outcomeReason: scenario.outcomeReason,
      matchStatistics: { matched: scenario.matchedClaims, compared: scenario.comparedClaims },
      migrationRecommendation: scenario.migrationRecommendation,
    })),
    matchStatistics: {
      matched: input.scenarios.reduce((sum, scenario) => sum + scenario.matchedClaims, 0),
      compared: input.scenarios.reduce((sum, scenario) => sum + scenario.comparedClaims, 0),
    },
    migrationRecommendation,
  };
}
