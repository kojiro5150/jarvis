import { COMPARISON_CLASSIFICATIONS, LEGACY_COMPARISON_STATUSES, OAUTH_SESSION_STATES, OPERATIONAL_VALIDATION_VERSION, OPERATOR_CONFIRMATIONS, OUTCOME_REASONS, SCENARIO_CATEGORIES, VALIDATION_CONNECTOR_SOURCES, VALIDATION_EXECUTION_SOURCES, VALIDATION_LEVELS, type AnonymisedValidationSummary, type AuthoritativeMigrationRecommendation, type EngineeringSummary, type MigrationRecommendationBasis, type MigrationRecommendationEvidence, type MigrationRecommendation, type OperationalValidationInput, type ValidationProvenance } from "./types";
import { deepFreeze } from "../executive-operating-system/runtime/validation";

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

type RecommendationInput = Pick<OperationalValidationInput,"provenance"|"operatorConfirmation"|"attestation"|"scenarios"|"deterministicValidationCompleted"|"legacyComparisonStatus">;
type MigrationGateClassification = Readonly<{value:MigrationRecommendation;basis:MigrationRecommendationBasis}>;

/** Measures facts only. This function does not classify or recommend migration. */
export function assembleMigrationRecommendationEvidence(input:RecommendationInput):MigrationRecommendationEvidence {
  let provenanceValid=true;
  try { validateProvenance(input.provenance); } catch { provenanceValid=false; }
  const authenticatedExecution=provenanceValid&&input.provenance.executionSource==="authenticated_deployment";
  const operatorAttested=input.operatorConfirmation==="confirmed"&&!!input.attestation?.reportWritten&&!!input.attestation.challengeCompleted&&input.attestation.runnerVersion===input.provenance.runnerVersion&&iso(input.attestation.attestedAt)&&iso(input.attestation.confirmedAt)&&!!input.attestation.confirmingOperator&&/^[a-f0-9]{64}$/.test(input.attestation.reportHash);
  const absent=input.scenarios.filter(r=>r.comparisonClassification==="Scenario Not Present").length;
  const notComparable=input.scenarios.filter(r=>r.comparisonClassification==="Not Comparable").length;
  const present=input.scenarios.length-absent;
  const legacyComparisonStatus=input.legacyComparisonStatus??"NOT_ENABLED";
  if(!LEGACY_COMPARISON_STATUSES.includes(legacyComparisonStatus)) throw new Error("invalid legacy comparison status");
  const legacyComparisonEnabled=legacyComparisonStatus!=="NOT_ENABLED";
  return deepFreeze({
    authenticatedExecution,
    operatorAttested,
    deterministicValidationCompleted:input.deterministicValidationCompleted===true,
    validatedScenarioCount:present,
    requiredScenarioCount:SCENARIO_CATEGORIES.length,
    scenarioCoverage:{present,absent,notComparable},
    legacyComparisonEnabled,
    legacyComparisonExecuted:legacyComparisonStatus==="EXECUTED",
    legacyComparisonStatus,
    implementationDefectsDetected:input.scenarios.filter(r=>r.comparisonClassification==="Action Required").length,
  });
}

/** The sole migration classification gate: only this function constructs value and basis. */
function applyMigrationRecommendationGate(evidence:MigrationRecommendationEvidence):MigrationGateClassification {
  if(!evidence.authenticatedExecution||!evidence.operatorAttested||!evidence.deterministicValidationCompleted) return {value:"NOT_ASSESSED",basis:"AUTHENTICATED_VALIDATION_INCOMPLETE"};
  if(evidence.implementationDefectsDetected>0) return {value:"DEFER",basis:"MATERIAL_IMPLEMENTATION_DEFECTS"};
  if(evidence.validatedScenarioCount<evidence.requiredScenarioCount||evidence.scenarioCoverage.notComparable>0) return {value:"REFINE",basis:"INSUFFICIENT_OPERATIONAL_COVERAGE"};
  if(evidence.legacyComparisonEnabled&&!evidence.legacyComparisonExecuted) return {value:"REFINE",basis:"LEGACY_COMPARISON_REQUIRED"};
  return {value:"PROCEED",basis:"SUFFICIENT_OPERATIONAL_EVIDENCE"};
}

export function determineMigrationRecommendation(input:RecommendationInput):AuthoritativeMigrationRecommendation {
  const evidence=assembleMigrationRecommendationEvidence(input);
  const classification=applyMigrationRecommendationGate(evidence);
  return deepFreeze({value:classification.value,basis:classification.basis,evidence});
}

export function deriveEngineeringSummary(recommendation:AuthoritativeMigrationRecommendation):EngineeringSummary {
  if(recommendation.value==="NOT_ASSESSED") return {implementationQuality:"NOT ASSESSED",evidenceSufficiency:"NOT ASSESSED",migrationEvidence:"AUTHENTICATED VALIDATION REQUIRED"};
  if(recommendation.evidence.implementationDefectsDetected>0) return {implementationQuality:"FAIL",evidenceSufficiency:"LIMITED",migrationEvidence:"IMPLEMENTATION REMEDIATION REQUIRED"};
  return {implementationQuality:"PASS",evidenceSufficiency:recommendation.value==="PROCEED"?"SUFFICIENT":"LIMITED",migrationEvidence:recommendation.value==="PROCEED"?"MIGRATION EVIDENCE SUFFICIENT":"MORE OPERATIONAL COVERAGE REQUIRED"};
}

