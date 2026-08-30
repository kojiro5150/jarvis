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
import type {
  OperatingPictureStore,
  OperatingPictureStoreAppendResult,
} from "./store-contract";

function preservesRecordPayload(
  previous: OperatingPictureHistoryRecord,
  next: OperatingPictureHistoryRecord,
): boolean {
  const ignored = new Set(["lifecycle", "supersededBy"]);
  const previousKeys = Object.keys(previous).filter(key => !ignored.has(key)).sort();
  const nextKeys = Object.keys(next).filter(key => !ignored.has(key)).sort();
  if (previousKeys.length !== nextKeys.length) return false;
  if (previousKeys.some((key, index) => key !== nextKeys[index])) return false;

  const previousObject = previous as unknown as Record<string, unknown>;
  const nextObject = next as unknown as Record<string, unknown>;
  return previousKeys.every(key => Object.is(previousObject[key], nextObject[key]));
}

export function createInMemoryOperatingPictureStore(): OperatingPictureStore {
  const versionsById = new Map<string, OperatingPictureRecordVersion<OperatingPictureHistoryRecord>>();
  const headVersionByRecordId = new Map<string, string>();

  function storeVersion(
    version: OperatingPictureRecordVersion<OperatingPictureHistoryRecord>,
  ): OperatingPictureStoreAppendResult {
    versionsById.set(version.versionId, version);
    headVersionByRecordId.set(version.recordId, version.versionId);
    return Object.freeze({ status: "appended", version });
  }

  return Object.freeze({
    appendInitialRecord(
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
    },

    appendStalenessTransition<R extends OperatingPictureRecord>(
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

      if (!preservesRecordPayload(
        previous.record,
        result.status === "transitioned" ? result.record : previous.record,
      )) {
        return Object.freeze({ status: "rejected", reason: "transition_invalid" });
      }

      const typedPrevious = previous as OperatingPictureRecordVersion<R>;
      const next = appendOperatingPictureStalenessVersion(typedPrevious, result, recordedAt);
      if (!next) {
        return Object.freeze({ status: "rejected", reason: "transition_invalid" });
      }

      return storeVersion(next);
    },

    appendSupersessionTransition<R extends OperatingPictureRecord>(
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

      if (!preservesRecordPayload(previous.record, result.record)) {
        return Object.freeze({ status: "rejected", reason: "transition_invalid" });
      }

      const typedPrevious = previous as OperatingPictureRecordVersion<R>;
      const next = appendOperatingPictureSupersessionVersion(typedPrevious, result, recordedAt);
      if (!next) {
        return Object.freeze({ status: "rejected", reason: "transition_invalid" });
      }

      return storeVersion(next);
    },

    getVersion(
      versionId: string,
    ): OperatingPictureRecordVersion<OperatingPictureHistoryRecord> | null {
      return versionsById.get(versionId) ?? null;
    },

    getHeadVersion(
      recordId: string,
    ): OperatingPictureRecordVersion<OperatingPictureHistoryRecord> | null {
      const versionId = headVersionByRecordId.get(recordId);
      return versionId ? versionsById.get(versionId) ?? null : null;
    },

    listRecordVersions(
      recordId: string,
    ): readonly OperatingPictureRecordVersion<OperatingPictureHistoryRecord>[] {
      const versionId = headVersionByRecordId.get(recordId);
      const head = versionId ? versionsById.get(versionId) ?? null : null;
      if (!head) return Object.freeze([]);

      const chain: OperatingPictureRecordVersion<OperatingPictureHistoryRecord>[] = [];
      let cursor: OperatingPictureRecordVersion<OperatingPictureHistoryRecord> | null = head;
      const seen = new Set<string>();

      while (cursor) {
        if (seen.has(cursor.versionId)) break;
        seen.add(cursor.versionId);
        chain.push(cursor);
        cursor = cursor.previousVersionId
          ? versionsById.get(cursor.previousVersionId) ?? null
          : null;
      }

      return Object.freeze(chain.reverse());
    },
  });
}

const defaultStore = createInMemoryOperatingPictureStore();

export function appendInitialOperatingPictureRecord(
  record: OperatingPictureRecord,
  recordedAt: string,
): OperatingPictureStoreAppendResult {
  return defaultStore.appendInitialRecord(record, recordedAt);
}

export function appendOperatingPictureStalenessTransition<R extends OperatingPictureRecord>(
  previousVersionId: string,
  result: OperatingPictureStalenessResult<R>,
  recordedAt: string,
): OperatingPictureStoreAppendResult {
  return defaultStore.appendStalenessTransition(previousVersionId, result, recordedAt);
}

export function appendOperatingPictureSupersessionTransition<R extends OperatingPictureRecord>(
  previousVersionId: string,
  result: OperatingPictureSupersessionTransition<R>,
  recordedAt: string,
): OperatingPictureStoreAppendResult {
  return defaultStore.appendSupersessionTransition(previousVersionId, result, recordedAt);
}

export function getOperatingPictureVersion(
  versionId: string,
): OperatingPictureRecordVersion<OperatingPictureHistoryRecord> | null {
  return defaultStore.getVersion(versionId);
}

export function getOperatingPictureHeadVersion(
  recordId: string,
): OperatingPictureRecordVersion<OperatingPictureHistoryRecord> | null {
  return defaultStore.getHeadVersion(recordId);
}

export function listOperatingPictureRecordVersions(
  recordId: string,
): readonly OperatingPictureRecordVersion<OperatingPictureHistoryRecord>[] {
  return defaultStore.listRecordVersions(recordId);
}
