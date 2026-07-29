import { describe, expect, it } from "vitest";
import { createSituationalAwareness } from "../model";
import { createSituationalAwarenessSnapshot } from "./snapshot";

function state() {
  return createSituationalAwareness({
    identity: { userId: "user-1", displayName: "Ada" },
    roles: [{ id: "role-1", name: "Engineer", status: "active" }],
    context: { workMode: "engineering", locationKind: "work", activeRoleId: "role-1" },
    sources: [{ id: "source-1", kind: "calendar", status: "available", observedAt: "2026-07-27T08:00:00Z" }],
  });
}

describe("createSituationalAwarenessSnapshot", () => {
  it("constructs an explicit, replay-safe, deeply frozen defensive copy", () => {
    const candidate = { snapshotId: "snapshot-1", observedAt: "2026-07-27T08:00:00Z", state: state() };
    const snapshot = createSituationalAwarenessSnapshot(candidate);
    const replay = createSituationalAwarenessSnapshot(JSON.parse(JSON.stringify(snapshot)));

    expect(replay).toEqual(snapshot);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.state)).toBe(true);
    expect(Object.isFrozen(snapshot.state.roles)).toBe(true);
    expect(Object.isFrozen(snapshot.state.roles[0])).toBe(true);
    expect(snapshot.state.communications).toEqual([]);
    expect(Object.isFrozen(snapshot.state.communications)).toBe(true);
    expect(snapshot.state).not.toBe(candidate.state);
  });

  it.each([
    [{ observedAt: "2026-07-27T08:00:00Z", state: state() }, "snapshot.snapshotId must be a non-empty string"],
    [{ snapshotId: "snapshot-1", state: state() }, "snapshot.observedAt must be an RFC 3339 timestamp"],
    [{ snapshotId: "snapshot-1", observedAt: "2026-02-30T08:00:00Z", state: state() }, "snapshot.observedAt must be an RFC 3339 timestamp"],
    [{ snapshotId: "snapshot-1", observedAt: "now", state: state() }, "snapshot.observedAt must be an RFC 3339 timestamp"],
    [{ snapshotId: "snapshot-1", observedAt: "2026-07-27T08:00:00Z", state: { identity: {}, context: {} } }, "snapshot.state.roles must be an array"],
  ])("rejects malformed candidates without generating identity or time", (candidate, message) => {
    expect(() => createSituationalAwarenessSnapshot(candidate as never)).toThrow(message as string);
  });

  it("rejects non-JSON-compatible values without silently removing them", () => {
    const candidate = JSON.parse(JSON.stringify({ snapshotId: "snapshot-1", observedAt: "2026-07-27T08:00:00Z", state: state() }));
    candidate.state.identity.invalid = undefined;
    expect(() => createSituationalAwarenessSnapshot(candidate)).toThrow("snapshot.state.identity.invalid must contain only JSON-compatible values");
  });

  it("rejects unsupported envelope data rather than silently discarding it", () => {
    const candidate = { snapshotId: "snapshot-1", observedAt: "2026-07-27T08:00:00Z", state: state(), metadata: {} };
    expect(() => createSituationalAwarenessSnapshot(candidate as never)).toThrow("snapshot contains unsupported field: metadata");
  });
});
