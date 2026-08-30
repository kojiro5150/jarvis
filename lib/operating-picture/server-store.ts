import type {
  OperatingPictureRecord,
} from "./record-core";
import {
  appendOperatingPictureStalenessVersion,
  appendOperatingPictureSupersessionVersion,
  createInitialOperatingPictureRecordVersion,
  type OperatingPictureHistoryRecord,
  type OperatingPictureRecordVersion,
} from "./record-version-history";
import type {
  OperatingPictureStalenessResult,
  OperatingPictureSupersessionTransition,
} from "./lifecycle-core";

export type OperatingPictureStoreAppendResult =
  | Readonly<{
      status: "appended";
      version: OperatingPictureRecordVersion<OperatingPictureHistoryRecord>;
    }>
  | Readonly<{
      status: "rejected";
      reason:
        | "invalid_initial_version"
        | "record_already_exists"
        | "previous_version_not_found"
        | "previous_version_not_current_head"
        | "transition_invalid";
    }>;

const versionsById = new Map<string, OperatingPictureRecordVersion<OperatingPictureHistoryRecord>>();
const headVersionByRecordId = new Map<string, string>();

function storeVersion(
  version: OperatingPictureRecordVersion<OperatingPictureHistoryRecord>,
): OperatingPictureStoreAppendResult {
  versionsById.set(version.versionId, version);
  headVersionByRecordId.set(version.recordId, version.versionId);
  return Object.freeze({ status: "appended", version });
}

export function appendInitialOperatingPictureRecord(
  record: OperatingPictureRecord,
  recordedAt: string,
): OperatingPictureStoreAppendResult {
  if (headVersionByRecordId.has(record.id)) {
    return Object.freeze({ status: "rejected", reason: "record_already_exists" });
  }

  const version = createInitialOperatingPictureRecordVersion(record, recordedAt);
  if (!version) {
    return Object.freeze({ status: "rejected", reason: "invalid_initial_version" });
  }

  return storeVersion(version);
}

export function appendOperatingPictureStalenessTransition<R extends OperatingPictureRecord>(
  previousVersionId: string,
  result: OperatingPictureStalenessResult<R>,
  recordedAt: string,
): OperatingPictureStoreAppendResult {
  const previous = versionsById.get(previousVersionId);
  if (!previous) {
    return Object.freeze({ status: "rejected", reason: "previous_version_not_found" });
  }
  if (headVersionByRecordId.get(previous.recordId) !== previous.versionId) {
    return Object.freeze({ status: "rejected", reason: "previous_version_not_current_head" });
  }

  const typedPrevious = previous as OperatingPictureRecordVersion<R>;
  const next = appendOperatingPictureStalenessVersion(typedPrevious, result, recordedAt);
  if (!next) {
    return Object.freeze({ status: "rejected", reason: "transition_invalid" });
  }

  return storeVersion(next);
}

export function appendOperatingPictureSupersessionTransition<R extends OperatingPictureRecord>(
  previousVersionId: string,
  result: OperatingPictureSupersessionTransition<R>,
  recordedAt: string,
): OperatingPictureStoreAppendResult {
  const previous = versionsById.get(previousVersionId);
  if (!previous) {
    return Object.freeze({ status: "rejected", reason: "previous_version_not_found" });
  }
  if (headVersionByRecordId.get(previous.recordId) !== previous.versionId) {
    return Object.freeze({ status: "rejected", reason: "previous_version_not_current_head" });
  }

  const typedPrevious = previous as OperatingPictureRecordVersion<R>;
  const next = appendOperatingPictureSupersessionVersion(typedPrevious, result, recordedAt);
  if (!next) {
    return Object.freeze({ status: "rejected", reason: "transition_invalid" });
  }

  return storeVersion(next);
}

export function getOperatingPictureVersion(
  versionId: string,
): OperatingPictureRecordVersion<OperatingPictureHistoryRecord> | null {
  return versionsById.get(versionId) ?? null;
}

export function getOperatingPictureHeadVersion(
  recordId: string,
): OperatingPictureRecordVersion<OperatingPictureHistoryRecord> | null {
  const versionId = headVersionByRecordId.get(recordId);
  return versionId ? versionsById.get(versionId) ?? null : null;
}

export function listOperatingPictureRecordVersions(
  recordId: string,
): readonly OperatingPictureRecordVersion<OperatingPictureHistoryRecord>[] {
  const head = getOperatingPictureHeadVersion(recordId);
  if (!head) return Object.freeze([]);

  const chain: OperatingPictureRecordVersion<OperatingPictureHistoryRecord>[] = [];
  let cursor: OperatingPictureRecordVersion<OperatingPictureHistoryRecord> | null = head;
  const seen = new Set<string>();

  while (cursor) {
    if (seen.has(cursor.versionId)) break;
    seen.add(cursor.versionId);
    chain.push(cursor);
    cursor = cursor.previousVersionId ? versionsById.get(cursor.previousVersionId) ?? null : null;
  }

  return Object.freeze(chain.reverse());
}

/** Test-only reset. The production API exposes no delete or overwrite operation. */
export function resetOperatingPictureStoreForTests(): void {
  versionsById.clear();
  headVersionByRecordId.clear();
}
