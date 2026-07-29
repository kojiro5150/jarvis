import { describe, expect, it } from "vitest";
import { ProjectionEngine, createProjectionArtifact } from "./engine";
import { ProjectionRegistry } from "./registry";
import type { ProjectionAdapter, ProjectionArtifact } from "./types";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

function artifact(adapterId: string, sourceId = adapterId, title = adapterId): ProjectionArtifact {
  return {
    entities: {
      identity: { userId: "sam", displayName: "Sam" },
      roles: [{ id: `${adapterId}-role`, name: title, status: "active" }],
    },
    provenance: {
      sourceId, sourceKind: "configuration", adapterId,
      projectedAt: "2026-07-26T12:00:00Z", availability: "available",
    },
    validationState: "valid",
    metadata: { package: "test" },
  };
}

function adapter(id: string, value = artifact(id)): ProjectionAdapter {
  return { id, project: () => value };
}

describe("ProjectionRegistry", () => {
  it("registers, deterministically enumerates, and removes adapters", () => {
    const registry = new ProjectionRegistry();
    registry.register(adapter("z")); registry.register(adapter("a"));
    expect(registry.adapters().map(({ id }) => id)).toEqual(["a", "z"]);
    expect(Object.isFrozen(registry.adapters())).toBe(true);
    expect(registry.remove("a")).toBe(true);
    expect(registry.adapters().map(({ id }) => id)).toEqual(["z"]);
  });

  it("rejects duplicate and malformed registrations explicitly", () => {
    const registry = new ProjectionRegistry(); registry.register(adapter("a"));
    expect(() => registry.register(adapter("a"))).toThrow("duplicate projection adapter: a");
    expect(() => registry.register({ id: "", project: () => artifact("a") })).toThrow("non-empty");
    expect(() => registry.register({ id: "x" } as never)).toThrow("project()");
  });
});

describe("ProjectionArtifact", () => {
  it("defensively copies, deeply freezes and serialises a valid artifact", () => {
    const input = artifact("config");
    const result = createProjectionArtifact(input);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    expect(result).not.toBe(input);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.entities.roles)).toBe(true);
    expect(Object.isFrozen(result.entities.roles?.[0])).toBe(true);
    expect(Object.isFrozen(result.provenance)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });

  it.each([
    ["missing provenance", { ...artifact("a"), provenance: undefined }],
    ["invalid availability", { ...artifact("a"), provenance: { ...artifact("a").provenance, availability: "degraded" } }],
    ["invalid validation state", { ...artifact("a"), validationState: "invalid" }],
    ["missing metadata", { ...artifact("a"), metadata: undefined }],
  ])("rejects %s", (_label, value) => expect(() => createProjectionArtifact(value as never)).toThrow());

  it("rejects structural and vocabulary failures independently", () => {
    expect(() => createProjectionArtifact({ ...artifact("a"), entities: [] } as never)).toThrow("artifact.entities must be an object");
    expect(() => createProjectionArtifact({ ...artifact("a"), entities: { ...artifact("a").entities, roles: [{ id: "r", name: "Role", status: "retired" }] } } as never)).toThrow("roles[0].status has invalid value: retired");
  });

  it.each(["not-a-date", "2026-02-31T12:00:00Z", "2026-07-26", "2026-07-26T12:00:00"])("rejects malformed projectedAt %s", (projectedAt) => {
    expect(() => createProjectionArtifact({ ...artifact("a"), provenance: { ...artifact("a").provenance, projectedAt } })).toThrow("must be an RFC 3339 timestamp");
  });

  it("rejects non-JSON-compatible values instead of silently changing them", () => {
    for (const invalid of [undefined, Number.NaN, BigInt(1), () => undefined]) {
      expect(() => createProjectionArtifact({ ...artifact("a"), metadata: { invalid } } as never)).toThrow("JSON-compatible");
    }
    const cyclic = artifact("a") as ProjectionArtifact & { cycle?: unknown }; cyclic.cycle = cyclic;
    expect(() => createProjectionArtifact(cyclic)).toThrow("JSON-compatible");
  });

  it("replays a serialized artifact without changing its projection", async () => {
    const original = artifact("a");
    const replay = JSON.parse(JSON.stringify(createProjectionArtifact(original))) as ProjectionArtifact;
    const project = async (value: ProjectionArtifact) => {
      const registry = new ProjectionRegistry(); registry.register(adapter("a", value));
      return new ProjectionEngine(registry).project();
    };
    expect(await project(replay)).toEqual(await project(original));
  });
});

