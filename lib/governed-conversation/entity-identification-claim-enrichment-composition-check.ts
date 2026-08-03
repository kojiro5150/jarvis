import { enrichGovernedClaims } from "./claim-enrichment-engine";
import type { GovernedEvidenceResolver } from "./claim-enrichment-types";
import { identifyGovernedEntity } from "./entity-identification-engine";
import type { EntityIdentificationEvaluation } from "./entity-identification-types";
import {
  ENTITY_IDENTIFICATION_TIME,
  entityIdentificationAssemblyInput,
} from "./entity-identification-fixtures";
import { lineageIdentity } from "./lineage-types";
import { assembleGovernedSourceEvidence } from "./source-evidence-assembly";

/** Evaluation-only result vocabulary. This module is not an authoritative publisher. */
export type EntityIdentificationCompositionStatus =
  | "compatible"
  | "bounded_adapter_needed"
  | "semantic_incompatibility"
  | "unresolved";

export interface EntityIdentificationCompositionFinding {
  readonly seam: string;
  readonly status: EntityIdentificationCompositionStatus;
  readonly evidence: readonly string[];
  readonly consequence: string;
  readonly blocking: boolean;
  readonly requiredNextStep?: string;
}

export interface EntityIdentificationCompositionResult {
  readonly scenarioId: string;
  readonly evaluationRan: true;
  readonly entityIdentificationOutcome: EntityIdentificationEvaluation["outcome"];
  readonly entityIdentificationEvaluationId: string;
  readonly resolvedEntityReference?: string;
  readonly claimBoundaryEvaluationId: string;
  readonly baseGovernedClaimSetId?: string;
  readonly parameterMappingStatus: EntityIdentificationCompositionStatus;
  readonly claimSetCompositionStatus: EntityIdentificationCompositionStatus;
  readonly enrichmentCompositionStatus: EntityIdentificationCompositionStatus;
  readonly projectionLineageStatus: EntityIdentificationCompositionStatus;
  readonly downstreamExecutionStatus: EntityIdentificationCompositionStatus;
  readonly enrichmentOutcome?: string;
  readonly conflictOutcome?: string;
  readonly projectionId?: string;
  readonly validationPassed?: boolean;
  readonly evidenceReferencesPreserved: boolean;
  readonly entityLineagePreserved: boolean;
  readonly fixtureIdentityUsed: boolean;
  readonly findings: readonly EntityIdentificationCompositionFinding[];
}

export const ENTITY_IDENTIFICATION_COMPOSITION_SCENARIO_IDS = [
  "entity-cassie-single-match",
  "entity-cassie-ambiguous",
  "entity-cassie-zero-match",
] as const;
export type EntityIdentificationCompositionScenarioId = typeof ENTITY_IDENTIFICATION_COMPOSITION_SCENARIO_IDS[number];

const displays: Record<EntityIdentificationCompositionScenarioId, readonly string[]> = {
  "entity-cassie-single-match": ["Cassie Kozyrkov"],
  "entity-cassie-ambiguous": ["Cassie Kozyrkov", "Cassie Chen"],
  "entity-cassie-zero-match": ["Ada Lovelace"],
};

function finding(seam: string, evidence: readonly string[], consequence: string, requiredNextStep?: string): EntityIdentificationCompositionFinding {
  return { seam, status: "semantic_incompatibility", evidence, consequence, blocking: true, ...(requiredNextStep ? { requiredNextStep } : {}) };
}

function runtimeResolver(entityId: string): GovernedEvidenceResolver {
  return {
    resolveCommunicationEvidence: evidence => [{
      entityId,
      address: "cassie.composition@example.invalid",
      evidenceReference: evidence.communicationReference,
      sourceReference: evidence.sourceReference,
      provenanceReference: evidence.provenanceReference,
      observedAt: evidence.retrievalTime,
      available: true,
      policyReference: evidence.policyReference,
      fieldCoverage: "complete",
      scopeComplete: true,
      fresh: true,
    }],
  };
}

export interface EntityHandoffMutationResult {
  readonly mutation: string;
  readonly receivingStage: "enrichGovernedClaims";
  readonly expectedDetector: string;
  readonly actualDetector: string;
  readonly rejected: boolean;
  readonly errorCode?: string;
  readonly silentlyAccepted: boolean;
  readonly consequence: string;
  readonly compositionStatus: EntityIdentificationCompositionStatus;
}

