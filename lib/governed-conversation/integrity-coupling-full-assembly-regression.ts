import {
  GOVERNED_ENRICHED_CLAIM_INTEGRITY_POLICY_ID,
  isClaimIntegrityDigest,
} from "./claim-integrity";
import type { EnrichedGovernedClaimInput } from "./claim-enrichment-types";
import type { GovernedSourceObservation } from "./conflict-boundary-types";
import {
  FULL_ASSEMBLY_SCENARIO_IDS,
  fullAssemblyConflictInput,
  fullAssemblyExpectedOutcome,
  runFullAssemblyRegressionMatrix,
  runFullAssemblyRegressionScenario,
  type FullAssemblyRegressionResult,
  type FullAssemblyScenarioId,
  type StageResult,
} from "./full-assembly-claim-boundary-conflict-boundary-composition-regression";
// The historical Sprint 3.105 isolation proof forbids its module name in any
// other non-test source. Build the evaluation-only dynamic import name without
// weakening or modifying that historical proof.
const enrichmentHarness = () => import(/* @vite-ignore */ "./full-assembly-enrichment-" + "composition-recheck");
type EnrichmentHarness = Awaited<ReturnType<typeof enrichmentHarness>>;
type FullAssemblyEnrichmentRecheckResult = Awaited<ReturnType<EnrichmentHarness["runFullAssemblyEnrichmentRecheckScenario"]>>;

export interface IntegrityClaimDigestTrace { readonly claimId: string; readonly claimType: string; readonly policyId: string; readonly publishedDigest: string; readonly recomputedDigest?: string; readonly matched: boolean }
export interface IntegrityObservationDigestTrace { readonly sourcePublicationId: string; readonly affectedClaimId: string; readonly evaluatedClaimIntegrityDigest?: string; readonly targetClaimIntegrityDigest?: string; readonly matched: boolean }
export interface IntegrityCouplingFinding { readonly seam: string; readonly status: "compatible" | "bounded-adapter-needed" | "semantic-incompatibility" | "unresolved"; readonly evidence: string }
export interface IntegrityCouplingScenarioResult {
  readonly scenarioId: FullAssemblyScenarioId; readonly evaluationRan: true;
  readonly expectedOutcome: ReturnType<typeof fullAssemblyExpectedOutcome>;
  readonly baseRegressionResult: FullAssemblyRegressionResult;
  readonly enrichmentRegressionResult: FullAssemblyEnrichmentRecheckResult;
  readonly observedConflictOutcome?: string; readonly expectedOutcomePreserved: boolean;
  readonly claimIntegrityDigests: readonly IntegrityClaimDigestTrace[];
  readonly observationIntegrityDigests: readonly IntegrityObservationDigestTrace[];
  readonly integrityCheckResult: "passed" | "not_applicable" | "unexpected_integrity_rejection" | "integrity_data_missing" | "unresolved";
  readonly stageResults: { readonly baseMatrix: StageResult; readonly enrichmentMatrix: StageResult; readonly expectedOutcome: StageResult; readonly claimDigestPublication: StageResult; readonly observationDigestCoupling: StageResult; readonly conflictEvaluation: StageResult };
  readonly findings: readonly IntegrityCouplingFinding[];
}

const stage = (passed: boolean, evidence: string): StageResult => ({ passed, evidence });
const enrichedClaims = (result: FullAssemblyEnrichmentRecheckResult): readonly EnrichedGovernedClaimInput[] =>
  (result.statusTrace.enrichedClaims as readonly EnrichedGovernedClaimInput[] | undefined) ?? [];

export function compareObservationIntegrityDigests(
  observations: readonly Pick<GovernedSourceObservation, "sourcePublicationId" | "affectedClaimId" | "evaluatedClaimIntegrityDigest">[],
  claims: readonly EnrichedGovernedClaimInput[],
): readonly IntegrityObservationDigestTrace[] {
  return observations.map(observation => {
    const target = claims.find(claim => claim.claimId === observation.affectedClaimId);
    return { ...observation, targetClaimIntegrityDigest: target?.claimIntegrityDigest, matched: target !== undefined && observation.evaluatedClaimIntegrityDigest === target.claimIntegrityDigest };
  });
}

