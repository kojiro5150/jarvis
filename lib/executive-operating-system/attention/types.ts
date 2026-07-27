import type { OperationalCommitment, OperationalContext, OperationalIdentity, OperationalPriority, OperationalProject, OperationalRole, OperationalSourceState, OperationalWaitingItem, OperationalWorkItem } from "../situational-awareness/model";

export const ATTENTION_DOMAINS = ["identity", "context", "roles", "projects", "commitments", "waitingItems", "priorities", "activeWork", "sources"] as const;
export type AttentionChangeDomain = typeof ATTENTION_DOMAINS[number];
export type AttentionChangeType = "added" | "modified" | "removed";
export type AttentionCanonicalValue = OperationalIdentity | OperationalContext | OperationalRole | OperationalProject | OperationalCommitment | OperationalWaitingItem | OperationalPriority | OperationalWorkItem | OperationalSourceState;
export type AttentionEvidenceValue = string | number | boolean | null;

export interface AttentionEvidence { readonly field: string; readonly value: AttentionEvidenceValue }
export interface AttentionReason { readonly code: string; readonly message: string; readonly evidence: readonly AttentionEvidence[] }
export type AttentionPolicyResult = { readonly matched: false } | { readonly matched: true; readonly reason: AttentionReason };
export interface AttentionPolicyMetadata { readonly id: string; readonly version: string; readonly description: string; readonly appliesTo: readonly AttentionChangeDomain[] }
export interface AttentionPolicyReference { readonly id: string; readonly version: string }
export interface AttentionEvaluationContext { readonly previousSnapshotId: string; readonly currentSnapshotId: string }
export interface CanonicalAttentionChange {
  readonly domain: AttentionChangeDomain; readonly changeType: AttentionChangeType; readonly entityId?: string;
  readonly previous?: AttentionCanonicalValue; readonly current?: AttentionCanonicalValue;
  readonly previousSnapshotId: string; readonly currentSnapshotId: string;
}
export interface AttentionPolicy extends AttentionPolicyMetadata {
  evaluate(change: CanonicalAttentionChange, context: AttentionEvaluationContext): AttentionPolicyResult;
}
export interface AttentionRecord extends CanonicalAttentionChange {
  readonly attentionId: string; readonly policy: AttentionPolicyReference; readonly reason: AttentionReason;
}
export interface ExecutiveAttentionSummary {
  readonly evaluatedChanges: number; readonly elevatedChanges: number; readonly attentionRecords: number; readonly matchedPolicies: number;
  readonly byDomain: Readonly<Record<AttentionChangeDomain, number>>;
  readonly byChangeType: Readonly<Record<AttentionChangeType, number>>;
}
export interface ExecutiveAttentionQueue {
  readonly queueId: string; readonly previousSnapshotId: string; readonly currentSnapshotId: string;
  readonly policySet: readonly AttentionPolicyReference[]; readonly records: readonly AttentionRecord[]; readonly summary: ExecutiveAttentionSummary;
}