export function evaluateMigrationGate(recommendation:AuthoritativeMigrationRecommendation):Readonly<{mayProceed:boolean;unmetConditions:readonly string[]}> {
  const e=recommendation.evidence, unmet:string[]=[];
  if(!e.authenticatedExecution) unmet.push("AUTHENTICATED_EXECUTION"); if(!e.operatorAttested) unmet.push("OPERATOR_ATTESTATION"); if(!e.deterministicValidationCompleted) unmet.push("DETERMINISTIC_VALIDATION");
  if(e.validatedScenarioCount<e.requiredScenarioCount||e.scenarioCoverage.notComparable>0) unmet.push("SUFFICIENT_OPERATIONAL_COVERAGE"); if(e.legacyComparisonEnabled&&!e.legacyComparisonExecuted) unmet.push("LEGACY_COMPARISON"); if(e.implementationDefectsDetected>0) unmet.push("NO_MATERIAL_IMPLEMENTATION_DEFECTS");
  return {mayProceed:recommendation.value==="PROCEED"&&unmet.length===0,unmetConditions:unmet};
}

const labels:Record<(typeof SCENARIO_CATEGORIES)[number],string>={CURRENT_WORKING_DAY:"Current day",TOMORROW:"Tomorrow",OVERLAPPING_COMMITMENTS:"Overlapping commitments",NO_COMMITMENTS:"No commitments",BUSY_AFTERNOON:"Busy periods",RECURRING_COMMITMENT:"Recurring commitments",CANCELLED_COMMITMENT:"Cancelled commitments",DECLINED_VISIBLE_INVITATION:"Declined visible invitations",ALL_DAY_COMMITMENT:"All-day commitments",MIXED_MEETING_DURATIONS:"Multiple meeting durations"};
const words=(value:string)=>value.toLowerCase().replaceAll("_"," ").replace(/^./,c=>c.toUpperCase());

/** Reviewer-only rendering. It consumes the authoritative recommendation and cannot alter it. */
export function renderValidationDashboard(summary:AnonymisedValidationSummary):string {
  const recommendation=summary.migrationRecommendation, evidence=recommendation.evidence, engineering=deriveEngineeringSummary(recommendation);
  const byCategory=new Map(summary.scenarios.map(s=>[s.scenarioCategory,s]));
  const coverage=SCENARIO_CATEGORIES.map(category=>`${byCategory.get(category)?.comparisonClassification==="Scenario Not Present"?"✗":"✓"} ${labels[category]}`).join("\n");
  const percentage=Math.round(100*evidence.validatedScenarioCount/evidence.requiredScenarioCount);
  return `Authenticated Operational Validation\n\nProjection\n${evidence.deterministicValidationCompleted?"PASS":"NOT COMPLETE"}\n\nExecutiveContext\n${evidence.deterministicValidationCompleted?"PASS":"NOT COMPLETE"}\n\nAvailability\n${evidence.deterministicValidationCompleted?"PASS":"NOT COMPLETE"}\n\nScenario Coverage\n\n${coverage}\n\nCoverage Summary\n\nPresent: ${evidence.scenarioCoverage.present}\nAbsent: ${evidence.scenarioCoverage.absent}\nNot Comparable: ${evidence.scenarioCoverage.notComparable}\n\nOperational Coverage\n${percentage}%\n\nLegacy Comparison\n${words(evidence.legacyComparisonStatus)}\n\nMigration Recommendation\n${recommendation.value}\n\nRecommendation Basis\n${words(recommendation.basis)}\n\nImplementation Quality\n${engineering.implementationQuality}\n\nEvidence Sufficiency\n${engineering.evidenceSufficiency}\n\nMigration Evidence\n${engineering.migrationEvidence}`;
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
  const recommendation = determineMigrationRecommendation(input);
  return { version: OPERATIONAL_VALIDATION_VERSION, runId: input.runId, generatedDate: input.provenance.generatedAt.slice(0,10), runnerVersion: input.provenance.runnerVersion, provenance: input.provenance, operatorConfirmation: input.operatorConfirmation, scenarioCount: input.scenarios.length, scenarios: input.scenarios.map(s => ({scenarioId:s.scenarioId,scenarioCategory:s.scenarioCategory,comparisonClassification:s.comparisonClassification,outcomeReason:s.outcomeReason,matchStatistics:{matched:s.matchedClaims,compared:s.comparedClaims}})), matchStatistics:{matched:input.scenarios.reduce((n,s)=>n+s.matchedClaims,0),compared:input.scenarios.reduce((n,s)=>n+s.comparedClaims,0)}, migrationRecommendation: recommendation };
}
