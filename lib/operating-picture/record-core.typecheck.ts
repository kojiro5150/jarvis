import {
  createCommitmentRecord,
  createDecisionRecord,
  createFactRecord,
  createGovernedCommitmentRecord,
  createGovernedDecisionRecord,
  createGovernedPlanRecord,
  createInferenceRecord,
  createPlanRecord,
  createPreferenceRecord,
  createRecommendationRecord,
  createUserAssertionRecord,
  type FactRecord,
  type PlanRecord,
  type ReusableAuthorityMustNotAppearInOperatingPicture,
} from "./record-core";
import {
  markModelText,
  type AuthorityEvidence,
  type CompletionProof,
  type GovernedEvidence,
  type GovernedProvenance,
  type PolicyProof,
  type ValidatedOperation,
  type VerificationProof,
} from "../governance-core/trust-types";

declare const evidence: GovernedEvidence<{ rate: number }>;
declare const stringEvidence: GovernedEvidence<string>;
declare const provenance: GovernedProvenance;
declare const authority: AuthorityEvidence<{ operation: string }>;
declare const policyProof: PolicyProof<{ operation: string }>;
declare const verificationProof: VerificationProof<{ result: string }>;
declare const completionProof: CompletionProof<{ result: string }>;
declare const validatedOperation: ValidatedOperation<{ operation: string }>;
declare const nestedTrustEvidence: GovernedEvidence<{
  safe: string;
  nested: {
    approval: AuthorityEvidence<{ operation: string }>;
  };
}>;

const fact = createFactRecord({
  id: "fact:1",
  subject: { namespace: "abs", entity: "victoria", attribute: "unemployment_rate", revision: "authoritative_snapshot" },
  evidence,
  provenance,
  visibility: ["executive_reasoning"],
});
const _factType: FactRecord<{ rate: number }> = fact;

const inference = createInferenceRecord({
  id: "inference:1",
  subject: { namespace: "abs", entity: "victoria", attribute: "unemployment_rate", revision: "authoritative_snapshot" },
  value: markModelText("Victoria's rate may be elevated."),
  generatedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});
void inference;

createRecommendationRecord({
  id: "recommendation:1",
  subject: { namespace: "abs", entity: "victoria", attribute: "unemployment_rate", revision: "authoritative_snapshot" },
  value: markModelText("Consider reviewing the trend."),
  generatedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});

createUserAssertionRecord({
  id: "user:1",
  subject: { namespace: "user", entity: "preferences", attribute: "time_of_day", revision: "explicit_replacement" },
  value: "I prefer mornings.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["planning"],
});

createFactRecord({
  id: "bad:fact",
  subject: { namespace: "abs", entity: "victoria", attribute: "unemployment_rate", revision: "authoritative_snapshot" },
  // @ts-expect-error model-authored text is not governed evidence and cannot construct a fact
  evidence: markModelText("5.1%"),
  provenance,
  visibility: ["conversation"],
});

// @ts-expect-error a model-authored inference is not a FactRecord
const _promotedInference: FactRecord<string> = inference;

