import { createProjectionArtifact } from "../../engine";
import type { ProjectionAdapter, ProjectionArtifact } from "../../types";
import type { DriveSourceProjectionOptions } from "./types";

export const DRIVE_SOURCE_PROJECTION_ADAPTER_ID = "google.drive.governed-source";

/**
 * Projects only governed Drive source availability/provenance.
 *
 * File names, paths, content and source-authored labels are deliberately not
 * promoted into canonical executive entities by this adapter. A future Drive
 * semantic projection requires its own deterministic mapping and attention
 * policy evidence.
 */
export class DriveSourceProjectionAdapter implements ProjectionAdapter {
  readonly id = DRIVE_SOURCE_PROJECTION_ADAPTER_ID;

  constructor(private readonly options: DriveSourceProjectionOptions) {
    if (!Number.isInteger(options.governedEvidenceCount) || options.governedEvidenceCount < 0) {
      throw new Error("Drive governedEvidenceCount must be a non-negative integer");
    }
  }

  project(): ProjectionArtifact {
    return createProjectionArtifact({
      entities: {
        identity: this.options.identity,
      },
      provenance: {
        sourceId: this.options.sourceId ?? "google-drive",
        sourceKind: "drive",
        adapterId: this.id,
        projectedAt: this.options.projectedAt,
        availability: this.options.availability,
      },
      validationState: "valid",
      metadata: {
        connector: "google-drive",
        governedEvidenceCount: String(this.options.governedEvidenceCount),
        semanticProjection: "none",
      },
    });
  }
}
