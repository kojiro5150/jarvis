import { createSituationalAwareness } from "../model";
import type { SituationalAwareness, SituationalAwarenessInput } from "../model";
import { ProjectionRegistry } from "./registry";
import type { ProjectionAdapter, ProjectionArtifact, ProjectionEntities, Provenance } from "./types";

const collections = ["roles", "projects", "commitments", "waitingItems", "priorities", "activeWork"] as const;
const availability = new Set(["available", "unavailable", "stale", "not_configured"]);
const sourceKinds = new Set(["configuration", "calendar", "email", "github", "drive", "vercel", "phdss", "other"]);

function required(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${path} must be a non-empty string`);
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  return JSON.stringify(value);
}

function validateArtifact(value: unknown, adapterId: string): asserts value is ProjectionArtifact {
  if (!value || typeof value !== "object") throw new Error(`adapter ${adapterId} returned an invalid projection artifact`);
  const artifact = value as Partial<ProjectionArtifact>;
  if (!artifact.entities || typeof artifact.entities !== "object") throw new Error(`adapter ${adapterId} artifact.entities is required`);
  if (!artifact.provenance || typeof artifact.provenance !== "object") throw new Error(`adapter ${adapterId} artifact.provenance is required`);
  required(artifact.provenance.sourceId, `adapter ${adapterId} provenance.sourceId`);
  required(artifact.provenance.adapterId, `adapter ${adapterId} provenance.adapterId`);
  required(artifact.provenance.projectedAt, `adapter ${adapterId} provenance.projectedAt`);
  if (artifact.provenance.adapterId !== adapterId) throw new Error(`adapter ${adapterId} returned provenance for ${artifact.provenance.adapterId}`);
  if (!availability.has(artifact.provenance.availability ?? "")) throw new Error(`adapter ${adapterId} returned invalid availability`);
  if (!sourceKinds.has(artifact.provenance.sourceKind ?? "")) throw new Error(`adapter ${adapterId} returned invalid source kind`);
  if (artifact.validationState !== "valid") throw new Error(`adapter ${adapterId} artifact is not valid`);
  if (!artifact.metadata || typeof artifact.metadata !== "object" || Array.isArray(artifact.metadata)) throw new Error(`adapter ${adapterId} artifact.metadata is required`);
  for (const [key, item] of Object.entries(artifact.metadata)) {
    required(key, `adapter ${adapterId} metadata key`);
    if (typeof item !== "string") throw new Error(`adapter ${adapterId} metadata.${key} must be a string`);
  }
  // The canonical constructor performs the domain validation. Running it here
  // validates each observation before it can enter merge state.
  createSituationalAwareness(artifact.entities);
}

function compareId(left: { readonly id: string }, right: { readonly id: string }): number {
  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

function merge(artifacts: readonly ProjectionArtifact[]): SituationalAwarenessInput {
  if (artifacts.length === 0) throw new Error("projection requires at least one artifact");
  const identities = artifacts.map(({ entities }) => entities.identity);
  const identity = identities[0];
  if (!identity || identities.some((item) => canonical(item) !== canonical(identity))) {
    throw new Error("projection artifacts contain conflicting operational identities");
  }

  const output: Record<string, unknown> = { identity: { ...identity } };
  for (const key of collections) {
    const entities: { readonly id: string }[] = [];
    for (const artifact of artifacts) {
      entities.push(...((artifact.entities[key] ?? []) as readonly { readonly id: string }[]));
    }
    const byId = new Map<string, { readonly id: string }>();
    for (const entity of entities) {
      const existing = byId.get(entity.id);
      if (existing && canonical(existing) !== canonical(entity)) throw new Error(`conflicting ${key} identifier: ${entity.id}`);
      if (!existing) byId.set(entity.id, entity);
    }
    output[key] = [...byId.values()].sort(compareId);
  }

  const contexts = artifacts.flatMap(({ entities }) => entities.context ? [entities.context] : []);
  if (contexts.length > 1 && contexts.some((item) => canonical(item) !== canonical(contexts[0]))) {
    throw new Error("projection artifacts contain conflicting operational contexts");
  }
  if (contexts[0]) output.context = contexts[0];

  const sources = artifacts.map(({ provenance }) => ({
    id: provenance.sourceId, kind: provenance.sourceKind, status: provenance.availability,
    observedAt: provenance.projectedAt,
  }));
  const sourceIds = new Set<string>();
  for (const source of sources) {
    if (sourceIds.has(source.id)) throw new Error(`duplicate projection source identifier: ${source.id}`);
    sourceIds.add(source.id);
  }
  output.sources = sources.sort(compareId);
  return output as unknown as SituationalAwarenessInput;
}

/** Runs the complete observation, validation, deterministic merge and construction pipeline. */
export class ProjectionEngine {
  readonly #registry: ProjectionRegistry;

  constructor(registry: ProjectionRegistry) { this.#registry = registry; }

  async project(): Promise<SituationalAwareness> {
    const artifacts: ProjectionArtifact[] = [];
    for (const adapter of this.#registry.adapters()) {
      const observed = await adapter.project();
      validateArtifact(observed, adapter.id);
      artifacts.push(createProjectionArtifact(observed));
    }
    return createSituationalAwareness(merge(artifacts));
  }
}

/** Creates a defensively copied, deeply immutable adapter exchange artifact. */
export function createProjectionArtifact(input: ProjectionArtifact): ProjectionArtifact {
  validateArtifact(input, input?.provenance?.adapterId ?? "unknown");
  const copy = JSON.parse(JSON.stringify(input)) as ProjectionArtifact;
  const freeze = (value: unknown): void => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return;
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  };
  freeze(copy);
  return copy;
}
