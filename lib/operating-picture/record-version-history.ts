import { randomUUID } from "node:crypto";

import type { OperatingPictureRecord } from "./record-core";
import type {
  OperatingPictureStalenessResult,
  OperatingPictureSupersessionTransition,
} from "./lifecycle-core";

type VersionedOperatingPictureRecord = Readonly<{
  id: string;
  lifecycle: "current" | "stale" | "superseded" | "withdrawn";
}>;

export type OperatingPictureRecordVersion<R extends VersionedOperatingPictureRecord = OperatingPictureRecord> = Readonly<{
  versionId: string;
  recordId: string;
  previousVersionId: string | null;
  recordedAt: string;
  record: R;
}>;

function validInstant(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function createInitialOperatingPictureRecordVersion<R extends OperatingPictureRecord>(
  record: R,
  recordedAt: string,
): OperatingPictureRecordVersion<R> | null {
  if (!validInstant(recordedAt)) return null;

  return Object.freeze({
    versionId: randomUUID(),
    recordId: record.id,
    previousVersionId: null,
    recordedAt,
    record,
  });
}

export function appendOperatingPictureStalenessVersion<R extends OperatingPictureRecord>(
  previous: OperatingPictureRecordVersion<R>,
  result: OperatingPictureStalenessResult<R>,
  recordedAt: string,
): OperatingPictureRecordVersion | null {
  if (!validInstant(recordedAt)) return null;
  if (result.status !== "transitioned") return null;
  if (previous.recordId !== result.record.id) return null;
  if (previous.record.id !== result.record.id) return null;
  if (previous.record.lifecycle !== result.transition.from) return null;
  if (result.record.lifecycle !== "stale") return null;

  return Object.freeze({
    versionId: randomUUID(),
    recordId: previous.recordId,
    previousVersionId: previous.versionId,
    recordedAt,
    record: result.record,
  });
}

export function appendOperatingPictureSupersessionVersion<R extends OperatingPictureRecord>(
  previous: OperatingPictureRecordVersion<R>,
  result: OperatingPictureSupersessionTransition<R>,
  recordedAt: string,
): OperatingPictureRecordVersion | null {
  if (!validInstant(recordedAt)) return null;
  if (previous.recordId !== result.record.id) return null;
  if (previous.record.id !== result.record.id) return null;
  if (previous.record.lifecycle !== result.transition.from) return null;
  if (result.record.lifecycle !== "superseded") return null;
  if (result.record.supersededBy !== result.transition.replacementRecordId) return null;

  return Object.freeze({
    versionId: randomUUID(),
    recordId: previous.recordId,
    previousVersionId: previous.versionId,
    recordedAt,
    record: result.record,
  });
}