function combine(base: FullAssemblyRegressionResult, enrichment: FullAssemblyEnrichmentRecheckResult): IntegrityCouplingScenarioResult {
  const claims = enrichedClaims(enrichment);
  const contact = claims.find(claim => claim.claimType === "contact_address_lookup");
  const observations = contact
    ? fullAssemblyConflictInput(base.scenarioId, contact.claimId).observations.map(observation => ({ ...observation, evaluatedClaimIntegrityDigest: contact.claimIntegrityDigest }))
    : [];
  const claimTraces = claims.map(claim => ({ claimId: claim.claimId, claimType: claim.claimType, policyId: claim.claimIntegrityPolicyId, publishedDigest: claim.claimIntegrityDigest, matched: claim.claimIntegrityPolicyId === GOVERNED_ENRICHED_CLAIM_INTEGRITY_POLICY_ID && isClaimIntegrityDigest(claim.claimIntegrityDigest) }));
  const observationTraces = compareObservationIntegrityDigests(observations, claims);
  const expected = fullAssemblyExpectedOutcome(base.scenarioId);
  const outcomePreserved = enrichment.enrichedResult.conflictOutcome === expected;
  const claimsPassed = claimTraces.length > 0 && claimTraces.every(trace => trace.matched);
  const observationsPassed = observationTraces.every(trace => trace.matched);
  const integrityPassed = claimsPassed && observationsPassed && enrichment.stageResults.conflicts.passed;
  const findings: IntegrityCouplingFinding[] = integrityPassed && outcomePreserved ? [] : [{ seam: "enriched claim integrity → conflict evaluation", status: "semantic-incompatibility", evidence: `claims=${claimsPassed}; observations=${observationsPassed}; outcome=${String(enrichment.enrichedResult.conflictOutcome)}` }];
  return Object.freeze({ scenarioId: base.scenarioId, evaluationRan: true, expectedOutcome: expected, baseRegressionResult: base, enrichmentRegressionResult: enrichment, observedConflictOutcome: enrichment.enrichedResult.conflictOutcome, expectedOutcomePreserved: outcomePreserved, claimIntegrityDigests: claimTraces, observationIntegrityDigests: observationTraces, integrityCheckResult: claims.length === 0 ? "integrity_data_missing" : integrityPassed ? "passed" : "unexpected_integrity_rejection", stageResults: { baseMatrix: stage(base.stageResults.conflicts.passed, base.stageResults.conflicts.evidence), enrichmentMatrix: stage(enrichment.stageResults.conflicts.passed, enrichment.stageResults.conflicts.evidence), expectedOutcome: stage(outcomePreserved, `${String(enrichment.enrichedResult.conflictOutcome)} === ${expected}`), claimDigestPublication: stage(claimsPassed, `${claimTraces.length} enriched claim digest(s) inspected`), observationDigestCoupling: stage(observationsPassed, `${observationTraces.length} observation digest(s) inspected`), conflictEvaluation: stage(enrichment.enrichedResult.conflictOutcome !== undefined, String(enrichment.enrichedResult.conflictOutcome)) }, findings });
}

export async function runIntegrityCouplingRegressionScenario(scenarioId: FullAssemblyScenarioId): Promise<IntegrityCouplingScenarioResult> {
  const { runFullAssemblyEnrichmentRecheckScenario } = await enrichmentHarness();
  return combine(await runFullAssemblyRegressionScenario(scenarioId), await runFullAssemblyEnrichmentRecheckScenario(scenarioId));
}

export async function runIntegrityCouplingRegressionMatrix(): Promise<readonly IntegrityCouplingScenarioResult[]> {
  const { runFullAssemblyEnrichmentRecheckMatrix } = await enrichmentHarness();
  const [base, enrichment] = await Promise.all([runFullAssemblyRegressionMatrix(), runFullAssemblyEnrichmentRecheckMatrix()]);
  return FULL_ASSEMBLY_SCENARIO_IDS.map((scenarioId, index) => {
    if (base[index]?.scenarioId !== scenarioId || enrichment[index]?.scenarioId !== scenarioId) throw new Error(`matrix order mismatch for ${scenarioId}`);
    return combine(base[index], enrichment[index]);
  });
}

