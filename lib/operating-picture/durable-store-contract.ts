import type { PersistedOperatingPictureVersion } from "./persistence-record";

export type DurableOperatingPictureReadReason =
  | "persistence_unavailable"
  | "unexpected_persistence_response"
  | "persistence_integrity_failure";

export type DurableOperatingPictureVersionReadResult =
  | Readonly<{
      status: "found";
      version: PersistedOperatingPictureVersion;
    }>
  | Readonly<{
      status: "not_found";
    }>
  | Readonly<{
      status: "rejected";
      reason: DurableOperatingPictureReadReason;
    }>;

export type DurableOperatingPictureHistoryReadResult =
  | Readonly<{
      status: "found";
      headVersionId: string;
      versions: readonly PersistedOperatingPictureVersion[];
    }>
  | Readonly<{
      status: "not_found";
    }>
  | Readonly<{
      status: "rejected";
      reason: DurableOperatingPictureReadReason;
    }>;

export type DurableOperatingPictureStore = Readonly<{
  getVersion(versionId: string): Promise<DurableOperatingPictureVersionReadResult>;
  getHeadVersion(recordId: string): Promise<DurableOperatingPictureVersionReadResult>;
  listRecordVersions(recordId: string): Promise<DurableOperatingPictureHistoryReadResult>;
}>;
