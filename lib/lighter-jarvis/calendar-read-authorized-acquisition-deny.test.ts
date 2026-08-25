import { describe, expect, it, vi } from "vitest";

const TEST_WINDOW = Object.freeze({ start: "2026-08-25T00:00:00.000Z", end: "2026-09-01T00:00:00.000Z", timeZone: "Australia/Melbourne", period: "default" as const });
vi.mock("./calendar-read-authority", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./calendar-read-authority")>();
  return {
    ...actual,
    evaluateCalendarReadAuthority: vi.fn(() => Object.freeze({
      capability: "calendar.read" as const,
      decision: "DENY" as const,
      reason: "explicit_calendar_read_not_established" as const,
      readOnly: true as const,
      authorityEvidence: Object.freeze([]),
    })),
  };
});

import { acquireAuthorizedCalendarEvidence } from "./calendar-read-authorized-acquisition";

describe("authority-gated governed Calendar acquisition DENY handling", () => {
  it("does not acquire when the composed evaluator returns DENY", async () => {
    const listUpcoming = vi.fn().mockResolvedValue([]);

    const result = await acquireAuthorizedCalendarEvidence({
      authority: {
        proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
        currentUserUtterance: "Show my calendar.",
      },
      acquisition: {
        connector: { source: "google", listUpcoming },
        clock: () => new Date("2026-08-24T00:00:00Z"),
        requestedLimit: 5,
        horizonDays: 7,
      },
    });

    expect(result.authority.decision).toBe("DENY");
    expect(result.evidence).toBeNull();
    expect(listUpcoming).not.toHaveBeenCalled();
  });
});
