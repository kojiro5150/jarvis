import type { AttentionRecord, ExecutiveAttentionQueue } from "../attention";

export interface SituationFormationPolicyMetadata {
  readonly id: string;
  readonly version: string;
  readonly displayName: string;
  readonly description: string;
}

export interface SituationFormationContext { readonly currentSnapshotId: string; readonly queueId: string }
export interface SituationFormationGroup { readonly key: string; readonly reasonCode: string; readonly evidence: Readonly<Record<string, string>>; readonly records: readonly AttentionRecord[] }
export interface SituationFormationPolicy extends SituationFormationPolicyMetadata {
  form(records: readonly AttentionRecord[], context: SituationFormationContext): readonly SituationFormationGroup[];
}
export interface SituationMembershipReason { readonly code: string; readonly evidence: Readonly<Record<string, string>> }
export interface SituationMembership {
  readonly formationPolicyId: string;
  readonly formationPolicyVersion: string;
  readonly reason: SituationMembershipReason;
  readonly attentionRecord: AttentionRecord;
}
export interface ExecutiveSituation {
  readonly situationId: string;
  readonly currentSnapshotId: string;
  readonly formationPolicy: Readonly<{ id: string; version: string }>;
  readonly memberships: readonly SituationMembership[];
}
export interface ExecutiveSituationSummary {
  readonly attentionRecords: number;
  readonly executiveSituations: number;
  readonly singletonCount: number;
  readonly multiRecordCount: number;
  readonly recordsByPolicy: Readonly<Record<string, number>>;
}
export interface ExecutiveSituationSet {
  readonly currentSnapshotId: string;
  readonly queueId: string;
  readonly situations: readonly ExecutiveSituation[];
  readonly summary: ExecutiveSituationSummary;
}
export interface SituationFormationEngine { form(queue: ExecutiveAttentionQueue): ExecutiveSituationSet }
