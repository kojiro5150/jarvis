import { createSituationalAwareness } from "../model";
import type { SituationalAwareness, SituationalAwarenessInput } from "../model";
import { ProjectionRegistry } from "./registry";
import type { ProjectionArtifact, ProjectionEntities } from "./types";

const collections = ["roles", "projects", "commitments", "communications", "waitingItems", "priorities", "activeWork"] as const;
const availability = new Set(["available", "unavailable", "stale", "not_configured"]);
const sourceKinds = new Set(["configuration", "calendar", "email", "github", "drive", "vercel", "phdss", "other"]);
const vocabularies: Readonly<Record<string, ReadonlySet<string>>> = {
  "roles.status": new Set(["active", "inactive"]),
  "projects.status": new Set(["planned", "active", "blocked", "paused", "completed", "cancelled"]),
  "commitments.kind": new Set(["meeting", "deadline", "deliverable", "review", "follow_up", "other"]),
  "commitments.status": new Set(["scheduled", "in_progress", "completed", "cancelled"]),
  "waitingItems.status": new Set(["waiting", "resolved", "cancelled"]),
  "priorities.level": new Set(["high", "medium", "low"]),
  "priorities.source": new Set(["user", "authoritative_source"]),
  "activeWork.status": new Set(["active", "paused", "blocked"]),
  "context.workMode": new Set(["meeting", "research", "engineering", "writing", "personal", "unknown"]),
  "context.locationKind": new Set(["home", "work", "commuting", "other", "unknown"]),
};
const timestampFields: Readonly<Record<string, readonly string[]>> = {
  projects: ["targetDate"], commitments: ["startsAt", "dueAt"], communications: ["sentAt", "receivedAt"],
  waitingItems: ["since", "expectedBy"], activeWork: ["startedAt", "lastUpdatedAt"],
};
const rfc3339 = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;

function required(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${path} must be a non-empty string`);
}

function record(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be an object`);
}

function array(value: unknown, path: string): asserts value is readonly unknown[] {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  return JSON.stringify(value);
}

