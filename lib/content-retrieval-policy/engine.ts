import {
  CONNECTOR_TYPES,
  PROCESSING_DECISIONS,
  type ContentResource,
  type ContentRetrievalPolicy,
  type ContentRetrievalPolicyRule,
  type PolicyEvaluation,
  type PolicyRuleMatch,
} from "./types";

/** Connector significance is never part of the content retrieval contract. */
export const PROHIBITED_SIGNIFICANCE_FIELDS = new Set([
  "importance", "priority", "starred", "flagged", "gmail_labels", "category",
  "focused_inbox", "connector_ai_summary", "inferred_urgency", "inferred_significance",
]);

const deny = (reason: PolicyEvaluation["reason"], version: string | null): PolicyEvaluation => ({
  policyVersion: version,
  decision: "retrieval_prohibited",
  matchedRuleId: null,
  admissibleFields: [],
  reason,
});

function hasSelector(match: PolicyRuleMatch): boolean {
  return Boolean(match && typeof match === "object") && Object.values(match).some((value) => value !== undefined);
}

function validMatch(match: PolicyRuleMatch): boolean {
  if (!hasSelector(match)) return false;
  const { connectorType, ...listSelectors } = match;
  return (connectorType === undefined || CONNECTOR_TYPES.includes(connectorType)) &&
    Object.values(listSelectors).every((values) => values === undefined ||
      (Array.isArray(values) && values.length > 0 && values.every((value) => typeof value === "string" && value.length > 0)));
}

function validPolicy(policy: ContentRetrievalPolicy): boolean {
  return typeof policy.policyVersion === "string" && Boolean(policy.policyVersion.trim()) && Array.isArray(policy.rules) && policy.rules.every((rule) =>
    Boolean(rule && typeof rule.id === "string" && rule.id.trim()) && validMatch(rule.match) &&
    PROCESSING_DECISIONS.includes(rule.processing) && Array.isArray(rule.admissibleFields) &&
    rule.admissibleFields.every((field: unknown) => typeof field === "string" && field.length > 0 && !PROHIBITED_SIGNIFICANCE_FIELDS.has(field))
  );
}

const includes = (values: readonly string[] | undefined, value: string | undefined) =>
  values === undefined || (value !== undefined && values.includes(value));

function matches(rule: ContentRetrievalPolicyRule, resource: ContentResource): boolean {
  const match = rule.match;
  return (match.connectorType === undefined || match.connectorType === resource.connectorType) &&
    includes(match.senderIdentities, resource.senderIdentity) &&
    includes(match.senderDomains, resource.senderDomain) &&
    (match.recipientIdentities === undefined || match.recipientIdentities.some((id) => resource.recipientIdentities?.includes(id))) &&
    includes(match.resourceLocations, resource.resourceLocation) &&
    includes(match.repositoryClassifications, resource.repositoryClassification);
}

/** Pure policy evaluation. Rules have explicit, deterministic first-match precedence. */
export function evaluateContentRetrievalPolicy(
  resource: ContentResource,
  policy: ContentRetrievalPolicy | null | undefined,
): PolicyEvaluation {
  if (!policy) return deny("missing_policy", null);
  const version = typeof policy.policyVersion === "string" && policy.policyVersion.trim() ? policy.policyVersion : null;
  if (!validPolicy(policy)) return deny("invalid_policy", version);
  if (!resource || typeof resource.resourceId !== "string" || !resource.resourceId.trim() ||
      typeof resource.connectorType !== "string" || !CONNECTOR_TYPES.includes(resource.connectorType as (typeof CONNECTOR_TYPES)[number])) {
    return deny("unknown_resource", version);
  }
  const rule = policy.rules.find((candidate) => matches(candidate, resource));
  if (!rule) return deny("no_matching_rule", version);
  return {
    policyVersion: policy.policyVersion,
    decision: rule.processing,
    matchedRuleId: rule.id,
    admissibleFields: rule.processing === "retrieval_prohibited" ? [] : [...rule.admissibleFields].sort(),
    reason: "matched",
  };
}

/** Gate 2: intersects requested fields only after Gate 1 permits raw processing. */
export function resolveReleasedFields(evaluation: PolicyEvaluation, requestedFields: readonly string[]): readonly string[] {
  if (evaluation.decision !== "external_processing_permitted") return [];
  const admissible = new Set(evaluation.admissibleFields);
  return [...new Set(requestedFields)].filter((field) => admissible.has(field) && !PROHIBITED_SIGNIFICANCE_FIELDS.has(field)).sort();
}
