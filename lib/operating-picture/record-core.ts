import type {
  AuthorityEvidence,
  CompletionProof,
  GovernedEvidence,
  GovernedProvenance,
  ModelText,
  PolicyProof,
  ValidatedOperation,
  VerificationProof,
} from "../governance-core/trust-types";

export const OPERATING_PICTURE_CLASSES = [
  "fact",
  "user_assertion",
  "inference",
  "plan",
  "commitment",
  "decision",
  "preference",
  "recommendation",
  "open_question",
] as const;

export type OperatingPictureClass = (typeof OPERATING_PICTURE_CLASSES)[number];

export const OPERATING_PICTURE_LIFECYCLE = [
  "current",
  "stale",
  "superseded",
  "withdrawn",
] as const;

export type OperatingPictureLifecycle = (typeof OPERATING_PICTURE_LIFECYCLE)[number];

export type OperatingPictureVisibility = Readonly<{
  purposes: readonly string[];
}>;

export const OPERATING_PICTURE_REVISION_SEMANTICS = [
  "append_only",
  "explicit_replacement",
  "authoritative_snapshot",
] as const;

export type OperatingPictureRevisionSemantics =
  (typeof OPERATING_PICTURE_REVISION_SEMANTICS)[number];

export type OperatingPictureSubject = Readonly<{
  namespace: string;
  entity: string;
  attribute: string;
  revision: OperatingPictureRevisionSemantics;
}>;

type TrustBearingPayloadValue =
  | AuthorityEvidence<unknown>
  | GovernedEvidence<unknown>
  | GovernedProvenance
  | PolicyProof<unknown>
  | VerificationProof<unknown>
  | CompletionProof<unknown>
  | ValidatedOperation<unknown>;

type ContainsTrustBearingPayload<T> =
  T extends TrustBearingPayloadValue
    ? true
    : T extends readonly (infer U)[]
      ? ContainsTrustBearingPayload<U>
      : T extends object
        ? true extends {
            [K in keyof T]-?: ContainsTrustBearingPayload<T[K]>
          }[keyof T]
          ? true
          : false
        : false;

type TrustSafePayload<T> = ContainsTrustBearingPayload<T> extends true ? never : T;

type BaseRecord<K extends OperatingPictureClass, V> = Readonly<{
  id: string;
  class: K;
  value: V;
  subject: OperatingPictureSubject;
  lifecycle: OperatingPictureLifecycle;
  visibility: OperatingPictureVisibility;
  validFrom?: string;
  validUntil?: string;
  staleAfter?: string;
  supersededBy?: string;
}>;

export type FactRecord<T> = BaseRecord<"fact", T> & Readonly<{
  evidence: GovernedEvidence<T>;
  provenance: GovernedProvenance;
}>;

export type UserAssertionRecord<T> = BaseRecord<"user_assertion", T> & Readonly<{
  authorship: Readonly<{
    source: "user";
    statedAt: string;
  }>;
}>;

export type InferenceRecord = BaseRecord<"inference", ModelText> & Readonly<{
  authorship: Readonly<{
    source: "model";
    generatedAt: string;
  }>;
}>;

export type RecommendationRecord = BaseRecord<"recommendation", ModelText> & Readonly<{
  authorship: Readonly<{
    source: "model";
    generatedAt: string;
  }>;
}>;

export type UserPlanRecord<T> = BaseRecord<"plan", T> & Readonly<{
  authorship: Readonly<{
    source: "user";
    statedAt: string;
  }>;
}>;

export type GovernedPlanRecord<T> = BaseRecord<"plan", T> & Readonly<{
  authorship: Readonly<{
    source: "governed_system";
    statedAt: string;
  }>;
  evidence: GovernedEvidence<T>;
  provenance: GovernedProvenance;
}>;

export type PlanRecord<T> = UserPlanRecord<T> | GovernedPlanRecord<T>;

export type UserCommitmentRecord<T> = BaseRecord<"commitment", T> & Readonly<{
  authorship: Readonly<{
    source: "user";
    statedAt: string;
  }>;
}>;

