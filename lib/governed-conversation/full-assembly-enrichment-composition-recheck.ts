import { enrichGovernedClaims } from "./claim-enrichment-engine";
import { claimParametersFromCassieEvaluation, resolverForAddress } from "./claim-enrichment-fixtures";
import type { EnrichedGovernedClaimSet } from "./claim-enrichment-types";
import {
  CONFLICT_EVALUATION_RULESET, FULL_ASSEMBLY_SCENARIO_IDS, FULL_ASSEMBLY_TIME, evaluateClaimBoundary,
  evaluateGovernedConversationalConflicts, fullAssemblyConflictInput,
  fullAssemblyEntities, fullAssemblyLineage, fullAssemblyQuestion,
  fullAssemblySourceInput, runFullAssemblyRegressionScenario, type FullAssemblyFinding,
  type FullAssemblyRegressionResult, type FullAssemblyScenarioId, type SeamStatus, type StageResult,
} from "./full-assembly-claim-boundary-conflict-boundary-composition-regression";
import { constructGovernedConversationalInput } from "./input";
import { lineageIdentity } from "./lineage-types";
import { invokeGovernedConversationModel, type GovernedConversationModelAdapter } from "./model-invocation";
import { composeGovernedConversationalProjection, constructGovernedConflictSummary } from "./projection-composer";
import { assembleGovernedSourceEvidence } from "./source-evidence-assembly";

export interface EnrichedFullAssemblyScenarioResult {
  readonly conflictOutcome?: string;
  readonly projectionId?: string;
  readonly modelOutcome?: string;
  readonly validationOutcome?: string;
}
export interface FullAssemblyEnrichmentRecheckResult {
  readonly scenarioId: FullAssemblyScenarioId; readonly evaluationRan: true;
  readonly originalResult: FullAssemblyRegressionResult; readonly enrichedResult: EnrichedFullAssemblyScenarioResult;
  readonly originalExpectationPreserved: boolean; readonly enrichmentSeamStatus: SeamStatus;
  readonly stageResults: { readonly assembly: StageResult; readonly recognition: StageResult; readonly enrichment: StageResult; readonly enrichedClaimSetToConflictEvaluation: StageResult; readonly conflicts: StageResult; readonly projection: StageResult; readonly governedInput: StageResult; readonly modelInvocation: StageResult; readonly validation: StageResult };
  readonly findings: readonly FullAssemblyFinding[]; readonly identityTrace: Readonly<Record<string, string | undefined>>; readonly statusTrace: Readonly<Record<string, unknown>>;
}

// This is deliberately visible as evaluation evidence, not hidden as compatibility.
// The current conflict boundary requires the historical field name and type. No
// enriched field is removed; the alias is the exact bounded adapter under test.
function conflictBoundaryView(set: EnrichedGovernedClaimSet) {
  return { ...set, schemaVersion: "1" as const, governedClaimSetId: set.enrichedGovernedClaimSetId };
}
const passed = (evidence: string): StageResult => ({ passed: true, evidence });
const failed = (evidence: string): StageResult => ({ passed: false, evidence });