describe("ProjectionEngine", () => {
  it("rejects an empty projection because operational identity is mandatory", async () => {
    await expect(new ProjectionEngine(new ProjectionRegistry()).project()).rejects.toThrow("at least one artifact");
  });

  it("projects one adapter through the canonical immutable constructor", async () => {
    const registry = new ProjectionRegistry(); registry.register(adapter("config"));
    const result = await new ProjectionEngine(registry).project();
    expect(result.roles.map(({ id }) => id)).toEqual(["config-role"]);
    expect(result.sources).toEqual([{ id: "config", kind: "configuration", status: "available", observedAt: "2026-07-26T12:00:00Z" }]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.roles[0])).toBe(true);
    expect(Object.isFrozen(result.sources[0])).toBe(true);
  });

  it("orders adapters and all merged collections by stable identifiers", async () => {
    const registry = new ProjectionRegistry(); registry.register(adapter("z")); registry.register(adapter("a"));
    const result = await new ProjectionEngine(registry).project();
    expect(result.roles.map(({ id }) => id)).toEqual(["a-role", "z-role"]);
    expect(result.sources.map(({ id }) => id)).toEqual(["a", "z"]);
  });

  it("is repeatable and independent of registration order", async () => {
    const project = async (ids: readonly string[]) => {
      const registry = new ProjectionRegistry(); ids.forEach((id) => registry.register(adapter(id)));
      return new ProjectionEngine(registry).project();
    };
    expect(await project(["z", "a"])).toEqual(await project(["a", "z"]));
  });

  it("deduplicates identical observations without interpreting them", async () => {
    const shared = { id: "role", name: "Lead", status: "active" as const };
    const first = { ...artifact("a"), entities: { ...artifact("a").entities, roles: [shared] } };
    const second = { ...artifact("b"), entities: { ...artifact("b").entities, roles: [{ ...shared }] } };
    const registry = new ProjectionRegistry(); registry.register(adapter("a", first)); registry.register(adapter("b", second));
    expect((await new ProjectionEngine(registry).project()).roles).toEqual([shared]);
  });

  it("fails explicitly and deterministically for conflicting observations", async () => {
    const first = { ...artifact("a"), entities: { ...artifact("a").entities, roles: [{ id: "role", name: "Lead", status: "active" as const }] } };
    const second = { ...artifact("b"), entities: { ...artifact("b").entities, roles: [{ id: "role", name: "Other", status: "active" as const }] } };
    const registry = new ProjectionRegistry(); registry.register(adapter("a", first)); registry.register(adapter("b", second));
    await expect(new ProjectionEngine(registry).project()).rejects.toThrow("conflicting roles identifier: role");
    const message = async () => new ProjectionEngine(registry).project().then(() => "", (error: Error) => error.message);
    expect(await message()).toBe(await message());
  });

  it("rejects conflicting identity, context, provenance ownership and source identifiers", async () => {
    const cases: readonly [ProjectionArtifact, ProjectionArtifact, string][] = [
      [artifact("a"), { ...artifact("b"), entities: { ...artifact("b").entities, identity: { userId: "other", displayName: "Other" } } }, "identities"],
      [{ ...artifact("a"), entities: { ...artifact("a").entities, context: { workMode: "writing", locationKind: "work" } } }, { ...artifact("b"), entities: { ...artifact("b").entities, context: { workMode: "meeting", locationKind: "work" } } }, "contexts"],
      [artifact("a", "same"), artifact("b", "same"), "duplicate projection source"],
    ];
    for (const [left, right, message] of cases) {
      const registry = new ProjectionRegistry(); registry.register(adapter("a", left)); registry.register(adapter("b", right));
      await expect(new ProjectionEngine(registry).project()).rejects.toThrow(message);
    }
    const registry = new ProjectionRegistry(); registry.register(adapter("a", { ...artifact("a"), provenance: { ...artifact("a").provenance, adapterId: "other" } }));
    await expect(new ProjectionEngine(registry).project()).rejects.toThrow("returned provenance for other");
  });

  it("defensively isolates the snapshot from mutable adapter output", async () => {
    const input = artifact("a"); const registry = new ProjectionRegistry(); registry.register(adapter("a", input));
    const result = await new ProjectionEngine(registry).project();
    (input.entities.roles![0] as { name: string }).name = "Changed";
    (input.provenance as { projectedAt: string }).projectedAt = "changed";
    expect(result.roles[0]?.name).toBe("a");
    expect(result.sources[0]?.observedAt).toBe("2026-07-26T12:00:00Z");
  });

  it("merges every supported entity collection across adapters", async () => {
    const base = artifact("a");
    const first: ProjectionArtifact = { ...base, entities: {
      identity: base.entities.identity,
      roles: [{ id: "role", name: "Lead", status: "active" }],
      projects: [{ id: "project", name: "Project", status: "active", roleIds: ["role"] }],
      commitments: [{ id: "commitment", title: "Meet", kind: "meeting", status: "scheduled", roleIds: ["role"], projectIds: ["project"] }],
    } };
    const second: ProjectionArtifact = { ...artifact("b"), entities: {
      identity: base.entities.identity,
      waitingItems: [{ id: "waiting", title: "Reply", status: "waiting", waitingOn: "Alex", roleIds: ["role"], projectIds: ["project"] }],
      priorities: [{ id: "priority", title: "Focus", level: "high", source: "user", roleIds: ["role"], projectIds: ["project"] }],
      activeWork: [{ id: "work", title: "Build", status: "active", roleIds: ["role"], projectIds: ["project"] }],
    } };
    const registry = new ProjectionRegistry(); registry.register(adapter("a", first)); registry.register(adapter("b", second));
    const result = await new ProjectionEngine(registry).project();
    expect([result.roles, result.projects, result.commitments, result.waitingItems, result.priorities, result.activeWork].map((items) => items.length)).toEqual([1, 1, 1, 1, 1, 1]);
  });
});

