import { createProjectionArtifact } from "../../engine";
import type { ProjectionAdapter, ProjectionArtifact } from "../../types";
import { normalizeGmailObservation } from "./normalizer";
import type { GmailProjectionOptions } from "./types";

export const GMAIL_PROJECTION_ADAPTER_ID = "google.gmail.operational-communication";

/** Production Gmail boundary: retrieval metadata remains artifact provenance, never canonical semantics. */
export class GmailProjectionAdapter implements ProjectionAdapter {
  readonly id = GMAIL_PROJECTION_ADAPTER_ID;
  constructor(private readonly options: GmailProjectionOptions) {}

  async project(): Promise<ProjectionArtifact> {
    if (this.options.connector.source !== "google") throw new Error("Gmail projection requires the Google Gmail connector");
    const observations = (await this.options.connector.listOperationalObservations(this.options.limit)).map(normalizeGmailObservation);
    const sourceId = this.options.sourceId ?? "google-gmail";
    return createProjectionArtifact({
      entities: {
        identity: this.options.identity,
        communications: observations.map((observation) => ({
          id: `${sourceId}:${observation.messageId}`,
          sender: observation.sender,
          recipients: observation.recipients,
          sentAt: observation.sentAt,
          ...(observation.inReplyTo === undefined ? {} : { inReplyTo: observation.inReplyTo }),
          references: observation.references,
        })),
      },
      provenance: { sourceId, sourceKind: "email", adapterId: this.id, projectedAt: this.options.projectedAt, availability: "available" },
      validationState: "valid",
      metadata: {
        connector: "gmail",
        observationCount: String(observations.length),
        connectorProvenance: JSON.stringify(observations.map(({ provenance }) => provenance)),
      },
    });
  }
}
