import type { OperationalIdentity, OperationalSourceId, OperationalTimestamp } from "../../../model";

/** Authoritative protocol observations accepted by the bounded communication adapter. */
export interface OperationalCommunicationObservation {
  readonly messageId: string;
  readonly sender: string;
  readonly recipients: readonly string[];
  readonly sentAt: OperationalTimestamp;
  readonly receivedAt?: OperationalTimestamp;
  readonly subject?: string;
  readonly inReplyTo?: string;
  readonly references?: readonly string[];
}

export interface OperationalCommunicationProjectionOptions {
  readonly identity: OperationalIdentity;
  readonly sourceId: OperationalSourceId;
  readonly projectedAt: OperationalTimestamp;
  readonly observations: readonly OperationalCommunicationObservation[];
}
