import type { CanonicalCalendarAttentionObservation, CanonicalCalendarAttentionObservationSet } from "./calendar-attention-observation";

export type CalendarAttentionObservationChange =
  | { readonly type: "added"; readonly id: string; readonly current: CanonicalCalendarAttentionObservation }
  | { readonly type: "removed"; readonly id: string; readonly previous: CanonicalCalendarAttentionObservation }
  | { readonly type: "modified"; readonly id: string; readonly previous: CanonicalCalendarAttentionObservation; readonly current: CanonicalCalendarAttentionObservation };

export interface CalendarAttentionObservationChangeSet {
  readonly previousObservedAt: string;
  readonly currentObservedAt: string;
  readonly coverageLimit: string;
  readonly policyReference: string;
  readonly changes: readonly CalendarAttentionObservationChange[];
}

const compareText = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0;

function compatible(previous: CanonicalCalendarAttentionObservationSet, current: CanonicalCalendarAttentionObservationSet): void {
  if (previous.sourceId !== current.sourceId) throw new Error("Calendar attention observation sets have incompatible source identity");
  if (previous.coverageLimit !== current.coverageLimit) throw new Error("Calendar attention observation sets have incompatible coverage");
  if (previous.policyReference !== current.policyReference) throw new Error("Calendar attention observation sets have incompatible disclosure policy");
  if (Date.parse(current.observedAt) < Date.parse(previous.observedAt)) throw new Error("current Calendar attention observation set must not precede previous set");
}

function stableIdentity(previous: CanonicalCalendarAttentionObservation, current: CanonicalCalendarAttentionObservation): void {
  if (previous.id !== current.id ||
      previous.sourceReference.sourceId !== current.sourceReference.sourceId ||
      previous.sourceReference.resourceId !== current.sourceReference.resourceId ||
      previous.sourceReference.field !== current.sourceReference.field ||
      previous.provenanceReference !== current.provenanceReference) {
    throw new Error(`Calendar attention observation identity changed for ${previous.id}`);
  }
}

function scheduleChanged(previous: CanonicalCalendarAttentionObservation, current: CanonicalCalendarAttentionObservation): boolean {
  return previous.startsAt !== current.startsAt ||
    previous.endsAt !== current.endsAt ||
    previous.timezone !== current.timezone;
}

/**
 * Compares caller-owned previous/current governed Calendar observation sets.
 * It does not persist history, acquire sources, rank changes, or invoke attention policies.
 */
export function compareCalendarAttentionObservationSets(
  previous: CanonicalCalendarAttentionObservationSet,
  current: CanonicalCalendarAttentionObservationSet,
): CalendarAttentionObservationChangeSet {
  if (!previous || !current) throw new Error("previous and current Calendar attention observation sets are required");
  compatible(previous, current);

  const before = new Map(previous.observations.map(item => [item.id, item]));
  const after = new Map(current.observations.map(item => [item.id, item]));
  const ids = [...new Set([...before.keys(), ...after.keys()])].sort(compareText);
  const membershipChanged = ids.some(id => !before.has(id) || !after.has(id));

  if (membershipChanged &&
      (previous.coverageState !== "bounded_complete_request" || current.coverageState !== "bounded_complete_request")) {
    throw new Error("Calendar attention observation membership comparison requires bounded_complete_request coverage");
  }

  const changes: CalendarAttentionObservationChange[] = [];
  for (const id of ids) {
    const oldValue = before.get(id);
    const newValue = after.get(id);
    if (!oldValue) {
      changes.push(Object.freeze({ type: "added", id, current: newValue! }));
      continue;
    }
    if (!newValue) {
      changes.push(Object.freeze({ type: "removed", id, previous: oldValue }));
      continue;
    }
    stableIdentity(oldValue, newValue);
    if (scheduleChanged(oldValue, newValue)) {
      changes.push(Object.freeze({ type: "modified", id, previous: oldValue, current: newValue }));
    }
  }

  return Object.freeze({
    previousObservedAt: previous.observedAt,
    currentObservedAt: current.observedAt,
    coverageLimit: previous.coverageLimit,
    policyReference: previous.policyReference,
    changes: Object.freeze(changes),
  });
}