export async function runFullAssemblyEnrichmentRecheckScenario(scenarioId: FullAssemblyScenarioId): Promise<FullAssemblyEnrichmentRecheckResult> {
  const originalResult = await runFullAssemblyRegressionScenario(scenarioId);
  const assembled = await assembleGovernedSourceEvidence(fullAssemblySourceInput(scenarioId));
  const lineage = fullAssemblyLineage(scenarioId);
  const recognition = evaluateClaimBoundary({ text: fullAssemblyQuestion(scenarioId), ...lineage, referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME, entities: fullAssemblyEntities() });
  if (!recognition.claimSet) throw new Error("re-check recognition did not publish a claim set");
  const baseSnapshot = JSON.stringify(recognition.claimSet);
  const extractedParameters = recognition.evaluation.extractedParameters;
  const enrichment = enrichGovernedClaims({ baseClaimSet: recognition.claimSet, assembledEvidence: assembled, sourceAssemblyReference: lineageIdentity("source-assembly", { scenarioId, sourceResults: assembled.sourceResults }), resolver: resolverForAddress(), claimParametersByClaimId: claimParametersFromCassieEvaluation(recognition.claimSet, extractedParameters), referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME });
  if (enrichment.outcome === "failed") {
    const na = failed("Not applicable: enrichment failed; downstream execution correctly stopped.");
    return { scenarioId, evaluationRan: true, originalResult, enrichedResult: {}, originalExpectationPreserved: false, enrichmentSeamStatus: "semantic-incompatibility", stageResults: { assembly: passed(JSON.stringify(assembled.sourceResults)), recognition: passed(baseSnapshot), enrichment: failed("enrichment_failed"), enrichedClaimSetToConflictEvaluation: na, conflicts: na, projection: na, governedInput: na, modelInvocation: na, validation: na }, findings: [{ seam: "recognition → enrichment", status: "semantic-incompatibility", evidence: "The real enrichment engine returned enrichment_failed.", requiredNextStep: "Govern the incompatibility before implementation." }], identityTrace: { baseGovernedClaimSetId: recognition.claimSet.governedClaimSetId, enrichmentRulesetId: enrichment.evaluation.enrichmentRulesetId, enrichmentEvaluationId: enrichment.evaluation.enrichmentEvaluationId }, statusTrace: { sourceResults: assembled.sourceResults } };
  }
  const enriched = enrichment.enrichedClaimSet;
  const contact = enriched.claims.find(claim => claim.claimType === "contact_address_lookup")!;
  const conflictFixture = fullAssemblyConflictInput(scenarioId, contact.claimId);
  const boundarySet = conflictBoundaryView(enriched);
  const conflicts = evaluateGovernedConversationalConflicts({ ruleset: CONFLICT_EVALUATION_RULESET, claimSet: boundarySet, observations: conflictFixture.observations, requestedConflictClasses: conflictFixture.classes, referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME, evaluationDiscriminator: `enriched:${scenarioId}` });
  if (!conflicts.evaluation) throw new Error("re-check conflict evaluation did not publish");
  const cellIds = [...conflicts.evaluation.cellEvaluations.map(cell => cell.claimId), ...conflicts.evaluation.unevaluatedReasons.flatMap(item => item.claimId ? [item.claimId] : [])];
  const idsPreserved = cellIds.every(id => enriched.claimIds.includes(id)) && !cellIds.some(id => recognition.claimSet!.claimIds.includes(id));
  const sourceEvidence = assembled.communicationEvidence.map(item => ({ sourceReference: item.sourceReference, publicationReference: { publicationId: item.communicationReference, publicationType: "governed_communication_evidence", schemaVersion: "1" }, available: item.available, status: item.available ? "available" as const : "unavailable" as const, provenanceReference: item.provenanceReference, retrievalTime: item.retrievalTime, contentDigest: item.contentDigest ?? lineageIdentity("communication-content", item.communicationReference), contentKind: item.contentKind, policyReference: item.policyReference }));
  const projection = composeGovernedConversationalProjection({ schemaVersion: "1", evidenceRulesetId: "evidence:3.105", compatibilityRulesetId: "compatibility:3.105", claimClassificationRulesetId: recognition.evaluation.claimBoundaryRulesetId, claimBoundaryEvaluation: recognition.evaluation, governedClaimSet: boundarySet, conflictEvaluation: conflicts.evaluation, governedConflictSet: conflicts.conflictSet, ...lineage, referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME, sourceEvidence, connectorAvailability: assembled.connectorAvailability, calendarEvidence: assembled.calendarEvidence, communicationEvidence: assembled.communicationEvidence, memoryPriorityReferences: assembled.memoryPriorityReferences, compatibilityContext: [], conversationHistory: [], claims: enriched.claims, conflicts: conflicts.conflictSet?.conflicts.map(constructGovernedConflictSummary) ?? [] });
  const effectiveClaims = projection.claims.map(claim => ({ ...claim, status: projection.effectiveClaimStatuses.find(item => item.claimId === claim.claimId)!.effectiveStatus }));
  const input = constructGovernedConversationalInput({ inputId: lineageIdentity("governed-input", projection.projectionId), ...lineage, projectionId: projection.projectionId, projectionLineage: { ...lineage, projectionId: projection.projectionId }, referenceTime: FULL_ASSEMBLY_TIME, question: { text: fullAssemblyQuestion(scenarioId) }, claims: effectiveClaims, sources: [{ sourceId: "gmail", available: assembled.sourceResults.gmail.status === "available", status: assembled.sourceResults.gmail.status === "available" ? "available" : "unavailable", observedAt: FULL_ASSEMBLY_TIME, provenance: "source-evidence-assembly" }] });
  const adapter: GovernedConversationModelAdapter = { invoke: async () => JSON.stringify({ interpretation: { ownership: "model_interpretation", claimIds: input.claims.map(claim => claim.claimId), text: "The governed evidence is constrained; no disputed value or unsupported importance is asserted.", evidenceReferences: [], uncertaintyReferences: input.claims.filter(claim => claim.status !== "available").map(claim => claim.claimId) } }) };
  const model = await invokeGovernedConversationModel(input, adapter, { attemptId: `attempt:enriched:${scenarioId}`, agentId: "deterministic-enrichment-recheck-adapter", completedAt: FULL_ASSEMBLY_TIME, schemaVersion: "2", validationPolicyId: "validation/1", policyReferences: ["validation/1"] });
  const outcomePreserved = conflicts.evaluation.outcome === originalResult.statuses.conflictEvaluationOutcome;
  const finding: FullAssemblyFinding = { seam: "Enriched Governed Claim Set → Conflict Evaluation", status: "bounded-adapter-needed", evidence: "ConflictEngineInput requires GovernedClaimSet.governedClaimSetId and schemaVersion; EnrichedGovernedClaimSet instead publishes enrichedGovernedClaimSetId and no schemaVersion. The evaluation-only boundary view supplies schemaVersion 1 and aliases that identity without removing baseClaimId, factualValues, sourceReferences, or enrichment lineage.", requiredNextStep: "Recommend a narrowly scoped correction implementation sprint; do not integrate before governing the field-name boundary." };
  const lineageFinding: FullAssemblyFinding = { seam: "Projection enrichment lineage", status: "semantic-incompatibility", evidence: "The projection accepts enriched claims through the bounded view but publishes no enrichmentRulesetId, enrichmentEvaluationId, enrichedGovernedClaimSetId, or baseClaimId lineage fields at projection level.", requiredNextStep: "Govern projection ownership of enrichment publication lineage before production integration." };
  return Object.freeze({ scenarioId, evaluationRan: true, originalResult, enrichedResult: { conflictOutcome: conflicts.evaluation.outcome, projectionId: projection.projectionId, modelOutcome: model.modelOutcome, validationOutcome: model.validation.outcome }, originalExpectationPreserved: outcomePreserved, enrichmentSeamStatus: "bounded-adapter-needed", stageResults: { assembly: passed(JSON.stringify(assembled.sourceResults)), recognition: JSON.stringify(recognition.claimSet) === baseSnapshot ? passed(recognition.claimSet.governedClaimSetId) : failed("base claim set mutated"), enrichment: passed(enrichment.evaluation.enrichmentEvaluationId), enrichedClaimSetToConflictEvaluation: idsPreserved && conflicts.evaluation.governedClaimSetId === enriched.enrichedGovernedClaimSetId ? passed("bounded identity alias; enriched claim IDs preserved") : failed("enriched identity was not preserved"), conflicts: outcomePreserved ? passed(conflicts.evaluation.outcome) : failed(conflicts.evaluation.outcome), projection: passed(projection.projectionId), governedInput: passed(input.inputId), modelInvocation: passed(model.modelOutcome), validation: model.validation.outcome === "passed" || model.modelOutcome === "validation_failed" ? passed(model.validation.outcome) : failed(model.validation.outcome) }, findings: [finding, lineageFinding], identityTrace: { baseGovernedClaimSetId: enriched.baseGovernedClaimSetId, enrichmentRulesetId: enrichment.evaluation.enrichmentRulesetId, enrichmentEvaluationId: enrichment.evaluation.enrichmentEvaluationId, enrichedGovernedClaimSetId: enriched.enrichedGovernedClaimSetId, baseClaimIds: recognition.claimSet.claimIds.join(","), enrichedClaimIds: enriched.claimIds.join(","), conflictEvaluationId: conflicts.evaluation.conflictEvaluationId, governedConflictSetId: conflicts.conflictSet?.governedConflictSetId, projectionId: projection.projectionId, responseEnvelopeId: model.envelope.envelopeId, executionRecordId: model.executionRecord.executionRecordId }, statusTrace: { sourceResults: assembled.sourceResults, enrichmentOutcomes: enrichment.evaluation.claimOutcomes, enrichedClaims: enriched.claims, conflictEvaluationOutcome: conflicts.evaluation.outcome, effectiveClaimStatuses: projection.effectiveClaimStatuses, memoryPriorityCount: projection.memoryPriorityReferences.length, connectorAvailability: projection.connectorAvailability } });
}