export type GovernedCommitmentRecord<T> = BaseRecord<"commitment", T> & Readonly<{
  authorship: Readonly<{
    source: "governed_source";
    statedAt: string;
  }>;
  evidence: GovernedEvidence<T>;
  provenance: GovernedProvenance;
}>;

export type CommitmentRecord<T> = UserCommitmentRecord<T> | GovernedCommitmentRecord<T>;

export type UserDecisionRecord<T> = BaseRecord<"decision", T> & Readonly<{
  authorship: Readonly<{
    source: "user";
    statedAt: string;
  }>;
}>;

export type GovernedDecisionRecord<T> = BaseRecord<"decision", T> & Readonly<{
  authorship: Readonly<{
    source: "governed_decision_source";
    statedAt: string;
  }>;
  evidence: GovernedEvidence<T>;
  provenance: GovernedProvenance;
}>;

export type DecisionRecord<T> = UserDecisionRecord<T> | GovernedDecisionRecord<T>;

export type PreferenceRecord<T> = BaseRecord<"preference", T> & Readonly<{
  authorship: Readonly<{
    source: "user";
    statedAt: string;
  }>;
}>;

export type OpenQuestionRecord = BaseRecord<"open_question", ModelText> & Readonly<{
  authorship: Readonly<{
    source: "model";
    generatedAt: string;
  }>;
}>;

export type OperatingPictureRecord<T = unknown> =
  | FactRecord<T>
  | UserAssertionRecord<T>
  | InferenceRecord
  | PlanRecord<T>
  | CommitmentRecord<T>
  | DecisionRecord<T>
  | PreferenceRecord<T>
  | RecommendationRecord
  | OpenQuestionRecord;

type CommonInput = Readonly<{
  id: string;
  subject: OperatingPictureSubject;
  visibility: readonly string[];
  validFrom?: string;
  validUntil?: string;
  staleAfter?: string;
}>;

function common(input: CommonInput): Readonly<{
  id: string;
  subject: OperatingPictureSubject;
  lifecycle: OperatingPictureLifecycle;
  visibility: OperatingPictureVisibility;
  validFrom?: string;
  validUntil?: string;
  staleAfter?: string;
}> {
  return Object.freeze({
    id: input.id,
    subject: Object.freeze({ ...input.subject }),
    lifecycle: "current",
    visibility: Object.freeze({ purposes: Object.freeze([...input.visibility]) }),
    ...(input.validFrom ? { validFrom: input.validFrom } : {}),
    ...(input.validUntil ? { validUntil: input.validUntil } : {}),
    ...(input.staleAfter ? { staleAfter: input.staleAfter } : {}),
  });
}

export function createFactRecord<T>(input: CommonInput & Readonly<{
  evidence: GovernedEvidence<TrustSafePayload<T>>;
  provenance: GovernedProvenance;
}>): FactRecord<TrustSafePayload<T>> {
  return Object.freeze({
    ...common(input),
    class: "fact",
    value: input.evidence.value,
    evidence: input.evidence,
    provenance: input.provenance,
  });
}

export function createUserAssertionRecord<T>(input: CommonInput & Readonly<{
  value: TrustSafePayload<T>;
  statedAt: string;
}>): UserAssertionRecord<TrustSafePayload<T>> {
  return Object.freeze({
    ...common(input),
    class: "user_assertion",
    value: input.value,
    authorship: Object.freeze({ source: "user", statedAt: input.statedAt }),
  });
}

export function createInferenceRecord(input: CommonInput & Readonly<{
  value: ModelText;
  generatedAt: string;
}>): InferenceRecord {
  return Object.freeze({
    ...common(input),
    class: "inference",
    value: input.value,
    authorship: Object.freeze({ source: "model", generatedAt: input.generatedAt }),
  });
}

export function createRecommendationRecord(input: CommonInput & Readonly<{
  value: ModelText;
  generatedAt: string;
}>): RecommendationRecord {
  return Object.freeze({
    ...common(input),
    class: "recommendation",
    value: input.value,
    authorship: Object.freeze({ source: "model", generatedAt: input.generatedAt }),
  });
}