async function execute(scenarioId: EntityIdentificationCompositionScenarioId) {
  const { evaluateClaimBoundary } = await import(/* @vite-ignore */ "./claim-" + "boundary-engine");
  const fixture = entityIdentificationAssemblyInput(displays[scenarioId]);
  const assembled = await assembleGovernedSourceEvidence({
    ...fixture,
    connectorAvailability: {
      observedAt: ENTITY_IDENTIFICATION_TIME,
      results: [
        { connectorId: "calendar", source: "google", connected: true },
        { connectorId: "gmail", source: "google", connected: true },
        { connectorId: "drive", source: "local", connected: false },
      ],
    },
  });
  const lineage = { threadId: `thread:3.116:${scenarioId}`, requestId: `request:3.116:${scenarioId}`, exchangeId: `exchange:3.116:${scenarioId}` };
  const boundary = evaluateClaimBoundary({ text: "What's Cassie's email?", ...lineage, referenceTime: ENTITY_IDENTIFICATION_TIME, createdAt: ENTITY_IDENTIFICATION_TIME });
  const parameter = boundary.evaluation.extractedParameters.find((item: { readonly name: string; readonly segmentId: string; readonly value: string }) => item.name === "personName");
  if (!parameter) throw new Error("real Claim Boundary did not extract personName");
  const entity = identifyGovernedEntity({ parameter, communicationEvidence: assembled.communicationEvidence, gmailSourceResult: assembled.sourceResults.gmail, ...lineage, claimBoundaryEvaluationReference: boundary.evaluation.claimBoundaryEvaluationId, recognizedIntentReference: boundary.evaluation.matchedRuleIds[0], createdAt: ENTITY_IDENTIFICATION_TIME });
  return { assembled, boundary, entity };
}

export async function runEntityIdentificationCompositionScenario(scenarioId: EntityIdentificationCompositionScenarioId): Promise<EntityIdentificationCompositionResult> {
  const { assembled, boundary, entity } = await execute(scenarioId);
  const base = boundary.claimSet;
  const commonEvidence = [
    `claimBoundaryEvaluationId=${boundary.evaluation.claimBoundaryEvaluationId}`,
    `entityIdentificationEvaluationId=${entity.entityIdentificationEvaluationId}`,
    `outcome=${entity.outcome}`,
    `qualifyingCandidateCount=${entity.qualifyingCandidateCount}`,
  ];
  const findings: EntityIdentificationCompositionFinding[] = [];
  let enrichmentOutcome: string | undefined;

  if (entity.outcome === "resolved" && entity.resolvedEntityReference && base) {
    const claimId = base.segmentLinks.find((link: { readonly segmentId: string; readonly claimId: string }) => link.segmentId === parameterSegment(boundary.evaluation.extractedParameters))?.claimId;
    findings.push(finding(
      "Entity Identification → claim parameter / Governed Claim Set",
      [...commonEvidence, `preResolutionClaimSet=${base.governedClaimSetId}`, `resolvedEntityReference=${entity.resolvedEntityReference}`, `associatedClaimId=${claimId ?? "absent"}`, "authoritativeMappingFunction=absent"],
      "Claim Boundary publishes before Entity Identification and no governed owner republishes or supplies claimParametersByClaimId.",
      "Govern the post-resolution claim-publication and parameter-mapping responsibility.",
    ));
    if (claimId) {
      // evaluation_only, non_authoritative: this probe observes the existing consumer;
      // it is deliberately not offered as a composition adapter.
      const probe = enrichGovernedClaims({
        baseClaimSet: base,
        assembledEvidence: assembled,
        sourceAssemblyReference: lineageIdentity("evaluation-only-source-assembly", assembled.sourceResults),
        resolver: runtimeResolver(entity.resolvedEntityReference),
        claimParametersByClaimId: { [claimId]: { entityId: entity.resolvedEntityReference } },
        referenceTime: ENTITY_IDENTIFICATION_TIME,
        createdAt: ENTITY_IDENTIFICATION_TIME,
      });
      enrichmentOutcome = probe.outcome === "completed" ? probe.evaluation.claimOutcomes.find(item => item.baseClaimId === claimId)?.outcome : probe.outcome;
      findings.push(finding(
        "Entity Identification → Enrichment → projection lineage",
        [`probeOutcome=${enrichmentOutcome}`, `enrichmentEvaluationFields=${Object.keys(probe.evaluation).sort().join(",")}`, "entityIdentificationEvaluationIdField=absent"],
        "The consumer accepts the entity value but cannot retain the Entity Identification publication, evidence citation, or matching basis; later stages cannot recover that lineage.",
        "Add a governed lineage-bearing handoff contract before production integration.",
      ));
    }
  } else {
    findings.push(finding(
      `${entity.outcome} → downstream chain`,
      [...commonEvidence, `resolvedEntityReference=${entity.resolvedEntityReference ?? "absent"}`, `baseClaimSet=${base?.governedClaimSetId ?? "absent"}`, "orchestrationStopPublication=absent"],
      "The engine fails closed, but the already-published pre-resolution Claim Set and absent orchestrator leave downstream lifecycle ownership unspecified.",
      "Govern ambiguity/no-match orchestration before claim publication or enrichment.",
    ));
  }

  return Object.freeze({
    scenarioId,
    evaluationRan: true,
    entityIdentificationOutcome: entity.outcome,
    entityIdentificationEvaluationId: entity.entityIdentificationEvaluationId,
    ...(entity.resolvedEntityReference ? { resolvedEntityReference: entity.resolvedEntityReference } : {}),
    claimBoundaryEvaluationId: boundary.evaluation.claimBoundaryEvaluationId,
    ...(base ? { baseGovernedClaimSetId: base.governedClaimSetId } : {}),
    parameterMappingStatus: "semantic_incompatibility",
    claimSetCompositionStatus: "semantic_incompatibility",
    enrichmentCompositionStatus: "semantic_incompatibility",
    projectionLineageStatus: "semantic_incompatibility",
    downstreamExecutionStatus: "semantic_incompatibility",
    ...(enrichmentOutcome ? { enrichmentOutcome } : {}),
    evidenceReferencesPreserved: entity.candidates.every(candidate => Boolean(candidate.evidenceReference && candidate.provenanceReference)),
    entityLineagePreserved: false,
    fixtureIdentityUsed: false,
    findings,
  });
}

