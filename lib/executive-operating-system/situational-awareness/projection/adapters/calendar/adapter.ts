import { createProjectionArtifact } from "../../engine";
import type { ProjectionAdapter, ProjectionArtifact } from "../../types";
import { mapCalendarEvents } from "./mapping";
import type { CalendarProjectionOptions } from "./types";

export const CALENDAR_PROJECTION_ADAPTER_ID = "google-calendar";

/** Bounded Connector -> Projection translation; it performs no reasoning or orchestration. */
export class CalendarProjectionAdapter implements ProjectionAdapter {
  readonly id = CALENDAR_PROJECTION_ADAPTER_ID;
  readonly #options: CalendarProjectionOptions;

  constructor(options: CalendarProjectionOptions) {
    this.#options = options;
  }

  async project(): Promise<ProjectionArtifact> {
    if (this.#options.connector.source !== "google") {
      throw new Error("calendar projection adapter requires the Google Calendar connector");
    }
    const events = await this.#options.connector.listUpcoming(this.#options.limit);
    const commitments = mapCalendarEvents(events);

    return createProjectionArtifact({
      entities: {
        identity: this.#options.identity,
        commitments,
      },
      provenance: {
        sourceId: this.#options.sourceId ?? "google-calendar",
        sourceKind: "calendar",
        adapterId: this.id,
        projectedAt: this.#options.observedAt,
        availability: this.#options.availability ?? "available",
      },
      validationState: "valid",
      metadata: {
        connector: "google-calendar",
        eventCount: String(commitments.length),
      },
    });
  }
}
