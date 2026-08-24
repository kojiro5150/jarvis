import { describe, expect, it, vi } from "vitest";
import type { CalendarEvent } from "@/lib/connectors/calendar-event";
import { acquireCalendarObservations } from "./calendar-acquisition";

const event: CalendarEvent = {
  id: "provider-event",
  title: "Private appointment",
  start: "2026-08-25T09:00:00Z",
  end: "2026-08-25T10:00:00Z",
  day: "TUE",
  time: "09:00",
  source: "google",
  calendarId: "primary",
  calendarName: "Private",
};

describe("lighter Calendar acquisition", () => {
  it("acquires through CalendarAcquisitionPort with the supplied bound", async () => {
    const listUpcoming = vi.fn().mockResolvedValue([event]);

    const result = await acquireCalendarObservations(
      { source: "google", listUpcoming },
      5,
    );

    expect(listUpcoming).toHaveBeenCalledOnce();
    expect(listUpcoming).toHaveBeenCalledWith(5);
    expect(result).toEqual({ status: "available", events: [event] });
    expect(Object.isFrozen(result)).toBe(true);
    if (result.status === "available") {
      expect(Object.isFrozen(result.events)).toBe(true);
    }
  });

  it("does not acquire from a non-Google compatibility source", async () => {
    const listUpcoming = vi.fn().mockResolvedValue([event]);

    await expect(acquireCalendarObservations(
      { source: "local", listUpcoming },
      5,
    )).resolves.toEqual({ status: "unavailable" });
    expect(listUpcoming).not.toHaveBeenCalled();
  });

  it("contains acquisition failure without exposing provider details", async () => {
    const result = await acquireCalendarObservations({
      source: "google",
      listUpcoming: async () => { throw new Error("provider secret"); },
    }, 5);

    expect(result).toEqual({ status: "unavailable" });
  });

  it.each([0, -1, 1.5])("rejects invalid bounds (%s) before acquisition", async (limit) => {
    const listUpcoming = vi.fn();
    await expect(acquireCalendarObservations(
      { source: "google", listUpcoming },
      limit,
    )).rejects.toThrow("calendar acquisition limit must be a positive integer");
    expect(listUpcoming).not.toHaveBeenCalled();
  });
});
