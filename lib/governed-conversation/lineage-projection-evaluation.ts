import type { GovernedInputConstruction } from "./input";
import type { GovernedConversationalProjection } from "./projection-composer";

export const EVALUATION_VERSION = "sprint-3.84/1.0.0";
export type CompositionStatus = "compatible" | "bounded_adapter_required" | "semantic_incompatibility";
export type FindingKind = "Compatible" | "Adapter Gap" | "Semantic Defect" | "Lifecycle Defect" | "Lineage Defect" | "Projection Defect" | "Evidence Defect" | "Validation Defect" | "Persistence Boundary" | "Evaluation Boundary";
export interface CompositionFinding { readonly kind: FindingKind; readonly code: string; readonly blocking: boolean; readonly detail: string }
export interface FieldCompatibility { readonly field: string; readonly conversationalMeaning: string | null; readonly directlyAuthorised: boolean; readonly adapterOnly: boolean; readonly semanticConflict: boolean; readonly finding: FindingKind }
export interface ClaimStatusEvaluation { readonly claimId: string; readonly status: string }
export interface CommitObservation { readonly operation: string; readonly committed: boolean }
export interface ConversationalCompositionEvaluationResult { readonly evaluationVersion: string; readonly scenarioId: string; readonly compositionStatus: CompositionStatus; readonly threadId: string; readonly requestId: string; readonly exchangeId: string; readonly projectionId?: string; readonly governedInputId?: string; readonly attemptIds: readonly string[]; readonly responseEnvelopeId?: string; readonly executionRecordId?: string; readonly claimStatuses: readonly ClaimStatusEvaluation[]; readonly lifecycleStates: readonly string[]; readonly commitSequence: readonly CommitObservation[]; readonly findings: readonly CompositionFinding[]; readonly responseReleased: boolean; readonly syntheticEvidenceNotice: string; readonly productionAuthorityChanged: false }

export const FIELD_COMPATIBILITY: readonly FieldCompatibility[] = Object.freeze([
  { field: "projectionId", conversationalMeaning: "projectionId", directlyAuthorised: true, adapterOnly: false, semanticConflict: false, finding: "Compatible" },
  { field: "runId", conversationalMeaning: "exchangeId", directlyAuthorised: false, adapterOnly: false, semanticConflict: true, finding: "Semantic Defect" },
  { field: "sessionId", conversationalMeaning: "threadId", directlyAuthorised: false, adapterOnly: false, semanticConflict: true, finding: "Semantic Defect" },
  { field: "interfaceContractId", conversationalMeaning: null, directlyAuthorised: false, adapterOnly: false, semanticConflict: true, finding: "Semantic Defect" },
  { field: "requestId (model/execution)", conversationalMeaning: "requestId", directlyAuthorised: true, adapterOnly: true, semanticConflict: false, finding: "Adapter Gap" },
  { field: "GovernedExecutionRecordPayload / ConversationalExecutionRecord", conversationalMeaning: "same terminal disposition, incompatible identity schemes", directlyAuthorised: false, adapterOnly: false, semanticConflict: true, finding: "Semantic Defect" },
]);

export interface PersistenceMapping { readonly guarantee: string; readonly primitive: string; readonly classification: "Directly Mappable" | "Mappable with Transactional Adapter" | "Requires Additional Repository Method" | "Requires New Governance" | "Not Representable" }
export const PERSISTENCE_MAPPING: readonly PersistenceMapping[] = Object.freeze([
  ["One request to one exchange", "unique foreign key", "Directly Mappable"], ["Idempotency-key reuse", "unique index and transactional lookup", "Directly Mappable"], ["Attempt ordinal uniqueness", "composite unique constraint", "Directly Mappable"], ["One accepted envelope", "unique constrained publication", "Directly Mappable"], ["One terminal record", "unique exchange constraint", "Directly Mappable"], ["Valid lifecycle transition", "compare-and-set/event version", "Mappable with Transactional Adapter"], ["No model call before commits", "commit acknowledgement", "Mappable with Transactional Adapter"], ["No response before terminal commit", "durable commit acknowledgement", "Mappable with Transactional Adapter"], ["Immutable history", "append-only rows", "Mappable with Transactional Adapter"], ["Failure recovery", "journal/outbox and indeterminate result", "Requires Additional Repository Method"],
].map(([guarantee, primitive, classification]) => ({ guarantee, primitive, classification })) as readonly PersistenceMapping[]);

export function evaluateProjectionHandoff(projection: GovernedConversationalProjection): ConversationalCompositionEvaluationResult {
  const findings: CompositionFinding[] = FIELD_COMPATIBILITY.filter((row) => row.finding !== "Compatible").map((row) => ({ kind: row.finding, code: `FIELD_${row.field.replace(/\W+/g, "_").toUpperCase()}`, blocking: row.semanticConflict, detail: row.conversationalMeaning ? `${row.field} cannot truthfully carry ${row.conversationalMeaning}.` : `${row.field} has no conversational projection equivalent.` }));
  findings.push({ kind: "Persistence Boundary", code: "INDETERMINATE_COMMIT", blocking: false, detail: "CommitResult distinguishes success and definite failure, but not an unknown durable outcome." });
  findings.push({ kind: "Evaluation Boundary", code: "DELIVERY_DISPOSITION", blocking: false, detail: "A committed terminal record cannot represent failure of the subsequent release callback." });
  return Object.freeze({ evaluationVersion: EVALUATION_VERSION, scenarioId: "cassie-mixed-status", compositionStatus: "semantic_incompatibility", threadId: projection.threadId, requestId: projection.requestId, exchangeId: projection.exchangeId, projectionId: projection.projectionId, governedInputId: undefined, attemptIds: [], claimStatuses: projection.claims.map(({ claimId, status }) => ({ claimId, status })), lifecycleStates: ["created", "input_projected"], commitSequence: [], findings, responseReleased: false, syntheticEvidenceNotice: "Synthetic fixture evidence only; no production authority or raw provider data was accessed.", productionAuthorityChanged: false });
}

/** Returns construction fields that compose directly; deliberately does not invent legacy identity fields. */
export function projectionCompatibleInputFields(projection: GovernedConversationalProjection): Pick<GovernedInputConstruction, "inputId" | "projectionId" | "referenceTime" | "claims" | "compatibilityContext" | "conversationHistory"> {
  return { inputId: `governed-input:${projection.projectionId}`, projectionId: projection.projectionId, referenceTime: projection.referenceTime, claims: projection.claims, compatibilityContext: projection.compatibilityContext, conversationHistory: projection.conversationHistory };
}

export function detectLineageMutation(projection: GovernedConversationalProjection, expectedExchangeId: string): CompositionFinding | null {
  return projection.exchangeId === expectedExchangeId ? null : { kind: "Lineage Defect", code: "PROJECTION_EXCHANGE_MISMATCH", blocking: true, detail: "Projection exchange identity does not match the committed exchange." };
}
