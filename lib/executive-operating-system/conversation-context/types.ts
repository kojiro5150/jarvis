import type { AvailabilityProvenance, NonComputableReason } from "../computation/availability";

export interface OccupiedIntervalView {
  readonly commitmentId: string;
  readonly start: string;
  readonly end: string;
}

export interface AvailableIntervalView {
  readonly start: string;
  readonly end: string;
}

export type ExecutiveContextUnknown =
  | { readonly kind: "unread_state_unavailable"; readonly field: "communications.unreadCount" }
  | { readonly kind: "next_commitment_unavailable"; readonly field: "commitments.nextCommitmentId" }
  | {
      readonly kind: "temporal_bounds_unavailable";
      readonly field: "availability.occupiedIntervals";
      readonly commitmentId: string;
      readonly reason: NonComputableReason;
    };

export interface ExecutiveContextProvenance {
  readonly situationalAwareness: {
    readonly snapshotId: string;
    readonly observedAt: string;
  };
  readonly availability: AvailabilityProvenance;
  readonly transformation: {
    readonly kind: "conversation_context_adapter";
    readonly version: "1.0.0";
  };
}

/** A bounded, internal representation of deterministic executive facts. */
export interface ExecutiveContext {
  readonly snapshotTimestamp: string;
  readonly computationTimestamp: string;
  readonly commitments: {
    readonly totalCount: number;
    readonly activeCommitmentIds: readonly string[];
    readonly nextCommitmentId?: string;
  };
  readonly availability: {
    readonly temporalOverlapCount: number;
    readonly occupiedIntervals: readonly OccupiedIntervalView[];
    readonly availableIntervals: readonly AvailableIntervalView[];
  };
  readonly communications: {
    readonly totalCount: number;
    readonly unreadCount?: number;
  };
  readonly unknowns: readonly ExecutiveContextUnknown[];
  readonly provenance: ExecutiveContextProvenance;
}
