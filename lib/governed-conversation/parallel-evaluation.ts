import { buildContextBlock } from "../context-builder";
import type { OperationalState } from "../operational-state";
import { computeCommunicationClaimStatus } from "./evidence-status";
import { constructGovernedConversationalInput } from "./input";
import type { ConversationalEvaluationScenario, EvaluationClaimFixture } from "./evaluation-fixtures";
import { SYNTHETIC_EVALUATION_NOTICE } from "./evaluation-fixtures";
import type { ConversationalEvidenceStatus, GovernedClaimInput, GovernedSourceReference } from "./types";

export const CONVERSATIONAL_COMPARISON_CLASSIFICATIONS = ["Governed Equivalent", "Governed Improvement", "Preserved Availability", "Governed Defect", "Legacy Boundary Unmeasurable", "Undocumented Evaluation Boundary"] as const;
export type ConversationalComparisonClassification = typeof CONVERSATIONAL_COMPARISON_CLASSIFICATIONS[number];

export interface LegacyClaimExposure { claimId: string; serializedContext: string; fieldsExposed: string[]; valuesExposed: Record<string, unknown>; heuristicFieldsExposed: string[]; sourceAvailabilityExposed: boolean; evidenceStatusExposed: boolean; provenanceExposed: boolean; unsupportedStateExposed: boolean; coverageBoundaryExposed: boolean; contentKindExposed: boolean; deterministicComparisonPossible: boolean; }
export interface GovernedClaimEvaluation { claimId: string; claimType: string; status: ConversationalEvidenceStatus; warrantedStatus: ConversationalEvidenceStatus; sourceReferences: string[]; conflicts: string[]; compatibilityUsed: boolean; governedEvidenceUsed: boolean; provenancePreserved: boolean; restrictions: string[]; contractBoundaryDocumented: boolean; }
export interface ConversationalComparisonResult { claimId: string; classification: ConversationalComparisonClassification; rationale: string; governingContractSections: string[]; }
export interface ConversationalScenarioResult { scenarioId: string; question: string; auditReference: string; legacyExposure: LegacyClaimExposure[]; governedEvaluation: GovernedClaimEvaluation[]; claimComparisons: ConversationalComparisonResult[]; scenarioClassification: ConversationalComparisonClassification; rationale: string; governingContractSections: string[]; syntheticEvidenceNotice: typeof SYNTHETIC_EVALUATION_NOTICE; productionAuthorityChanged: false; modelInvocationUsed: false; }

const REFERENCE_TIME = new Date("2026-07-15T12:00:00.000Z");
const emptyState = (scenario: ConversationalEvaluationScenario): OperationalState => ({ priorities: [], projects: [], signals: [], blockers: [], calendar: [], calendarStatus: "unavailable", gmailThreads: [...scenario.messages], gmailStatus: scenario.claims.every(c => c.conditions.sourceAvailable) ? "online" : "unavailable", driveFiles: [], driveStatus: "unavailable", connectorStatuses: [], updatedAt: REFERENCE_TIME.toISOString() });

export function reconstructLegacyClaimExposure(scenario: ConversationalEvaluationScenario, claim: EvaluationClaimFixture): LegacyClaimExposure {
  const serializedContext = buildContextBlock(emptyState(scenario), "full", REFERENCE_TIME);
  const valuesExposed: Record<string, unknown> = {};
  for (const field of claim.legacyRelevantFields) valuesExposed[field] = scenario.messages.map(message => message[field]);
  const fieldsExposed: string[] = claim.legacyRelevantFields.filter(field => scenario.messages.some(message => {
    if (field === "unread") return message.unread && serializedContext.includes("unread");
    if (field === "important" || field === "needsReply") return false;
    if (field === "sourceLabel" && message.sourceLabel === "Main Gmail") return false;
    return serializedContext.includes(String(message[field]));
  }));
  if (claim.claimType === "message_absence" && serializedContext.includes("Communications:\nNone recorded.")) fieldsExposed.push("communications.empty");
  if (scenario.conversationHistory?.some(turn => turn.classification === "assistant_prior_output")) fieldsExposed.push("conversationHistory.assistant_prior_output");
  const heuristicFields = ["unread", "important", "needsReply", "sourceLabel"];
  return { claimId: claim.claimId, serializedContext, fieldsExposed, valuesExposed, heuristicFieldsExposed: fieldsExposed.filter(field => heuristicFields.includes(field)), sourceAvailabilityExposed: false, evidenceStatusExposed: false, provenanceExposed: false, unsupportedStateExposed: false, coverageBoundaryExposed: false, contentKindExposed: false, deterministicComparisonPossible: scenario.legacyComparisonPossible !== false };
}

