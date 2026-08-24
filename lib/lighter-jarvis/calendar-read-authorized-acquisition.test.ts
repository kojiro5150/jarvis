import { describe, expect, it, vi } from "vitest";
import type { CalendarEvent } from "../connectors/calendar-event";
import {
  acquireAuthorizedCalendarEvidence,
  acquireCalendarEvidenceForAuthorityDecision,
} from "./calendar-read-authorized-acquisition";
import type { CalendarReadAuthorityDecision } from "./calendar-read-authority";

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
        proposedOperation: { capability: "calendar.read" },
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
        proposedOperation: { capability: "calendar.read" },
        currentUserUtterance: "How does tomorrow look?",
      },
      acquisition: acquisition(listUpcoming),
    });

    expect(result.authority.decision).toBe("ASK");
    expect(result.evidence).toBeNull();
    expect(listUpcoming).not.toHaveBeenCalled();
  });

  it("does not enter governed acquisition or call the connector after DENY", async () => {
    const listUpcoming = vi.fn().mockResolvedValue([event]);
    const denied: CalendarReadAuthorityDecision = Object.freeze({
      capability: "calendar.read",
      decision: "DENY",
      reason: "explicit_calendar_read_not_established",
      readOnly: true,
      authorityEvidence: Object.freeze([]),
    });

    const result = await acquireCalendarEvidenceForAuthorityDecision(
      denied,
      acquisition(listUpcoming),
    );

    expect(result.authority.decision).toBe("DENY");
    expect(result.evidence).toBeNull();
    expect(listUpcoming).not.toHaveBeenCalled();
  });
});
