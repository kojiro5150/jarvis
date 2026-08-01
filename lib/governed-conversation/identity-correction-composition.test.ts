import { expect, it } from "vitest";
import { constructLifecycleEvent } from "./exchange-lifecycle";
import { InMemoryConversationalLineageRepository } from "./in-memory-lineage-repository";
import { constructGovernedConversationalInput } from "./input";
import { cassieEvaluationFixture, evaluationTime } from "./lineage-projection-evaluation-fixtures";
import { constructModelInvocationAttempt } from "./lineage-types";
import { invokeGovernedConversationModel } from "./model-invocation";
import { constructGovernedInputReference } from "./projection-composer";

it("composes the full governed exchange with conversational lineage and no EOS identity", async () => {
  const { thread, request, exchange, projection } = cassieEvaluationFixture();
  const repository = new InMemoryConversationalLineageRepository({ now: () => evaluationTime });
  expect((await repository.createThread(thread)).committed).toBe(true);
  expect((await repository.commitAcceptedRequest(request)).committed).toBe(true);
  expect((await repository.createExchange(exchange)).committed).toBe(true);
  const governedInputReference = constructGovernedInputReference(projection);
  expect((await repository.commitProjection(exchange.exchangeId, projection, governedInputReference)).committed).toBe(true);
  expect((await repository.transitionExchange(constructLifecycleEvent({ exchangeId: exchange.exchangeId, from: "created", to: "input_projected", occurredAt: evaluationTime, projectionId: projection.projectionId, eventCode: "projection_committed", eventDiscriminator: "3.86-projection" }))).committed).toBe(true);

  const input = constructGovernedConversationalInput({ inputId: governedInputReference.governedInputId, threadId: thread.threadId, requestId: request.requestId, exchangeId: exchange.exchangeId, projectionId: projection.projectionId, projectionLineage: projection, referenceTime: projection.referenceTime, question: { text: "What's Cassie's email? Anything important?" }, claims: projection.claims, sources: [{ sourceId: "gmail", available: true, status: "available", observedAt: projection.referenceTime, provenance: "retrieval:1" }], compatibilityContext: projection.compatibilityContext, conversationHistory: projection.conversationHistory });
  expect([input.runId, input.sessionId, input.interfaceContractId]).toEqual([undefined, undefined, undefined]);
  const attempt = constructModelInvocationAttempt({ schemaVersion: "2", exchangeId: exchange.exchangeId, governedInputId: input.inputId, ordinal: 1, startedAt: evaluationTime, providerConfigurationReference: "mock:3.86", projectionCommitted: true, eventDiscriminator: "3.86-attempt" });
  expect((await repository.startAttempt(attempt)).committed).toBe(true);
  expect((await repository.transitionExchange(constructLifecycleEvent({ exchangeId: exchange.exchangeId, from: "input_projected", to: "model_invocation_started", occurredAt: evaluationTime, attemptId: attempt.attemptId, eventCode: "model_started", eventDiscriminator: "3.86-started" }))).committed).toBe(true);

  const result = await invokeGovernedConversationModel(input, { invoke: async () => ({ metadataReference: "mock:output", text: JSON.stringify({ interpretation: { claimIds: ["cassie-address", "cassie-importance"], text: "Cassie's address is available; importance remains unsupported.", evidenceReferences: ["gmail:governed-publication:cassie-address:sender_address"], uncertaintyReferences: ["cassie-importance"], ownership: "model_interpretation" } }) }) }, { attemptId: attempt.attemptId, agentId: "evaluation-agent", completedAt: evaluationTime, schemaVersion: "2", validationPolicyId: exchange.validationPolicyId, policyReferences: [exchange.validationPolicyId, exchange.evidencePolicyId] });
  const completedAttempt = { ...attempt, outcome: "accepted" as const, completedAt: evaluationTime, outputDigest: "mock:output" };
  expect((await repository.completeAttempt(completedAttempt)).committed).toBe(true);
  expect((await repository.transitionExchange(constructLifecycleEvent({ exchangeId: exchange.exchangeId, from: "model_invocation_started", to: "model_output_received", occurredAt: evaluationTime, attemptId: attempt.attemptId, eventCode: "output_received", eventDiscriminator: "3.86-output" }))).committed).toBe(true);
  expect((await repository.transitionExchange(constructLifecycleEvent({ exchangeId: exchange.exchangeId, from: "model_output_received", to: "validation_passed", occurredAt: evaluationTime, responseEnvelopeId: result.envelopeReference.responseEnvelopeId, eventCode: "validation_passed", eventDiscriminator: "3.86-validation" }))).committed).toBe(true);
  expect((await repository.commitValidatedEnvelope(result.envelopeReference)).committed).toBe(true);
  expect((await repository.commitTerminalRecord(result.executionRecord)).committed).toBe(true);

  const aggregate = await repository.getExchange(exchange.exchangeId);
  expect(aggregate?.terminalRecord).toEqual(result.executionRecord);
  expect(aggregate?.exchange.currentState).toBe("completed");
  expect(result.executionRecord).toMatchObject({ threadId: thread.threadId, requestId: request.requestId, exchangeId: exchange.exchangeId, projectionId: projection.projectionId, governedInputId: governedInputReference.governedInputId, acceptedEnvelopeId: result.envelopeReference.responseEnvelopeId, validationOutcome: "passed", finalDisposition: "completed" });
});
