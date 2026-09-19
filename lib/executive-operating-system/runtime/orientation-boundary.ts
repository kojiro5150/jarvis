import {
  compareSituationalAwarenessSnapshots,
  type SituationalAwarenessChangeSet,
  type SituationalAwarenessSnapshot,
} from "../situational-awareness/lifecycle";

export type CanonicalOrientationSnapshot = SituationalAwarenessSnapshot;
export type CanonicalOrientationChangeSet = SituationalAwarenessChangeSet;

/**
 * Canonical runtime-owned lifecycle boundary for downstream orientation.
 *
 * Downstream cognition packages consume this boundary rather than importing
 * Situational Awareness projection/lifecycle internals directly.
 */
export function compareCanonicalOrientationSnapshots(
  previous: CanonicalOrientationSnapshot,
  current: CanonicalOrientationSnapshot,
): CanonicalOrientationChangeSet {
  return compareSituationalAwarenessSnapshots(previous, current);
}