const sourceReference = (scenario: ConversationalEvaluationScenario, claim: EvaluationClaimFixture): GovernedSourceReference[] => claim.conditions.governedEvidence && claim.conditions.provenanceSufficient ? [{ sourceId: "synthetic:gmail", resourceId: scenario.messages[0]?.id ?? `missing:${claim.claimId}`, field: claim.claimType, observedAt: REFERENCE_TIME.toISOString() }] : [];
const toClaimInput = (scenario: ConversationalEvaluationScenario, claim: EvaluationClaimFixture): GovernedClaimInput => {
  const status = computeCommunicationClaimStatus(claim.claimType, claim.conditions);
  return { claimId: claim.claimId, claimType: claim.claimType, material: claim.material, status, ownership: status === "unsupported" ? "unsupported" : status === "available" ? "deterministic_observation" : "deterministic_status", sourceReferences: sourceReference(scenario, claim), factualValues: claim.factualValues, sourceAvailable: claim.conditions.sourceAvailable, provenance: SYNTHETIC_EVALUATION_NOTICE, observedAt: REFERENCE_TIME.toISOString(), contentKind: claim.claimType === "message_full_content" && claim.conditions.contentComplete ? "plain_text_body" : claim.claimType === "message_full_content" || claim.claimType === "message_excerpt" ? "partial_excerpt" : claim.claimType === "message_absence" ? "negative_result" : "metadata", boundedComplete: claim.conditions.scopeComplete && claim.conditions.contentComplete, conflicts: claim.conflicts ?? [] };
};

export function compareConversationalClaimCoverage(legacy: LegacyClaimExposure, governed: GovernedClaimEvaluation): ConversationalComparisonResult {
  let classification: ConversationalComparisonClassification;
  if (!governed.contractBoundaryDocumented) classification = "Undocumented Evaluation Boundary";
  else if (!legacy.deterministicComparisonPossible) classification = "Legacy Boundary Unmeasurable";
  else if (governed.status !== governed.warrantedStatus || (governed.status === "available" && (!governed.provenancePreserved || governed.sourceReferences.length === 0)) || (governed.conflicts.length > 0 && governed.status === "available")) classification = "Governed Defect";
  else if (governed.status !== "available") classification = legacy.fieldsExposed.length > 0 && !legacy.evidenceStatusExposed ? "Governed Improvement" : "Governed Equivalent";
  else if (governed.governedEvidenceUsed && governed.provenancePreserved) classification = legacy.fieldsExposed.length > 0 ? "Preserved Availability" : "Governed Equivalent";
  else classification = "Governed Equivalent";
  const rationaleByClass: Record<ConversationalComparisonClassification, string> = {
    "Governed Equivalent": "The deterministic claim boundary is aligned at the coverage level.",
    "Governed Improvement": "Legacy context exposes claim-relevant fields without a deterministic sufficiency boundary; governed evaluation restricts the claim.",
    "Preserved Availability": "Sufficient governed evidence remains available with source identity and provenance.",
    "Governed Defect": "The governed record contradicts its runtime-computed evidence requirement or loses required lineage.",
    "Legacy Boundary Unmeasurable": "A deterministic legacy comparison cannot be made without model inference.",
    "Undocumented Evaluation Boundary": "The governing contract does not define this material evaluation boundary.",
  };
  const sections = classification === "Preserved Availability" ? ["Sprint 3.76 §§7–9, 18"] : classification === "Governed Improvement" ? ["Sprint 3.76 §§8–10, 16–18"] : ["Sprint 3.76 §§7–10, 14, 18"];
  return { claimId: legacy.claimId, classification, rationale: rationaleByClass[classification], governingContractSections: sections };
}

