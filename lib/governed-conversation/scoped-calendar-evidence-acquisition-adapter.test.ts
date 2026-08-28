import { describe, expect, it, vi } from "vitest";
import { acquireScopedCalendarEvidence } from "./scoped-calendar-evidence-acquisition-adapter";
import type { CalendarAcquisitionResult } from "../connectors/calendar-acquisition-completeness";
import type { CalendarEvent } from "../connectors/calendar-event";
import type { CalendarReadWindow } from "../lighter-jarvis/calendar-read-window";

const window: CalendarReadWindow = Object.freeze({
  start: "2026-08-27T14:00:00.000Z",
  end: "2026-08-28T14:00:00.000Z",
  timeZone: "Australia/Melbourne",
  period: "today",
});

const event: CalendarEvent = {
  id: "evt-1",
  title: "Hidden",
  start: "2026-08-28T10:00:00+10:00",
  end: "2026-08-28T11:00:00+10:00",
  day: "FRI",
  time: "10:00",
  source: "google",
  calendarId: "primary",
  calendarName: "Primary",
};

const acquisition = (
  completeness: "complete" | "partial" | "unavailable",
  events: readonly CalendarEvent[] = [event],
): CalendarAcquisitionResult => Object.freeze({
  events,
  completeness: Object.freeze({
    sourceId: "google-calendar",
    windowStart: window.start,
    windowEnd: window.end,
    requestedLimit: 5,
    targetDiscovery: "calendar_list",
    targetCount: 1,
    targets: Object.freeze([
      Object.freeze({
        calendarId: "primary",
        status: completeness === "complete" ? "complete" : completeness === "partial" ? "partial" : "unavailable",
        returnedCount: events.length,
        continuation: completeness === "complete" ? "none" : "unknown",
      }),
    ]),
    mergedReturnedCount: events.length,
    mergeTruncated: false,
    completeness,
    observedAt: "2026-08-28T00:00:00.000Z",
  }),
});

describe("scoped Calendar completeness mapping", () => {
  it("maps a proven complete acquisition to bounded_complete_request", async () => {
    const listBetween = vi.fn();
    const listBetweenWithCompleteness = vi.fn(async () => acquisition("complete"));

    const result = await acquireScopedCalendarEvidence({
      connector: { source: "google", listBetween, listBetweenWithCompleteness },
      clock: () => new Date("2026-08-28T00:00:00.000Z"),
      requestedLimit: 5,
      window,
    });

    expect(result.status).toBe("available");
    expect(result.coverageState).toBe("bounded_complete_request");
    expect(result.completeness?.completeness).toBe("complete");
    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0].coverageLimit).toContain("completeness=bounded_complete_request");
    expect(listBetween).not.toHaveBeenCalled();
  });

  it("maps partial acquisition to bounded_partial_request while preserving usable evidence", async () => {
    const result = await acquireScopedCalendarEvidence({
      connector: {
        source: "google",
        listBetween: vi.fn(),
        listBetweenWithCompleteness: vi.fn(async () => acquisition("partial")),
      },
      clock: () => new Date("2026-08-28T00:00:00.000Z"),
      requestedLimit: 5,
      window,
    });

    expect(result.status).toBe("available");
    expect(result.coverageState).toBe("bounded_partial_request");
    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0].coverageLimit).toContain("completeness=bounded_partial_request");
  });

  it("maps unavailable completeness to an unavailable governed result", async () => {
    const result = await acquireScopedCalendarEvidence({
      connector: {
        source: "google",
        listBetween: vi.fn(),
        listBetweenWithCompleteness: vi.fn(async () => acquisition("unavailable", [])),
      },
      clock: () => new Date("2026-08-28T00:00:00.000Z"),
      requestedLimit: 5,
      window,
    });

    expect(result).toMatchObject({
      status: "unavailable",
      evidence: [],
      failureReason: "calendar_acquisition_unavailable",
      completeness: { completeness: "unavailable" },
    });
  });

  it("preserves legacy bounded semantics when the connector has no completeness method", async () => {
    const result = await acquireScopedCalendarEvidence({
      connector: {
        source: "google",
        listBetween: vi.fn(async () => [event]),
      },
      clock: () => new Date("2026-08-28T00:00:00.000Z"),
      requestedLimit: 5,
      window,
    });

    expect(result.status).toBe("available");
    expect(result.coverageState).toBe("bounded");
    expect(result.evidence[0].coverageLimit).toContain("completeness=bounded");
  });
});
