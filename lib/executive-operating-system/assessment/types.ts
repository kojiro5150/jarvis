import type { AttentionRecord } from "../attention";
import type { ExecutiveSituation, ExecutiveSituationSet } from "../situations";

export type AssessmentEvidenceValue = string | number | boolean | null | readonly AssessmentEvidenceValue[] | Readonly<{ [key: string]: AssessmentEvidenceValue }>;
export interface SituationAssessmentPolicyMetadata { readonly id: string; readonly version: string; readonly observationType: string; readonly description: string }
export interface SituationAssessmentMetadata { readonly situationId: string; readonly currentSnapshotId: string; readonly policySet: readonly Readonly<{ id: string; version: string }>[] }
export interface SituationAssessmentObservation {
  readonly observationId: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly observationType: string;
  readonly supportingEvidence: Readonly<Record<string, AssessmentEvidenceValue>>;
  readonly originatingAttentionRecordIds: readonly string[];
  readonly originatingSituationId: string;
}
export interface SituationAssessmentPolicy extends SituationAssessmentPolicyMetadata {
  applies(situation: ExecutiveSituation): boolean;
  observe(situation: ExecutiveSituation): readonly Omit<SituationAssessmentObservation, "observationId" | "policyId" | "policyVersion" | "observationType" | "originatingSituationId">[];
}
export interface SituationAssessment { readonly assessmentId: string; readonly metadata: SituationAssessmentMetadata; readonly observations: readonly SituationAssessmentObservation[] }
export interface SituationAssessmentSummary { readonly situations: number; readonly assessments: number; readonly observationCount: number; readonly observationsByPolicy: Readonly<Record<string, number>>; readonly observationsByType: Readonly<Record<string, number>> }
export interface SituationAssessmentSet { readonly currentSnapshotId: string; readonly situationSetId: string; readonly assessments: readonly SituationAssessment[]; readonly summary: SituationAssessmentSummary }
export interface AssessmentRegistryContract { register(policy: SituationAssessmentPolicy): void; policies(): readonly SituationAssessmentPolicy[]; metadata(): readonly SituationAssessmentPolicyMetadata[] }
export interface AssessmentEngine { assess(situations: ExecutiveSituationSet): SituationAssessmentSet }

export type AssessmentAttentionRecord = AttentionRecord;