const precedence: readonly ConversationalComparisonClassification[] = ["Governed Defect", "Undocumented Evaluation Boundary", "Legacy Boundary Unmeasurable", "Governed Improvement", "Preserved Availability", "Governed Equivalent"];
export function aggregateScenarioClassification(results: readonly ConversationalComparisonResult[]): ConversationalComparisonClassification { return precedence.find(value => results.some(result => result.classification === value)) ?? "Undocumented Evaluation Boundary"; }

export function evaluateConversationalScenario(scenario: ConversationalEvaluationScenario): ConversationalScenarioResult {
  const rawClaims = scenario.claims.map(claim => toClaimInput(scenario, claim));
  const input = constructGovernedConversationalInput({ inputId: `evaluation:${scenario.scenarioId}`, runId: `run:${scenario.scenarioId}`, sessionId: "session:synthetic-evaluation", interfaceContractId: "contract:sprint-3.76", projectionId: "projection:synthetic-evaluation", referenceTime: REFERENCE_TIME.toISOString(), question: { text: scenario.question, timezone: "Etc/UTC", locale: "en-US" }, claims: rawClaims, sources: [{ sourceId: "synthetic:gmail", available: rawClaims.every(claim => claim.sourceAvailable), status: rawClaims.some(claim => claim.status === "unavailable") ? "unavailable" : "available", observedAt: REFERENCE_TIME.toISOString(), provenance: SYNTHETIC_EVALUATION_NOTICE }], compatibilityContext: scenario.messages.map(message => ({ contextId: `legacy:${message.id}`, legacySource: "OperationalState.gmailThreads", governedResourceId: message.id, classification: "compatibility", authority: "none", descriptiveFields: { subject: message.subject, from: message.from, snippet: message.snippet, unread: message.unread, sourceLabel: message.sourceLabel }, excludedHeuristicFields: ["important", "needsReply", "heuristicRanking", "requiringAttention"] })), conversationHistory: scenario.conversationHistory ?? [] });
  const legacyExposure = scenario.claims.map(claim => reconstructLegacyClaimExposure(scenario, claim));
  const governedEvaluation = input.claims.map((claim, index): GovernedClaimEvaluation => ({ claimId: claim.claimId, claimType: claim.claimType, status: claim.status, warrantedStatus: computeCommunicationClaimStatus(scenario.claims[index].claimType, scenario.claims[index].conditions), sourceReferences: claim.sourceReferences.map(reference => `${reference.sourceId}/${reference.resourceId}#${reference.field}`), conflicts: claim.conflicts.map(conflict => conflict.description), compatibilityUsed: input.compatibilityContext.length > 0, governedEvidenceUsed: scenario.claims[index].conditions.governedEvidence, provenancePreserved: claim.sourceReferences.length > 0 && Boolean(claim.provenance), restrictions: claim.status === "available" ? [] : [`Do not assert claim: ${claim.status}`], contractBoundaryDocumented: scenario.contractBoundaryDocumented !== false }));
  const claimComparisons = legacyExposure.map((legacy, index) => compareConversationalClaimCoverage(legacy, governedEvaluation[index]));
  const scenarioClassification = aggregateScenarioClassification(claimComparisons);
  return { scenarioId: scenario.scenarioId, question: scenario.question, auditReference: scenario.auditReference, legacyExposure, governedEvaluation, claimComparisons, scenarioClassification, rationale: claimComparisons.map(result => result.rationale).join(" "), governingContractSections: [...new Set(claimComparisons.flatMap(result => result.governingContractSections))], syntheticEvidenceNotice: scenario.syntheticEvidenceNotice, productionAuthorityChanged: false, modelInvocationUsed: false };
}
