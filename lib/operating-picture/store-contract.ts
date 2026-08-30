import type { OperatingPictureRecord } from "./record-core";
import type {
  OperatingPictureHistoryRecord,
  OperatingPictureRecordVersion,
} from "./record-version-history";
import type {
  OperatingPictureStalenessResult,
  OperatingPictureSupersessionTransition,
} from "./lifecycle-core";

export type OperatingPictureStoreRejectReason =
  | "invalid_initial_version"
  | "record_already_exists"
  | "previous_version_not_found"
  | "previous_version_not_current_head"
  | "transition_invalid";

export type OperatingPictureStoreAppendResult =
  | Readonly<{
      status: "appended";
      version: OperatingPictureRecordVersion<OperatingPictureHistoryRecord>;
    }>
  | Readonly<{
      status: "rejected";
      reason: OperatingPictureStoreRejectReason;
    }>;

export type OperatingPictureStore = Readonly<{
  appendInitialRecord(
    record: OperatingPictureRecord,
    recordedAt: string,
  ): OperatingPictureStoreAppendResult;

  appendStalenessTransition<R extends OperatingPictureRecord>(
    previousVersionId: string,
    result: OperatingPictureStalenessResult<R>,
    recordedAt: string,
  ): OperatingPictureStoreAppendResult;

  appendSupersessionTransition<R extends OperatingPictureRecord>(
    previousVersionId: string,
    result: OperatingPictureSupersessionTransition<R>,
    recordedAt: string,
  ): OperatingPictureStoreAppendResult;

  getVersion(
    versionId: string,
  ): OperatingPictureRecordVersion<OperatingPictureHistoryRecord> | null;

  getHeadVersion(
    recordId: string,
  ): OperatingPictureRecordVersion<OperatingPictureHistoryRecord> | null;

  listRecordVersions(
    recordId: string,
  ): readonly OperatingPictureRecordVersion<OperatingPictureHistoryRecord>[];
}>;
