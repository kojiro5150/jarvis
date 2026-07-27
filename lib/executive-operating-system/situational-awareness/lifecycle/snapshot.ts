import { createSituationalAwareness } from "../model";
import type { SituationalAwareness, SituationalAwarenessInput } from "../model";
import type { SituationalAwarenessSnapshot, SituationalAwarenessSnapshotInput } from "./types";

const rfc3339 = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;
const stateCollections = ["roles", "projects", "commitments", "waitingItems", "priorities", "activeWork", "sources"] as const;

function record(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${path} must be a plain object`);
  }
}

/** Rejects any value that cannot make a lossless JSON round trip. */
export function validateJsonValue(value: unknown, path: string, ancestors = new Set<object>()): void {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number" && Number.isFinite(value)) return;
  if (!value || typeof value !== "object") throw new Error(`${path} must contain only JSON-compatible values`);
  if (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value)) {
    throw new Error(`${path} must contain only JSON-compatible values`);
  }
  if (ancestors.has(value)) throw new Error(`${path} must contain only JSON-compatible values`);
  ancestors.add(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) throw new Error(`${path} must contain only JSON-compatible values`);
      validateJsonValue(value[index], `${path}[${index}]`, ancestors);
    }
  } else {
    if (Reflect.ownKeys(value).some((key) => typeof key === "symbol")) {
      throw new Error(`${path} must contain only JSON-compatible values`);
    }
    for (const [key, child] of Object.entries(value)) validateJsonValue(child, `${path}.${key}`, ancestors);
  }
  ancestors.delete(value);
}

function validateTimestamp(value: unknown): asserts value is string {
  const match = typeof value === "string" ? rfc3339.exec(value) : null;
  const timestamp = typeof value === "string" ? value : "";
  const days = match ? new Date(Date.UTC(Number(timestamp.slice(0, 4)), Number(match[1]), 0)).getUTCDate() : 0;
  if (!match || Number(match[2]) > days || !Number.isFinite(Date.parse(timestamp))) {
    throw new Error("snapshot.observedAt must be an RFC 3339 timestamp");
  }
}

function validateStateShape(value: unknown): asserts value is SituationalAwareness {
  record(value, "snapshot.state");
  record(value.identity, "snapshot.state.identity");
  record(value.context, "snapshot.state.context");
  for (const key of stateCollections) {
    if (!Array.isArray(value[key])) throw new Error(`snapshot.state.${key} must be an array`);
  }
}

/** Validates supplied identity/time, reconstructs canonical state, and returns an isolated frozen snapshot. */
export function createSituationalAwarenessSnapshot(input: SituationalAwarenessSnapshotInput): SituationalAwarenessSnapshot {
  record(input, "snapshot");
  const unsupported = Object.keys(input).filter((key) => !["snapshotId", "observedAt", "state"].includes(key)).sort();
  if (unsupported.length > 0) throw new Error(`snapshot contains unsupported field: ${unsupported[0]}`);
  if (typeof input.snapshotId !== "string" || input.snapshotId.trim().length === 0) {
    throw new Error("snapshot.snapshotId must be a non-empty string");
  }
  validateTimestamp(input.observedAt);
  validateJsonValue(input, "snapshot");
  validateStateShape(input.state);
  const state = createSituationalAwareness(input.state as SituationalAwarenessInput);
  return Object.freeze({ snapshotId: input.snapshotId, observedAt: input.observedAt, state });
}
