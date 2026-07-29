import { describe, expect, it } from "vitest";
import { AvailabilityEngine } from "../computation/availability";
import { createSituationalAwareness, type OperationalCommitment } from "../situational-awareness/model";
import { createSituationalAwarenessSnapshot } from "../situational-awareness/lifecycle";
import { ConversationContextAdapter } from "./adapter";

const commitment = (id: string, startsAt?: string, dueAt?: string): OperationalCommitment => ({
  id, title: id, kind: "meeting", status: "scheduled", roleIds: [], projectIds: [],
  ...(startsAt ? { startsAt } : {}), ...(dueAt ? { dueAt } : {}),
});

function inputs() {
  const snapshot = createSituationalAwarenessSnapshot({
    snapshotId: "snapshot-348", observedAt: "2026-07-29T08:00:00Z",
    state: createSituationalAwareness({
      identity: { userId: "executive", displayName: "Executive" },
      commitments: [
        commitment("active", "2026-07-29T09:00:00Z", "2026-07-29T10:30:00Z"),
        commitment("overlap", "2026-07-29T09:30:00Z", "2026-07-29T11:00:00Z"),
        commitment("next", "2026-07-29T12:00:00Z", "2026-07-29T12:30:00Z"),
        commitment("unknown-time", undefined, "2026-07-29T13:00:00Z"),
      ],
      communications: [{ id: "message-1", sender: "sender@example.test", recipients: ["executive@example.test"], sentAt: "2026-07-29T07:00:00Z", references: [] }],
    }),
  });
  const availability = new AvailabilityEngine().compute(snapshot, {
    currentInstant: "2026-07-29T10:00:00Z", start: "2026-07-29T08:00:00Z", end: "2026-07-29T14:00:00Z",
  });
  return { snapshot, availability };
}

describe("ConversationContextAdapter", () => {
  it("constructs the bounded context by preserving deterministic references and counts", () => {
    const { snapshot, availability } = inputs();
    const context = new ConversationContextAdapter().adapt(snapshot, availability);
    expect(context.commitments).toEqual({ totalCount: 4, activeCommitmentIds: ["active", "overlap"], nextCommitmentId: "next" });
    expect(context.availability.temporalOverlapCount).toBe(1);
    expect(context.availability.occupiedIntervals).toEqual(availability.occupiedIntervals);
    expect(context.availability.availableIntervals).toEqual(availability.availableIntervals);
    expect(context.communications).toEqual({ totalCount: 1 });
    expect(context.communications).not.toHaveProperty("unreadCount");
    expect(context.communications).not.toHaveProperty("requiresReview");
    expect(context.communications).not.toHaveProperty("needsAttention");
  });

  it("propagates explicit unknowns rather than substituting values", () => {
    const { snapshot, availability } = inputs();
    const context = new ConversationContextAdapter().adapt(snapshot, availability);
    expect(context.unknowns).toContainEqual({ kind: "unread_state_unavailable", field: "communications.unreadCount" });
    expect(context.unknowns).toContainEqual({ kind: "temporal_bounds_unavailable", field: "availability.occupiedIntervals", commitmentId: "unknown-time", reason: "missing_start" });
  });

  it("preserves source, computation, and transformation provenance", () => {
    const { snapshot, availability } = inputs();
    expect(new ConversationContextAdapter().adapt(snapshot, availability).provenance).toEqual({
      situationalAwareness: { snapshotId: snapshot.snapshotId, observedAt: snapshot.observedAt },
      availability: availability.provenance,
      transformation: { kind: "conversation_context_adapter", version: "1.0.0" },
    });
  });

  it("is immutable at every nested representation boundary", () => {
    const { snapshot, availability } = inputs();
    const context = new ConversationContextAdapter().adapt(snapshot, availability);
    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.commitments.activeCommitmentIds)).toBe(true);
    expect(Object.isFrozen(context.availability.occupiedIntervals[0])).toBe(true);
    expect(Object.isFrozen(context.provenance.availability)).toBe(true);
  });

  it("replays identically and contains no connector-native representation", () => {
    const { snapshot, availability } = inputs();
    const adapter = new ConversationContextAdapter();
    const first = adapter.adapt(snapshot, availability);
    const replay = adapter.adapt(JSON.parse(JSON.stringify(snapshot)), JSON.parse(JSON.stringify(availability)));
    expect(replay).toEqual(first);
    expect(JSON.stringify(first)).not.toMatch(/google|gmail|connector|artifact/i);
  });

  it("represents absence of a next commitment as unknown", () => {
    const { snapshot } = inputs();
    const availability = new AvailabilityEngine().compute(snapshot, {
      currentInstant: "2026-07-29T14:00:00Z", start: "2026-07-29T14:00:00Z", end: "2026-07-29T15:00:00Z",
    });
    const context = new ConversationContextAdapter().adapt(snapshot, availability);
    expect(context.commitments).not.toHaveProperty("nextCommitmentId");
    expect(context.unknowns).toContainEqual({ kind: "next_commitment_unavailable", field: "commitments.nextCommitmentId" });
  });

  it("rejects mismatched provenance and never invokes temporal computation", () => {
    const { snapshot, availability } = inputs();
    const adapter = new ConversationContextAdapter();
    const compute = AvailabilityEngine.prototype.compute;
    AvailabilityEngine.prototype.compute = () => { throw new Error("adapter recomputed availability"); };
    try { expect(adapter.adapt(snapshot, availability).availability.temporalOverlapCount).toBe(1); }
    finally { AvailabilityEngine.prototype.compute = compute; }
    expect(() => adapter.adapt({ ...snapshot, snapshotId: "different" }, availability)).toThrow(/provenance/);
  });
});
