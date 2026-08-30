import type {
  AuthorityEvidence,
  GovernedEvidence,
  GovernedProvenance,
  ModelText,
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

type BaseRecord<K extends OperatingPictureClass, V> = Readonly<{
  id: string;
  class: K;
  value: V;
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

export type PlanRecord<T> = BaseRecord<"plan", T> & Readonly<{
  authorship: Readonly<{
    source: "user" | "governed_system";
    statedAt: string;
  }>;
}>;

export type CommitmentRecord<T> = BaseRecord<"commitment", T> & Readonly<{
  authorship: Readonly<{
    source: "user" | "governed_source";
    statedAt: string;
  }>;
}>;

export type DecisionRecord<T> = BaseRecord<"decision", T> & Readonly<{
  authorship: Readonly<{
    source: "user" | "governed_decision_source";
    statedAt: string;
  }>;
}>;

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
  visibility: readonly string[];
  lifecycle?: OperatingPictureLifecycle;
  validFrom?: string;
  validUntil?: string;
  staleAfter?: string;
  supersededBy?: string;
}>;

function common(input: CommonInput): Readonly<{
  id: string;
  lifecycle: OperatingPictureLifecycle;
  visibility: OperatingPictureVisibility;
  validFrom?: string;
  validUntil?: string;
  staleAfter?: string;
  supersededBy?: string;
}> {
  return Object.freeze({
    id: input.id,
    lifecycle: input.lifecycle ?? "current",
    visibility: Object.freeze({ purposes: Object.freeze([...input.visibility]) }),
    ...(input.validFrom ? { validFrom: input.validFrom } : {}),
    ...(input.validUntil ? { validUntil: input.validUntil } : {}),
    ...(input.staleAfter ? { staleAfter: input.staleAfter } : {}),
    ...(input.supersededBy ? { supersededBy: input.supersededBy } : {}),
  });
}

export function createFactRecord<T>(input: CommonInput & Readonly<{
  evidence: GovernedEvidence<T>;
  provenance: GovernedProvenance;
}>): FactRecord<T> {
  return Object.freeze({
    ...common(input),
    class: "fact",
    value: input.evidence.value,
    evidence: input.evidence,
    provenance: input.provenance,
  });
}

export function createUserAssertionRecord<T>(input: CommonInput & Readonly<{
  value: T;
  statedAt: string;
}>): UserAssertionRecord<T> {
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
  value: T;
  source: "user" | "governed_system";
  statedAt: string;
}>): PlanRecord<T> {
  return Object.freeze({
    ...common(input),
    class: "plan",
    value: input.value,
    authorship: Object.freeze({ source: input.source, statedAt: input.statedAt }),
  });
}

export function createCommitmentRecord<T>(input: CommonInput & Readonly<{
  value: T;
  source: "user" | "governed_source";
  statedAt: string;
}>): CommitmentRecord<T> {
  return Object.freeze({
    ...common(input),
    class: "commitment",
    value: input.value,
    authorship: Object.freeze({ source: input.source, statedAt: input.statedAt }),
  });
}

export function createDecisionRecord<T>(input: CommonInput & Readonly<{
  value: T;
  source: "user" | "governed_decision_source";
  statedAt: string;
}>): DecisionRecord<T> {
  return Object.freeze({
    ...common(input),
    class: "decision",
    value: input.value,
    authorship: Object.freeze({ source: input.source, statedAt: input.statedAt }),
  });
}

export function createPreferenceRecord<T>(input: CommonInput & Readonly<{
  value: T;
  statedAt: string;
}>): PreferenceRecord<T> {
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
 * inside an OperatingPictureRecord. Keep this negative type assertion exported
 * only for compile-time regression files.
 */
export type ReusableAuthorityMustNotAppearInOperatingPicture = AuthorityEvidence<never> extends OperatingPictureRecord
  ? never
  : true;
