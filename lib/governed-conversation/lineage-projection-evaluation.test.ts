import { describe, expect, it } from "vitest";
import { constructGovernedConversationalInput } from "./input";
import { invokeGovernedConversationModel } from "./model-invocation";
import { InMemoryConversationalLineageRepository } from "./in-memory-lineage-repository";
import { composeGovernedConversationalProjection } from "./projection-composer";
import { cassieEvaluationFixture } from "./lineage-projection-evaluation-fixtures";
import { projectionInput } from "./lineage-test-fixtures";
import { detectLineageMutation, evaluateProjectionHandoff, FIELD_COMPATIBILITY, PERSISTENCE_MAPPING, projectionCompatibleInputFields } from "./lineage-projection-evaluation";

describe("Sprint 3.84 composition diagnostic", () => {
  it("reports the real projection/input identity incompatibility without inventing a shim", () => {
    const { projection } = cassieEvaluationFixture();
    const result = evaluateProjectionHandoff(projection);
    expect(result.compositionStatus).toBe("semantic_incompatibility");
    expect(result.governedInputId).toBeUndefined();
    expect(FIELD_COMPATIBILITY.filter((row) => row.semanticConflict).map((row) => row.field)).toEqual(["runId", "sessionId", "interfaceContractId", "GovernedExecutionRecordPayload / ConversationalExecutionRecord"]);
    expect(result.claimStatuses).toEqual([{ claimId: "cassie-address", status: "available" }, { claimId: "cassie-importance", status: "unsupported" }]);
    expect(result.productionAuthorityChanged).toBe(false);
  });

  it("proves projection sufficiency and raw-data independence up to the blocked identity handoff", () => {
    const { projection } = cassieEvaluationFixture();
    const compatible = projectionCompatibleInputFields(projection);
    expect(compatible.claims[0].factualValues).toEqual(["cassie@example.test"]);
    expect(compatible.claims[1].status).toBe("unsupported");
    expect(projection.communicationEvidence[0].recipientEvidenceReference).toBe("person-match:cassie");
    expect(projection.connectorAvailability[0].availability).toBe("available");
    expect(projection.conversationHistory.every((turn) => !turn.canonicalEvidence)).toBe(true);
    expect(projection.compatibilityContext[0]).toMatchObject({ authority: "none", excludedHeuristicFields: ["important", "needsReply"] });
    expect(JSON.stringify(projection)).not.toContain("OperationalState");
  });

  it("exercises the unchanged evidence/model pipeline with equivalent synthetic evidence, separately from the forbidden lineage mapping", async () => {
    const { projection } = cassieEvaluationFixture();
    const fields = projectionCompatibleInputFields(projection);
    const input = constructGovernedConversationalInput({ ...fields, question: { text: "What's Cassie's email? Anything important?" }, sources: [{ sourceId: "gmail", available: true, status: "available", observedAt: projection.referenceTime, provenance: "retrieval:1" }] });
    const result = await invokeGovernedConversationModel(input, { invoke: async () => ({ metadataReference: "mock:1", text: JSON.stringify({ interpretation: { claimIds: ["cassie-address", "cassie-importance"], text: "The address is cassie@example.test; significance is unsupported and not established.", evidenceReferences: ["gmail:governed-publication:cassie-address:sender_address"], uncertaintyReferences: ["cassie-importance"], ownership: "model_interpretation" } }) }) }, { attemptId: "attempt:1", agentId: "evaluation-agent", completedAt: projection.referenceTime, schemaVersion: "2", validationPolicyId: "validation/1", policyReferences: ["validation/1"] });
    expect(result.modelOutcome).toBe("accepted");
    expect(result.validation.outcome).toBe("passed");
    expect(result.envelope.claims.map(({ status }) => status)).toEqual(["available", "unsupported"]);
    expect(result.request.governedContext.compatibilityBoundaries[0].authority).toBe("none");
    expect(result.executionRecord).toMatchObject({ threadId: projection.threadId, requestId: projection.requestId, exchangeId: projection.exchangeId, projectionId: projection.projectionId, finalDisposition: "completed" });
    expect(input.runId).toBeUndefined(); expect(input.sessionId).toBeUndefined(); expect(input.interfaceContractId).toBeUndefined();
  });

  it("rejects malformed projection integrity cases with real composer checks", () => {
    const base = projectionInput();
    expect(() => composeGovernedConversationalProjection({ ...base, claims: [...base.claims, base.claims[0]] })).toThrow("claim summaries do not match governed claim set");
    expect(() => composeGovernedConversationalProjection({ ...base, conversationHistory: [{ ...base.conversationHistory[0], canonicalEvidence: true as never }] })).toThrow("conversation history is non-canonical");
    expect(() => composeGovernedConversationalProjection({ ...base, compatibilityContext: [{ ...base.compatibilityContext[0], authority: "evidence" as never }] })).toThrow("compatibility context has no evidence authority");
  });

  it("detects a full-boundary lineage mutation rather than returning a fixture label", () => {
    const { projection, exchange } = cassieEvaluationFixture();
    expect(detectLineageMutation(projection, exchange.exchangeId)).toBeNull();
    expect(detectLineageMutation({ ...projection, exchangeId: "mutated" }, exchange.exchangeId)).toMatchObject({ kind: "Lineage Defect", blocking: true });
  });

  it("exercises idempotency, duplicate exchange, and persistence constraints", async () => {
    const { thread, request, exchange, projection } = cassieEvaluationFixture();
    const repository = new InMemoryConversationalLineageRepository();
    expect((await repository.createThread(thread)).committed).toBe(true);
    expect((await repository.commitAcceptedRequest(request)).committed).toBe(true);
    expect(await repository.getByIdempotencyKey("transport:cassie")).toEqual(request);
    expect((await repository.commitAcceptedRequest(request)).committed).toBe(false);
    expect((await repository.createExchange(exchange)).committed).toBe(true);
    expect((await repository.createExchange(exchange)).committed).toBe(false);
    expect(detectLineageMutation(projection, exchange.exchangeId)).toBeNull();
    expect(PERSISTENCE_MAPPING.find((row) => row.guarantee === "Failure recovery")?.classification).toBe("Requires Additional Repository Method");
  });
});
