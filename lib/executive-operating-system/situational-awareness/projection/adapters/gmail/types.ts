import type { OperationalIdentity, OperationalSourceId, OperationalTimestamp } from "../../../model";

export interface GmailHeaderObservation { readonly name: string; readonly value: string }
export interface GmailPartObservation { readonly mimeType?: string; readonly filename?: string; readonly parts?: readonly GmailPartObservation[] }

/** The bounded, metadata-only portion of a Gmail API Message consumed by projection. */
export interface GmailMessageObservation {
  readonly id: string;
  readonly threadId?: string;
  readonly internalDate?: string;
  readonly labelIds?: readonly string[];
  readonly payload?: GmailPartObservation & { readonly headers?: readonly GmailHeaderObservation[] };
  readonly retrievedAt?: OperationalTimestamp;
}

export interface NormalizedGmailObservation {
  readonly messageId: string;
  readonly sender: string;
  readonly recipients: readonly string[];
  readonly sentAt: OperationalTimestamp;
  readonly inReplyTo?: string;
  readonly references: readonly string[];
  readonly provenance: {
    readonly gmailMessageId: string;
    readonly gmailThreadId?: string;
    readonly gmailInternalDate?: string;
    readonly retrievedAt?: OperationalTimestamp;
    readonly hasAttachment: boolean;
    readonly unread: boolean;
    readonly multipart: boolean;
    readonly htmlOnly: boolean;
  };
}

export interface GmailProjectionConnector {
  readonly source: "google";
  listOperationalObservations(limit?: number): Promise<readonly GmailMessageObservation[]>;
}

export interface GmailProjectionOptions {
  readonly identity: OperationalIdentity;
  readonly sourceId?: OperationalSourceId;
  readonly projectedAt: OperationalTimestamp;
  readonly connector: GmailProjectionConnector;
  readonly limit?: number;
}