/** Rejects values which cannot be replayed without loss through JSON. */
function validateJsonCompatible(value: unknown, path = "artifact", ancestors = new Set<object>()): void {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (Number.isFinite(value)) return;
    throw new Error(`${path} must contain only JSON-compatible values`);
  }
  if (typeof value !== "object") throw new Error(`${path} must contain only JSON-compatible values`);
  const object = value as object;
  if (ancestors.has(object)) throw new Error(`${path} must contain only JSON-compatible values`);
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${path} must contain only JSON-compatible values`);
  }
  ancestors.add(object);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) throw new Error(`${path} must contain only JSON-compatible values`);
      validateJsonCompatible(value[index], `${path}[${index}]`, ancestors);
    }
  } else {
    if (Reflect.ownKeys(value).some((key) => typeof key === "symbol")) throw new Error(`${path} must contain only JSON-compatible values`);
    for (const [key, item] of Object.entries(value)) validateJsonCompatible(item, `${path}.${key}`, ancestors);
  }
  ancestors.delete(object);
}

/** Validates the artifact envelope without applying domain meaning. */
function validateArtifactStructure(value: unknown, adapterId: string): asserts value is ProjectionArtifact {
  record(value, `adapter ${adapterId} projection artifact`);
  record(value.entities, `adapter ${adapterId} artifact.entities`);
  record(value.entities.identity, `adapter ${adapterId} artifact.entities.identity`);
  record(value.provenance, `adapter ${adapterId} artifact.provenance`);
  record(value.metadata, `adapter ${adapterId} artifact.metadata`);
  if (value.validationState !== "valid") throw new Error(`adapter ${adapterId} artifact is not valid`);
  for (const key of collections) if (value.entities[key] !== undefined) array(value.entities[key], `adapter ${adapterId} entities.${key}`);
  if (value.entities.context !== undefined) record(value.entities.context, `adapter ${adapterId} entities.context`);
  for (const [key, item] of Object.entries(value.metadata)) {
    required(key, `adapter ${adapterId} metadata key`);
    if (typeof item !== "string") throw new Error(`adapter ${adapterId} metadata.${key} must be a string`);
  }
}

/** Validates every closed runtime vocabulary used by artifacts. */
function validateControlledVocabulary(artifact: ProjectionArtifact, adapterId: string): void {
  if (!availability.has(artifact.provenance.availability)) throw new Error(`adapter ${adapterId} returned invalid availability: ${String(artifact.provenance.availability)}`);
  if (!sourceKinds.has(artifact.provenance.sourceKind)) throw new Error(`adapter ${adapterId} returned invalid source kind: ${String(artifact.provenance.sourceKind)}`);
  for (const [key, accepted] of Object.entries(vocabularies)) {
    const [collection, field] = key.split(".");
    const values = collection === "context" ? [artifact.entities.context].filter(Boolean) : (artifact.entities[collection as keyof ProjectionEntities] ?? []);
    for (const [index, value] of (values as unknown as readonly Record<string, unknown>[]).entries()) {
      if (!accepted.has(String(value[field]))) throw new Error(`adapter ${adapterId} ${collection}${collection === "context" ? "" : `[${index}]`}.${field} has invalid value: ${String(value[field])}`);
    }
  }
}

function validateTimestamp(value: unknown, path: string): void {
  const match = typeof value === "string" ? rfc3339.exec(value) : null;
  const daysInMonth = match ? new Date(Date.UTC(Number((value as string).slice(0, 4)), Number(match[1]), 0)).getUTCDate() : 0;
  if (!match || Number(match[2]) > daysInMonth || !Number.isFinite(Date.parse(value as string))) {
    throw new Error(`${path} must be an RFC 3339 timestamp`);
  }
}

/** Validates provenance and entity timestamps independently from construction. */
function validateProjectedAtAndEntityTimestamps(artifact: ProjectionArtifact, adapterId: string): void {
  validateTimestamp(artifact.provenance.projectedAt, `adapter ${adapterId} provenance.projectedAt`);
  for (const [collection, fields] of Object.entries(timestampFields)) {
    for (const [index, entity] of ((artifact.entities[collection as keyof ProjectionEntities] ?? []) as unknown as readonly Record<string, unknown>[]).entries()) {
      for (const field of fields) if (entity[field] !== undefined) validateTimestamp(entity[field], `adapter ${adapterId} ${collection}[${index}].${field}`);
    }
  }
}

/** Validates entity shape and reference shape; cross-artifact reference existence is deferred. */
function validateEntitySemantics(artifact: ProjectionArtifact, adapterId: string): void {
  required(artifact.entities.identity.userId, `adapter ${adapterId} identity.userId`);
  required(artifact.entities.identity.displayName, `adapter ${adapterId} identity.displayName`);
  for (const key of collections) {
    for (const [index, entity] of (artifact.entities[key] ?? []).entries()) {
      record(entity, `adapter ${adapterId} ${key}[${index}]`);
      required(entity.id, `adapter ${adapterId} ${key}[${index}].id`);
      if (key === "roles") required(entity.name, `adapter ${adapterId} roles[${index}].name`);
      else if (key !== "communications") required(entity.title ?? entity.name, `adapter ${adapterId} ${key}[${index}].title`);
      if ("roleIds" in entity) array(entity.roleIds, `adapter ${adapterId} ${key}[${index}].roleIds`);
      if ("projectIds" in entity) array(entity.projectIds, `adapter ${adapterId} ${key}[${index}].projectIds`);
      if (key === "waitingItems") required(entity.waitingOn, `adapter ${adapterId} waitingItems[${index}].waitingOn`);
      if (key === "communications") {
        required(entity.sender, `adapter ${adapterId} communications[${index}].sender`);
        required(entity.sentAt, `adapter ${adapterId} communications[${index}].sentAt`);
        array(entity.recipients, `adapter ${adapterId} communications[${index}].recipients`);
        array(entity.references, `adapter ${adapterId} communications[${index}].references`);
      }
    }
  }
}

function validateArtifact(artifact: unknown, adapterId: string): asserts artifact is ProjectionArtifact {
  validateJsonCompatible(artifact);
  validateArtifactStructure(artifact, adapterId);
  required(artifact.provenance.sourceId, `adapter ${adapterId} provenance.sourceId`);
  required(artifact.provenance.adapterId, `adapter ${adapterId} provenance.adapterId`);
  if (artifact.provenance.adapterId !== adapterId) throw new Error(`adapter ${adapterId} returned provenance for ${artifact.provenance.adapterId}`);
  validateControlledVocabulary(artifact, adapterId);
  validateProjectedAtAndEntityTimestamps(artifact, adapterId);
  validateEntitySemantics(artifact, adapterId);
}

function compareId(left: { readonly id: string }, right: { readonly id: string }): number {
  return left.id.localeCompare(right.id);
}

/** Validates ownership and singular facts before any merge state is created. */
function validateCrossArtifactIdentityAndSources(artifacts: readonly ProjectionArtifact[]): void {
  if (artifacts.length === 0) throw new Error("projection requires at least one artifact");
  const identity = artifacts[0].entities.identity;
  if (artifacts.some(({ entities }) => canonical(entities.identity) !== canonical(identity))) {
    throw new Error("projection artifacts contain conflicting operational identities");
  }
  const contexts = artifacts.flatMap(({ entities }) => entities.context ? [entities.context] : []);
  if (contexts.some((item) => canonical(item) !== canonical(contexts[0]))) {
    throw new Error("projection artifacts contain conflicting operational contexts");
  }
  const sourceIds = new Set<string>();
  for (const { provenance } of artifacts) {
    if (sourceIds.has(provenance.sourceId)) throw new Error(`duplicate projection source identifier: ${provenance.sourceId}`);
    sourceIds.add(provenance.sourceId);
  }
}

/** Deduplicates exact observations and rejects incompatible same-ID observations. */
function merge(artifacts: readonly ProjectionArtifact[]): SituationalAwarenessInput {
  const output: Record<string, unknown> = { identity: { ...artifacts[0].entities.identity } };
  for (const key of collections) {
    const byId = new Map<string, { readonly id: string }>();
    for (const artifact of artifacts) for (const entity of artifact.entities[key] ?? []) {
      const existing = byId.get(entity.id);
      if (existing && canonical(existing) !== canonical(entity)) throw new Error(`conflicting ${key} identifier: ${entity.id}`);
      if (!existing) byId.set(entity.id, entity);
    }
    output[key] = [...byId.values()].sort(compareId);
  }
  const context = artifacts.find(({ entities }) => entities.context)?.entities.context;
  if (context) output.context = context;
  output.sources = artifacts.map(({ provenance }) => ({
    id: provenance.sourceId, kind: provenance.sourceKind, status: provenance.availability, observedAt: provenance.projectedAt,
  })).sort(compareId);
  return output as unknown as SituationalAwarenessInput;
}

/** Validates merged PR1 uniqueness and references without constructing a snapshot. */
function validateMergedInput(input: SituationalAwarenessInput): void {
  const roleIds = new Set((input.roles ?? []).map(({ id }) => id));
  const projectIds = new Set((input.projects ?? []).map(({ id }) => id));
  for (const project of input.projects ?? []) for (const id of project.roleIds) if (!roleIds.has(id)) throw new Error(`projects roleIds references unknown role: ${id}`);
  for (const [key, entities] of [["commitments", input.commitments], ["waitingItems", input.waitingItems], ["priorities", input.priorities], ["activeWork", input.activeWork]] as const) {
    for (const entity of entities ?? []) {
      for (const id of entity.roleIds) if (!roleIds.has(id)) throw new Error(`${key} roleIds references unknown role: ${id}`);
      for (const id of entity.projectIds) if (!projectIds.has(id)) throw new Error(`${key} projectIds references unknown project: ${id}`);
    }
  }
  if (input.context?.activeRoleId !== undefined && !roleIds.has(input.context.activeRoleId)) throw new Error(`context.activeRoleId references unknown role: ${input.context.activeRoleId}`);
  if (input.context?.activeProjectId !== undefined && !projectIds.has(input.context.activeProjectId)) throw new Error(`context.activeProjectId references unknown project: ${input.context.activeProjectId}`);
}

function deepCopyAndFreeze(input: ProjectionArtifact): ProjectionArtifact {
  const copies = new WeakMap<object, object>();
  const copyValue = (value: unknown): unknown => {
    if (!value || typeof value !== "object") return value;
    const existing = copies.get(value);
    if (existing) return existing;
    const copy: object = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value)) as object;
    copies.set(value, copy);
    for (const key of Reflect.ownKeys(value)) (copy as Record<PropertyKey, unknown>)[key] = copyValue((value as Record<PropertyKey, unknown>)[key]);
    return copy;
  };
  const copy = copyValue(input) as ProjectionArtifact;
  const frozen = new WeakSet<object>();
  const freeze = (value: unknown): void => {
    if (!value || typeof value !== "object" || frozen.has(value)) return;
    frozen.add(value);
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  };
  freeze(copy);
  return copy;
}

/** Runs observation, defensive isolation, validation, merge, invariant validation and one construction. */
export class ProjectionEngine {
  readonly #registry: ProjectionRegistry;

  constructor(registry: ProjectionRegistry) { this.#registry = registry; }

  async project(): Promise<SituationalAwareness> {
    const artifacts: ProjectionArtifact[] = [];
    for (const adapter of this.#registry.adapters()) {
      const artifact = deepCopyAndFreeze(await adapter.project());
      validateArtifact(artifact, adapter.id);
      artifacts.push(artifact);
    }
    validateCrossArtifactIdentityAndSources(artifacts);
    const merged = merge(artifacts);
    validateMergedInput(merged);
    return createSituationalAwareness(merged);
  }
}

/** Constructs Situational Awareness from an already collected artifact boundary. */
export function projectArtifacts(input: readonly ProjectionArtifact[]): SituationalAwareness {
  const artifacts = input.map(deepCopyAndFreeze);
  for (const artifact of artifacts) validateArtifact(artifact, artifact?.provenance?.adapterId ?? "unknown");
  validateCrossArtifactIdentityAndSources(artifacts);
  const merged = merge(artifacts);
  validateMergedInput(merged);
  return createSituationalAwareness(merged);
}

/** Creates one defensively copied, deeply immutable, validated adapter exchange artifact. */
export function createProjectionArtifact(input: ProjectionArtifact): ProjectionArtifact {
  const artifact = deepCopyAndFreeze(input);
  validateArtifact(artifact, artifact?.provenance?.adapterId ?? "unknown");
  return artifact;
}
