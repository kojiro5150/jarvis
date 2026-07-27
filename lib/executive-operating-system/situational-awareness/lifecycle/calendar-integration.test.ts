import { describe, expect, it } from "vitest";
import { normalizeGoogleEvent } from "../../../connectors/calendar-event";
import { CalendarProjectionAdapter } from "../projection/adapters/calendar";
import type { CalendarProjectionEvent } from "../projection/adapters/calendar";
import { ProjectionEngine, ProjectionRegistry } from "../projection";
import { compareSituationalAwarenessSnapshots } from "./compare";
import { createSituationalAwarenessSnapshot } from "./snapshot";

const identity = { userId: "user-1", displayName: "Sam" } as const;
function event(id: string, title: string): CalendarProjectionEvent {
  return normalizeGoogleEvent({
    id, summary: title,
    start: { dateTime: "2026-07-28T09:00:00Z" }, end: { dateTime: "2026-07-28T10:00:00Z" },
  }, 0, { calendarId: "executive", calendarName: "Executive" });
}

async function project(events: readonly CalendarProjectionEvent[], observedAt: string) {
  const registry = new ProjectionRegistry();
  registry.register(new CalendarProjectionAdapter({
    identity, observedAt,
    connector: { source: "google", listUpcoming: async () => events },
  }));
  return new ProjectionEngine(registry).project();
}

describe("calendar projection to snapshot lifecycle integration", () => {
  it("detects unchanged, added, absent, and modified recurring-instance observations deterministically", async () => {
    const recurringId = "series_20260728T090000Z";
    const beforeState = await project([
      event("unchanged", "Stand-up"), event("removed", "One-off"), event(recurringId, "Recurring review"),
    ], "2026-07-27T08:00:00Z");
    const afterState = await project([
      event("added", "New meeting"), event("unchanged", "Stand-up"), event(recurringId, "Recurring review updated"),
    ], "2026-07-27T09:00:00Z");
    const before = createSituationalAwarenessSnapshot({ snapshotId: "calendar-before", observedAt: "2026-07-27T08:00:00Z", state: beforeState });
    const after = createSituationalAwarenessSnapshot({ snapshotId: "calendar-after", observedAt: "2026-07-27T09:00:00Z", state: afterState });
    const first = compareSituationalAwarenessSnapshots(before, after);
    const second = compareSituationalAwarenessSnapshots(before, after);

    expect(first.changes.commitments.map(({ id, type }) => [id, type])).toEqual([
      ["google-calendar:executive:added", "added"],
      ["google-calendar:executive:removed", "removed"],
      [`google-calendar:executive:${recurringId}`, "modified"],
    ]);
    expect(first.changes.sources[0]).toMatchObject({ type: "modified", id: "google-calendar", previous: { observedAt: "2026-07-27T08:00:00Z" }, current: { observedAt: "2026-07-27T09:00:00Z" } });
    expect(first.summary).toEqual({ added: 1, removed: 1, modified: 2, unchanged: 3, totalChanged: 4 });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});
