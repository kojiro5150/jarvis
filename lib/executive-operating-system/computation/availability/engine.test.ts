import { describe, expect, it } from "vitest";
import { createSituationalAwareness } from "../../situational-awareness/model";
import { createSituationalAwarenessSnapshot } from "../../situational-awareness/lifecycle";
import type { OperationalCommitment } from "../../situational-awareness/model";
import { AvailabilityEngine } from "./engine";

const day = { currentInstant: "2026-07-29T09:30:00Z", start: "2026-07-29T08:00:00Z", end: "2026-07-29T13:00:00Z" };
function commitment(id: string, start?: string, end?: string): OperationalCommitment {
  return { id, title: id, kind: "meeting", status: "scheduled", roleIds: [], projectIds: [],
    ...(start === undefined ? {} : { startsAt: start }), ...(end === undefined ? {} : { dueAt: end }) };
}
function snapshot(commitments: readonly OperationalCommitment[]) {
  return createSituationalAwarenessSnapshot({ snapshotId: "snapshot-1", observedAt: "2026-07-29T07:00:00Z",
    state: createSituationalAwareness({ identity: { userId: "u", displayName: "User" }, commitments }) });
}
const compute = (items: readonly OperationalCommitment[], window = day) => new AvailabilityEngine().compute(snapshot(items), window);

describe("AvailabilityEngine", () => {
  it("treats adjacent commitments as non-overlapping half-open intervals", () => {
    const state = compute([commitment("a", "2026-07-29T09:00:00Z", "2026-07-29T09:30:00Z"), commitment("b", "2026-07-29T09:30:00Z", "2026-07-29T10:00:00Z")]);
    expect(state.temporalOverlaps).toEqual([]);
    expect(state.activeCommitments.map(({ id }) => id)).toEqual(["b"]);
  });

  it("finds strict, nested, and multiple simultaneous pairwise overlaps", () => {
    const state = compute([commitment("outer", "2026-07-29T09:00:00Z", "2026-07-29T11:00:00Z"), commitment("inner", "2026-07-29T09:15:00Z", "2026-07-29T10:00:00Z"), commitment("third", "2026-07-29T09:20:00Z", "2026-07-29T09:40:00Z")]);
    expect(state.temporalOverlaps).toHaveLength(3);
    expect(state.activeCommitments.map(({ id }) => id)).toEqual(["outer", "inner", "third"]);
    expect(state.temporalOverlaps[0]).toMatchObject({ start: "2026-07-29T09:15:00.000Z", end: "2026-07-29T10:00:00.000Z" });
  });

  it("computes the complement of merged occupancy", () => {
    const state = compute([commitment("a", "2026-07-29T09:00:00Z", "2026-07-29T10:00:00Z"), commitment("b", "2026-07-29T09:30:00Z", "2026-07-29T11:00:00Z")]);
    expect(state.availableIntervals).toEqual([
      { start: "2026-07-29T08:00:00.000Z", end: "2026-07-29T09:00:00.000Z" },
      { start: "2026-07-29T11:00:00.000Z", end: "2026-07-29T13:00:00.000Z" },
    ]);
  });

  it("returns the entire window when there are no commitments", () => {
    expect(compute([]).availableIntervals).toEqual([{ start: "2026-07-29T08:00:00.000Z", end: "2026-07-29T13:00:00.000Z" }]);
  });

  it("selects the earliest commitment strictly after T with deterministic tie ordering", () => {
    const state = compute([commitment("z", "2026-07-29T10:00:00Z", "2026-07-29T11:00:00Z"), commitment("a", "2026-07-29T10:00:00Z", "2026-07-29T10:30:00Z")]);
    expect(state.nextCommitment?.id).toBe("a");
  });

  it.each([
    [commitment("missing-start", undefined, "2026-07-29T10:00:00Z"), "missing_start"],
    [commitment("missing-end", "2026-07-29T09:00:00Z"), "missing_end"],
    [commitment("zero", "2026-07-29T09:00:00Z", "2026-07-29T09:00:00Z"), "zero_duration"],
    [commitment("all-day", "2026-07-29", "2026-07-30"), "invalid_start"],
  ])("reports non-computable temporal observations without occupying time", (item, reason) => {
    const state = compute([item]);
    expect(state.nonComputableCommitments).toEqual([{ commitmentId: item.id, reason }]);
    expect(state.occupiedIntervals).toEqual([]);
    expect(state.availableIntervals).toHaveLength(1);
  });

  it("compares cross-timezone bounds only after instant normalization", () => {
    const state = compute([commitment("offset", "2026-07-29T11:00:00+02:00", "2026-07-29T12:00:00+02:00"), commitment("utc", "2026-07-29T09:30:00Z", "2026-07-29T10:30:00Z")]);
    expect(state.temporalOverlaps[0]).toMatchObject({ start: "2026-07-29T09:30:00.000Z", end: "2026-07-29T10:00:00.000Z" });
  });

  it("replays deterministically and retains only snapshot provenance", () => {
    const input = snapshot([commitment("a", "2026-07-29T09:00:00Z", "2026-07-29T10:00:00Z")]);
    const engine = new AvailabilityEngine();
    const first = engine.compute(input, day); const replay = engine.compute(JSON.parse(JSON.stringify(input)), day);
    expect(replay).toEqual(first);
    expect(first.computationTimestamp).toBe("2026-07-29T09:30:00.000Z");
    expect(first.provenance).toMatchObject({ sourceSnapshotId: "snapshot-1", kind: "deterministic_executive_computation" });
    expect(JSON.stringify(first)).not.toContain("google");
  });
});
