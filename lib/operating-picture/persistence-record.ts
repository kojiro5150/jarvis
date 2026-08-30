import type { OperatingPictureHistoryRecord, OperatingPictureRecordVersion } from "./record-version-history";

export type OperatingPictureJsonValue =
  | null
  | boolean
  | number
  | string
  | readonly OperatingPictureJsonValue[]
  | Readonly<{ [key: string]: OperatingPictureJsonValue }>;

export type PersistedOperatingPictureVersion = Readonly<{
  versionId: string;
  recordId: string;
  previousVersionId: string | null;
  recordedAt: string;
  semanticClass: OperatingPictureHistoryRecord["class"];
  lifecycle: OperatingPictureHistoryRecord["lifecycle"];
  subjectNamespace: string;
  subjectEntity: string;
  subjectAttribute: string;
  revisionSemantics: OperatingPictureHistoryRecord["subject"]["revision"];
  visibilityPurposes: readonly string[];
  validFrom: string | null;
  validUntil: string | null;
  staleAfter: string | null;
  supersededBy: string | null;
  payload: OperatingPictureJsonValue;
  authorshipSource:
    | "user"
    | "model"
    | "governed_system"
    | "governed_source"
    | "governed_decision_source"
    | null;
  authorshipAt: string | null;
  provenanceSource: string | null;
  provenanceObservedAt: string | null;
}>;


const SEMANTIC_CLASSES = new Set([
  "fact",
  "user_assertion",
  "inference",
  "plan",
  "commitment",
  "decision",
  "preference",
  "recommendation",
  "open_question",
] as const);

const LIFECYCLE_STATES = new Set([
  "current",
  "stale",
  "superseded",
  "withdrawn",
] as const);

const REVISION_SEMANTICS = new Set([
  "append_only",
  "explicit_replacement",
  "authoritative_snapshot",
] as const);

const AUTHORSHIP_SOURCES = new Set([
  "user",
  "model",
  "governed_system",
  "governed_source",
  "governed_decision_source",
] as const);

function isPlainObject(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function toJsonValue(value: unknown): OperatingPictureJsonValue | null {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (Array.isArray(value)) {
    const items: OperatingPictureJsonValue[] = [];
    for (const item of value) {
      const converted = toJsonValue(item);
      if (converted === null && item !== null) return null;
      items.push(converted);
    }
    return Object.freeze(items);
  }
  if (typeof value === "object" && isPlainObject(value)) {
    const result: Record<string, OperatingPictureJsonValue> = {};
    for (const [key, item] of Object.entries(value)) {
      const converted = toJsonValue(item);
      if (converted === null && item !== null) return null;
      result[key] = converted;
    }
    return Object.freeze(result);
  }
  return null;
}


function isValidInstantOrNull(value: unknown): value is string | null {
  return value === null || (
    typeof value === "string"
    && Number.isFinite(Date.parse(value))
  );
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

export function isOperatingPictureJsonValue(
  value: unknown,
): value is OperatingPictureJsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.every(isOperatingPictureJsonValue);
  }
  if (typeof value === "object" && isPlainObject(value)) {
    return Object.values(value).every(isOperatingPictureJsonValue);
  }
  return false;
}

function validSemanticSourceShape(
  semanticClass: PersistedOperatingPictureVersion["semanticClass"],
  authorshipSource: PersistedOperatingPictureVersion["authorshipSource"],
  provenanceSource: string | null,
): boolean {
  switch (semanticClass) {
    case "fact":
      return authorshipSource === null && provenanceSource !== null;
    case "user_assertion":
    case "preference":
      return authorshipSource === "user" && provenanceSource === null;
    case "inference":
    case "recommendation":
    case "open_question":
      return authorshipSource === "model" && provenanceSource === null;
    case "plan":
      return (authorshipSource === "user" && provenanceSource === null)
        || (authorshipSource === "governed_system" && provenanceSource !== null);
    case "commitment":
      return (authorshipSource === "user" && provenanceSource === null)
        || (authorshipSource === "governed_source" && provenanceSource !== null);
    case "decision":
      return (authorshipSource === "user" && provenanceSource === null)
        || (authorshipSource === "governed_decision_source" && provenanceSource !== null);
    default:
      return false;
  }
}

