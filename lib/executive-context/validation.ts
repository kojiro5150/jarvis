import { createSituationalAwareness } from "../executive-operating-system/situational-awareness/model";
import type { ExecutiveStateSnapshot } from "../executive-operating-system/situational-awareness/assembly";
import { canonicalJson, compareCodeUnits, executiveContextIdentity } from "./identity";
import type { ExecutiveContextSnapshot } from "./types";

const rfc3339 = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;
export function validTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = rfc3339.exec(value);
  if (!match) return false;
  const year = Number(value.slice(0, 4)), month = Number(match[1]), day = Number(match[2]);
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate() && Number.isFinite(Date.parse(value));
}
function required(value: unknown, path: string): asserts value is string { if (typeof value !== "string" || value.trim() === "") throw new Error(`${path} must be a non-empty string`); }
export function jsonCompatible(value: unknown, path = "value", ancestors = new Set<object>()): void {
  if (value === null || typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return;
  if (!value || typeof value !== "object" || ancestors.has(value as object) || (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype)) throw new Error(`${path} must contain only JSON-compatible values`);
  ancestors.add(value as object); for (const [key, child] of Object.entries(value)) jsonCompatible(child, `${path}.${key}`, ancestors); ancestors.delete(value as object);
}
export function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
export function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T { if (value && typeof value === "object" && !seen.has(value as object)) { seen.add(value as object); Object.values(value as object).forEach((child) => deepFreeze(child, seen)); Object.freeze(value); } return value; }
function orderedUnique(values: readonly string[]): boolean { return values.every((value, index) => index === 0 || compareCodeUnits(values[index - 1], value) < 0); }

export function validateSourceState(value: ExecutiveStateSnapshot): void {
  if (!value || typeof value !== "object") throw new Error("source state is required");
  required(value.snapshotId, "source snapshotId"); required(value.lifecycleSnapshotId, "source lifecycleSnapshotId"); required(value.previousLifecycleSnapshotId, "source previousLifecycleSnapshotId");
  if (!validTimestamp(value.observedAt)) throw new Error("source observedAt must be an RFC 3339 timestamp");
  if (value.metadata?.assemblyVersion !== "1.0.0" || value.metadata?.canonicalContractVersion !== "projection-artifact-v1") throw new Error("unsupported source state contract version");
  if (![value.artifacts, value.relationships, value.conflicts, value.gaps, value.provenance].every(Array.isArray)) throw new Error("source state collections are required");
  createSituationalAwareness(value.state); jsonCompatible(value, "source state");
  if (value.metadata.artifactCount !== value.artifacts.length || value.metadata.relationshipCount !== value.relationships.length || value.metadata.conflictCount !== value.conflicts.length || value.metadata.gapCount !== value.gaps.length) throw new Error("source state metadata is inconsistent");
  const checks = [[...value.artifacts.map((x) => x.artifactId)], [...value.relationships.map((x) => x.relationshipId)], [...value.conflicts.map((x) => x.conflictId)], [...value.gaps.map((x) => x.gapId)]];
  if (checks.some((ids) => !orderedUnique(ids))) throw new Error("source state identities must be unique and canonically ordered");
}

export function publishContext(candidate: ExecutiveContextSnapshot): ExecutiveContextSnapshot {
  jsonCompatible(candidate, "executive context snapshot");
  if (candidate.identity.contextId !== executiveContextIdentity(candidate.sourceStateIdentity.snapshotId, candidate.referenceTime)) throw new Error("context identity is inconsistent");
  if (!validTimestamp(candidate.referenceTime) || !validTimestamp(candidate.observedAt)) throw new Error("context timestamps are invalid");
  const conditionKeys = candidate.deterministicConditions.map((x) => x.conditionId), evidenceKeys = candidate.calculationEvidence.map((x) => x.measureId);
  if (!orderedUnique(conditionKeys) || !orderedUnique(evidenceKeys)) throw new Error("context collections must be unique and canonically ordered");
  if (candidate.measures.provenanceCoverage < 0 || candidate.measures.provenanceCoverage > 1 || Object.values(candidate.measures).some((x) => !Number.isFinite(x) || x < 0)) throw new Error("context measures are invalid");
  // Canonical serialization also rejects accidental undefined values.
  if (canonicalJson(candidate) === undefined) throw new Error("context snapshot is not canonical");
  return deepFreeze(clone(candidate));
}
