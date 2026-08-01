import { constructExecutionRecordPayload } from "./execution-record";
import { parseGovernedModelOutput, type GovernedModelOutputParseResult, type GovernedModelRawResponse } from "./model-output";
import { constructGovernedModelRequest, type GovernedModelRequest } from "./model-request";
import { constructResponseEnvelope, constructSafeEnvelope, pendingValidation } from "./response-envelope";
import type { GovernedConversationalInput, GovernedConversationalResponseEnvelope, GovernedExecutionRecordPayload, GovernedValidationResult } from "./types";
import { validateResponseEnvelope } from "./validator";

export interface GovernedConversationModelAdapter { invoke(request: GovernedModelRequest): Promise<GovernedModelRawResponse> }
export interface GovernedModelInvocationIdentifiers { readonly requestId: string; readonly envelopeId: string; readonly safeEnvelopeId: string; readonly executionRecordId: string; readonly agentId: string }
export interface GovernedModelInvocationResult { readonly request: GovernedModelRequest; readonly envelope: GovernedConversationalResponseEnvelope; readonly modelOutcome: "accepted" | "parse_failed" | "validation_failed" | "adapter_failed"; readonly parseResult?: GovernedModelOutputParseResult; readonly validation: GovernedValidationResult; readonly executionRecord: GovernedExecutionRecordPayload }

function baseEnvelope(input: GovernedConversationalInput, envelopeId: string, output?: Extract<GovernedModelOutputParseResult, { ok: true }>["output"]): GovernedConversationalResponseEnvelope {
  const unsupported = input.claims.filter((claim) => claim.status === "unsupported");
  return constructResponseEnvelope({
    envelopeId,
    inputId: input.inputId,
    claims: input.claims.map((claim) => ({ claimId: claim.claimId, claimType: claim.claimType, material: claim.material, status: claim.status, sourceReferences: claim.sourceReferences, disclosure: claim.status === "available" ? undefined : `Evidence status: ${claim.status}` })),
    observedFacts: input.claims.filter((claim) => claim.status === "available").flatMap((claim) => claim.factualValues.flatMap((value, index) => claim.sourceReferences.slice(0, 1).map((sourceReference) => ({ factId: `fact:${claim.claimId}:${index}`, claimId: claim.claimId, sourceReference, status: "available" as const, ownership: "deterministic_observation" as const, value, contentKind: claim.contentKind, boundedComplete: claim.boundedComplete })))),
    interpretation: output?.interpretation ? { ownership: "model_interpretation", text: output.interpretation.text, evidenceClaimIds: output.interpretation.claimIds, uncertainty: output.interpretation.uncertaintyReferences.join(", ") || "none" } : undefined,
    uncertainties: input.claims.filter((claim) => claim.status !== "available").map((claim) => ({ uncertaintyId: `uncertainty:${claim.claimId}`, claimId: claim.claimId, description: `Evidence status is ${claim.status}.` })),
    conflicts: input.claims.flatMap((claim) => claim.conflicts),
    advisoryNextSteps: output?.advisoryNextSteps?.map((step, index) => ({ stepId: `model-step:${index}`, ownership: "model_advisory", claimIds: step.claimIds, text: step.text, kind: step.kind, subjectToOperatorJudgment: true })),
    refusal: unsupported.length ? { claimIds: unsupported.map((claim) => claim.claimId), reason: "unsupported", explanation: "No governed evidence owner supports these claims." } : undefined,
  });
}

export async function invokeGovernedConversationModel(input: GovernedConversationalInput, adapter: GovernedConversationModelAdapter, ids: GovernedModelInvocationIdentifiers): Promise<GovernedModelInvocationResult> {
  const request = constructGovernedModelRequest(input, ids.requestId);
  const finish = (envelope: GovernedConversationalResponseEnvelope, modelOutcome: GovernedModelInvocationResult["modelOutcome"], validation: GovernedValidationResult, parseResult?: GovernedModelOutputParseResult, metadata: readonly string[] = []) => ({ request, envelope, modelOutcome, parseResult, validation, executionRecord: constructExecutionRecordPayload({ executionRecordId: ids.executionRecordId, requestId: ids.requestId, agentId: ids.agentId, input, envelope, modelExecutionMetadataReferences: [`model-outcome:${modelOutcome}`, `parser-outcome:${parseResult ? (parseResult.ok ? "passed" : "failed") : "not-run"}`, ...metadata] }) });
  let raw: GovernedModelRawResponse;
  try { raw = await adapter.invoke(request); }
  catch { const validation = pendingValidation(); const safe = constructSafeEnvelope(input, validation, ids.safeEnvelopeId); return finish(safe, "adapter_failed", validation); }
  const parseResult = parseGovernedModelOutput(raw, input);
  const metadata = typeof raw === "object" && raw.metadataReference ? [`adapter:${raw.metadataReference}`] : [];
  if (!parseResult.ok) { const validation = pendingValidation(); const safe = constructSafeEnvelope(input, validation, ids.safeEnvelopeId); return finish(safe, "parse_failed", validation, parseResult, metadata); }
  const candidate = baseEnvelope(input, ids.envelopeId, parseResult.output);
  const validation = validateResponseEnvelope(input, candidate);
  if (!validation.valid) { const safe = constructSafeEnvelope(input, validation, ids.safeEnvelopeId); return finish(safe, "validation_failed", validation, parseResult, metadata); }
  const envelope = { ...candidate, validation };
  return finish(envelope, "accepted", validation, parseResult, metadata);
}
