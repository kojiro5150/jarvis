import { expect, it } from "vitest";
import { constructConversationalExecutionRecordMetadata } from "./execution-record";
import { availableGovernedCommunicationFixture } from "./fixtures";
import { constructConversationalExecutionRecord } from "./lineage-types";
import { constructResponseEnvelope } from "./response-envelope";

it("migrates reference-only metadata into the authoritative conversational execution record", () => {
  const input = availableGovernedCommunicationFixture.input;
  const envelope = constructResponseEnvelope({ envelopeId: "envelope:validated", inputId: input.inputId, claims: input.claims.map(claim => ({ ...claim, sourceReferences: claim.sourceReferences })), observedFacts: [], uncertainties: [], conflicts: [] });
  const record = constructConversationalExecutionRecord({ schemaVersion: "2", threadId: input.threadId, requestId: input.requestId, exchangeId: input.exchangeId, projectionId: input.projectionId, governedInputId: input.inputId, attemptIds: ["attempt:1"], acceptedEnvelopeId: envelope.envelopeId, finalDisposition: "completed_safe_response", terminalState: "completed", createdAt: input.referenceTime, completedAt: input.referenceTime, policyReferences: ["validation/1"], eventDiscriminator: "execution-record-test", ...constructConversationalExecutionRecordMetadata({ input, envelope, agentId: "dawnwatch" }) });
  expect(record).toMatchObject({ threadId: input.threadId, requestId: input.requestId, exchangeId: input.exchangeId, acceptedEnvelopeId: "envelope:validated", validationOutcome: "failed", refusalOutcome: null });
  expect(record.sourceReferences).toHaveLength(1);
  expect(JSON.stringify(record)).not.toContain("cassie@example.invalid");
  expect(record.ownershipSummary?.deterministic_observation).toBe(1);
});
