import type { CalendarEvent } from "../connectors/calendar-event";
import type { ConnectorSource } from "../connectors/types";
import type {
  CalendarAcquisitionResult,
  CalendarAcquisitionCompletenessEnvelope,
} from "../connectors/calendar-acquisition-completeness";
import { publishCalendarEvidence } from "./calendar-evidence-publisher";
import type { GovernedCalendarEvidenceInput } from "./projection-composer";
import { sourceResult, type SourceAdapterResult } from "./source-adapter-result";
import type { CalendarReadWindow } from "../lighter-jarvis/calendar-read-window";
import { aggregateCalendarTimeAllocation } from "../connectors/calendar-time-allocation";
import {
  publishGovernedWeeklyCalendarAllocation,
  type GovernedWeeklyCalendarAllocationPublication,
} from "./calendar-weekly-allocation-publisher";
import {
  publishCalendarFactualEvidence,
  type GovernedCalendarFactualEvent,
} from "./calendar-factual-evidence";

export type GovernedCalendarCoverageState =
  | "bounded_complete_request"
  | "bounded_partial_request"
  | "bounded";

export type ScopedCalendarEvidenceResult = SourceAdapterResult<GovernedCalendarEvidenceInput> & Readonly<{
  coverageState?: GovernedCalendarCoverageState;
  completeness?: CalendarAcquisitionCompletenessEnvelope;
  weeklyAllocation?: GovernedWeeklyCalendarAllocationPublication;
  factualEvents?: readonly GovernedCalendarFactualEvent[];
}>;

export interface ScopedCalendarAcquisitionPort {
  readonly source: ConnectorSource;
  listBetween(start: string, end: string, limit?: number): Promise<CalendarEvent[]>;
  listBetweenWithCompleteness?(
    start: string,
    end: string,
    limit?: number,
  ): Promise<CalendarAcquisitionResult>;
}

function coverageStateFor(
  envelope: CalendarAcquisitionCompletenessEnvelope,
): GovernedCalendarCoverageState | null {
  if (envelope.completeness === "complete") return "bounded_complete_request";
  if (envelope.completeness === "partial") return "bounded_partial_request";
  return null;
}

function withCoverage(
  result: SourceAdapterResult<GovernedCalendarEvidenceInput>,
  coverageState: GovernedCalendarCoverageState,
  completeness?: CalendarAcquisitionCompletenessEnvelope,
  weeklyAllocation?: GovernedWeeklyCalendarAllocationPublication | null,
  factualEvents?: readonly GovernedCalendarFactualEvent[],
): ScopedCalendarEvidenceResult {
  return Object.freeze({
    ...result,
    coverageState,
    ...(completeness === undefined ? {} : { completeness }),
    ...(weeklyAllocation ? { weeklyAllocation } : {}),
    ...(factualEvents ? { factualEvents } : {}),
  });
}

/** The scoped connector receives the authorized bounds before it can fetch private events. */
export async function acquireScopedCalendarEvidence(input: {
  connector: ScopedCalendarAcquisitionPort;
  clock: () => Date;
  requestedLimit: number;
  window: CalendarReadWindow;
}): Promise<ScopedCalendarEvidenceResult> {
  const startedAt = input.clock().toISOString();
  if (input.connector.source !== "google") {
    return sourceResult("unavailable", [], {
      observedAt: startedAt,
      failureReason: "calendar_governed_source_unavailable",
    });
  }

  try {
    if (input.connector.listBetweenWithCompleteness) {
      const acquisition = await input.connector.listBetweenWithCompleteness(
        input.window.start,
        input.window.end,
        input.requestedLimit,
      );
      const retrievedAt = input.clock().toISOString();
      const coverageState = coverageStateFor(acquisition.completeness);

      if (coverageState === null) {
        return Object.freeze({
          ...sourceResult("unavailable", [], {
            observedAt: retrievedAt,
            failureReason: "calendar_acquisition_unavailable",
          }),
          completeness: acquisition.completeness,
        });
      }

      const inWindow = acquisition.events.filter(event =>
        Date.parse(event.end) > Date.parse(input.window.start) &&
        Date.parse(event.start) < Date.parse(input.window.end));

      const weeklyAllocation = publishGovernedWeeklyCalendarAllocation({
        allocation: aggregateCalendarTimeAllocation({
          events: inWindow,
          windowStart: input.window.start,
          windowEnd: input.window.end,
        }),
        period: input.window.period,
        coverageState,
        observedAt: retrievedAt,
      });

      return withCoverage(
        sourceResult(
          "available",
          publishCalendarEvidence({
            sourceId: "google-calendar",
            availability: "available",
            retrievedAt,
            windowStart: input.window.start,
            windowEnd: input.window.end,
            requestedLimit: input.requestedLimit,
            coverageState,
            events: inWindow,
          }),
          { observedAt: retrievedAt },
        ),
        coverageState,
        acquisition.completeness,
        weeklyAllocation,
        publishCalendarFactualEvidence(inWindow),
      );
    }

    const events = await input.connector.listBetween(
      input.window.start,
      input.window.end,
      input.requestedLimit,
    );
    const retrievedAt = input.clock().toISOString();
    const inWindow = events.filter(event =>
      Date.parse(event.end) > Date.parse(input.window.start) &&
      Date.parse(event.start) < Date.parse(input.window.end));

    return withCoverage(
      sourceResult(
        "available",
        publishCalendarEvidence({
          sourceId: "google-calendar",
          availability: "available",
          retrievedAt,
          windowStart: input.window.start,
          windowEnd: input.window.end,
          requestedLimit: input.requestedLimit,
          coverageState: "bounded",
          events: inWindow,
        }),
        { observedAt: retrievedAt },
      ),
      "bounded",
      undefined,
      undefined,
      publishCalendarFactualEvidence(inWindow),
    );
  } catch {
    return sourceResult("unavailable", [], {
      observedAt: input.clock().toISOString(),
      failureReason: "calendar_acquisition_unavailable",
    });
  }
}
