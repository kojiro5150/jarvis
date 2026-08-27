import { describe, expect, it } from "vitest";
import { projectCalendarContext } from "./calendar-governed-context";
import { createGovernedContext } from "./governed-context";
import { resolveCalendarReadWindow } from "./calendar-read-window";

describe("Calendar governed-context closed projection", () => {
  it("copies only the explicit schedule allow-list into a deeply frozen artifact", () => {
    const malicious = Object.assign({ start: "2026-08-26T09:00:00Z", end: "2026-08-26T10:00:00Z" }, {
      title: "SECRET TITLE", eventId: "provider-id-123", description: "SECRET DESCRIPTION",
      attendees: ["private@example.com"], location: "SECRET LOCATION", organizer: { email: "private@example.com" },
      raw: { conferenceData: "secret" },
    });
    const window = resolveCalendarReadWindow("tomorrow", new Date("2026-08-25T00:00:00Z"));
    const context = createGovernedContext(projectCalendarContext([malicious as never], window));

    expect(context).toEqual({ version: "1", sources: [{ source: "calendar", capability: "calendar.read",
      period: "tomorrow", window: { start: window.start, end: window.end, timeZone: "Australia/Melbourne" },
      commitments: [{ start: malicious.start, end: malicious.end }], userSuppliedBindings: [], unboundUserSuppliedDetails: [] }] });
    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.sources)).toBe(true);
    expect(Object.isFrozen(context.sources[0].commitments[0])).toBe(true);
    expect(JSON.stringify(context)).not.toMatch(/SECRET|provider-id-123|attendees|organizer|location|raw|conferenceData/);
  });
});
