import type { CalendarEvent } from "../connectors/calendar-event";
import type { ConnectorSource } from "../connectors/types";
import { publishCalendarEvidence } from "./calendar-evidence-publisher";
import type { GovernedCalendarEvidenceInput } from "./projection-composer";
import { sourceResult, type SourceAdapterResult } from "./source-adapter-result";

export interface CalendarAcquisitionPort {
  readonly source: ConnectorSource;
  listUpcoming(limit?: number): Promise<CalendarEvent[]>;
}

export async function acquireGovernedCalendarEvidence(input: {
  readonly connector: CalendarAcquisitionPort;
  readonly clock: () => Date;
  readonly requestedLimit: number;
  readonly horizonDays: number;
}): Promise<SourceAdapterResult<GovernedCalendarEvidenceInput>> {
  if (!Number.isInteger(input.requestedLimit) || input.requestedLimit < 0 ||
      !Number.isInteger(input.horizonDays) || input.horizonDays <= 0) {
    throw new Error("calendar acquisition configuration is invalid");
  }
  const acquisitionStartedAt = input.clock().toISOString();
  if (input.connector.source !== "google") {
    return sourceResult("unavailable", [], {
      observedAt: acquisitionStartedAt,
      failureReason: "calendar_governed_source_unavailable",
    });
  }
  try {
    const events = await input.connector.listUpcoming(input.requestedLimit);
    const retrievedAt = input.clock().toISOString();
    const windowEnd = new Date(Date.parse(acquisitionStartedAt) + input.horizonDays * 86_400_000).toISOString();
    return sourceResult("available", publishCalendarEvidence({
      sourceId: "google-calendar",
      availability: "available",
      retrievedAt,
      windowStart: acquisitionStartedAt,
      windowEnd,
      requestedLimit: input.requestedLimit,
      coverageState: "bounded",
      events,
    }), { observedAt: retrievedAt });
  } catch {
    const retrievedAt = input.clock().toISOString();
    return sourceResult("unavailable", [], {
      observedAt: retrievedAt,
      failureReason: "calendar_acquisition_unavailable",
    });
  }
}
