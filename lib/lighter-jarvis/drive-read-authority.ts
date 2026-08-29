import { proveExplicitDriveRead } from "@/lib/governance-core/explicit-command-authority";
export const DRIVE_READ_CAPABILITY = "drive.read" as const;
export const DRIVE_TEXT_MODE = "text" as const;
export type DriveReadOperation = Readonly<{ capability: typeof DRIVE_READ_CAPABILITY; fileId: string; contentMode: typeof DRIVE_TEXT_MODE }>;
const PROVIDER_FILE_ID = /^[A-Za-z0-9_-]+$/;
export function proposeDriveRead(fileId: string): DriveReadOperation {
  if (!PROVIDER_FILE_ID.test(fileId)) throw new Error("drive.read requires one exact provider fileId");
  return Object.freeze({ capability: DRIVE_READ_CAPABILITY, fileId, contentMode: DRIVE_TEXT_MODE });
}
export function evaluateDriveReadAuthority(operation: DriveReadOperation, utterance: string) {
  const authorityEvidence = proveExplicitDriveRead(operation, utterance);
  const allowed = authorityEvidence.length === 1;
  return Object.freeze({ decision: allowed ? "ALLOW" as const : "DENY" as const,
    reason: allowed ? "explicit_drive_read" : "explicit_drive_read_not_established",
    authorityEvidence });
}
