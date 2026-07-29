import { describe, expect, it } from "vitest";
import { createSituationalAwareness } from "./model";

const base = () => ({
  identity: { userId: "sam", displayName: "Sam" },
  roles: [{ id: "lead", name: "Service Lead", status: "active" as const }],
  projects: [{ id: "renewal", name: "Service renewal", status: "active" as const, roleIds: ["lead"] }],
});

describe("situational awareness model", () => {
  it("creates a minimal deeply immutable snapshot with structural defaults", () => {
    const snapshot = createSituationalAwareness({ identity: { userId: "sam", displayName: "Sam" } });
    expect(snapshot).toEqual({ identity: { userId: "sam", displayName: "Sam" }, roles: [], projects: [], commitments: [], communications: [], waitingItems: [], priorities: [], activeWork: [], context: { workMode: "unknown", locationKind: "unknown" }, sources: [] });
    for (const value of [snapshot, snapshot.identity, snapshot.roles, snapshot.projects, snapshot.commitments, snapshot.communications, snapshot.waitingItems, snapshot.priorities, snapshot.activeWork, snapshot.context, snapshot.sources]) expect(Object.isFrozen(value)).toBe(true);
  });

  it("preserves a representative ordered, JSON-compatible operational snapshot", () => {
    const input = { ...base(), commitments: [{ id: "board", title: "Board meeting", kind: "meeting" as const, status: "scheduled" as const, roleIds: ["lead"], projectIds: ["renewal"], startsAt: "2026-08-01T09:00:00Z" }], waitingItems: [{ id: "review", title: "PR review", status: "waiting" as const, roleIds: ["lead"], projectIds: ["renewal"], waitingOn: "reviewer" }], priorities: [{ id: "quality", title: "Service quality", level: "high" as const, source: "user" as const, roleIds: ["lead"], projectIds: ["renewal"] }], activeWork: [{ id: "draft", title: "Draft paper", status: "active" as const, roleIds: ["lead"], projectIds: ["renewal"] }], context: { activeRoleId: "lead", activeProjectId: "renewal", workMode: "writing" as const, locationKind: "work" as const }, sources: [{ id: "calendar-main", kind: "calendar" as const, status: "available" as const, observedAt: "2026-07-26T08:45:00Z" }] };
    const snapshot = createSituationalAwareness(input);
    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
    expect(snapshot.commitments[0]).toMatchObject({ id: "board", roleIds: ["lead"], projectIds: ["renewal"] });
    for (const value of [snapshot.roles[0], snapshot.projects[0], snapshot.projects[0]?.roleIds, snapshot.commitments[0], snapshot.commitments[0]?.roleIds, snapshot.commitments[0]?.projectIds, snapshot.waitingItems[0], snapshot.priorities[0], snapshot.activeWork[0], snapshot.sources[0]]) expect(Object.isFrozen(value)).toBe(true);
    expect(Object.keys(snapshot)).not.toEqual(expect.arrayContaining(["messages", "memories", "embeddings", "decisionCandidates", "attentionQueue", "recommendedActions", "routing", "executionPlan"]));
  });

  it.each(["roles", "projects", "commitments", "communications", "waitingItems", "priorities", "activeWork", "sources"] as const)("rejects duplicate identifiers in %s", (key) => {
    const records = { roles: { id: "x", name: "Role", status: "active" }, projects: { id: "x", name: "Project", status: "active", roleIds: [] }, commitments: { id: "x", title: "Item", kind: "other", status: "scheduled", roleIds: [], projectIds: [] }, communications: { id: "x", sender: "sender@example.com", recipients: [], sentAt: "2026-07-26T08:45:00Z", references: [] }, waitingItems: { id: "x", title: "Item", status: "waiting", waitingOn: "someone", roleIds: [], projectIds: [] }, priorities: { id: "x", title: "Item", level: "high", source: "user", roleIds: [], projectIds: [] }, activeWork: { id: "x", title: "Item", status: "active", roleIds: [], projectIds: [] }, sources: { id: "x", kind: "other", status: "available" } } as const;
    expect(() => createSituationalAwareness({ identity: { userId: "u", displayName: "User" }, [key]: [records[key], records[key]] } as never)).toThrow(`duplicate ${key} identifier: x`);
  });

  it.each(["project", "commitment", "waiting", "priority", "work", "context"])("rejects unknown role references from %s", (kind) => {
    const additions: Record<string, object> = { project: { projects: [{ id: "p", name: "P", status: "active", roleIds: ["missing"] }] }, commitment: { commitments: [{ id: "c", title: "C", kind: "other", status: "scheduled", roleIds: ["missing"], projectIds: [] }] }, waiting: { waitingItems: [{ id: "w", title: "W", status: "waiting", waitingOn: "x", roleIds: ["missing"], projectIds: [] }] }, priority: { priorities: [{ id: "p", title: "P", level: "high", source: "user", roleIds: ["missing"], projectIds: [] }] }, work: { activeWork: [{ id: "w", title: "W", status: "active", roleIds: ["missing"], projectIds: [] }] }, context: { context: { activeRoleId: "missing", workMode: "unknown", locationKind: "unknown" } } };
    expect(() => createSituationalAwareness({ identity: { userId: "u", displayName: "User" }, ...additions[kind] } as never)).toThrow(/unknown role/);
  });

  it.each(["commitments", "waitingItems", "priorities", "activeWork", "context"])("rejects unknown project references from %s", (kind) => {
    const item = kind === "waitingItems" ? { id: "x", title: "X", status: "waiting", waitingOn: "x", roleIds: [], projectIds: ["missing"] } : kind === "priorities" ? { id: "x", title: "X", level: "high", source: "user", roleIds: [], projectIds: ["missing"] } : kind === "activeWork" ? { id: "x", title: "X", status: "active", roleIds: [], projectIds: ["missing"] } : { id: "x", title: "X", kind: "other", status: "scheduled", roleIds: [], projectIds: ["missing"] };
    const addition = kind === "context" ? { context: { activeProjectId: "missing", workMode: "unknown", locationKind: "unknown" } } : { [kind]: [item] };
    expect(() => createSituationalAwareness({ identity: { userId: "u", displayName: "User" }, ...addition } as never)).toThrow(/unknown project/);
  });

  it.each(["userId", "displayName"] as const)("rejects empty identity %s", (field) => expect(() => createSituationalAwareness({ identity: { userId: "u", displayName: "User", [field]: " " } })).toThrow(`identity.${field}`));

  it("copies without mutating or freezing caller-owned input and preserves order deterministically", () => {
    const input = base();
    const first = createSituationalAwareness(input);
    const second = createSituationalAwareness(base());
    expect(first).toEqual(second);
    expect(Object.isFrozen(input)).toBe(false); expect(Object.isFrozen(input.identity)).toBe(false); expect(Object.isFrozen(input.roles)).toBe(false); expect(Object.isFrozen(input.roles[0])).toBe(false); expect(Object.isFrozen(input.projects[0].roleIds)).toBe(false);
    input.identity.displayName = "Changed"; input.roles[0].name = "Changed"; input.projects[0].roleIds.push("later");
    expect(first.identity.displayName).toBe("Sam"); expect(first.roles[0]?.name).toBe("Service Lead"); expect(first.projects[0]?.roleIds).toEqual(["lead"]);
  });
});
