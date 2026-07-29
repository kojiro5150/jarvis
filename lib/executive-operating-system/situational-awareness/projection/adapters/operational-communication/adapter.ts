import { createProjectionArtifact } from "../../engine";
import type { ProjectionAdapter, ProjectionArtifact } from "../../types";
import type { OperationalCommunicationProjectionOptions } from "./types";

export const OPERATIONAL_COMMUNICATION_PROJECTION_ADAPTER_ID = "canonical.operational-communication";

/**
 * Publishes only supplied intrinsic and protocol-defined observations. It does not group,
 * classify, infer, retrieve preserved evidence, or relate communications to other publications.
 */
export class OperationalCommunicationProjectionAdapter implements ProjectionAdapter {
  readonly id = OPERATIONAL_COMMUNICATION_PROJECTION_ADAPTER_ID;

  constructor(private readonly options: OperationalCommunicationProjectionOptions) {}

  project(): ProjectionArtifact {
    return createProjectionArtifact({
      entities: {
        identity: this.options.identity,
        communications: this.options.observations.map((observation) => ({
          id: `${this.options.sourceId}:${observation.messageId}`,
          sender: observation.sender,
          recipients: [...observation.recipients],
          sentAt: observation.sentAt,
          ...(observation.receivedAt === undefined ? {} : { receivedAt: observation.receivedAt }),
          ...(observation.subject === undefined ? {} : { subject: observation.subject }),
          ...(observation.inReplyTo === undefined ? {} : { inReplyTo: observation.inReplyTo }),
          references: [...(observation.references ?? [])],
        })),
      },
      provenance: {
        sourceId: this.options.sourceId,
        sourceKind: "email",
        adapterId: this.id,
        projectedAt: this.options.projectedAt,
        availability: "available",
      },
      validationState: "valid",
      metadata: {},
    });
  }
}
