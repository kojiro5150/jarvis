import { describe, expect, it } from "vitest";
import type { OperationalState } from "../operational-state";
import {
  classifyProjectionFailure,
  evaluateDashboardOperationalPicture,
} from "./operational-picture-parallel-evaluation";

const observedAt = "2026-07-30T10:00:00Z";

function state(calendar: OperationalState["calendar"]): OperationalState {
  return {
    priorities: [], projects: [], signals: [], blockers: [], calendar, calendarStatus: "online",
    gmailThreads: [], gmailStatus: "unavailable", driveFiles: [], driveStatus: "unavailable",
    connectorStatuses: [], updatedAt: observedAt,
  };
}

const event = {
  id: "board-review",
  title: "Board review",
  start: "2026-07-31T09:00:00Z",
  end: "2026-07-31T10:00:00Z",
  day: "FRI",
  time: "09:00",
  source: "google" as const,
  calendarId: "executive",
  calendarName: "Executive",
  calendarColor: "#123456",
  status: "confirmed" as const,
};

describe("Dashboard operational-picture parallel evaluation", () => {
  it("constructs both pictures from one event array and records every difference", async () => {
    const legacy = state([event]);
    const report = await evaluateDashboardOperationalPicture(legacy, observedAt);

    expect(report.authority).toBe("OperationalState");
    expect(report.legacy.operationalState).toBe(legacy);
    expect(report.identicalInputEvidence).toEqual({
      rule: "one-acquisition-one-event-array", eventIds: ["board-review"], legacyEventCount: 1,
    });
    expect(report.canonical.status).toBe("available");
    expect(report.canonical.executiveStateSnapshot?.state.commitments).toHaveLength(1);
    expect(report.comparison.map(({ classification }) => classification)).toEqual([
      "Equivalent", "Intentional Improvement", "Defect",
    ]);
    expect(report.recommendation).toBe("DO_NOT_PROMOTE");
  });

  it("is deterministic for identical inputs and observation time", async () => {
    const legacy = state([event]);
    expect(await evaluateDashboardOperationalPicture(legacy, observedAt))
      .toEqual(await evaluateDashboardOperationalPicture(legacy, observedAt));
  });

  it("records an ADR-0007 boundary and keeps legacy authoritative", async () => {
    const local = state([{ ...event, source: "local", calendarId: "local" }]);
    const report = await evaluateDashboardOperationalPicture(local, observedAt);
    const boundary = report.comparison[0];

    expect(report.canonical.status).toBe("unavailable");
    expect(boundary).toMatchObject({
      classification: "Unsupported Boundary",
      adr: "ADR-0007",
      matchedBoundary: "Unsupported source value",
    });
    expect(report.legacy.operationalState).toBe(local);
    expect(report.recommendation).toBe("DO_NOT_PROMOTE");
  });

  it("does not assume an undocumented failure is an architectural boundary", () => {
    expect(classifyProjectionFailure(new Error("unexpected assembly explosion"))).toEqual({
      capability: "Canonical calendar projection",
      classification: "Undocumented Failure Mode",
      evidence: "Projection failed without an ADR-0007 rejection match: unexpected assembly explosion",
    });
  });
});
