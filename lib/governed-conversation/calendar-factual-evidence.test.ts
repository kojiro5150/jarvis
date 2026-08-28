import { describe, expect, it } from "vitest";
import { publishCalendarFactualEvidence } from "./calendar-factual-evidence";

describe("publishCalendarFactualEvidence", () => {
  it("publishes only the closed deterministic title projection", () => {
    const event = {
      id: "event-1",
      title: "URGENT Board Crisis — Deep Work",
      start: "2026-09-01T09:00:00+10:00",
      end: "2026-09-01T10:00:00+10:00",
      day: "TUE",
      time: "09:00",
      source: "google" as const,
      calendarId: "primary",
      calendarName: "Work",
      eventLabelId: "provider-label",
      timeMode: "routine" as const,
      status: "confirmed" as const,
    };

    expect(publishCalendarFactualEvidence([event])).toEqual([{
      title: "URGENT Board Crisis — Deep Work",
      start: "2026-09-01T09:00:00+10:00",
      end: "2026-09-01T10:00:00+10:00",
      calendarName: "Work",
    }]);
    expect(JSON.stringify(publishCalendarFactualEvidence([event]))).not.toContain("provider-label");
    expect(JSON.stringify(publishCalendarFactualEvidence([event]))).not.toContain("routine");
  });

  it("does not publish all-day title content into the timed factual surface", () => {
    expect(publishCalendarFactualEvidence([{
      id: "all-day", title: "Private all-day title", start: "2026-09-01", end: "2026-09-02",
      day: "TUE", time: "All day", source: "google" as const, calendarId: "primary", calendarName: "Work",
    }])).toEqual([]);
  });
});