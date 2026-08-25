import type { CalendarEvent } from "../connectors/calendar-event";
import type { ConnectorSource } from "../connectors/types";
import { publishCalendarEvidence } from "./calendar-evidence-publisher";
import type { GovernedCalendarEvidenceInput } from "./projection-composer";
import { sourceResult, type SourceAdapterResult } from "./source-adapter-result";
import type { CalendarReadWindow } from "../lighter-jarvis/calendar-read-window";

export interface ScopedCalendarAcquisitionPort {
  readonly source: ConnectorSource;
  listBetween(start: string, end: string, limit?: number): Promise<CalendarEvent[]>;
}

/** The scoped connector receives the authorized bounds before it can fetch private events. */
export async function acquireScopedCalendarEvidence(input: {
  connector: ScopedCalendarAcquisitionPort; clock: () => Date; requestedLimit: number; window: CalendarReadWindow;
}): Promise<SourceAdapterResult<GovernedCalendarEvidenceInput>> {
  const startedAt = input.clock().toISOString();
  if (input.connector.source !== "google") return sourceResult("unavailable", [], {
    observedAt: startedAt, failureReason: "calendar_governed_source_unavailable",
  });
  try {
    const events = await input.connector.listBetween(input.window.start, input.window.end, input.requestedLimit);
    const retrievedAt = input.clock().toISOString();
    const inWindow = events.filter(event =>
      Date.parse(event.end) > Date.parse(input.window.start) && Date.parse(event.start) < Date.parse(input.window.end));
    return sourceResult("available", publishCalendarEvidence({ sourceId: "google-calendar", availability: "available",
      retrievedAt, windowStart: input.window.start, windowEnd: input.window.end, requestedLimit: input.requestedLimit,
      coverageState: "bounded", events: inWindow }), { observedAt: retrievedAt });
  } catch {
    return sourceResult("unavailable", [], { observedAt: input.clock().toISOString(), failureReason: "calendar_acquisition_unavailable" });
  }
}
