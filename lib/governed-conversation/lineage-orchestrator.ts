import { constructLifecycleEvent } from "./exchange-lifecycle";
import type { ConversationalExecutionRecord, ConversationalExchange, ConversationalRequest, ModelInvocationAttempt, ValidatedConversationalResponseEnvelopeReference } from "./lineage-types";
import type { ConversationalLineageRepository, CommitResult } from "./lineage-repository";
import { constructGovernedInputReference, type GovernedConversationalProjection, type GovernedConversationalProjectionInput, type GovernedInputReference } from "./projection-composer";

export interface ModelInvocationResult { readonly completedAttempt: ModelInvocationAttempt; readonly candidate: unknown }
export interface EnvelopeValidationResult { readonly passed: boolean; readonly envelope?: ValidatedConversationalResponseEnvelopeReference }
export interface ConversationalReleaseResult { readonly released: boolean; readonly exchangeId: string; readonly responseEnvelopeId?: string; readonly executionRecordId?: string; readonly blockedBy?: string; readonly failureCategory?: "projection" | "source" | "provider" | "malformed_output" | "validation" | "persistence" }
export interface ConversationalLineageOrchestrationInput { readonly request: ConversationalRequest; readonly exchange: ConversationalExchange; readonly projectionInput: GovernedConversationalProjectionInput; readonly attempt: ModelInvocationAttempt; readonly constructTerminalRecord: (value: { projection: GovernedConversationalProjection; governedInput: GovernedInputReference; completedAttempt: ModelInvocationAttempt; envelope: ValidatedConversationalResponseEnvelopeReference; safe: boolean }) => ConversationalExecutionRecord }
export interface ConversationalLineageOrchestratorDependencies { readonly repository: ConversationalLineageRepository; readonly composeProjection: (input: GovernedConversationalProjectionInput) => GovernedConversationalProjection; readonly constructGovernedInput?: (projection: GovernedConversationalProjection) => GovernedInputReference; readonly invokeModel: (attempt: ModelInvocationAttempt, projection: GovernedConversationalProjection) => Promise<ModelInvocationResult>; readonly validateEnvelope: (candidate: unknown, attempt: ModelInvocationAttempt) => Promise<EnvelopeValidationResult>; readonly constructSafeEnvelope: (attempt: ModelInvocationAttempt) => Promise<ValidatedConversationalResponseEnvelopeReference>; readonly releaseResponse: (envelope: ValidatedConversationalResponseEnvelopeReference, record: ConversationalExecutionRecord) => Promise<void>; readonly now: () => string }

export class ConversationalLineageOrchestrator {
  constructor(private readonly dependencies: ConversationalLineageOrchestratorDependencies) {}
  private blocked(exchangeId: string, point: string, result?: CommitResult): ConversationalReleaseResult { return { released: false, exchangeId, blockedBy: result && !result.committed ? `${point}:${result.failure}` : point, failureCategory: point === "projection" ? "projection" : "persistence" }; }
  private async transition(exchangeId: string, from: Parameters<typeof constructLifecycleEvent>[0]["from"], to: Parameters<typeof constructLifecycleEvent>[0]["to"], eventCode: string, extras: Partial<Parameters<typeof constructLifecycleEvent>[0]> = {}) { return this.dependencies.repository.transitionExchange(constructLifecycleEvent({ exchangeId, from, to, occurredAt: this.dependencies.now(), eventCode, eventDiscriminator: eventCode, ...extras })); }
  async execute(input: ConversationalLineageOrchestrationInput): Promise<ConversationalReleaseResult> {
    const { repository } = this.dependencies; const exchangeId = input.exchange.exchangeId;
    let commit = await repository.commitAcceptedRequest(input.request); if (!commit.committed) return this.blocked(exchangeId, "accepted-request-commit", commit);
    commit = await repository.createExchange(input.exchange); if (!commit.committed) return this.blocked(exchangeId, "exchange-creation-commit", commit);
    let projection: GovernedConversationalProjection; try { projection = this.dependencies.composeProjection(input.projectionInput); } catch { return this.blocked(exchangeId, "projection"); }
    const governedInput = (this.dependencies.constructGovernedInput ?? constructGovernedInputReference)(projection);
    commit = await repository.commitProjection(exchangeId, projection, governedInput); if (!commit.committed) return this.blocked(exchangeId, "projection-input-commit", commit);
    commit = await this.transition(exchangeId, "created", "input_projected", "projection-committed", { projectionId: projection.projectionId }); if (!commit.committed) return this.blocked(exchangeId, "projection-transition-commit", commit);
    commit = await repository.startAttempt(input.attempt); if (!commit.committed) return this.blocked(exchangeId, "attempt-start-commit", commit);
    commit = await this.transition(exchangeId, "input_projected", "model_invocation_started", "attempt-started", { attemptId: input.attempt.attemptId }); if (!commit.committed) return this.blocked(exchangeId, "attempt-start-transition-commit", commit);
    let model: ModelInvocationResult; try { model = await this.dependencies.invokeModel(input.attempt, projection); } catch { return { released: false, exchangeId, blockedBy: "provider-failure", failureCategory: "provider" }; }
    commit = await repository.completeAttempt(model.completedAttempt); if (!commit.committed) return this.blocked(exchangeId, "attempt-result-commit", commit);
    commit = await this.transition(exchangeId, "model_invocation_started", "model_output_received", "model-output-received", { attemptId: input.attempt.attemptId }); if (!commit.committed) return this.blocked(exchangeId, "attempt-result-transition-commit", commit);
    const validation = await this.dependencies.validateEnvelope(model.candidate, model.completedAttempt);
    let envelope: ValidatedConversationalResponseEnvelopeReference; let safe = false;
    if (validation.passed && validation.envelope) { envelope = validation.envelope; commit = await this.transition(exchangeId, "model_output_received", "validation_passed", "validation-passed", { attemptId: input.attempt.attemptId }); }
    else { commit = await this.transition(exchangeId, "model_output_received", "validation_failed", "validation-failed", { attemptId: input.attempt.attemptId }); if (!commit.committed) return this.blocked(exchangeId, "validation-transition-commit", commit); envelope = await this.dependencies.constructSafeEnvelope(model.completedAttempt); safe = true; commit = await this.transition(exchangeId, "validation_failed", "safe_response_created", "safe-response-created", { responseEnvelopeId: envelope.responseEnvelopeId }); }
    if (!commit.committed) return this.blocked(exchangeId, "validation-transition-commit", commit);
    commit = await repository.commitValidatedEnvelope(envelope); if (!commit.committed) return this.blocked(exchangeId, "validated-envelope-commit", commit);
    const record = input.constructTerminalRecord({ projection, governedInput, completedAttempt: model.completedAttempt, envelope, safe });
    commit = await repository.commitTerminalRecord(record); if (!commit.committed) return this.blocked(exchangeId, "terminal-execution-record-commit", commit);
    await this.dependencies.releaseResponse(envelope, record);
    return { released: true, exchangeId, responseEnvelopeId: envelope.responseEnvelopeId, executionRecordId: record.executionRecordId };
  }
}
