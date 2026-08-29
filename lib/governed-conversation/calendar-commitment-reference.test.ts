import { describe, expect, it } from "vitest";
import type { CalendarEvent } from "../connectors/calendar-event";
import { calendarCommitmentIdentity } from "./calendar-commitment-reference";
import {
  CALENDAR_CONVERSATIONAL_DISCLOSURE_POLICY,
  publishCalendarEvidence,
} from "./calendar-evidence-publisher";

function event(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "evt-1",
    title: "Example",
    start: "2026-09-01T13:00:00+10:00",
    end: "2026-09-01T14:00:00+10:00",
    day: "TUE",
    time: "13:00",
    source: "google",
    calendarId: "primary",
    calendarName: "Work",
    ...overrides,
  };
}

describe("canonical Calendar commitment identity", () => {
  it("matches the existing protected governed Calendar publisher identity exactly", () => {
    const source = event();
    const identity = calendarCommitmentIdentity(source);
    expect(identity).toEqual({
      commitmentReference: "google-calendar:calendar:primary:event:evt-1",
      resourceId: "calendar:primary:event:evt-1",
      provenanceReference: "google-calendar:calendar:primary:event:evt-1#provenance",
    });

    const published = publishCalendarEvidence({
      sourceId: "google-calendar",
      availability: "available",
      retrievedAt: "2026-08-29T05:30:00.000Z",
      windowStart: "2026-09-01T00:00:00.000Z",
      windowEnd: "2026-09-02T00:00:00.000Z",
      requestedLimit: 100,
      coverageState: "bounded_complete_request",
      events: [source],
    });

    expect(published).toHaveLength(1);
    expect(identity).toMatchObject({
      commitmentReference: published[0]?.commitmentReference,
      resourceId: published[0]?.sourceReference.resourceId,
      provenanceReference: published[0]?.provenanceReference,
    });
    expect(published[0]?.policyReference).toBe(CALENDAR_CONVERSATIONAL_DISCLOSURE_POLICY);
  });

  it("rejects local and synthetic provider identities", () => {
    expect(calendarCommitmentIdentity(event({
      id: "local-1",
      source: "local",
      calendarId: "local",
      calendarName: "Local",
    }))).toBeNull();

    expect(calendarCommitmentIdentity(event({
      id: "google-primary-0",
    }))).toBeNull();
  });
});
