import type { AssessmentEvidenceValue, SituationAssessmentSet } from "../assessment";

export type ContextEvidence = AssessmentEvidenceValue;
export interface ContextMetadata { readonly policyId: string; readonly policyVersion: string; readonly description: string }
export interface ContextSection { readonly sectionId: string; readonly entries: readonly Readonly<Record<string, ContextEvidence>>[]; readonly metadata: readonly ContextMetadata[] }
export interface ContextStatistics { readonly statisticId: string; readonly value: number; readonly dimensions: Readonly<Record<string, string>> }
export interface ExecutiveContextSummary { readonly sectionCount: number; readonly statisticCount: number; readonly situationCount: number; readonly assessmentCount: number; readonly attentionRecordCount: number; readonly observationCount: number }
export interface ContextPolicyMetadata { readonly id: string; readonly version: string; readonly description: string; readonly sectionId: string }
export interface ContextPolicyContribution { readonly entries: readonly Readonly<Record<string, ContextEvidence>>[]; readonly statistics: readonly ContextStatistics[] }
export interface ContextPolicy extends ContextPolicyMetadata { construct(assessmentSet: SituationAssessmentSet): ContextPolicyContribution }
export interface ExecutiveContext { readonly contextId: string; readonly snapshotId: string; readonly assessmentSetId: string; readonly sections: readonly ContextSection[]; readonly statistics: readonly ContextStatistics[]; readonly summary: ExecutiveContextSummary; readonly canonicalProvenance: Readonly<{ snapshotId: string; assessmentSetId: string; situationSetId: string; policies: readonly Readonly<{ id: string; version: string }>[] }> }
export interface ContextRegistry { register(policy: ContextPolicy): void; policies(): readonly ContextPolicy[]; metadata(): readonly ContextPolicyMetadata[] }
export interface ContextEngine { construct(assessmentSet: SituationAssessmentSet): ExecutiveContext }
