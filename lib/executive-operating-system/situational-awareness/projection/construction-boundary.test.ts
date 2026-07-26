import { beforeEach, describe, expect, it, vi } from "vitest";

const { construction } = vi.hoisted(() => ({ construction: vi.fn((input: object) => Object.freeze(input)) }));

vi.mock("../model", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../model")>();
  return { ...actual, createSituationalAwareness: construction };
});

import { ProjectionEngine, createProjectionArtifact } from "./engine";
import { ProjectionRegistry } from "./registry";
import type { ProjectionArtifact } from "./types";

const artifact: ProjectionArtifact = {
  entities: { identity: { userId: "sam", displayName: "Sam" } },
  provenance: { sourceId: "config", sourceKind: "configuration", adapterId: "config", projectedAt: "2026-07-26T12:00:00Z", availability: "available" },
  validationState: "valid",
  metadata: {},
};

describe("construction boundary", () => {
  beforeEach(() => construction.mockClear());

  it("constructs exactly once after a successful projection", async () => {
    const registry = new ProjectionRegistry(); registry.register({ id: "config", project: () => artifact });
    await new ProjectionEngine(registry).project();
    expect(construction).toHaveBeenCalledOnce();
  });

  it("never constructs while validating an artifact or a failed projection", async () => {
    createProjectionArtifact(artifact);
    expect(construction).not.toHaveBeenCalled();
    const registry = new ProjectionRegistry(); registry.register({ id: "config", project: () => ({ ...artifact, provenance: { ...artifact.provenance, projectedAt: "invalid" } }) });
    await expect(new ProjectionEngine(registry).project()).rejects.toThrow("RFC 3339");
    expect(construction).not.toHaveBeenCalled();
  });
});
