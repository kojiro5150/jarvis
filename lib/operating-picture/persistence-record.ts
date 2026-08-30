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
