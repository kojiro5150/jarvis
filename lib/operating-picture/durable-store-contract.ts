import type {
  PersistedOperatingPictureProjectionMetadata,
  PersistedOperatingPictureVersion,
} from "./persistence-record";

export type DurableOperatingPictureReadReason =
  | "persistence_unavailable"
  | "unexpected_persistence_response"
  | "persistence_integrity_failure"
  | "recovery_scope_exceeded";


export type DurableOperatingPictureHead = Readonly<{
  recordId: string;
  versionId: string;
}>;

export type DurableOperatingPictureHeadListResult =
  | Readonly<{
      status: "found";
      heads: readonly DurableOperatingPictureHead[];
    }>
  | Readonly<{
      status: "empty";
    }>
  | Readonly<{
      status: "rejected";
      reason: DurableOperatingPictureReadReason;
    }>;


export type DurableOperatingPictureProjectionMetadataReadResult =
  | Readonly<{
      status: "found";
      metadata: PersistedOperatingPictureProjectionMetadata;
    }>
  | Readonly<{
      status: "not_found";
    }>
  | Readonly<{
      status: "rejected";
      reason: DurableOperatingPictureReadReason;
    }>;

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
  listRecordHeads(): Promise<DurableOperatingPictureHeadListResult>;
  getVersionProjectionMetadata(
    versionId: string,
  ): Promise<DurableOperatingPictureProjectionMetadataReadResult>;
  getVersion(versionId: string): Promise<DurableOperatingPictureVersionReadResult>;
  getHeadVersion(recordId: string): Promise<DurableOperatingPictureVersionReadResult>;
  listRecordVersions(recordId: string): Promise<DurableOperatingPictureHistoryReadResult>;
}>;
