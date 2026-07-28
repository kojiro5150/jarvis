import type { ExecutiveContext as LegacyAssessedContext } from "../context";
import type { ExecutiveContextSnapshot } from "../../executive-context";
import type { SituationAssessmentSet, AssessmentEvidenceValue } from "../assessment";

export interface DeliberationLifecycleComparison { readonly previousSnapshotId: string; readonly currentSnapshotId: string; readonly previousObservedAt: string; readonly currentObservedAt: string }

export type DeliberationValue = AssessmentEvidenceValue;
export interface DeliberationConfiguration {
  readonly reasoningConstraints?: readonly string[];
  readonly assumptions?: readonly string[];
  readonly requiredDecisions?: readonly string[];
}
export interface DeliberativeConcern {
  readonly assessmentId: string;
  readonly situationId: string;
  readonly priority: number;
  readonly observationIds: readonly string[];
}
export interface ExecutiveDeliberationContext extends LegacyAssessedContext {
  readonly deliberationContextId?: string;
  readonly executiveStateId?: string;
  readonly executiveContextId?: string;
  readonly situationAssessmentSetId?: string;
  readonly lifecycleComparisonId?: string;
  readonly deliberativeScope?: Readonly<{ readonly situationIds: readonly string[]; readonly observationBoundary: string }>;
  readonly activeExecutiveConcerns?: readonly DeliberativeConcern[];
  readonly assessedPriorities?: readonly Readonly<{ readonly assessmentId: string; readonly priority: number }>[];
  readonly executiveReasoningConstraints?: readonly string[];
  readonly executiveAssumptions?: readonly string[];
  readonly unresolvedUncertainty?: readonly Readonly<{ readonly observationId: string; readonly evidence: Readonly<Record<string, DeliberationValue>> }>[];
  readonly requiredExecutiveDecisions?: readonly string[];
  readonly deliberativeMetadata?: Readonly<{
    readonly contractVersion: "executive-deliberation-context-v1";
    readonly engineVersion: "1.0.0";
    readonly assessmentIds: readonly string[];
    readonly policyVersion: "1.0.0";
  }>;
}
export interface ExecutiveDeliberationContextInput {
  readonly executiveContextSnapshot: ExecutiveContextSnapshot;
  readonly assessmentSet: SituationAssessmentSet;
  readonly lifecycleComparison: DeliberationLifecycleComparison;
  readonly configuration?: DeliberationConfiguration;
}
export interface ExecutiveDeliberationContextEngine { construct(input: ExecutiveDeliberationContextInput): ExecutiveDeliberationContext }
