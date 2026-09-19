import { createHash, randomUUID } from "node:crypto";

const REFERENCE_TTL_MS = 15 * 60 * 1_000;

export type DurableContinuityReleaseReference = Readonly<{
  durableContinuityReleaseReferenceId: string;
}>;

type DurableContinuityReleaseRecord = Readonly<{
  referenceId: string;
  presentationDigest: string;
  createdAt: number;
  expiresAt: number;
  status: "eligible";
}>;

const records = new Map<string, DurableContinuityReleaseRecord>();

function referenceId(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const value = (input as { durableContinuityReleaseReferenceId?: unknown })
    .durableContinuityReleaseReferenceId;
  return typeof value === "string" && /^[0-9a-f-]{36}$/.test(value) ? value : null;
}

export function createDurableContinuityReleaseReference(input: Readonly<{
  presentation: string;
  now?: number;
}>): DurableContinuityReleaseReference {
  const now = input.now ?? Date.now();
  const id = randomUUID();
  records.set(id, Object.freeze({
    referenceId: id,
    presentationDigest: createHash("sha256").update(input.presentation).digest("hex"),
    createdAt: now,
    expiresAt: now + REFERENCE_TTL_MS,
    status: "eligible",
  }));
  return Object.freeze({ durableContinuityReleaseReferenceId: id });
}

export function resolveDurableContinuityReleaseReference(
  reference: unknown,
  now = Date.now(),
): DurableContinuityReleaseRecord | null {
  const id = referenceId(reference);
  if (!id) return null;
  const record = records.get(id);
  if (!record || record.status !== "eligible" || record.expiresAt <= now) {
    if (record?.expiresAt && record.expiresAt <= now) records.delete(id);
    return null;
  }
  return record;
}

export function resetDurableContinuityReleaseReferencesForTests(): void {
  records.clear();
}
