import type { PolicyEvaluation, RetrievalAuditRecord, RetrievalOutcome, RetrievalRequest, TransformationStatus } from "./types";

export function createRetrievalAuditRecord(input: {
  request: RetrievalRequest;
  evaluation: PolicyEvaluation;
  releasedFields: readonly string[];
  transformationStatus: TransformationStatus;
  timestamp: string;
  outcome: RetrievalOutcome;
}): RetrievalAuditRecord {
  return {
    request: input.request,
    policyDecision: input.evaluation.decision,
    policyVersion: input.evaluation.policyVersion,
    requestedFields: [...input.request.requestedFields],
    releasedFields: [...input.releasedFields],
    transformationStatus: input.transformationStatus,
    requestingRuntime: input.request.requestingRuntime,
    timestamp: input.timestamp,
    outcome: input.outcome,
  };
}
