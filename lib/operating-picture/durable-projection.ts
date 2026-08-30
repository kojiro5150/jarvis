import type { OperatingPictureJsonValue, PersistedOperatingPictureVersion } from "./persistence-record";
import type {
  OperatingPictureRecoveryDisposition,
  RecoveredOperatingPictureVersion,
} from "./restart-recovery";
import type {
  OperatingPictureRestartSnapshotRecord,
  OperatingPictureRestartSnapshotResult,
} from "./restart-snapshot";

export type DurableOperatingPictureProjectionExclusionReason =
  | "purpose_not_visible"
  | "lifecycle_not_current"
  | "source_revalidation_required"
  | "snapshot_not_recovered"
  | "head_missing_or_inconsistent";

export type DurableOperatingPictureProjectionItem = Readonly<{
  recordId: string;
  versionId: string;
  purpose: string;
  semanticClass: PersistedOperatingPictureVersion["semanticClass"];
  lifecycle: "current";
  recoveryDisposition:
    | "recoverable_user_continuity"
    | "recoverable_model_continuity";
  subject: Readonly<{
    namespace: string;
    entity: string;
    attribute: string;
    revision: PersistedOperatingPictureVersion["revisionSemantics"];
  }>;
  payload: OperatingPictureJsonValue;
  visibilityPurposes: readonly string[];
  validFrom: string | null;
  validUntil: string | null;
  staleAfter: string | null;
  authorshipSource: PersistedOperatingPictureVersion["authorshipSource"];
  authorshipAt: string | null;
}>;

export type DurableOperatingPictureProjectionDecision = Readonly<{
  recordId: string;
  headVersionId: string;
  status: "admitted" | "excluded";
  reason?: DurableOperatingPictureProjectionExclusionReason;
}>;

export type DurableOperatingPictureProjectionResult =
  | Readonly<{
      status: "projected";
      purpose: string;
      items: readonly DurableOperatingPictureProjectionItem[];
      decisions: readonly DurableOperatingPictureProjectionDecision[];
    }>
  | Readonly<{
      status: "empty";
      purpose: string;
      items: readonly [];
      decisions: readonly DurableOperatingPictureProjectionDecision[];
    }>
  | Readonly<{
      status: "rejected";
      purpose: string;
      reason: "invalid_purpose" | "snapshot_not_recovered" | "head_missing_or_inconsistent";
    }>;

function validPurpose(purpose: string): boolean {
  return purpose.trim().length > 0 && purpose === purpose.trim();
}

function headOf(
  record: OperatingPictureRestartSnapshotRecord,
): RecoveredOperatingPictureVersion | null {
  const head = record.versions[record.versions.length - 1];
  if (!head || head.version.versionId !== record.headVersionId) return null;
  return head;
}

function isRecoverableDisposition(
  disposition: OperatingPictureRecoveryDisposition,
): disposition is
  | "recoverable_user_continuity"
  | "recoverable_model_continuity" {
  return disposition === "recoverable_user_continuity"
    || disposition === "recoverable_model_continuity";
}

function projectItem(
  head: RecoveredOperatingPictureVersion,
  purpose: string,
): DurableOperatingPictureProjectionItem | null {
  if (!isRecoverableDisposition(head.disposition)) return null;
  if (head.version.lifecycle !== "current") return null;
  if (!head.version.visibilityPurposes.includes(purpose)) return null;

  return Object.freeze({
    recordId: head.version.recordId,
    versionId: head.version.versionId,
    purpose,
    semanticClass: head.version.semanticClass,
    lifecycle: "current",
    recoveryDisposition: head.disposition,
    subject: Object.freeze({
      namespace: head.version.subjectNamespace,
      entity: head.version.subjectEntity,
      attribute: head.version.subjectAttribute,
      revision: head.version.revisionSemantics,
    }),
    payload: head.version.payload,
    visibilityPurposes: Object.freeze([...head.version.visibilityPurposes]),
    validFrom: head.version.validFrom,
    validUntil: head.version.validUntil,
    staleAfter: head.version.staleAfter,
    authorshipSource: head.version.authorshipSource,
    authorshipAt: head.version.authorshipAt,
  });
}

function exclusionReason(
  head: RecoveredOperatingPictureVersion,
  purpose: string,
): DurableOperatingPictureProjectionExclusionReason | null {
  if (head.disposition === "requires_source_revalidation") {
    return "source_revalidation_required";
  }
  if (head.version.lifecycle !== "current") {
    return "lifecycle_not_current";
  }
  if (!head.version.visibilityPurposes.includes(purpose)) {
    return "purpose_not_visible";
  }
  return null;
}

/**
 * Builds a low-trust, purpose-bounded projection from one stable restart snapshot.
 *
 * The projection is current-only. Historical stale/superseded/withdrawn versions
 * remain in durable history but are not admitted to active continuity.
 *
 * This function does not create GovernedEvidence, authority, policy proof,
 * verification proof, completion proof, or a high-trust OperatingPictureRecord.
 */
export function projectDurableOperatingPictureForPurpose(
  snapshot: OperatingPictureRestartSnapshotResult,
  purpose: string,
): DurableOperatingPictureProjectionResult {
  if (!validPurpose(purpose)) {
    return Object.freeze({
      status: "rejected",
      purpose,
      reason: "invalid_purpose",
    });
  }

  if (snapshot.status !== "recovered") {
    return Object.freeze({
      status: "rejected",
      purpose,
      reason: "snapshot_not_recovered",
    });
  }

  const items: DurableOperatingPictureProjectionItem[] = [];
  const decisions: DurableOperatingPictureProjectionDecision[] = [];

  for (const record of snapshot.records) {
    const head = headOf(record);
    if (!head) {
      return Object.freeze({
        status: "rejected",
        purpose,
        reason: "head_missing_or_inconsistent",
      });
    }

    const reason = exclusionReason(head, purpose);
    if (reason) {
      decisions.push(Object.freeze({
        recordId: record.recordId,
        headVersionId: record.headVersionId,
        status: "excluded",
        reason,
      }));
      continue;
    }

    const item = projectItem(head, purpose);
    if (!item) {
      return Object.freeze({
        status: "rejected",
        purpose,
        reason: "head_missing_or_inconsistent",
      });
    }

    items.push(item);
    decisions.push(Object.freeze({
      recordId: record.recordId,
      headVersionId: record.headVersionId,
      status: "admitted",
    }));
  }

  if (items.length === 0) {
    return Object.freeze({
      status: "empty",
      purpose,
      items: Object.freeze([]) as readonly [],
      decisions: Object.freeze(decisions),
    });
  }

  return Object.freeze({
    status: "projected",
    purpose,
    items: Object.freeze(items),
    decisions: Object.freeze(decisions),
  });
}
