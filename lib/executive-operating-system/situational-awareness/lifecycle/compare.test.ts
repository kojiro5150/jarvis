import { describe, expect, it } from "vitest";
import { createSituationalAwareness } from "../model";
import type { SituationalAwarenessInput } from "../model";
import { compareSituationalAwarenessSnapshots } from "./compare";
import { createSituationalAwarenessSnapshot } from "./snapshot";

const base: SituationalAwarenessInput = {
  identity: { userId: "user-1", displayName: "Ada" },
  roles: [{ id: "role-z", name: "Founder", status: "active" }, { id: "role-a", name: "Engineer", status: "active" }],
  projects: [{ id: "project-1", name: "JARVIS", status: "active", roleIds: ["role-a"] }],
  commitments: [{ id: "commitment-1", title: "Review", kind: "review", status: "scheduled", roleIds: ["role-a"], projectIds: ["project-1"] }],
  waitingItems: [{ id: "waiting-1", title: "Feedback", status: "waiting", roleIds: [], projectIds: [], waitingOn: "Alex" }],
  priorities: [{ id: "priority-1", title: "Ship", level: "high", roleIds: ["role-a"], projectIds: ["project-1"], source: "user" }],
  activeWork: [{ id: "work-1", title: "Tests", status: "active", roleIds: ["role-a"], projectIds: ["project-1"] }],
  context: { activeProjectId: "project-1", workMode: "engineering", locationKind: "work" },
  sources: [{ id: "source-1", kind: "calendar", status: "available", observedAt: "2026-07-27T08:00:00Z" }],
};

function snapshot(id: string, observedAt: string, input: SituationalAwarenessInput) {
  return createSituationalAwarenessSnapshot({ snapshotId: id, observedAt, state: createSituationalAwareness(input) });
}

describe("compareSituationalAwarenessSnapshots", () => {
  it("classifies every canonical collection and scalar changes with stable identifier ordering", () => {
    const current: SituationalAwarenessInput = {
      ...base,
      identity: { userId: "user-1", displayName: "Ada Lovelace" },
      roles: [{ id: "role-b", name: "Writer", status: "active" }, { id: "role-a", name: "Engineer", status: "inactive" }],
      projects: [{ id: "project-1", name: "JARVIS 2", status: "active", roleIds: ["role-a"] }, { id: "project-2", name: "Book", status: "planned", roleIds: ["role-b"] }],
      commitments: [], waitingItems: [],
      priorities: [{ ...base.priorities![0], level: "medium" }],
      activeWork: [{ ...base.activeWork![0] }, { id: "work-2", title: "Draft", status: "active", roleIds: ["role-b"], projectIds: ["project-2"] }],
      context: { activeProjectId: "project-2", workMode: "writing", locationKind: "home" },
      sources: [{ id: "source-1", kind: "calendar", status: "unavailable", observedAt: "2026-07-27T09:00:00Z" }, { id: "source-2", kind: "email", status: "available" }],
    };
    const diff = compareSituationalAwarenessSnapshots(snapshot("before", "2026-07-27T08:00:00Z", base), snapshot("after", "2026-07-27T09:00:00Z", current));

    expect(diff.changes.identity?.type).toBe("modified");
    expect(diff.changes.context?.type).toBe("modified");
    expect(diff.changes.roles.map(({ id, type }) => [id, type])).toEqual([["role-a", "modified"], ["role-b", "added"], ["role-z", "removed"]]);
    expect(diff.changes.projects.map(({ id, type }) => [id, type])).toEqual([["project-1", "modified"], ["project-2", "added"]]);
    expect(diff.changes.commitments[0]).toMatchObject({ id: "commitment-1", type: "removed" });
    expect(diff.changes.waitingItems[0]).toMatchObject({ id: "waiting-1", type: "removed" });
    expect(diff.changes.priorities[0]).toMatchObject({ id: "priority-1", type: "modified" });
    expect(diff.changes.activeWork[0]).toMatchObject({ id: "work-2", type: "added" });
    expect(diff.changes.sources.map(({ id, type }) => [id, type])).toEqual([["source-1", "modified"], ["source-2", "added"]]);
    expect(diff.summary).toEqual({ added: 4, removed: 3, modified: 6, unchanged: 1, totalChanged: 13 });
    expect(Object.isFrozen(diff)).toBe(true);
    expect(Object.isFrozen(diff.changes.roles)).toBe(true);
    expect(Object.isFrozen(diff.summary)).toBe(true);
  });

  it("produces a deterministic empty result, counts unchanged values, and permits equal times", () => {
    const left = snapshot("same-a", "2026-07-27T08:00:00Z", base);
    const reordered = { ...base, roles: [...base.roles!].reverse() };
    const right = snapshot("same-b", "2026-07-27T08:00:00Z", reordered);
    const first = compareSituationalAwarenessSnapshots(left, right);
    const second = compareSituationalAwarenessSnapshots(left, right);
    expect(first.changes).toEqual({ identity: null, context: null, roles: [], projects: [], commitments: [], communications: [], waitingItems: [], priorities: [], activeWork: [], sources: [] });
    expect(first.summary).toEqual({ added: 0, removed: 0, modified: 0, unchanged: 10, totalChanged: 0 });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
  });

  it("rejects chronological inversion deterministically and never reorders inputs", () => {
    const later = snapshot("later", "2026-07-27T09:00:00Z", base);
    const earlier = snapshot("earlier", "2026-07-27T08:00:00Z", base);
    expect(() => compareSituationalAwarenessSnapshots(later, earlier)).toThrow("current snapshot observedAt must not precede previous snapshot observedAt");
  });

  it("isolates modified records from mutable candidates", () => {
    const before = JSON.parse(JSON.stringify(snapshot("before", "2026-07-27T08:00:00Z", base)));
    const after = JSON.parse(JSON.stringify(snapshot("after", "2026-07-27T09:00:00Z", { ...base, commitments: [{ ...base.commitments![0], title: "Changed" }] })));
    const diff = compareSituationalAwarenessSnapshots(before, after);
    after.state.commitments[0].title = "Mutated later";
    before.state.commitments[0].title = "Also mutated";
    expect(diff.changes.commitments[0]).toMatchObject({ previous: { title: "Review" }, current: { title: "Changed" } });
    expect(Object.isFrozen((diff.changes.commitments[0] as { current: object }).current)).toBe(true);
  });

  it("reports source absence only as removal without interpreting its cause", () => {
    const before = snapshot("before", "2026-07-27T08:00:00Z", base);
    const after = snapshot("after", "2026-07-27T09:00:00Z", { ...base, sources: [] });
    expect(compareSituationalAwarenessSnapshots(before, after).changes.sources).toEqual([{
      type: "removed", id: "source-1", previous: base.sources![0],
    }]);
  });
});
