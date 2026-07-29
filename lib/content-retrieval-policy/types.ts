export const CONNECTOR_TYPES = ["email", "calendar", "document"] as const;
export type ConnectorType = (typeof CONNECTOR_TYPES)[number];

export const PROCESSING_DECISIONS = [
  "external_processing_permitted",
  "redacted_processing_only",
  "approved_environment_only",
  "retrieval_prohibited",
] as const;
export type ProcessingDecision = (typeof PROCESSING_DECISIONS)[number];

export type ContentResource = Readonly<{
  resourceId: string;
  connectorType: string;
  senderIdentity?: string;
  senderDomain?: string;
  recipientIdentities?: readonly string[];
  resourceLocation?: string;
  repositoryClassification?: string;
}>;

export type PolicyRuleMatch = Readonly<{
  connectorType?: ConnectorType;
  senderIdentities?: readonly string[];
  senderDomains?: readonly string[];
  recipientIdentities?: readonly string[];
  resourceLocations?: readonly string[];
  repositoryClassifications?: readonly string[];
}>;

export type ContentRetrievalPolicyRule = Readonly<{
  id: string;
  match: PolicyRuleMatch;
  processing: ProcessingDecision;
  admissibleFields: readonly string[];
}>;

export type ContentRetrievalPolicy = Readonly<{
  policyVersion: string;
  rules: readonly ContentRetrievalPolicyRule[];
}>;

export type PolicyEvaluation = Readonly<{
  policyVersion: string | null;
  decision: ProcessingDecision;
  matchedRuleId: string | null;
  admissibleFields: readonly string[];
  reason: "matched" | "missing_policy" | "invalid_policy" | "unknown_resource" | "no_matching_rule";
}>;

export type RetrievalRequest = Readonly<{
  resource: ContentResource;
  requestedFields: readonly string[];
  requestingRuntime: string;
}>;

export type TransformationStatus = "not_required" | "required_not_applied" | "applied" | "unavailable";
export type RetrievalOutcome = "permitted" | "denied" | "failed";

export type RetrievalAuditRecord = Readonly<{
  retrievalId: string;
  request: RetrievalRequest;
  policyDecision: ProcessingDecision;
  policyVersion: string | null;
  requestedFields: readonly string[];
  releasedFields: readonly string[];
  transformationStatus: TransformationStatus;
  requestingRuntime: string;
  timestamp: string;
  outcome: RetrievalOutcome;
}>;
