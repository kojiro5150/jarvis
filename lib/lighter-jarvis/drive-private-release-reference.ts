import { createHash, randomUUID } from "node:crypto";

const REFERENCE_TTL_MS = 15 * 60 * 1_000;

export type DrivePrivateReleaseReference = Readonly<{
  drivePrivateReleaseReferenceId: string;
}>;

type DrivePrivateReleaseRecord = Readonly<{
  referenceId: string;
  fileId: string;
  contentMode: "text";
  presentationDigest: string;
  createdAt: number;
  expiresAt: number;
  status: "eligible";
}>;

const records = new Map<string, DrivePrivateReleaseRecord>();

function referenceId(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const value = (input as { drivePrivateReleaseReferenceId?: unknown })
    .drivePrivateReleaseReferenceId;
  return typeof value === "string" && /^[0-9a-f-]{36}$/.test(value) ? value : null;
}

export function createDrivePrivateReleaseReference(input: Readonly<{
  fileId: string;
  presentation: string;
  now?: number;
}>): DrivePrivateReleaseReference {
  const now = input.now ?? Date.now();
  const id = randomUUID();
  records.set(id, Object.freeze({
    referenceId: id,
    fileId: input.fileId,
    contentMode: "text",
    presentationDigest: createHash("sha256").update(input.presentation).digest("hex"),
    createdAt: now,
    expiresAt: now + REFERENCE_TTL_MS,
    status: "eligible",
  }));
  return Object.freeze({ drivePrivateReleaseReferenceId: id });
}

export function resolveDrivePrivateReleaseReference(
  reference: unknown,
  now = Date.now(),
): DrivePrivateReleaseRecord | null {
  const id = referenceId(reference);
  if (!id) return null;
  const record = records.get(id);
  if (!record || record.status !== "eligible" || record.expiresAt <= now) {
    if (record?.expiresAt && record.expiresAt <= now) records.delete(id);
    return null;
  }
  return record;
}

const CONTENT_DEPENDENT_FOLLOW_UPS = [
  /^(?:summarise|summarize) that document[.!?]?$/i,
  /^what does that document say[?]?$/i,
  /^what are the main points of that document[?]?$/i,
  /^explain that document[.!?]?$/i,
  /^(?:analyse|analyze) that document[.!?]?$/i,
  /^(?:summarise|summarize) that file[.!?]?$/i,
  /^compare that document with this[.!?]?$/i,
  /^does that document conflict with this[?]?$/i,
] as const;

export function isDrivePrivateReleaseContentFollowUp(utterance: string): boolean {
  const normalized = utterance.trim().replace(/\s+/g, " ");
  return CONTENT_DEPENDENT_FOLLOW_UPS.some((pattern) => pattern.test(normalized));
}

export function resetDrivePrivateReleaseReferencesForTests(): void {
  records.clear();
}
