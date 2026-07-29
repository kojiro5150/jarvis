import { createSituationalAwarenessSnapshot } from "./snapshot";
import type {
  ChangeCounts, EntityChange, ScalarChange, SituationalAwarenessChangeSet,
  SituationalAwarenessChanges, SituationalAwarenessSnapshot,
} from "./types";

type JsonRecord = Readonly<Record<string, unknown>>;
const collectionKeys = ["roles", "projects", "commitments", "communications", "waitingItems", "priorities", "activeWork", "sources"] as const;

function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }

/** Structural equality ignores object key insertion order and preserves array order. */
function equal(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length
      && left.every((value, index) => equal(value, right[index]));
  }
  if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
  const leftKeys = Object.keys(left).sort(compareText);
  const rightKeys = Object.keys(right).sort(compareText);
  return leftKeys.length === rightKeys.length && leftKeys.every((key, index) =>
    key === rightKeys[index] && equal((left as JsonRecord)[key], (right as JsonRecord)[key]));
}

function clone<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clone) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)])) as T;
  }
  return value;
}

function freeze(value: unknown): void {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return;
  Object.values(value).forEach(freeze);
  Object.freeze(value);
}

function scalar<T>(previous: T | undefined, current: T | undefined): { change: ScalarChange<T> | null; unchanged: number } {
  if (previous === undefined && current === undefined) return { change: null, unchanged: 0 };
  if (previous === undefined) return { change: { type: "added", current: clone(current as T) }, unchanged: 0 };
  if (current === undefined) return { change: { type: "removed", previous: clone(previous) }, unchanged: 0 };
  if (equal(previous, current)) return { change: null, unchanged: 1 };
  return { change: { type: "modified", previous: clone(previous), current: clone(current) }, unchanged: 0 };
}

function entities<T extends { readonly id: string }>(previous: readonly T[], current: readonly T[]): {
  changes: readonly EntityChange<T>[]; counts: Omit<ChangeCounts, "totalChanged">;
} {
  const index = (items: readonly T[], label: string): Map<string, T> => {
    const result = new Map<string, T>();
    for (const item of items) {
      if (result.has(item.id)) throw new Error(`duplicate ${label} identifier: ${item.id}`);
      result.set(item.id, item);
    }
    return result;
  };
  const before = index(previous, "previous canonical");
  const after = index(current, "current canonical");
  const ids = [...new Set([...before.keys(), ...after.keys()])].sort(compareText);
  const changes: EntityChange<T>[] = [];
  let added = 0; let removed = 0; let modified = 0; let unchanged = 0;
  for (const id of ids) {
    const oldValue = before.get(id); const newValue = after.get(id);
    if (!oldValue) { added += 1; changes.push({ type: "added", id, current: clone(newValue as T) }); }
    else if (!newValue) { removed += 1; changes.push({ type: "removed", id, previous: clone(oldValue) }); }
    else if (!equal(oldValue, newValue)) { modified += 1; changes.push({ type: "modified", id, previous: clone(oldValue), current: clone(newValue) }); }
    else unchanged += 1;
  }
  return { changes, counts: { added, removed, modified, unchanged } };
}

/** Compares two canonical snapshots without interpretation, source access, or implicit time. */
export function compareSituationalAwarenessSnapshots(
  previousCandidate: SituationalAwarenessSnapshot,
  currentCandidate: SituationalAwarenessSnapshot,
): SituationalAwarenessChangeSet {
  const previous = createSituationalAwarenessSnapshot(previousCandidate);
  const current = createSituationalAwarenessSnapshot(currentCandidate);
  if (Date.parse(current.observedAt) < Date.parse(previous.observedAt)) {
    throw new Error("current snapshot observedAt must not precede previous snapshot observedAt");
  }

  const identity = scalar(previous.state.identity, current.state.identity);
  const context = scalar(previous.state.context, current.state.context);
  const results = {
    roles: entities(previous.state.roles, current.state.roles),
    projects: entities(previous.state.projects, current.state.projects),
    commitments: entities(previous.state.commitments, current.state.commitments),
    communications: entities(previous.state.communications, current.state.communications),
    waitingItems: entities(previous.state.waitingItems, current.state.waitingItems),
    priorities: entities(previous.state.priorities, current.state.priorities),
    activeWork: entities(previous.state.activeWork, current.state.activeWork),
    sources: entities(previous.state.sources, current.state.sources),
  };
  const changes: SituationalAwarenessChanges = {
    identity: identity.change, context: context.change,
    roles: results.roles.changes, projects: results.projects.changes,
    commitments: results.commitments.changes, communications: results.communications.changes, waitingItems: results.waitingItems.changes,
    priorities: results.priorities.changes, activeWork: results.activeWork.changes, sources: results.sources.changes,
  };
  const countParts = [
    { added: identity.change?.type === "added" ? 1 : 0, removed: identity.change?.type === "removed" ? 1 : 0, modified: identity.change?.type === "modified" ? 1 : 0, unchanged: identity.unchanged },
    { added: context.change?.type === "added" ? 1 : 0, removed: context.change?.type === "removed" ? 1 : 0, modified: context.change?.type === "modified" ? 1 : 0, unchanged: context.unchanged },
    ...collectionKeys.map((key) => results[key].counts),
  ];
  const totals = countParts.reduce((sum, item) => ({
    added: sum.added + item.added, removed: sum.removed + item.removed,
    modified: sum.modified + item.modified, unchanged: sum.unchanged + item.unchanged,
  }), { added: 0, removed: 0, modified: 0, unchanged: 0 });
  const output: SituationalAwarenessChangeSet = {
    previousSnapshotId: previous.snapshotId, currentSnapshotId: current.snapshotId,
    previousObservedAt: previous.observedAt, currentObservedAt: current.observedAt,
    changes, summary: { ...totals, totalChanged: totals.added + totals.removed + totals.modified },
  };
  freeze(output);
  return output;
}
