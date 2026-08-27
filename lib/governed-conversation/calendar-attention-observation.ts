import type { GovernedCalendarEvidenceInput } from "./projection-composer";

export interface CanonicalCalendarAttentionObservation {
  readonly id: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly observedAt: string;
  readonly timezone: string;
  readonly sourceReference: GovernedCalendarEvidenceInput["sourceReference"];
  readonly provenanceReference: string;
  readonly coverageLimit: string;
  readonly policyReference: string;
}


export interface CanonicalCalendarAttentionObservationSet {
  readonly sourceId: "google-calendar";
  readonly observedAt: string;
  readonly windowStart: string;
  readonly windowEnd: string;
  readonly requestedLimit: number;
  readonly coverageState: "bounded_complete_request" | "bounded_partial_request" | "bounded";
  readonly coverageLimit: string;
  readonly policyReference: string;
  readonly observations: readonly CanonicalCalendarAttentionObservation[];
}

const rfc3339 = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;

function required(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${path} must be a non-empty string`);
}

function timestamp(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || !rfc3339.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${path} must be an RFC 3339 timestamp`);
  }
}

function cloneReference(reference: GovernedCalendarEvidenceInput["sourceReference"]): GovernedCalendarEvidenceInput["sourceReference"] {
  return Object.freeze({
    sourceId: reference.sourceId,
    resourceId: reference.resourceId,
    field: reference.field,
    observedAt: reference.observedAt,
  });
}

/**
 * Converts already-authorised governed Calendar evidence into the minimum
 * stable observation required by the attention path.
 *
 * This function performs no acquisition, title/status reconstruction,
 * role/project inference, ranking, interpretation or connector access.
 */
export function projectGovernedCalendarAttentionObservations(
  evidence: readonly GovernedCalendarEvidenceInput[],
): readonly CanonicalCalendarAttentionObservation[] {
  if (!Array.isArray(evidence)) throw new Error("governed Calendar evidence must be an array");

  const seen = new Set<string>();
  const observations = evidence.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`evidence[${index}] must be an object`);
    required(item.commitmentReference, `evidence[${index}].commitmentReference`);
    if (seen.has(item.commitmentReference)) throw new Error(`duplicate governed Calendar commitment reference: ${item.commitmentReference}`);
    seen.add(item.commitmentReference);

    if (item.available !== true) throw new Error(`evidence[${index}] must be available`);
    if (!item.sourceReference || typeof item.sourceReference !== "object") throw new Error(`evidence[${index}].sourceReference is required`);
    required(item.sourceReference.sourceId, `evidence[${index}].sourceReference.sourceId`);
    required(item.sourceReference.resourceId, `evidence[${index}].sourceReference.resourceId`);
    required(item.sourceReference.field, `evidence[${index}].sourceReference.field`);
    timestamp(item.sourceReference.observedAt, `evidence[${index}].sourceReference.observedAt`);

    timestamp(item.start, `evidence[${index}].start`);
    timestamp(item.end, `evidence[${index}].end`);
    if (Date.parse(item.end) < Date.parse(item.start)) throw new Error(`evidence[${index}].end must not precede start`);

    required(item.timezone, `evidence[${index}].timezone`);
    required(item.provenanceReference, `evidence[${index}].provenanceReference`);
    required(item.coverageLimit, `evidence[${index}].coverageLimit`);
    required(item.policyReference, `evidence[${index}].policyReference`);

    return Object.freeze({
      id: item.commitmentReference,
      startsAt: item.start,
      endsAt: item.end,
      observedAt: item.sourceReference.observedAt,
      timezone: item.timezone,
      sourceReference: cloneReference(item.sourceReference),
      provenanceReference: item.provenanceReference,
      coverageLimit: item.coverageLimit,
      policyReference: item.policyReference,
    });
  });

  observations.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
  return Object.freeze(observations);
}


export interface GovernedCalendarAttentionObservationSetInput {
  readonly sourceId: "google-calendar";
  readonly available: true;
  readonly observedAt: string;
  readonly windowStart: string;
  readonly windowEnd: string;
  readonly requestedLimit: number;
  readonly coverageState: "bounded_complete_request" | "bounded_partial_request" | "bounded";
  readonly coverageLimit: string;
  readonly policyReference: string;
  readonly evidence: readonly GovernedCalendarEvidenceInput[];
}

export function projectGovernedCalendarAttentionObservationSet(
  set: GovernedCalendarAttentionObservationSetInput,
): CanonicalCalendarAttentionObservationSet {
  if (!set || typeof set !== "object" || set.available !== true || set.sourceId !== "google-calendar") {
    throw new Error("available governed Calendar evidence set is required");
  }
  timestamp(set.observedAt, "Calendar evidence set observedAt");
  timestamp(set.windowStart, "Calendar evidence set windowStart");
  timestamp(set.windowEnd, "Calendar evidence set windowEnd");
  if (Date.parse(set.windowEnd) < Date.parse(set.windowStart)) throw new Error("Calendar evidence set windowEnd must not precede windowStart");
  if (!Number.isInteger(set.requestedLimit) || set.requestedLimit < 0) throw new Error("Calendar evidence set requestedLimit must be a non-negative integer");
  required(set.coverageLimit, "Calendar evidence set coverageLimit");
  required(set.policyReference, "Calendar evidence set policyReference");

  const observations = projectGovernedCalendarAttentionObservations(set.evidence);
  for (const [index, observation] of observations.entries()) {
    if (observation.observedAt !== set.observedAt) throw new Error(`observations[${index}].observedAt does not match evidence set`);
    if (observation.coverageLimit !== set.coverageLimit) throw new Error(`observations[${index}].coverageLimit does not match evidence set`);
    if (observation.policyReference !== set.policyReference) throw new Error(`observations[${index}].policyReference does not match evidence set`);
    if (observation.sourceReference.sourceId !== set.sourceId) throw new Error(`observations[${index}].sourceId does not match evidence set`);
  }

  return Object.freeze({
    sourceId: "google-calendar",
    observedAt: set.observedAt,
    windowStart: set.windowStart,
    windowEnd: set.windowEnd,
    requestedLimit: set.requestedLimit,
    coverageState: set.coverageState,
    coverageLimit: set.coverageLimit,
    policyReference: set.policyReference,
    observations,
  });
}