export function createPlanRecord<T>(input: CommonInput & Readonly<{
  value: TrustSafePayload<T>;
  statedAt: string;
}>): UserPlanRecord<TrustSafePayload<T>> {
  return Object.freeze({
    ...common(input),
    class: "plan",
    value: input.value,
    authorship: Object.freeze({ source: "user", statedAt: input.statedAt }),
  });
}

export function createGovernedPlanRecord<T>(input: CommonInput & Readonly<{
  evidence: GovernedEvidence<TrustSafePayload<T>>;
  provenance: GovernedProvenance;
  statedAt: string;
}>): GovernedPlanRecord<TrustSafePayload<T>> {
  return Object.freeze({
    ...common(input),
    class: "plan",
    value: input.evidence.value,
    authorship: Object.freeze({ source: "governed_system", statedAt: input.statedAt }),
    evidence: input.evidence,
    provenance: input.provenance,
  });
}

export function createCommitmentRecord<T>(input: CommonInput & Readonly<{
  value: TrustSafePayload<T>;
  statedAt: string;
}>): UserCommitmentRecord<TrustSafePayload<T>> {
  return Object.freeze({
    ...common(input),
    class: "commitment",
    value: input.value,
    authorship: Object.freeze({ source: "user", statedAt: input.statedAt }),
  });
}

export function createGovernedCommitmentRecord<T>(input: CommonInput & Readonly<{
  evidence: GovernedEvidence<TrustSafePayload<T>>;
  provenance: GovernedProvenance;
  statedAt: string;
}>): GovernedCommitmentRecord<TrustSafePayload<T>> {
  return Object.freeze({
    ...common(input),
    class: "commitment",
    value: input.evidence.value,
    authorship: Object.freeze({ source: "governed_source", statedAt: input.statedAt }),
    evidence: input.evidence,
    provenance: input.provenance,
  });
}

export function createDecisionRecord<T>(input: CommonInput & Readonly<{
  value: TrustSafePayload<T>;
  statedAt: string;
}>): UserDecisionRecord<TrustSafePayload<T>> {
  return Object.freeze({
    ...common(input),
    class: "decision",
    value: input.value,
    authorship: Object.freeze({ source: "user", statedAt: input.statedAt }),
  });
}

export function createGovernedDecisionRecord<T>(input: CommonInput & Readonly<{
  evidence: GovernedEvidence<TrustSafePayload<T>>;
  provenance: GovernedProvenance;
  statedAt: string;
}>): GovernedDecisionRecord<TrustSafePayload<T>> {
  return Object.freeze({
    ...common(input),
    class: "decision",
    value: input.evidence.value,
    authorship: Object.freeze({ source: "governed_decision_source", statedAt: input.statedAt }),
    evidence: input.evidence,
    provenance: input.provenance,
  });
}

export function createPreferenceRecord<T>(input: CommonInput & Readonly<{
  value: TrustSafePayload<T>;
  statedAt: string;
}>): PreferenceRecord<TrustSafePayload<T>> {
  return Object.freeze({
    ...common(input),
    class: "preference",
    value: input.value,
    authorship: Object.freeze({ source: "user", statedAt: input.statedAt }),
  });
}

export function createOpenQuestionRecord(input: CommonInput & Readonly<{
  value: ModelText;
  generatedAt: string;
}>): OpenQuestionRecord {
  return Object.freeze({
    ...common(input),
    class: "open_question",
    value: input.value,
    authorship: Object.freeze({ source: "model", generatedAt: input.generatedAt }),
  });
}

/**
 * OPERATING-PICTURE-05:
 * Authority may be referenced by external audit/history records, but never stored
 * as the whole Operating Picture record or inside its semantic payload.
 */
export type ReusableAuthorityMustNotAppearInOperatingPicture = AuthorityEvidence<never> extends OperatingPictureRecord
  ? never
  : true;

export function sameOperatingPictureSubject(
  left: OperatingPictureRecord,
  right: OperatingPictureRecord,
): boolean {
  return left.subject.namespace === right.subject.namespace
    && left.subject.entity === right.subject.entity
    && left.subject.attribute === right.subject.attribute;
}

export function sameOperatingPictureRevisionSemantics(
  left: OperatingPictureRecord,
  right: OperatingPictureRecord,
): boolean {
  return left.subject.revision === right.subject.revision;
}
