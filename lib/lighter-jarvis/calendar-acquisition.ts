import type { CalendarEvent } from "@/lib/connectors/calendar-event";
import type { CalendarAcquisitionPort } from "@/lib/governed-conversation/calendar-evidence-acquisition-adapter";

export type CalendarAcquisitionOutcome =
  | Readonly<{
      status: "available";
      events: readonly CalendarEvent[];
    }>
  | Readonly<{
      status: "unavailable";
    }>;

/**
 * Acquires bounded Calendar observations without deciding whether a request is
 * allowed to use them.
 *
 * Request authority is intentionally an upstream concern. This function does
 * not inspect user text, select a connector, construct grants, publish the
 * observations, or fall back to local data. Its sole dependency is the
 * established CalendarAcquisitionPort.
 */
export async function acquireCalendarObservations(
  port: CalendarAcquisitionPort,
  limit: number,
): Promise<CalendarAcquisitionOutcome> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("calendar acquisition limit must be a positive integer");
  }

  if (port.source !== "google") {
    return Object.freeze({ status: "unavailable" });
  }

  try {
    const events = await port.listUpcoming(limit);
    return Object.freeze({
      status: "available",
      events: Object.freeze([...events]),
    });
  } catch {
    return Object.freeze({ status: "unavailable" });
  }
}
