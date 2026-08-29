import { describe, expect, it, vi } from "vitest";
import type { CalendarEvent } from "../connectors/calendar-event";
import type { CalendarEventWritePort } from "../connectors/google/calendar-write";
import type { ScopedCalendarAcquisitionPort } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import { createCalendarMoveProposalReference } from "./calendar-move-proposal-reference";
import { createCalendarMoveAuthorizationReference } from "./calendar-move-authorization";
import { executeConfirmedCalendarMove } from "./calendar-move-execution";

const source: CalendarEvent = {
  id: "deep",
  title: "SECRET",
  start: "2026-08-29T09:00:00.000Z",
  end: "2026-08-29T10:30:00.000Z",
  day: "SAT",
  time: "19:00",
  source: "google",
  calendarId: "primary",
  calendarName: "Private",
  timeMode: "deep_work",
};

function authorization() {
  const proposal = createCalendarMoveProposalReference({
    commitmentReference: "google-calendar:calendar:primary:event:deep",
    calendarId: "primary",
    eventId: "deep",
    expectedStart: source.start,
    expectedEnd: source.end,
    targetStart: "2026-08-29T10:30:00.000Z",
    targetEnd: "2026-08-29T12:00:00.000Z",
    durationMinutes: 90,
    observedAt: "2026-08-29T08:00:00.000Z",
  });
  return createCalendarMoveAuthorizationReference(proposal);
}

function completeRead(events: readonly CalendarEvent[]): ScopedCalendarAcquisitionPort {
  return {
    source: "google",
    listBetween: vi.fn(async () => [...events]),
    listBetweenWithCompleteness: vi.fn(async (start, end, limit = 100) => ({
      events,
      completeness: {
        sourceId: "google-calendar",
        windowStart: start,
        windowEnd: end,
        requestedLimit: limit,
        targetDiscovery: "calendar_list",
        targetCount: 1,
        targets: [{
          calendarId: "primary",
          status: "complete",
          returnedCount: events.length,
          continuation: "none",
        }],
        mergedReturnedCount: events.length,
        mergeTruncated: false,
        completeness: "complete",
        observedAt: "2026-08-29T08:10:00.000Z",
      },
    })),
  };
}

describe("confirmed Calendar move execution", () => {
  it("rechecks, writes once, independently reads back, and only then says Done", async () => {
    const moveEvent = vi.fn<CalendarEventWritePort["moveEvent"]>(
      async () => ({ ok: true, status: 200 }),
    );
    const readEvent = vi.fn<CalendarEventWritePort["readEvent"]>(async () => ({
      ...source,
      start: "2026-08-29T20:30:00+10:00",
      end: "2026-08-29T22:00:00+10:00",
    }));
    const writeConnector: CalendarEventWritePort = {
      hasWriteScope: vi.fn(async () => true),
      moveEvent,
      readEvent,
    };

    const result = await executeConfirmedCalendarMove({
      authorizationReference: authorization(),
      currentUserUtterance: "Yes.",
      readConnector: completeRead([source]),
      writeConnector,
      clock: () => new Date("2026-08-29T08:10:00.000Z"),
    });

    expect(result).toEqual({
      status: "resolved",
      reply:
        "Done — the deep-work block is now 8:30 PM–10:00 PM, verified against Google Calendar.",
    });
    expect(moveEvent).toHaveBeenCalledOnce();
    expect(moveEvent).toHaveBeenCalledWith(
      "primary",
      "deep",
      "2026-08-29T10:30:00.000Z",
      "2026-08-29T12:00:00.000Z",
    );
    expect(readEvent).toHaveBeenCalledWith("primary", "deep");
    expect(moveEvent.mock.invocationCallOrder[0]).toBeLessThan(
      readEvent.mock.invocationCallOrder[0]!,
    );
  });

  it("consumes confirmation and performs no write when the pre-write state diverged", async () => {
    const movedSource = { ...source, end: "2026-08-29T10:45:00.000Z" };
    const moveEvent = vi.fn<CalendarEventWritePort["moveEvent"]>();
    const writeConnector: CalendarEventWritePort = {
      hasWriteScope: vi.fn(async () => true),
      moveEvent,
      readEvent: vi.fn<CalendarEventWritePort["readEvent"]>(),
    };

    const result = await executeConfirmedCalendarMove({
      authorizationReference: authorization(),
      currentUserUtterance: "Yes.",
      readConnector: completeRead([movedSource]),
      writeConnector,
      clock: () => new Date("2026-08-29T08:10:00.000Z"),
    });

    expect(result.status).toBe("prewrite_diverged");
    expect(moveEvent).not.toHaveBeenCalled();
  });

  it("never claims Done when provider write succeeds but verification does not", async () => {
    const writeConnector: CalendarEventWritePort = {
      hasWriteScope: vi.fn(async () => true),
      moveEvent: vi.fn<CalendarEventWritePort["moveEvent"]>(
        async () => ({ ok: true, status: 200 }),
      ),
      readEvent: vi.fn<CalendarEventWritePort["readEvent"]>(async () => source),
    };

    const result = await executeConfirmedCalendarMove({
      authorizationReference: authorization(),
      currentUserUtterance: "Yes.",
      readConnector: completeRead([source]),
      writeConnector,
      clock: () => new Date("2026-08-29T08:10:00.000Z"),
    });

    expect(result.status).toBe("verification_failed");
    expect(result.reply).not.toContain("Done");
  });
});
