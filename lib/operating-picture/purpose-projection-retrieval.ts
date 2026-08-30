import type {
  DurableOperatingPictureHead,
  DurableOperatingPictureReadReason,
  DurableOperatingPictureStore,
} from "./durable-store-contract";
import {
  sameDurableOperatingPictureHeadSet,
} from "./durable-head-set";
import type {
  DurableOperatingPictureProjectionDecision,
  DurableOperatingPictureProjectionItem,
} from "./durable-projection";
import {
  retrieveDurableOperatingPictureHeadForPurpose,
} from "./purpose-retrieval";

export type DurablePurposeProjectionResult =
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
      reason:
        | DurableOperatingPictureReadReason
        | "invalid_purpose"
        | "head_missing_or_inconsistent"
        | "projection_snapshot_changed";
    }>;

function validPurpose(purpose: string): boolean {
  return purpose.trim().length > 0 && purpose === purpose.trim();
}

async function stableEmptyProjection(
  durableStore: DurableOperatingPictureStore,
  purpose: string,
): Promise<DurablePurposeProjectionResult> {
  const after = await durableStore.listRecordHeads();
  if (after.status === "rejected") {
    return Object.freeze({
      status: "rejected",
      purpose,
      reason: after.reason,
    });
  }
  if (after.status !== "empty") {
    return Object.freeze({
      status: "rejected",
      purpose,
      reason: "projection_snapshot_changed",
    });
  }

  return Object.freeze({
    status: "empty",
    purpose,
    items: Object.freeze([]) as readonly [],
    decisions: Object.freeze([]),
  });
}

/**
 * Builds one stable purpose-bounded durable projection directly from the store.
 *
 * Payload retrieval is delegated to the single-head two-stage gate, so excluded
 * heads never have semantic payload fetched. The whole projection is accepted
 * only if the durable head set is identical before and after retrieval.
 */
export async function retrieveDurableOperatingPictureForPurpose(
  durableStore: DurableOperatingPictureStore,
  purpose: string,
): Promise<DurablePurposeProjectionResult> {
  if (!validPurpose(purpose)) {
    return Object.freeze({
      status: "rejected",
      purpose,
      reason: "invalid_purpose",
    });
  }

  const before = await durableStore.listRecordHeads();
  if (before.status === "rejected") {
    return Object.freeze({
      status: "rejected",
      purpose,
      reason: before.reason,
    });
  }
  if (before.status === "empty") {
    return stableEmptyProjection(durableStore, purpose);
  }

  const discoveredHeads: readonly DurableOperatingPictureHead[] = before.heads;
  const items: DurableOperatingPictureProjectionItem[] = [];
  const decisions: DurableOperatingPictureProjectionDecision[] = [];

  for (const head of discoveredHeads) {
    const result = await retrieveDurableOperatingPictureHeadForPurpose(
      durableStore,
      head,
      purpose,
    );

    if (result.status === "rejected") {
      return Object.freeze({
        status: "rejected",
        purpose,
        reason: result.reason,
      });
    }

    if (result.status === "excluded") {
      decisions.push(Object.freeze({
        recordId: result.recordId,
        headVersionId: result.headVersionId,
        status: "excluded",
        reason: result.reason,
      }));
      continue;
    }

    items.push(result.item);
    decisions.push(Object.freeze({
      recordId: result.item.recordId,
      headVersionId: result.item.versionId,
      status: "admitted",
    }));
  }

  const after = await durableStore.listRecordHeads();
  if (after.status === "rejected") {
    return Object.freeze({
      status: "rejected",
      purpose,
      reason: after.reason,
    });
  }
  if (
    after.status !== "found"
    || !sameDurableOperatingPictureHeadSet(discoveredHeads, after.heads)
  ) {
    return Object.freeze({
      status: "rejected",
      purpose,
      reason: "projection_snapshot_changed",
    });
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
