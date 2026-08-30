import type {
  DurableOperatingPictureHeadListResult,
  DurableOperatingPictureReadReason,
  DurableOperatingPictureStore,
} from "./durable-store-contract";
import { sameDurableOperatingPictureHeadSet } from "./durable-head-set";
import {
  recoverOperatingPictureRecordHistoryAfterRestart,
  type OperatingPictureRestartRecoveryResult,
} from "./restart-recovery";

export type OperatingPictureRestartSnapshotRecord = Extract<
  OperatingPictureRestartRecoveryResult,
  Readonly<{ status: "found" }>
>;

export type OperatingPictureRestartSnapshotResult =
  | Readonly<{
      status: "recovered";
      records: readonly OperatingPictureRestartSnapshotRecord[];
    }>
  | Readonly<{
      status: "empty";
    }>
  | Readonly<{
      status: "rejected";
      reason:
        | DurableOperatingPictureReadReason
        | "recovery_classification_invalid"
        | "recovery_snapshot_changed";
    }>;

function headsFrom(
  result: DurableOperatingPictureHeadListResult,
): readonly DurableOperatingPictureHead[] | null {
  return result.status === "found" ? result.heads : null;
}

/**
 * Builds one bounded low-trust restart snapshot.
 *
 * This function does not repopulate the high-trust OperatingPictureStore.
 * It accepts a recovery snapshot only when the durable head set is stable
 * before and after all record histories are recovered.
 */
export async function recoverOperatingPictureSnapshotAfterRestart(
  durableStore: DurableOperatingPictureStore,
): Promise<OperatingPictureRestartSnapshotResult> {
  const before = await durableStore.listRecordHeads();

  if (before.status === "rejected") return before;
  if (before.status === "empty") {
    const afterEmpty = await durableStore.listRecordHeads();
    if (afterEmpty.status === "rejected") return afterEmpty;
    return afterEmpty.status === "empty"
      ? Object.freeze({ status: "empty" })
      : Object.freeze({
          status: "rejected",
          reason: "recovery_snapshot_changed",
        });
  }

  const recovered: OperatingPictureRestartSnapshotRecord[] = [];

  for (const discoveredHead of before.heads) {
    const result = await recoverOperatingPictureRecordHistoryAfterRestart(
      durableStore,
      discoveredHead.recordId,
    );

    if (result.status === "rejected") return result;
    if (result.status === "not_found") {
      return Object.freeze({
        status: "rejected",
        reason: "recovery_snapshot_changed",
      });
    }
    if (result.headVersionId !== discoveredHead.versionId) {
      return Object.freeze({
        status: "rejected",
        reason: "recovery_snapshot_changed",
      });
    }

    recovered.push(result);
  }

  const after = await durableStore.listRecordHeads();
  if (after.status === "rejected") return after;

  const beforeHeads = headsFrom(before);
  const afterHeads = headsFrom(after);
  if (
    !beforeHeads
    || !afterHeads
    || !sameDurableOperatingPictureHeadSet(beforeHeads, afterHeads)
  ) {
    return Object.freeze({
      status: "rejected",
      reason: "recovery_snapshot_changed",
    });
  }

  return Object.freeze({
    status: "recovered",
    records: Object.freeze(recovered),
  });
}
