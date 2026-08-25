import { describe, expect, it, vi } from "vitest";
import type { CalendarEvent } from "../connectors/calendar-event";
import { acquireAuthorizedCalendarEvidence } from "./calendar-read-authorized-acquisition";

const TEST_WINDOW = Object.freeze({ start: "2026-08-25T00:00:00.000Z", end: "2026-09-01T00:00:00.000Z", timeZone: "Australia/Melbourne", period: "default" as const });
const event: CalendarEvent = {
  id: "provider-event",
  title: "Private event",
  start: "2026-08-25T09:00:00Z",
  end: "2026-08-25T10:00:00Z",
  day: "TUE",
  time: "09:00",
  source: "google",
  calendarId: "primary",
  calendarName: "Private",
};

const acquisition = (listUpcoming: () => Promise<CalendarEvent[]>) => ({
  connector: { source: "google" as const, listUpcoming },
  clock: () => new Date("2026-08-24T00:00:00Z"),
  requestedLimit: 5,
  horizonDays: 7,
});

describe("authority-gated governed Calendar acquisition", () => {
  it("reuses the PR1 evaluator and existing governed acquisition after ALLOW", async () => {
    const listUpcoming = vi.fn().mockResolvedValue([event]);

    const result = await acquireAuthorizedCalendarEvidence({
      authority: {
        proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
        currentUserUtterance: "What's on my calendar tomorrow?",
      },
      acquisition: acquisition(listUpcoming),
    });

    expect(result.authority.decision).toBe("ALLOW");
    expect(listUpcoming).toHaveBeenCalledOnce();
    expect(result.evidence).toMatchObject({ status: "available" });
  });

  it("does not enter governed acquisition or call the connector after ASK", async () => {
    const listUpcoming = vi.fn().mockResolvedValue([event]);

    const result = await acquireAuthorizedCalendarEvidence({
      authority: {
        proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
        currentUserUtterance: "How does tomorrow look?",
      },
      acquisition: acquisition(listUpcoming),
    });

    expect(result.authority.decision).toBe("ASK");
    expect(result.evidence).toBeNull();
    expect(listUpcoming).not.toHaveBeenCalled();
  });

  it("contains an authorized provider failure on the composed path", async () => {
    const listUpcoming = vi.fn().mockRejectedValue(new Error("provider unavailable"));

    const result = await acquireAuthorizedCalendarEvidence({
      authority: {
        proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
        currentUserUtterance: "Check my calendar for tomorrow.",
      },
      acquisition: acquisition(listUpcoming),
    });

    expect(result.authority.decision).toBe("ALLOW");
    expect(listUpcoming).toHaveBeenCalledOnce();
    expect(result.evidence).toMatchObject({
      status: "unavailable",
      evidence: [],
      failureReason: "calendar_acquisition_unavailable",
    });
  });

  it("preserves governed non-Google refusal on the composed path", async () => {
    const listUpcoming = vi.fn().mockResolvedValue([event]);

    const result = await acquireAuthorizedCalendarEvidence({
      authority: {
        proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
        currentUserUtterance: "Show my calendar.",
      },
      acquisition: {
        ...acquisition(listUpcoming),
        connector: { source: "local", listUpcoming },
      },
    });

    expect(result.authority.decision).toBe("ALLOW");
    expect(listUpcoming).not.toHaveBeenCalled();
    expect(result.evidence).toMatchObject({
      status: "unavailable",
      evidence: [],
      failureReason: "calendar_governed_source_unavailable",
    });
  });

  it("does not acquire when only prior Calendar context could imply authority", async () => {
    const listUpcoming = vi.fn().mockResolvedValue([event]);

    const result = await acquireAuthorizedCalendarEvidence({
      authority: {
        proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
        currentUserUtterance: "What should I do?",
      },
      acquisition: acquisition(listUpcoming),
    });

    expect(result.authority.decision).toBe("ASK");
    expect(result.evidence).toBeNull();
    expect(listUpcoming).not.toHaveBeenCalled();
  });

  it.each([
    "Don't show my calendar.",
    "Check my calendar and then add lunch.",
  ])("does not acquire for negated or mixed wording: %j", async (currentUserUtterance) => {
    const listUpcoming = vi.fn().mockResolvedValue([event]);

    const result = await acquireAuthorizedCalendarEvidence({
      authority: {
        proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
        currentUserUtterance,
      },
      acquisition: acquisition(listUpcoming),
    });

    expect(result.authority.decision).toBe("ASK");
    expect(result.evidence).toBeNull();
    expect(listUpcoming).not.toHaveBeenCalled();
  });
});