export function parsePersistedOperatingPictureVersionRow(
  row: unknown,
): PersistedOperatingPictureVersion | null {
  if (typeof row !== "object" || row === null || Array.isArray(row)) return null;
  const value = row as Record<string, unknown>;

  const semanticClass = value.semantic_class;
  const lifecycle = value.lifecycle;
  const revisionSemantics = value.revision_semantics;
  const authorshipSource = value.authorship_source;

  if (typeof value.version_id !== "string"
    || typeof value.record_id !== "string"
    || (value.previous_version_id !== null && typeof value.previous_version_id !== "string")
    || typeof value.recorded_at !== "string"
    || !Number.isFinite(Date.parse(value.recorded_at))
    || typeof semanticClass !== "string"
    || !SEMANTIC_CLASSES.has(semanticClass as never)
    || typeof lifecycle !== "string"
    || !LIFECYCLE_STATES.has(lifecycle as never)
    || typeof value.subject_namespace !== "string"
    || typeof value.subject_entity !== "string"
    || typeof value.subject_attribute !== "string"
    || typeof revisionSemantics !== "string"
    || !REVISION_SEMANTICS.has(revisionSemantics as never)
    || !isStringArray(value.visibility_purposes)
    || !isValidInstantOrNull(value.valid_from)
    || !isValidInstantOrNull(value.valid_until)
    || !isValidInstantOrNull(value.stale_after)
    || (value.superseded_by !== null && typeof value.superseded_by !== "string")
    || !isOperatingPictureJsonValue(value.payload)
    || (authorshipSource !== null && (
      typeof authorshipSource !== "string"
      || !AUTHORSHIP_SOURCES.has(authorshipSource as never)
    ))
    || !isValidInstantOrNull(value.authorship_at)
    || (value.provenance_source !== null && typeof value.provenance_source !== "string")
    || !isValidInstantOrNull(value.provenance_observed_at)) {
    return null;
  }

  if ((authorshipSource === null) !== (value.authorship_at === null)) return null;
  if ((value.provenance_source === null) !== (value.provenance_observed_at === null)) return null;

  if (lifecycle === "superseded") {
    if (typeof value.superseded_by !== "string" || value.superseded_by.length === 0) return null;
  } else if (value.superseded_by !== null) {
    return null;
  }

  if (!validSemanticSourceShape(
    semanticClass as PersistedOperatingPictureVersion["semanticClass"],
    authorshipSource as PersistedOperatingPictureVersion["authorshipSource"],
    value.provenance_source as string | null,
  )) {
    return null;
  }

  return Object.freeze({
    versionId: value.version_id,
    recordId: value.record_id,
    previousVersionId: value.previous_version_id as string | null,
    recordedAt: value.recorded_at,
    semanticClass: semanticClass as PersistedOperatingPictureVersion["semanticClass"],
    lifecycle: lifecycle as PersistedOperatingPictureVersion["lifecycle"],
    subjectNamespace: value.subject_namespace,
    subjectEntity: value.subject_entity,
    subjectAttribute: value.subject_attribute,
    revisionSemantics: revisionSemantics as PersistedOperatingPictureVersion["revisionSemantics"],
    visibilityPurposes: Object.freeze([...value.visibility_purposes]),
    validFrom: value.valid_from,
    validUntil: value.valid_until,
    staleAfter: value.stale_after,
    supersededBy: value.superseded_by as string | null,
    payload: value.payload,
    authorshipSource: authorshipSource as PersistedOperatingPictureVersion["authorshipSource"],
    authorshipAt: value.authorship_at,
    provenanceSource: value.provenance_source as string | null,
    provenanceObservedAt: value.provenance_observed_at,
  });
}

function authorshipOf(record: OperatingPictureHistoryRecord): Readonly<{
  source: PersistedOperatingPictureVersion["authorshipSource"];
  at: string | null;
}> {
  if (!("authorship" in record)) {
    return Object.freeze({ source: null, at: null });
  }

  const authorship = record.authorship;
  if ("statedAt" in authorship) {
    return Object.freeze({ source: authorship.source, at: authorship.statedAt });
  }
  return Object.freeze({ source: authorship.source, at: authorship.generatedAt });
}

function provenanceOf(record: OperatingPictureHistoryRecord): Readonly<{
  source: string | null;
  observedAt: string | null;
}> {
  if (!("provenance" in record)) {
    return Object.freeze({ source: null, observedAt: null });
  }
  return Object.freeze({
    source: record.provenance.source,
    observedAt: record.provenance.observedAt,
  });
}

/**
 * Persistence is deliberately lower trust than the in-memory record.
 *
 * The durable representation stores semantic payload and provenance/authorship
 * metadata, but never serializes trust brands, reusable authority, policy proof,
 * verification proof, or completion proof. Loading this DTO later must not
 * manufacture a GovernedEvidence/AuthorityEvidence value.
 */
export function serializeOperatingPictureVersion(
  version: OperatingPictureRecordVersion<OperatingPictureHistoryRecord>,
): PersistedOperatingPictureVersion | null {
  const record = version.record;
  const payload = toJsonValue(record.value);
  if (payload === null && record.value !== null) return null;

  const authorship = authorshipOf(record);
  const provenance = provenanceOf(record);

  return Object.freeze({
    versionId: version.versionId,
    recordId: version.recordId,
    previousVersionId: version.previousVersionId,
    recordedAt: version.recordedAt,
    semanticClass: record.class,
    lifecycle: record.lifecycle,
    subjectNamespace: record.subject.namespace,
    subjectEntity: record.subject.entity,
    subjectAttribute: record.subject.attribute,
    revisionSemantics: record.subject.revision,
    visibilityPurposes: Object.freeze([...record.visibility.purposes]),
    validFrom: record.validFrom ?? null,
    validUntil: record.validUntil ?? null,
    staleAfter: record.staleAfter ?? null,
    supersededBy: record.supersededBy ?? null,
    payload,
    authorshipSource: authorship.source,
    authorshipAt: authorship.at,
    provenanceSource: provenance.source,
    provenanceObservedAt: provenance.observedAt,
  });
}