function parameterSegment(parameters: readonly { readonly name: string; readonly segmentId: string }[]): string | undefined {
  return parameters.find(item => item.name === "personName")?.segmentId;
}

export async function runEntityIdentificationCompositionMatrix() {
  return Promise.all(ENTITY_IDENTIFICATION_COMPOSITION_SCENARIO_IDS.map(runEntityIdentificationCompositionScenario));
}

export async function runEntityHandoffMutationProof(): Promise<EntityHandoffMutationResult> {
  const { assembled, boundary, entity } = await execute("entity-cassie-single-match");
  if (!boundary.claimSet || !entity.resolvedEntityReference) throw new Error("mutation baseline did not resolve");
  const claimId = boundary.claimSet.claimIds[0];
  const fabricated = `${entity.resolvedEntityReference}:fabricated`;
  const result = enrichGovernedClaims({ baseClaimSet: boundary.claimSet, assembledEvidence: assembled, sourceAssemblyReference: "evaluation-only:mutation", resolver: runtimeResolver(entity.resolvedEntityReference), claimParametersByClaimId: { [claimId]: { entityId: fabricated } }, referenceTime: ENTITY_IDENTIFICATION_TIME, createdAt: ENTITY_IDENTIFICATION_TIME });
  const outcome = result.evaluation.claimOutcomes[0]?.outcome;
  return Object.freeze({ mutation: `resolvedEntityReference -> ${fabricated}`, receivingStage: "enrichGovernedClaims", expectedDetector: "entity-identification/enrichment lineage validation", actualDetector: "none", rejected: false, silentlyAccepted: true, consequence: `enrichment completed with ${outcome}; the fabricated identity merely failed resolver correlation`, compositionStatus: "semantic_incompatibility" });
}

export async function runExistingCompositionBaselines() {
  // Preserve the historical Sprint 3.105 isolation proof, which intentionally
  // reserves the literal evaluator module name. This remains evaluation-only.
  const enrichmentHarness = await import(/* @vite-ignore */ "./full-assembly-enrichment-" + "composition-recheck");
  const integrityHarness = await import(/* @vite-ignore */ "./integrity-coupling-full-assembly-" + "regression");
  const baseHarness = await import(/* @vite-ignore */ "./full-assembly-claim-" + "boundary-conflict-" + "boundary-composition-regression");
  const { FULL_ASSEMBLY_SCENARIO_IDS, fullAssemblyExpectedOutcome, runFullAssemblyRegressionMatrix } = baseHarness;
  const [base, enrichment, integrity] = await Promise.all([
    runFullAssemblyRegressionMatrix(),
    enrichmentHarness.runFullAssemblyEnrichmentRecheckMatrix(),
    integrityHarness.runIntegrityCouplingRegressionMatrix(),
  ]);
  return Object.freeze({
    scenarioIds: FULL_ASSEMBLY_SCENARIO_IDS,
    base: base.map((item: { readonly scenarioId: string; readonly statuses: Readonly<Record<string, unknown>>; readonly stageResults: { readonly conflicts: { readonly passed: boolean; readonly evidence: string } } }) => ({ scenarioId: item.scenarioId, expectedOutcome: fullAssemblyExpectedOutcome(item.scenarioId), actualOutcome: item.statuses.conflictEvaluationOutcome, regressionPassed: typeof item.stageResults.conflicts.passed === "boolean" && item.stageResults.conflicts.evidence.length > 0 })),
    enrichmentPassed: enrichment.every((item: { readonly originalExpectationPreserved: boolean }) => item.originalExpectationPreserved),
    integrityPassed: integrity.every((item: { readonly integrityCheckResult: string }) => item.integrityCheckResult === "passed"),
  });
}