// @ts-expect-error user assertions retain their semantic class
const _userAssertionAsFact: FactRecord<string> = createUserAssertionRecord({
  id: "user:2",
  subject: { namespace: "user", entity: "work", attribute: "owner", revision: "explicit_replacement" },
  value: "Rachel owns this.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});

createUserAssertionRecord({
  id: "user:lifecycle-at-construction",
  subject: { namespace: "user", entity: "lifecycle", attribute: "state", revision: "append_only" },
  value: "Lifecycle is transition-owned.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
  // @ts-expect-error lifecycle state cannot be supplied at record construction
  lifecycle: "superseded",
});

createUserAssertionRecord({
  id: "user:supersession-at-construction",
  subject: { namespace: "user", entity: "lifecycle", attribute: "supersession", revision: "append_only" },
  value: "Supersession is transition-owned.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
  // @ts-expect-error supersededBy cannot be supplied at record construction
  supersededBy: "user:newer",
});

// Nested trust-bearing payloads are rejected, not only whole-record authority.
createUserAssertionRecord({
  id: "bad:nested-authority",
  subject: { namespace: "user", entity: "test", attribute: "authority", revision: "append_only" },
  // @ts-expect-error authority cannot be nested inside an Operating Picture payload
  value: { safe: "text", nested: { approval: authority } },
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});

createPreferenceRecord({
  id: "bad:proof-array",
  subject: { namespace: "user", entity: "test", attribute: "proofs", revision: "append_only" },
  // @ts-expect-error policy/verification/completion proofs cannot be hidden in arrays
  value: [policyProof, verificationProof, completionProof],
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});

createCommitmentRecord({
  id: "bad:validated-operation",
  subject: { namespace: "user", entity: "test", attribute: "operation", revision: "append_only" },
  // @ts-expect-error validated operations are trust-bearing and cannot become remembered payload
  value: { operation: validatedOperation },
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});

createFactRecord({
  id: "bad:fact-nested-authority",
  subject: { namespace: "system", entity: "test", attribute: "authority", revision: "authoritative_snapshot" },
  // @ts-expect-error governed evidence cannot smuggle nested authority into a fact payload
  evidence: nestedTrustEvidence,
  provenance,
  visibility: ["conversation"],
});

// User constructors no longer accept caller-selected pseudo-governed authorship.
createPlanRecord({
  id: "bad:pseudo-governed-plan",
  subject: { namespace: "user", entity: "test", attribute: "plan", revision: "explicit_replacement" },
  value: "Plan",
  // @ts-expect-error user plan constructor has no caller-selectable governed source
  source: "governed_system",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["planning"],
});

createCommitmentRecord({
  id: "bad:pseudo-governed-commitment",
  subject: { namespace: "user", entity: "test", attribute: "commitment", revision: "explicit_replacement" },
  value: "Commitment",
  // @ts-expect-error user commitment constructor has no caller-selectable governed source
  source: "governed_source",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["planning"],
});

createDecisionRecord({
  id: "bad:pseudo-governed-decision",
  subject: { namespace: "user", entity: "test", attribute: "decision", revision: "explicit_replacement" },
  value: "Decision",
  // @ts-expect-error user decision constructor has no caller-selectable governed source
  source: "governed_decision_source",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["planning"],
});

// A governed-source record requires real governed evidence + provenance.
const governedPlan = createGovernedPlanRecord({
  id: "governed:plan",
  subject: { namespace: "system", entity: "project", attribute: "plan", revision: "explicit_replacement" },
  evidence: stringEvidence,
  provenance,
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["planning"],
});
const _governedPlanSource: "governed_system" = governedPlan.authorship.source;

const governedCommitment = createGovernedCommitmentRecord({
  id: "governed:commitment",
  subject: { namespace: "system", entity: "project", attribute: "commitment", revision: "explicit_replacement" },
  evidence: stringEvidence,
  provenance,
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["planning"],
});
const _governedCommitmentSource: "governed_source" = governedCommitment.authorship.source;

const governedDecision = createGovernedDecisionRecord({
  id: "governed:decision",
  subject: { namespace: "system", entity: "project", attribute: "decision", revision: "explicit_replacement" },
  evidence: stringEvidence,
  provenance,
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["planning"],
});
const _governedDecisionSource: "governed_decision_source" = governedDecision.authorship.source;

// @ts-expect-error a bare pseudo-governed PlanRecord is incomplete without governed evidence/provenance
const _fabricatedGovernedPlan: PlanRecord<string> = {
  id: "fake:governed-plan",
  class: "plan",
  value: "Plan",
  subject: { namespace: "system", entity: "project", attribute: "plan", revision: "explicit_replacement" },
  lifecycle: "current",
  visibility: { purposes: ["planning"] },
  authorship: { source: "governed_system", statedAt: "2026-08-30T04:30:00Z" },
};

const _noReusableAuthority: ReusableAuthorityMustNotAppearInOperatingPicture = true;
void _factType;
void _promotedInference;
void _userAssertionAsFact;
void _governedPlanSource;
void _governedCommitmentSource;
void _governedDecisionSource;
void _fabricatedGovernedPlan;
void _noReusableAuthority;
