import type {
  DurableOperatingPictureHistoryReadResult,
  DurableOperatingPictureReadReason,
  DurableOperatingPictureStore,
} from "./durable-store-contract";
import type { PersistedOperatingPictureVersion } from "./persistence-record";

import {
  classifyOperatingPictureRecovery,
  type OperatingPictureRecoveryDisposition,
  type OperatingPictureRecoveryReason,
} from "./recovery-classification";

export type {
  OperatingPictureRecoveryDisposition,
  OperatingPictureRecoveryReason,
};

export type RecoveredOperatingPictureVersion = Readonly<{
  version: PersistedOperatingPictureVersion;
  disposition: OperatingPictureRecoveryDisposition;
  reason: OperatingPictureRecoveryReason;
}>;

export type OperatingPictureRestartRecoveryResult =
  | Readonly<{
      status: "found";
      recordId: string;
      headVersionId: string;
      versions: readonly RecoveredOperatingPictureVersion[];
    }>
  | Readonly<{
      status: "not_found";
    }>
  | Readonly<{
      status: "rejected";
      reason: DurableOperatingPictureReadReason | "recovery_classification_invalid";
    }>;

function classifyPersistedOperatingPictureVersion(
  version: PersistedOperatingPictureVersion,
): RecoveredOperatingPictureVersion | null {
  const classification = classifyOperatingPictureRecovery(version);
  if (!classification) return null;

  return Object.freeze({
    version,
    disposition: classification.disposition,
    reason: classification.reason,
  });
}

export async function recoverOperatingPictureRecordHistoryAfterRestart(
  durableStore: DurableOperatingPictureStore,
  recordId: string,
): Promise<OperatingPictureRestartRecoveryResult> {
  const history: DurableOperatingPictureHistoryReadResult =
    await durableStore.listRecordVersions(recordId);

  if (history.status !== "found") {
    return history;
  }

  const recovered: RecoveredOperatingPictureVersion[] = [];
  for (const version of history.versions) {
    const classified = classifyPersistedOperatingPictureVersion(version);
    if (!classified) {
      return Object.freeze({
        status: "rejected",
        reason: "recovery_classification_invalid",
      });
    }
    recovered.push(classified);
  }

  const head = recovered[recovered.length - 1];
  if (!head || head.version.versionId !== history.headVersionId) {
    return Object.freeze({
      status: "rejected",
      reason: "recovery_classification_invalid",
    });
  }

  return Object.freeze({
    status: "found",
    recordId,
    headVersionId: history.headVersionId,
    versions: Object.freeze(recovered),
  });
}
