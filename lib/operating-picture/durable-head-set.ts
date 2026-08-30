import type { DurableOperatingPictureHead } from "./durable-store-contract";

export function sameDurableOperatingPictureHeadSet(
  left: readonly DurableOperatingPictureHead[],
  right: readonly DurableOperatingPictureHead[],
): boolean {
  if (left.length !== right.length) return false;

  const rightByRecordId = new Map<string, string>();
  for (const head of right) {
    if (rightByRecordId.has(head.recordId)) return false;
    rightByRecordId.set(head.recordId, head.versionId);
  }

  const seenLeftRecordIds = new Set<string>();
  for (const head of left) {
    if (seenLeftRecordIds.has(head.recordId)) return false;
    seenLeftRecordIds.add(head.recordId);

    if (rightByRecordId.get(head.recordId) !== head.versionId) {
      return false;
    }
  }

  return true;
}
