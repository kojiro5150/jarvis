import type { AvailabilitySnapshot, AvailabilityState } from "../computation/availability";
import type { ExecutiveContext, ExecutiveContextUnknown } from "./types";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

/**
 * Copies completed deterministic outputs into a conversational representation.
 * It deliberately performs no temporal computation or behavioural inference.
 */
export class ConversationContextAdapter {
  adapt(snapshot: AvailabilitySnapshot, availability: AvailabilityState): ExecutiveContext {
    if (availability.provenance.sourceSnapshotId !== snapshot.snapshotId ||
        availability.provenance.sourceObservedAt !== snapshot.observedAt) {
      throw new Error("availability provenance does not identify the supplied Situational Awareness snapshot");
    }

    const unknowns: ExecutiveContextUnknown[] = [
      { kind: "unread_state_unavailable", field: "communications.unreadCount" },
      ...availability.nonComputableCommitments.map(({ commitmentId, reason }) => ({
        kind: "temporal_bounds_unavailable" as const,
        field: "availability.occupiedIntervals" as const,
        commitmentId,
        reason,
      })),
    ];
    if (availability.nextCommitment === null) {
      unknowns.push({ kind: "next_commitment_unavailable", field: "commitments.nextCommitmentId" });
    }

    return deepFreeze({
      snapshotTimestamp: snapshot.observedAt,
      computationTimestamp: availability.computationTimestamp,
      commitments: {
        totalCount: snapshot.state.commitments.length,
        activeCommitmentIds: availability.activeCommitments.map(({ id }) => id),
        ...(availability.nextCommitment === null ? {} : { nextCommitmentId: availability.nextCommitment.id }),
      },
      availability: {
        temporalOverlapCount: availability.temporalOverlaps.length,
        occupiedIntervals: availability.occupiedIntervals.map(({ commitmentId, start, end }) => ({ commitmentId, start, end })),
        availableIntervals: availability.availableIntervals.map(({ start, end }) => ({ start, end })),
      },
      communications: { totalCount: snapshot.state.communications.length },
      unknowns,
      provenance: {
        situationalAwareness: { snapshotId: snapshot.snapshotId, observedAt: snapshot.observedAt },
        availability: { ...availability.provenance },
        transformation: { kind: "conversation_context_adapter", version: "1.0.0" },
      },
    });
  }
}
