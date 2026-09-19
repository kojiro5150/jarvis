import type { ExecutiveAttentionQueue } from "../attention";
import type { SituationAssessmentSet } from "../assessment";
import type { ExecutiveContext } from "../context";
import type { ExecutiveSituationSet } from "../situations";
import type {
  AttentionChangeDomain,
  AttentionChangeType,
  AttentionEvidence,
} from "../attention/types";
import type {
  SituationalAwarenessChangeSet,
  SituationalAwarenessSnapshot,
} from "../situational-awareness/lifecycle";

export const ORIENTATION_CHANGE_DOMAINS = [
  "identity",
  "context",
  "roles",
  "projects",
  "commitments",
  "communications",
  "waitingItems",
  "priorities",
  "activeWork",
  "sources",
] as const;

export type OrientationChangeDomain = typeof ORIENTATION_CHANGE_DOMAINS[number];

export interface OrientationDomainChangeSummary {
  readonly domain: OrientationChangeDomain;
  readonly added: number;
  readonly modified: number;
  readonly removed: number;
  readonly totalChanged: number;
}

export interface OrientationAttentionItem {
  readonly attentionId: string;
  readonly domain: AttentionChangeDomain;
  readonly changeType: AttentionChangeType;
  readonly entityId?: string;
  readonly policyId: string;
  readonly policyVersion: string;
  readonly reasonCode: string;
  readonly reasonMessage: string;
  readonly evidence: readonly AttentionEvidence[];
}

export interface OrientationCommunicationDependency {
  readonly sourceCommunicationId: string;
  readonly relation: "in_reply_to" | "references";
  readonly targetProtocolMessageId: string;
}

export interface OrientationSourceState {
  readonly sourceId: string;
  readonly kind: string;
  readonly status: string;
  readonly observedAt?: string;
}

export interface ExecutiveOrientation {
  readonly orientationId: string;
  readonly previousSnapshotId: string;
  readonly currentSnapshotId: string;
  readonly currentObservedAt: string;
  readonly changes: SituationalAwarenessChangeSet;
  readonly changeSummary: readonly OrientationDomainChangeSummary[];
  readonly attention: ExecutiveAttentionQueue;
  readonly attentionItems: readonly OrientationAttentionItem[];
  readonly situations: ExecutiveSituationSet;
  readonly assessment: SituationAssessmentSet;
  readonly context: ExecutiveContext;
  readonly communicationDependencies: readonly OrientationCommunicationDependency[];
  readonly sources: readonly OrientationSourceState[];
  readonly summary: Readonly<{
    totalChanged: number;
    changedDomains: number;
    communicationChanges: number;
    attentionRecords: number;
    situations: number;
    observations: number;
    explicitCommunicationDependencies: number;
  }>;
}

export interface ExecutiveOrientationInput {
  readonly previousSnapshot: SituationalAwarenessSnapshot;
  readonly currentSnapshot: SituationalAwarenessSnapshot;
}
