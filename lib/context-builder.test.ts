import { describe, expect, it } from "vitest";
import { buildContextBlock } from "./context-builder";
import type { OperationalState } from "./operational-state";

function stateWithNextCommitment(start: string): OperationalState {
  return {
    priorities: [],
    projects: [],
    signals: [],
    blockers: [],
    calendar: [{
      id: "next-event",
      calendarId: "local",
      title: "Next event",
      start,
      end: start,
      day: "TUE",
      time: "09:00",
      status: "confirmed",
      source: "local",
      calendarName: "Local",
    }],
    calendarStatus: "unavailable",
    gmailThreads: [],
    gmailStatus: "unavailable",
    driveFiles: [],
    driveStatus: "unavailable",
    connectorStatuses: [],
    updatedAt: "1970-01-01T00:00:00.000Z",
  };
}

describe("legacy chat relative-date context", () => {
  it("resolves tomorrow deterministically from the supplied UTC reference time", () => {
    const referenceTime = new Date("2026-07-30T18:45:00.000Z");
    const first = buildContextBlock(stateWithNextCommitment("2026-08-04T09:00:00.000Z"), "full", referenceTime);
    const second = buildContextBlock(stateWithNextCommitment("2026-08-11T09:00:00.000Z"), "full", referenceTime);

    expect(first).toContain("Today: 2026-07-30 (Thursday)");
    expect(first).toContain("Tomorrow: 2026-07-31 (Friday)");
    expect(first).toContain("do not infer dates from calendar commitments");
    expect(second.match(/Relative Date Reference[\s\S]*?Urgent Signals:/)?.[0])
      .toBe(first.match(/Relative Date Reference[\s\S]*?Urgent Signals:/)?.[0]);
  });

  it("handles a UTC month boundary", () => {
    const context = buildContextBlock(
      stateWithNextCommitment("2026-08-04T09:00:00.000Z"),
      "full",
      new Date("2026-07-31T23:59:59.000Z")
    );

    expect(context).toContain("Tomorrow: 2026-08-01 (Saturday)");
  });
});