describe("package conformance", () => {
  it("keeps registry enumeration isolated from later registry changes", () => {
    const registry = new ProjectionRegistry(); registry.register(adapter("a"));
    const snapshot = registry.adapters(); registry.register(adapter("b"));
    expect(snapshot.map(({ id }) => id)).toEqual(["a"]);
  });

  it("does not publicly export obsolete merge result contracts", () => {
    const root = readFileSync(resolve(__dirname, "../index.ts"), "utf8");
    const projection = readFileSync(resolve(__dirname, "index.ts"), "utf8");
    expect(root).not.toMatch(/Merge(Result|Conflict)/);
    expect(projection).not.toMatch(/Merge(Result|Conflict)/);
  });

  it("has no consumer outside its package, context boundary, test fixtures, and canonical runtime", () => {
    const repository = process.cwd();
    
    const files = (directory: string): string[] => readdirSync(directory).flatMap((name) => {
      if (["node_modules", ".git", ".next", "docs"].includes(name)) return [];
      const path = resolve(directory, name);
      return statSync(path).isDirectory() ? files(path) : [path];
    });
    const consumers = files(repository).filter((path) => /\.(ts|tsx)$/.test(path))
      .filter((path) => !path.includes("/situational-awareness/"))
      // Deterministic Executive Computation is a constitutional snapshot consumer,
      // not a projection consumer or deliberation/runtime stage.
      .filter((path) => !path.includes("/executive-operating-system/computation/"))
      .filter((path) => !path.includes("/executive-operating-system/attention/"))
      .filter((path) => !path.includes("/executive-operating-system/runtime/"))
      .filter((path) => !path.includes("/executive-context/"))
      .filter((path) => !path.includes("/tests/fixtures/"))
      .filter((path) => !path.endsWith(".test.ts") && !path.endsWith(".test.tsx"))
      .filter((path) => /(?:from\s+|require\()["'][^"']*situational-awareness/.test(readFileSync(path, "utf8")));
    expect(consumers).toEqual([]);
  });
});
