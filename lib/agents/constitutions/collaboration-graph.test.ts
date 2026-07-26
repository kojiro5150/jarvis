import { describe, expect, it } from "vitest";

import type {
  BehaviouralCapability,
  BehaviouralCapabilityMatrix,
} from "./capability-matrix";
import {
  BEHAVIOURAL_CONSTITUTION_REGISTRY,
  buildBehaviouralCapabilityMatrix,
} from "./capability-matrix";
import { buildBehaviouralCollaborationGraph } from "./collaboration-graph";

function capability(
  specialistId: BehaviouralCapability["specialistId"],
  collaborationPartners: BehaviouralCapability["collaborationPartners"] = []
): BehaviouralCapability {
  return {
    specialistId,
    mission: `${specialistId} mission`,
    responsibilities: [],
    authorityBoundaries: [],
    collaborationPartners,
    outputs: [],
  };
}

function matrix(
  capabilities: readonly BehaviouralCapability[]
): BehaviouralCapabilityMatrix {
  return { capabilities };
}

describe("behavioural collaboration graph", () => {
  it("projects every default capability and exactly its declared edges", () => {
    const source = buildBehaviouralCapabilityMatrix(
      BEHAVIOURAL_CONSTITUTION_REGISTRY
    );
    const graph = buildBehaviouralCollaborationGraph(source);
    const declared = source.capabilities.flatMap((entry) =>
      entry.collaborationPartners.map((targetSpecialistId) => ({
        sourceSpecialistId: entry.specialistId,
        targetSpecialistId,
      }))
    );

    expect(graph.nodes.map((node) => node.specialistId)).toEqual(
      source.capabilities.map((entry) => entry.specialistId)
    );
    expect(graph.edges).toHaveLength(declared.length);
    expect(
      graph.edges.map(({ reciprocal: _reciprocal, ...edge }) => edge)
    ).toEqual(expect.arrayContaining(declared));
  });

  it("preserves a single isolated specialist deterministically", () => {
    const source = matrix([capability("oracle")]);

    expect(buildBehaviouralCollaborationGraph(source)).toEqual({
      nodes: [{ specialistId: "oracle" }],
      edges: [],
    });
    expect(buildBehaviouralCollaborationGraph(source)).toEqual(
      buildBehaviouralCollaborationGraph(matrix([capability("oracle")]))
    );
  });

  it("preserves asymmetric direction without inventing an inverse", () => {
    const graph = buildBehaviouralCollaborationGraph(
      matrix([capability("dawnwatch", ["oracle"]), capability("oracle")])
    );

    expect(graph.edges).toEqual([
      {
        sourceSpecialistId: "dawnwatch",
        targetSpecialistId: "oracle",
        reciprocal: false,
      },
    ]);
  });

  it("marks both independently declared inverse edges as reciprocal", () => {
    const graph = buildBehaviouralCollaborationGraph(
      matrix([
        capability("oracle", ["gecko"]),
        capability("gecko", ["oracle"]),
        capability("steve"),
      ])
    );

    expect(graph.edges).toEqual([
      {
        sourceSpecialistId: "oracle",
        targetSpecialistId: "gecko",
        reciprocal: true,
      },
      {
        sourceSpecialistId: "gecko",
        targetSpecialistId: "oracle",
        reciprocal: true,
      },
    ]);
    expect(graph.nodes.at(-1)).toEqual({ specialistId: "steve" });
  });

  it("deduplicates edges and orders them by source then target node order", () => {
    const source = matrix([
      capability("jarvis", ["oracle", "gecko", "oracle"]),
      capability("gecko", ["oracle"]),
      capability("oracle"),
    ]);
    const before = structuredClone(source);

    expect(buildBehaviouralCollaborationGraph(source).edges).toEqual([
      {
        sourceSpecialistId: "jarvis",
        targetSpecialistId: "gecko",
        reciprocal: false,
      },
      {
        sourceSpecialistId: "jarvis",
        targetSpecialistId: "oracle",
        reciprocal: false,
      },
      {
        sourceSpecialistId: "gecko",
        targetSpecialistId: "oracle",
        reciprocal: false,
      },
    ]);
    expect(source).toEqual(before);
    expect(Object.isFrozen(source)).toBe(false);
    expect(Object.isFrozen(source.capabilities)).toBe(false);
    expect(Object.isFrozen(source.capabilities[0]?.collaborationPartners)).toBe(
      false
    );
  });

  it("returns a deeply frozen graph with topology-only fields", () => {
    const graph = buildBehaviouralCollaborationGraph(
      matrix([capability("jarvis", ["oracle"]), capability("oracle")])
    );

    expect(Object.isFrozen(graph)).toBe(true);
    expect(Object.isFrozen(graph.nodes)).toBe(true);
    expect(graph.nodes.every(Object.isFrozen)).toBe(true);
    expect(Object.isFrozen(graph.edges)).toBe(true);
    expect(graph.edges.every(Object.isFrozen)).toBe(true);
    expect(Object.keys(graph)).toEqual(["nodes", "edges"]);
    expect(Object.keys(graph.edges[0] ?? {})).toEqual([
      "sourceSpecialistId",
      "targetSpecialistId",
      "reciprocal",
    ]);
  });

  it("rejects malformed matrix references and duplicate nodes", () => {
    expect(() =>
      buildBehaviouralCollaborationGraph(matrix([capability("jarvis", ["oracle"])]))
    ).toThrow("unknown collaboration target: oracle");
    expect(() =>
      buildBehaviouralCollaborationGraph(
        matrix([capability("jarvis"), capability("jarvis")])
      )
    ).toThrow("duplicate specialist node: jarvis");
  });

  it("produces deeply equal topology from equivalent independent matrices", () => {
    const makeMatrix = () =>
      matrix([
        capability("gecko", ["oracle"]),
        capability("oracle", ["gecko"]),
      ]);

    expect(buildBehaviouralCollaborationGraph(makeMatrix())).toEqual(
      buildBehaviouralCollaborationGraph(makeMatrix())
    );
  });
});
