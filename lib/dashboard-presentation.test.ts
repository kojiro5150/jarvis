import { describe, expect, it } from "vitest";
import { executiveContextFixture } from "./executive-context/fixtures";
import { buildDashboardPresentation, formatDashboardRelativeTime } from "./dashboard-presentation";

const configuration = { locale: "en-AU", viewerTimeZone: "Australia/Melbourne", referenceTime: "2026-07-31T12:00:00Z", sourceScope: ["calendar", "email", "drive"] } as const;

describe("governed Dashboard presentation", () => {
  it("replays identically and exposes no deferred or rejected fields", () => {
    const first = buildDashboardPresentation(executiveContextFixture, configuration);
    const second = buildDashboardPresentation(executiveContextFixture, configuration);
    expect(first).toEqual(second);
    expect(JSON.stringify(first)).not.toMatch(/updatedAt|snippet|recurringEventId|selfAttendeeResponse|progress|calendarName|sourceLabel|unread|important/);
    expect(first.needsReply).toEqual([]);
    expect(first.urgentCommunications).toEqual([]);
  });

  it("applies the documented locale, timezone, eligibility, and identity tie-breaker", () => {
    const presentation = buildDashboardPresentation(executiveContextFixture, configuration);
    expect(presentation.configuration).toEqual(configuration);
    expect(presentation.calendar.every(item => item.status === "scheduled" || item.status === "cancelled")).toBe(true);
    expect([...presentation.priorities].map(item => item.id)).toEqual([...presentation.priorities].map(item => item.id).sort());
  });

  it("uses explicit v1 duration thresholds and never describes future evidence", () => {
    expect(formatDashboardRelativeTime("2026-07-31T11:59:31Z", configuration)).toBe("just now");
    expect(formatDashboardRelativeTime("2026-07-31T11:59:00Z", configuration)).toBe("1 min ago");
    expect(formatDashboardRelativeTime("2026-07-31T10:00:00Z", configuration)).toBe("2 hours ago");
    expect(formatDashboardRelativeTime("2026-08-01T00:00:00Z", configuration)).toBeUndefined();
  });
});
