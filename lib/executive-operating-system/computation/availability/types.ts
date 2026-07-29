import type { OperationalCommitment } from "../../situational-awareness/model";
import type { SituationalAwarenessSnapshot } from "../../situational-awareness/lifecycle";

/** A normalized UTC interval with constitutional half-open semantics: [start, end). */
export interface TemporalInterval {
  readonly start: string;
  readonly end: string;
}

export interface OccupiedInterval extends TemporalInterval {
  readonly commitmentId: string;
}

export interface TemporalOverlap extends TemporalInterval {
  readonly commitmentIds: readonly [string, string];
}

export type NonComputableReason =
  | "missing_start"
  | "missing_end"
  | "invalid_start"
  | "invalid_end"
  | "end_precedes_start"
  | "zero_duration";

export interface NonComputableCommitment {
  readonly commitmentId: string;
  readonly reason: NonComputableReason;
}

export interface AvailabilityProvenance {
  readonly kind: "deterministic_executive_computation";
  readonly engine: "availability";
  readonly version: "1.0.0";
  readonly sourceSnapshotId: string;
  readonly sourceObservedAt: string;
  readonly intervalSemantics: "[start,end)";
}

export interface AvailabilityState {
  readonly currentInstant: string;
  readonly activeCommitments: readonly OperationalCommitment[];
  readonly nextCommitment: OperationalCommitment | null;
  readonly occupiedIntervals: readonly OccupiedInterval[];
  readonly availableIntervals: readonly TemporalInterval[];
  readonly temporalOverlaps: readonly TemporalOverlap[];
  readonly nonComputableCommitments: readonly NonComputableCommitment[];
  /** Equal to the supplied computation instant; the engine never reads a clock. */
  readonly computationTimestamp: string;
  readonly provenance: AvailabilityProvenance;
}

export interface AvailabilityComputationWindow extends TemporalInterval {
  readonly currentInstant: string;
}

/** Structural input boundary intentionally excludes publications and connector values. */
export type AvailabilitySnapshot = SituationalAwarenessSnapshot;
