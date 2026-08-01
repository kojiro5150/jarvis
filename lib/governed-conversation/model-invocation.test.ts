import { describe, expect, it } from "vitest";
import { cassieFixture, gmailRef } from "./fixtures";
import { invokeGovernedConversationModel, type GovernedConversationModelAdapter } from "./model-invocation";

const source = `${gmailRef.sourceId}:${gmailRef.resourceId}:${gmailRef.field}`;
const ids = { requestId: "request:test", envelopeId: "envelope:model", safeEnvelopeId: "envelope:safe", executionRecordId: "record:test", agentId: "governed-conversation" };
const adapter = (value: unknown): GovernedConversationModelAdapter => ({ invoke: async () => typeof value === "string" ? value : JSON.stringify(value) });
const valid = {
  interpretation: { ownership: "model_interpretation", claimIds: ["contact", "importance"], text: "The governed address shown is cassie@example.invalid; importance is unsupported and cannot be established.", evidenceReferences: [source], uncertaintyReferences: ["importance"] },
  advisoryNextSteps: [{ ownership: "model_advisory", nonAuthoritative: true, kind: "source_verification", claimIds: ["contact"], text: "Consider verifying the address source, subject to operator judgment.", evidenceReferences: [source] }],
};

describe("isolated governed model invocation", () => {
  it("accepts the Cassie mixed-status case through the unchanged validator", async () => {
    const result = await invokeGovernedConversationModel(cassieFixture.input, adapter({ ...valid }), ids);
    expect(result.modelOutcome).toBe("accepted");
    expect(result.validation.outcome).toBe("passed");
    expect(result.envelope.claims.map(({ claimId, status }) => ({ claimId, status }))).toEqual([{ claimId: "contact", status: "available" }, { claimId: "importance", status: "unsupported" }]);
    expect(result.envelope.observedFacts[0]).toMatchObject({ ownership: "deterministic_observation", value: "cassie@example.invalid" });
    expect(result.envelope.interpretation?.ownership).toBe("model_interpretation");
    expect(result.envelope.advisoryNextSteps?.[0]).toMatchObject({ ownership: "model_advisory", subjectToOperatorJudgment: true });
    expect(result.executionRecord).toMatchObject({ requestId: ids.requestId, responseEnvelopeId: ids.envelopeId, validationOutcome: "passed", refusalOutcome: "unsupported" });
    expect(result.executionRecord.modelExecutionMetadataReferences).toContain("model-outcome:accepted");
  });
  it("reuses the safe envelope for malformed output", async () => {
    const result = await invokeGovernedConversationModel(cassieFixture.input, adapter("not json"), ids);
    expect(result).toMatchObject({ modelOutcome: "parse_failed", envelope: { envelopeId: ids.safeEnvelopeId, observedFacts: [], advisoryNextSteps: undefined, refusal: { reason: "validation_failure" } } });
    expect(result.executionRecord.responseEnvelopeId).toBe(ids.safeEnvelopeId);
  });
  it("lets the validator authoritatively reject advice for unsupported claims", async () => {
    const violating = { interpretation: valid.interpretation, advisoryNextSteps: [{ ...valid.advisoryNextSteps[0], claimIds: ["importance"], kind: "review_consideration" }] };
    const result = await invokeGovernedConversationModel(cassieFixture.input, adapter(violating), ids);
    expect(result.modelOutcome).toBe("validation_failed");
    expect(result.validation.failures.map((failure) => failure.ruleId)).toContain("GC-013-ADVISORY-STATUS");
    expect(result.envelope.envelopeId).toBe(ids.safeEnvelopeId);
    expect(result.envelope.interpretation).toBeUndefined();
  });
  it("returns a safe in-memory record when the adapter throws", async () => {
    const throwing: GovernedConversationModelAdapter = { invoke: async () => { throw new Error("offline"); } };
    const result = await invokeGovernedConversationModel(cassieFixture.input, throwing, ids);
    expect(result).toMatchObject({ modelOutcome: "adapter_failed", envelope: { envelopeId: ids.safeEnvelopeId }, executionRecord: { responseEnvelopeId: ids.safeEnvelopeId, validationOutcome: "failed" } });
    expect(result.parseResult).toBeUndefined();
  });
  it("preserves deterministic statuses regardless of model wording", async () => {
    const result = await invokeGovernedConversationModel(cassieFixture.input, adapter(valid), ids);
    expect(result.envelope.claims.map((claim) => claim.status)).toEqual(cassieFixture.input.claims.map((claim) => claim.status));
  });
});
