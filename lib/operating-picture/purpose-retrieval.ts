import type {
  DurableOperatingPictureHead,
  DurableOperatingPictureReadReason,
  DurableOperatingPictureStore,
} from "./durable-store-contract";
import type {
  DurableOperatingPictureProjectionExclusionReason,
  DurableOperatingPictureProjectionItem,
} from "./durable-projection";
import type {
  PersistedOperatingPictureProjectionMetadata,
  PersistedOperatingPictureVersion,
} from "./persistence-record";
import {
  classifyOperatingPictureRecovery,
  type OperatingPictureRecoveryDisposition,
} from "./recovery-classification";

export type DurablePurposeRetrievalResult =
  | Readonly<{
      status: "admitted";
      item: DurableOperatingPictureProjectionItem;
    }>
  | Readonly<{
      status: "excluded";
      recordId: string;
      headVersionId: string;
      reason:
        | "purpose_not_visible"
        | "lifecycle_not_current"
        | "source_revalidation_required";
    }>
  | Readonly<{
      status: "rejected";
      reason:
        | DurableOperatingPictureReadReason
        | "invalid_purpose"
        | "head_missing_or_inconsistent";
    }>;

function validPurpose(purpose: string): boolean {
  return purpose.trim().length > 0 && purpose === purpose.trim();
}

function sameStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function metadataMatchesVersion(
  metadata: PersistedOperatingPictureProjectionMetadata,
  version: PersistedOperatingPictureVersion,
): boolean {
  return metadata.versionId === version.versionId
    && metadata.recordId === version.recordId
    && metadata.semanticClass === version.semanticClass
    && metadata.lifecycle === version.lifecycle
    && sameStrings(metadata.visibilityPurposes, version.visibilityPurposes)
    && metadata.authorshipSource === version.authorshipSource
    && metadata.authorshipAt === version.authorshipAt
    && metadata.provenanceSource === version.provenanceSource
    && metadata.provenanceObservedAt === version.provenanceObservedAt;
}

function exclusionReason(
  metadata: PersistedOperatingPictureProjectionMetadata,
  purpose: string,
  disposition: OperatingPictureRecoveryDisposition,
): DurableOperatingPictureProjectionExclusionReason | null {
  if (disposition === "requires_source_revalidation") {
    return "source_revalidation_required";
  }
  if (metadata.lifecycle !== "current") {
    return "lifecycle_not_current";
  }
  if (!metadata.visibilityPurposes.includes(purpose)) {
    return "purpose_not_visible";
  }
  return null;
}

function projectionItem(
  version: PersistedOperatingPictureVersion,
  purpose: string,
  disposition:
    | "recoverable_user_continuity"
    | "recoverable_model_continuity",
): DurableOperatingPictureProjectionItem {
  return Object.freeze({
    recordId: version.recordId,
    versionId: version.versionId,
    purpose,
    semanticClass: version.semanticClass,
    lifecycle: "current",
    recoveryDisposition: disposition,
    subject: Object.freeze({
      namespace: version.subjectNamespace,
      entity: version.subjectEntity,
      attribute: version.subjectAttribute,
      revision: version.revisionSemantics,
    }),
    payload: version.payload,
    visibilityPurposes: Object.freeze([...version.visibilityPurposes]),
    validFrom: version.validFrom,
    validUntil: version.validUntil,
    staleAfter: version.staleAfter,
    authorshipSource: version.authorshipSource,
    authorshipAt: version.authorshipAt,
  });
}

/**
 * Performs a two-stage, purpose-bounded durable read for one exact discovered head.
 *
 * Stage 1 reads payload-free metadata and applies purpose/lifecycle/source gates.
 * Stage 2 reads semantic payload only when Stage 1 admits the exact head.
 */
export async function retrieveDurableOperatingPictureHeadForPurpose(
  durableStore: DurableOperatingPictureStore,
  head: DurableOperatingPictureHead,
  purpose: string,
): Promise<DurablePurposeRetrievalResult> {
  if (!validPurpose(purpose)) {
    return Object.freeze({
      status: "rejected",
      reason: "invalid_purpose",
    });
  }

  const preflight = await durableStore.getVersionProjectionMetadata(head.versionId);
  if (preflight.status === "rejected") return preflight;
  if (preflight.status === "not_found") {
    return Object.freeze({
      status: "rejected",
      reason: "head_missing_or_inconsistent",
    });
  }

  const metadata = preflight.metadata;
  if (
    metadata.versionId !== head.versionId
    || metadata.recordId !== head.recordId
  ) {
    return Object.freeze({
      status: "rejected",
      reason: "head_missing_or_inconsistent",
    });
  }

  const classification = classifyOperatingPictureRecovery(metadata);
  if (!classification) {
    return Object.freeze({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  }

  const disposition = classification.disposition;
  const reason = exclusionReason(metadata, purpose, disposition);
  if (reason) {
    return Object.freeze({
      status: "excluded",
      recordId: head.recordId,
      headVersionId: head.versionId,
      reason,
    });
  }

  const full = await durableStore.getVersion(head.versionId);
  if (full.status === "rejected") return full;
  if (full.status === "not_found") {
    return Object.freeze({
      status: "rejected",
      reason: "head_missing_or_inconsistent",
    });
  }

  if (
    !metadataMatchesVersion(metadata, full.version)
    || full.version.versionId !== head.versionId
    || full.version.recordId !== head.recordId
    || full.version.lifecycle !== "current"
  ) {
    return Object.freeze({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  }

  if (
    disposition !== "recoverable_user_continuity"
    && disposition !== "recoverable_model_continuity"
  ) {
    return Object.freeze({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  }

  return Object.freeze({
    status: "admitted",
    item: projectionItem(full.version, purpose, disposition),
  });
}
