import { randomUUID } from "node:crypto";

import type {
  CanonicalCalendarAttentionObservation,
  CanonicalCalendarAttentionObservationSet,
} from "../governed-conversation/calendar-attention-observation";

export type CalendarAttentionObservationReference = Readonly<{
  calendarAttentionObservationReferenceId: string;
}>;

type StoredCalendarAttentionObservation = Readonly<{
  id: string;
  reference: CalendarAttentionObservationReference;
  set: CanonicalCalendarAttentionObservationSet;
}>;

const observations = new Map<string, StoredCalendarAttentionObservation>();

const cloneObservation = (
  observation: CanonicalCalendarAttentionObservation,
): CanonicalCalendarAttentionObservation => Object.freeze({
  id: observation.id,
  startsAt: observation.startsAt,
  endsAt: observation.endsAt,
  observedAt: observation.observedAt,
  timezone: observation.timezone,
  sourceReference: Object.freeze({
    sourceId: observation.sourceReference.sourceId,
    resourceId: observation.sourceReference.resourceId,
    field: observation.sourceReference.field,
    observedAt: observation.sourceReference.observedAt,
  }),
  provenanceReference: observation.provenanceReference,
  coverageLimit: observation.coverageLimit,
  policyReference: observation.policyReference,
});

const cloneSet = (
  set: CanonicalCalendarAttentionObservationSet,
): CanonicalCalendarAttentionObservationSet => Object.freeze({
  sourceId: set.sourceId,
  observedAt: set.observedAt,
  windowStart: set.windowStart,
  windowEnd: set.windowEnd,
  requestedLimit: set.requestedLimit,
  coverageState: set.coverageState,
  coverageLimit: set.coverageLimit,
  policyReference: set.policyReference,
  observations: Object.freeze(set.observations.map(cloneObservation)),
});

function isReference(value: unknown): value is CalendarAttentionObservationReference {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const descriptor = Object.getOwnPropertyDescriptor(value, "calendarAttentionObservationReferenceId");
  return descriptor !== undefined
    && "value" in descriptor
    && typeof descriptor.value === "string"
    && descriptor.value.trim().length > 0;
}

/**
 * Stores a canonical Calendar attention observation set in module-private
 * server state and returns only an opaque, non-authoritative reference.
 *
 * The reference grants no Calendar authority and contains no observation data.
 */
export function createCalendarAttentionObservationReference(
  set: CanonicalCalendarAttentionObservationSet,
): CalendarAttentionObservationReference {
  const id = randomUUID();
  const reference = Object.freeze({ calendarAttentionObservationReferenceId: id });
  observations.set(id, Object.freeze({ id, reference, set: cloneSet(set) }));
  return reference;
}

/**
 * Resolves only references previously created by this server process.
 * Client-carried fields other than the opaque identifier are ignored.
 */
export function resolveCalendarAttentionObservationReference(
  reference: unknown,
): CanonicalCalendarAttentionObservationSet | null {
  if (!isReference(reference)) return null;
  const stored = observations.get(reference.calendarAttentionObservationReferenceId);
  return stored ? cloneSet(stored.set) : null;
}

/**
 * Rotates the caller's previous observation reference to a new canonical set.
 *
 * The old reference is deleted only when it was valid server-owned state.
 * A fabricated or unknown reference cannot delete any stored observation.
 */
export function rotateCalendarAttentionObservationReference(input: {
  readonly previousReference: unknown;
  readonly currentSet: CanonicalCalendarAttentionObservationSet;
}): CalendarAttentionObservationReference {
  if (isReference(input.previousReference)
      && observations.has(input.previousReference.calendarAttentionObservationReferenceId)) {
    observations.delete(input.previousReference.calendarAttentionObservationReferenceId);
  }
  return createCalendarAttentionObservationReference(input.currentSet);
}
