import type {
  DurableOperatingPictureHistoryReadResult,
  DurableOperatingPictureReadReason,
  DurableOperatingPictureStore,
} from "./durable-store-contract";
import type { PersistedOperatingPictureVersion } from "./persistence-record";

export type OperatingPictureRecoveryDisposition =
  | "recoverable_user_continuity"
  | "recoverable_model_continuity"
  | "requires_source_revalidation";

export type OperatingPictureRecoveryReason =
  | "user_authorship_persists_as_historical_continuity"
  | "model_authorship_persists_as_low_trust_continuity"
  | "governed_fact_requires_source_revalidation"
  | "governed_plan_requires_source_revalidation"
  | "governed_commitment_requires_source_revalidation"
  | "governed_decision_requires_source_revalidation";

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
  switch (version.semanticClass) {
    case "fact":
      if (
        version.authorshipSource !== null
        || version.provenanceSource === null
      ) {
        return null;
      }
      return Object.freeze({
        version,
        disposition: "requires_source_revalidation",
        reason: "governed_fact_requires_source_revalidation",
      });

    case "user_assertion":
    case "preference":
      if (
        version.authorshipSource !== "user"
        || version.provenanceSource !== null
      ) {
        return null;
      }
      return Object.freeze({
        version,
        disposition: "recoverable_user_continuity",
        reason: "user_authorship_persists_as_historical_continuity",
      });

    case "inference":
    case "recommendation":
    case "open_question":
      if (
        version.authorshipSource !== "model"
        || version.provenanceSource !== null
      ) {
        return null;
      }
      return Object.freeze({
        version,
        disposition: "recoverable_model_continuity",
        reason: "model_authorship_persists_as_low_trust_continuity",
      });

    case "plan":
      if (
        version.authorshipSource === "user"
        && version.provenanceSource === null
      ) {
        return Object.freeze({
          version,
          disposition: "recoverable_user_continuity",
          reason: "user_authorship_persists_as_historical_continuity",
        });
      }
      if (
        version.authorshipSource === "governed_system"
        && version.provenanceSource !== null
      ) {
        return Object.freeze({
          version,
          disposition: "requires_source_revalidation",
          reason: "governed_plan_requires_source_revalidation",
        });
      }
      return null;

    case "commitment":
      if (
        version.authorshipSource === "user"
        && version.provenanceSource === null
      ) {
        return Object.freeze({
          version,
          disposition: "recoverable_user_continuity",
          reason: "user_authorship_persists_as_historical_continuity",
        });
      }
      if (
        version.authorshipSource === "governed_source"
        && version.provenanceSource !== null
      ) {
        return Object.freeze({
          version,
          disposition: "requires_source_revalidation",
          reason: "governed_commitment_requires_source_revalidation",
        });
      }
      return null;

    case "decision":
      if (
        version.authorshipSource === "user"
        && version.provenanceSource === null
      ) {
        return Object.freeze({
          version,
          disposition: "recoverable_user_continuity",
          reason: "user_authorship_persists_as_historical_continuity",
        });
      }
      if (
        version.authorshipSource === "governed_decision_source"
        && version.provenanceSource !== null
      ) {
        return Object.freeze({
          version,
          disposition: "requires_source_revalidation",
          reason: "governed_decision_requires_source_revalidation",
        });
      }
      return null;
  }

  return null;
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
