import type { GmailProductionAcquisition } from "../connectors/google/gmail";
import { normalizeGmailObservation } from "../executive-operating-system/situational-awareness/projection/adapters/gmail/normalizer";
import type {
  GmailRecipientEvidenceState,
  NormalizedGmailObservation,
} from "../executive-operating-system/situational-awareness/projection/adapters/gmail/types";

/** Narrow constitutional context boundary between canonical projection and application composition. */
export interface ProductionGmailRecipientEvidence {
  readonly communications: readonly NormalizedGmailObservation[];
  readonly sourceId: "google-gmail";
  readonly availability: "available" | "unavailable";
  readonly state: GmailRecipientEvidenceState;
  readonly observedAt?: string;
  readonly snapshotId?: string;
}

export function projectProductionGmailEvidence(
  acquisition: GmailProductionAcquisition,
): ProductionGmailRecipientEvidence {
  return Object.freeze({
    communications: Object.freeze(acquisition.observations.map(normalizeGmailObservation)),
    sourceId: "google-gmail",
    availability: "available",
    state: "available",
    observedAt: acquisition.observedAt,
    snapshotId: acquisition.snapshotId,
  });
}