export async function runFullAssemblyEnrichmentRecheckMatrix() {
  return Promise.all(FULL_ASSEMBLY_SCENARIO_IDS.map(runFullAssemblyEnrichmentRecheckScenario));
}

export async function runEnrichedClaimMutationProof() {
  const scenarioId: FullAssemblyScenarioId = "single-contact-no-conflict";
  const assembled = await assembleGovernedSourceEvidence(fullAssemblySourceInput(scenarioId));
  const lineage = fullAssemblyLineage(scenarioId);
  const recognition = evaluateClaimBoundary({ text: fullAssemblyQuestion(scenarioId), ...lineage, referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME, entities: fullAssemblyEntities() });
  const base = recognition.claimSet!;
  const enrichment = enrichGovernedClaims({ baseClaimSet: base, assembledEvidence: assembled, sourceAssemblyReference: "mutation-proof:source-assembly", resolver: resolverForAddress(), claimParametersByClaimId: claimParametersFromCassieEvaluation(base, recognition.evaluation.extractedParameters), referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME });
  if (enrichment.outcome !== "completed") throw new Error("mutation baseline enrichment failed");
  const contact = enrichment.enrichedClaimSet.claims.find(claim => claim.claimType === "contact_address_lookup")!;
  const fixture = fullAssemblyConflictInput(scenarioId, contact.claimId);
  const evaluate = (set: EnrichedGovernedClaimSet, discriminator: string) => evaluateGovernedConversationalConflicts({ ruleset: CONFLICT_EVALUATION_RULESET, claimSet: conflictBoundaryView(set), observations: fixture.observations, requestedConflictClasses: fixture.classes, referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME, evaluationDiscriminator: discriminator }).evaluation!;
  const baseline = evaluate(enrichment.enrichedClaimSet, "mutation:baseline");
  const mutate = (changes: Record<string, unknown>): EnrichedGovernedClaimSet => ({ ...enrichment.enrichedClaimSet, claims: enrichment.enrichedClaimSet.claims.map(claim => claim.claimId === contact.claimId ? { ...claim, ...changes } : claim) });
  const status = evaluate(mutate({ status: "unsupported" }), "mutation:status");
  const factualValues = evaluate(mutate({ factualValues: ["corrupt@example.invalid"] }), "mutation:factual-values");
  return Object.freeze({ scenarioId, baselineOutcome: baseline.outcome, statusMutationOutcome: status.outcome, factualValueMutationOutcome: factualValues.outcome, metadataUnchanged: enrichment.enrichedClaimSet.threadId === lineage.threadId, statusMutationSilentlyAccepted: status.outcome === baseline.outcome, factualValueMutationSilentlyAccepted: factualValues.outcome === baseline.outcome });
}
