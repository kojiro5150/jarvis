import { describe, expect, it } from "vitest";
import { normalizeGoogleEvent } from "../../connectors/calendar-event";
import { CalendarProjectionAdapter } from "../situational-awareness/projection/adapters/calendar";
import { ProjectionEngine, ProjectionRegistry } from "../situational-awareness/projection";
import { compareSituationalAwarenessSnapshots, createSituationalAwarenessSnapshot } from "../situational-awareness/lifecycle";
import { AttentionPolicyRegistry, INITIAL_ATTENTION_POLICIES, constructExecutiveAttentionQueue } from ".";

async function project(include: boolean, observedAt: string) {
  const event = normalizeGoogleEvent({ id: "board", summary: "Board review", start: { dateTime: "2026-07-28T09:00:00Z" }, end: { dateTime: "2026-07-28T10:00:00Z" } }, 0, { calendarId: "executive", calendarName: "Executive" });
  const registry = new ProjectionRegistry(); registry.register(new CalendarProjectionAdapter({ identity: { userId: "u", displayName: "User" }, observedAt, connector: { source: "google", listUpcoming: async () => include ? [event] : [] } }));
  return new ProjectionEngine(registry).project();
}

describe("Calendar to Executive Attention integration", () => {
  it("elevates a Calendar-derived bounded removal through the canonical lifecycle", async () => {
    const previous = createSituationalAwarenessSnapshot({ snapshotId: "calendar-a", observedAt: "2026-07-27T08:00:00Z", state: await project(true, "2026-07-27T08:00:00Z") });
    const current = createSituationalAwarenessSnapshot({ snapshotId: "calendar-b", observedAt: "2026-07-27T09:00:00Z", state: await project(false, "2026-07-27T09:00:00Z") });
    const queue = constructExecutiveAttentionQueue(compareSituationalAwarenessSnapshots(previous, current), new AttentionPolicyRegistry(INITIAL_ATTENTION_POLICIES));
    expect(queue.records).toHaveLength(1); expect(queue.records[0]).toMatchObject({ domain: "commitments", changeType: "removed", entityId: "google-calendar:executive:board", reason: { code: "commitment.absent-from-current-snapshot" } });
  });
});

