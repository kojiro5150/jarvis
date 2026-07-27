import type { CalendarConnector } from "../../../../../connectors/calendar";
import type { CalendarEvent } from "../../../../../connectors/calendar-event";
import type { OperationalIdentity } from "../../../model";
import type { SourceAvailability } from "../../types";

/** Connector observation fields understood by the calendar semantic boundary. */
export interface CalendarProjectionEvent extends CalendarEvent {
  /** Google event state when supplied by the connector. Omission means confirmed. */
  readonly status?: "confirmed" | "tentative" | "cancelled";
}

export interface CalendarProjectionConnector extends Pick<CalendarConnector, "source"> {
  listUpcoming(limit?: number): Promise<readonly CalendarProjectionEvent[]>;
}

/** All non-event facts are supplied observations, never adapter-generated values. */
export interface CalendarProjectionOptions {
  readonly connector: CalendarProjectionConnector;
  readonly identity: OperationalIdentity;
  readonly observedAt: string;
  readonly availability?: SourceAvailability;
  readonly sourceId?: string;
  readonly limit?: number;
}