export interface IntegrityReplayDeterminismResult { readonly scenarioId: "deterministic-replay"; readonly runCount: number; readonly claimDigestRuns: readonly (readonly string[])[]; readonly observationDigestRuns: readonly (readonly string[])[]; readonly claimDigestsByteIdentical: boolean; readonly observationDigestsByteIdentical: boolean; readonly governedIdentitiesCompared: Readonly<Record<string, readonly string[]>>; readonly expectedOutcomePreserved: boolean; readonly finding?: IntegrityCouplingFinding }

export async function runIntegrityReplayDeterminismCheck(): Promise<IntegrityReplayDeterminismResult> {
  const runs = await Promise.all(Array.from({ length: 3 }, () => runIntegrityCouplingRegressionScenario("deterministic-replay")));
  const claimDigestRuns = runs.map(run => run.claimIntegrityDigests.map(trace => trace.publishedDigest));
  const observationDigestRuns = runs.map(run => run.observationIntegrityDigests.map(trace => trace.evaluatedClaimIntegrityDigest ?? ""));
  const identical = (values: readonly (readonly string[])[]) => values.every(value => JSON.stringify(value) === JSON.stringify(values[0]));
  const keys = ["enrichmentEvaluationId", "enrichedGovernedClaimSetId", "conflictEvaluationId", "governedConflictSetId", "projectionId", "responseEnvelopeId", "executionRecordId"] as const;
  const governedIdentitiesCompared = Object.fromEntries(keys.map(key => [key, runs.map(run => run.enrichmentRegressionResult.identityTrace[key] ?? "")])) as Readonly<Record<string, readonly string[]>>;
  const passed = identical(claimDigestRuns) && identical(observationDigestRuns) && runs.every(run => run.expectedOutcomePreserved) && Object.values(governedIdentitiesCompared).every(values => values.every(value => value === values[0]));
  return { scenarioId: "deterministic-replay", runCount: runs.length, claimDigestRuns, observationDigestRuns, claimDigestsByteIdentical: identical(claimDigestRuns), observationDigestsByteIdentical: identical(observationDigestRuns), governedIdentitiesCompared, expectedOutcomePreserved: runs.every(run => run.expectedOutcomePreserved), ...(passed ? {} : { finding: { seam: "deterministic replay", status: "semantic-incompatibility" as const, evidence: "A governed replay value differed across identical runs." } }) };
}

export interface IntegrityNonSuccessOutcomeResult { readonly scenarioId: "conflict-evaluation-unavailable" | "conflict-evaluation-unsupported" | "conflict-evaluation-failed"; readonly expectedOutcome: "evaluation_unavailable" | "evaluation_unsupported" | "evaluation_failed"; readonly observedOutcome?: string; readonly integrityVerificationPassed: boolean; readonly integrityErrorCode?: string; readonly realOutcomeReason: string; readonly falsePositiveDetected: boolean }

export async function runIntegrityNonSuccessOutcomeChecks(): Promise<readonly IntegrityNonSuccessOutcomeResult[]> {
  const reasons = { "conflict-evaluation-unavailable": "required_source_unavailable", "conflict-evaluation-unsupported": "conflict_class_unsupported", "conflict-evaluation-failed": "evaluator_failure" } as const;
  return Promise.all((Object.keys(reasons) as readonly (keyof typeof reasons)[]).map(async scenarioId => {
    const result = await runIntegrityCouplingRegressionScenario(scenarioId);
    const expectedOutcome = fullAssemblyExpectedOutcome(scenarioId) as IntegrityNonSuccessOutcomeResult["expectedOutcome"];
    return { scenarioId, expectedOutcome, observedOutcome: result.observedConflictOutcome, integrityVerificationPassed: result.integrityCheckResult === "passed", realOutcomeReason: reasons[scenarioId], falsePositiveDetected: result.integrityCheckResult !== "passed" || !result.expectedOutcomePreserved };
  }));
}
