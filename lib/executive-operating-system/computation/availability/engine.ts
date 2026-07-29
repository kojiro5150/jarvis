import type { OperationalCommitment } from "../../situational-awareness/model";
import type {
  AvailabilityComputationWindow, AvailabilitySnapshot, AvailabilityState, NonComputableCommitment,
  NonComputableReason, OccupiedInterval, TemporalInterval, TemporalOverlap,
} from "./types";

const rfc3339 = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;

function instant(value: string, path: string): number {
  const parsed = typeof value === "string" && rfc3339.test(value) ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(parsed)) throw new Error(`${path} must be an RFC 3339 timestamp`);
  return parsed;
}

function iso(milliseconds: number): string { return new Date(milliseconds).toISOString(); }

function bounds(commitment: OperationalCommitment): { start: number; end: number } | NonComputableReason {
  if (commitment.startsAt === undefined) return "missing_start";
  if (commitment.dueAt === undefined) return "missing_end";
  const start = rfc3339.test(commitment.startsAt) ? Date.parse(commitment.startsAt) : Number.NaN;
  const end = rfc3339.test(commitment.dueAt) ? Date.parse(commitment.dueAt) : Number.NaN;
  if (!Number.isFinite(start)) return "invalid_start";
  if (!Number.isFinite(end)) return "invalid_end";
  if (end < start) return "end_precedes_start";
  if (end === start) return "zero_duration";
  return { start, end };
}

function freeze<T extends object>(value: T): Readonly<T> { return Object.freeze(value); }

/**
 * Computes temporal facts only. It does not consult a clock, connector, publication,
 * or deliberation stage. Intervals are half-open: a commitment is active when start <= T < end.
 */
export class AvailabilityEngine {
  compute(snapshot: AvailabilitySnapshot, window: AvailabilityComputationWindow): AvailabilityState {
    if (!snapshot?.state || !Array.isArray(snapshot.state.commitments)) {
      throw new Error("snapshot must be a completed Situational Awareness snapshot");
    }
    const current = instant(window?.currentInstant, "window.currentInstant");
    const windowStart = instant(window?.start, "window.start");
    const windowEnd = instant(window?.end, "window.end");
    if (windowEnd < windowStart) throw new Error("window.end must not precede window.start");

    const computable: { commitment: OperationalCommitment; start: number; end: number }[] = [];
    const nonComputable: NonComputableCommitment[] = [];
    for (const commitment of snapshot.state.commitments) {
      const result = bounds(commitment);
      if (typeof result === "string") nonComputable.push(freeze({ commitmentId: commitment.id, reason: result }));
      else computable.push({ commitment, ...result });
    }
    computable.sort((a, b) => a.start - b.start || a.end - b.end || a.commitment.id.localeCompare(b.commitment.id));
    nonComputable.sort((a, b) => a.commitmentId.localeCompare(b.commitmentId));

    const occupied: OccupiedInterval[] = computable.map(({ commitment, start, end }) => freeze({
      commitmentId: commitment.id, start: iso(start), end: iso(end),
    }));
    const overlaps: TemporalOverlap[] = [];
    for (let left = 0; left < computable.length; left += 1) {
      for (let right = left + 1; right < computable.length; right += 1) {
        const a = computable[left]; const b = computable[right];
        if (b.start >= a.end) break;
        const start = Math.max(a.start, b.start); const end = Math.min(a.end, b.end);
        if (start < end) overlaps.push(freeze({
          commitmentIds: freeze([a.commitment.id, b.commitment.id]) as readonly [string, string],
          start: iso(start), end: iso(end),
        }));
      }
    }

    const clipped = computable
      .map(({ start, end }) => ({ start: Math.max(start, windowStart), end: Math.min(end, windowEnd) }))
      .filter(({ start, end }) => start < end)
      .sort((a, b) => a.start - b.start || a.end - b.end);
    const merged: { start: number; end: number }[] = [];
    for (const interval of clipped) {
      const last = merged[merged.length - 1];
      if (last && interval.start <= last.end) last.end = Math.max(last.end, interval.end);
      else merged.push({ ...interval });
    }
    const available: TemporalInterval[] = [];
    let cursor = windowStart;
    for (const interval of merged) {
      if (cursor < interval.start) available.push(freeze({ start: iso(cursor), end: iso(interval.start) }));
      cursor = Math.max(cursor, interval.end);
    }
    if (cursor < windowEnd) available.push(freeze({ start: iso(cursor), end: iso(windowEnd) }));

    const active = computable.filter(({ start, end }) => start <= current && current < end).map(({ commitment }) => commitment);
    const next = computable.find(({ start }) => start > current)?.commitment ?? null;
    return freeze({
      currentInstant: iso(current), activeCommitments: freeze(active), nextCommitment: next,
      occupiedIntervals: freeze(occupied), availableIntervals: freeze(available),
      temporalOverlaps: freeze(overlaps), nonComputableCommitments: freeze(nonComputable),
      computationTimestamp: iso(current),
      provenance: freeze({ kind: "deterministic_executive_computation", engine: "availability", version: "1.0.0",
        sourceSnapshotId: snapshot.snapshotId, sourceObservedAt: snapshot.observedAt, intervalSemantics: "[start,end)" }),
    });
  }
}
