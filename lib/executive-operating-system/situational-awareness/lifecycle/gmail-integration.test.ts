import { describe, expect, it } from "vitest";
import { GmailProjectionAdapter } from "../projection/adapters/gmail";
import { ProjectionEngine, projectArtifacts } from "../projection/engine";
import { ProjectionRegistry } from "../projection/registry";
import { compareSituationalAwarenessSnapshots, createSituationalAwarenessSnapshot } from ".";

describe("Gmail projection lifecycle integration", () => {
  it("assembles and compares immutable communication snapshots", async () => {
    const connector = { source: "google" as const, listOperationalObservations: async () => [{
      id: "gmail-1", retrievedAt: "2026-07-29T11:05:00.000Z", payload: { headers: [
        { name: "Message-ID", value: "<gmail-1@example.test>" }, { name: "From", value: "sender@example.test" },
        { name: "To", value: "recipient@example.test" }, { name: "Date", value: "2026-07-29T11:00:00Z" },
      ] },
    }] };
    const options = { identity: { userId: "executive", displayName: "Executive" }, projectedAt: "2026-07-29T12:00:00Z", connector } as const;
    const registry = new ProjectionRegistry(); registry.register(new GmailProjectionAdapter(options));
    const currentState = await new ProjectionEngine(registry).project();
    const empty = await new GmailProjectionAdapter({ ...options, connector: { ...connector, listOperationalObservations: async () => [] } }).project();
    const previous = createSituationalAwarenessSnapshot({ snapshotId: "before", observedAt: "2026-07-29T11:59:00Z", state: projectArtifacts([empty]) });
    const current = createSituationalAwarenessSnapshot({ snapshotId: "after", observedAt: options.projectedAt, state: currentState });
    const changes = compareSituationalAwarenessSnapshots(previous, current);
    expect(changes.changes.communications).toEqual([expect.objectContaining({ type: "added", id: "google-gmail:<gmail-1@example.test>" })]);
    expect(changes.summary.added).toBe(1);
    expect(Object.isFrozen(changes)).toBe(true);
  });
});
