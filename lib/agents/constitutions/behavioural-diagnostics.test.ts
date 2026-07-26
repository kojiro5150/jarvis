import { describe, expect, it } from "vitest";

import { diagnoseBehaviouralArchitecture } from "./behavioural-diagnostics";
import type { BehaviouralCapabilityMatrix } from "./capability-matrix";
import type { BehaviouralCollaborationGraph } from "./collaboration-graph";
import type { ConstitutionSpecialistId } from "./registry";

const ids = ["jarvis", "oracle", "gecko", "herald"] as const;

function matrix(
  specialistIds: readonly ConstitutionSpecialistId[],
  empty = false
): BehaviouralCapabilityMatrix {
  return {
    capabilities: specialistIds.map((specialistId) => ({
      specialistId,
      mission: `${specialistId} mission`,
      responsibilities: empty ? [] : ["responsibility"],
      authorityBoundaries: empty ? [] : ["boundary"],
      collaborationPartners: [],
      outputs: empty ? [] : ["output"],
    })),
  };
}

function graph(
  specialistIds: readonly ConstitutionSpecialistId[],
  pairs: readonly (readonly [ConstitutionSpecialistId, ConstitutionSpecialistId])[]
): BehaviouralCollaborationGraph {
  const keys = new Set(pairs.map(([source, target]) => `${source}:${target}`));
  return {
    nodes: specialistIds.map((specialistId) => ({ specialistId })),
    edges: pairs.map(([sourceSpecialistId, targetSpecialistId]) => ({
      sourceSpecialistId,
      targetSpecialistId,
      reciprocal: keys.has(`${targetSpecialistId}:${sourceSpecialistId}`),
    })),
  };
}

describe("diagnoseBehaviouralArchitecture", () => {
  it("returns a deeply immutable empty report for an empty valid projection", () => {
    const report = diagnoseBehaviouralArchitecture(matrix([]), graph([], []));
    expect(report).toEqual({
      diagnostics: [],
      summary: {
        specialistCount: 0,
        collaborationEdgeCount: 0,
        reciprocalPairCount: 0,
        isolatedSpecialistCount: 0,
        disconnectedComponentCount: 0,
        diagnosticCount: 0,
        attentionCount: 0,
        informationCount: 0,
      },
    });
    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.diagnostics)).toBe(true);
    expect(Object.isFrozen(report.summary)).toBe(true);
    expect(report).not.toHaveProperty("status");
  });

  it("diagnoses isolated specialists without contradictory degree diagnostics", () => {
    const report = diagnoseBehaviouralArchitecture(matrix([ids[0]]), graph([ids[0]], []));
    expect(report.diagnostics).toEqual([
      {
        code: "isolated_specialist",
        severity: "attention",
        specialistIds: [ids[0]],
        message: 'Specialist "jarvis" has no declared incoming or outgoing collaboration relationships.',
      },
    ]);
    expect(Object.isFrozen(report.diagnostics[0])).toBe(true);
    expect(Object.isFrozen(report.diagnostics[0].specialistIds)).toBe(true);
  });

  it("describes one-way degree and relationship topology", () => {
    const report = diagnoseBehaviouralArchitecture(
      matrix(ids.slice(0, 2)),
      graph(ids.slice(0, 2), [[ids[0], ids[1]]])
    );
    expect(report.diagnostics.map(({ code, specialistIds }) => [code, specialistIds])).toEqual([
      ["outgoing_only_specialist", ["jarvis"]],
      ["incoming_only_specialist", ["oracle"]],
      ["one_way_collaboration", ["jarvis", "oracle"]],
    ]);
    expect(report.diagnostics[2]).toMatchObject({
      severity: "attention",
      message: 'Specialist "jarvis" declares collaboration with "oracle" without a reciprocal declaration.',
    });
  });

  it("emits one canonically ordered reciprocal pair diagnostic", () => {
    const report = diagnoseBehaviouralArchitecture(
      matrix(ids.slice(0, 2)),
      graph(ids.slice(0, 2), [[ids[1], ids[0]], [ids[0], ids[1]]])
    );
    expect(report.diagnostics).toEqual([
      {
        code: "reciprocal_collaboration",
        severity: "information",
        specialistIds: ["jarvis", "oracle"],
        message: 'Specialists "jarvis" and "oracle" declare reciprocal collaboration relationships.',
      },
    ]);
    expect(report.summary.reciprocalPairCount).toBe(1);
  });

  it("orders weak components and their members by matrix order", () => {
    const report = diagnoseBehaviouralArchitecture(
      matrix(ids),
      graph(ids, [[ids[1], ids[0]], [ids[2], ids[3]], [ids[3], ids[2]]])
    );
    const components = report.diagnostics.filter(({ code }) => code === "disconnected_component");
    expect(components.map(({ specialistIds }) => specialistIds)).toEqual([
      ["jarvis", "oracle"],
      ["gecko", "herald"],
    ]);
    expect(report.summary.disconnectedComponentCount).toBe(2);
    expect(report.summary).toMatchObject({ specialistCount: 4, collaborationEdgeCount: 3 });
  });

  it("counts an isolated node as a component and emits permitted empty collection diagnostics", () => {
    const report = diagnoseBehaviouralArchitecture(
      matrix(ids.slice(0, 3), true),
      graph(ids.slice(0, 3), [[ids[0], ids[1]], [ids[1], ids[0]]])
    );
    expect(report.summary).toEqual({
      specialistCount: 3,
      collaborationEdgeCount: 2,
      reciprocalPairCount: 1,
      isolatedSpecialistCount: 1,
      disconnectedComponentCount: 2,
      diagnosticCount: 13,
      attentionCount: 10,
      informationCount: 3,
    });
    expect(report.diagnostics.slice(-9).map(({ code }) => code)).toEqual([
      "empty_responsibilities", "empty_responsibilities", "empty_responsibilities",
      "empty_authority_boundaries", "empty_authority_boundaries", "empty_authority_boundaries",
      "empty_outputs", "empty_outputs", "empty_outputs",
    ]);
  });

  it("fails focused cross-projection and malformed graph invariants", () => {
    expect(() => diagnoseBehaviouralArchitecture(matrix([ids[0]]), graph([ids[1]], []))).toThrow(
      "behavioural architecture diagnostics: graph specialist absent from matrix: oracle"
    );
    expect(() => diagnoseBehaviouralArchitecture(matrix([ids[0]]), graph([ids[0]], [[ids[0], ids[1]]]))).toThrow(
      "behavioural architecture diagnostics: edge references missing target: oracle"
    );
    expect(() => diagnoseBehaviouralArchitecture(matrix([ids[0], ids[0]]), graph([ids[0]], []))).toThrow(
      "behavioural architecture diagnostics: duplicate matrix specialist: jarvis"
    );
    expect(() => diagnoseBehaviouralArchitecture(matrix([ids[0]]), graph([ids[0], ids[0]], []))).toThrow(
      "behavioural architecture diagnostics: duplicate graph node: jarvis"
    );
  });

  it("is deterministic and does not mutate or freeze mutable inputs", () => {
    const sourceMatrix = matrix(ids.slice(0, 3));
    const sourceGraph = graph(ids.slice(0, 3), [[ids[0], ids[1]]]);
    const before = JSON.stringify({ sourceMatrix, sourceGraph });
    const first = diagnoseBehaviouralArchitecture(sourceMatrix, sourceGraph);
    const second = diagnoseBehaviouralArchitecture(sourceMatrix, sourceGraph);
    expect(first).toEqual(second);
    expect(JSON.stringify({ sourceMatrix, sourceGraph })).toBe(before);
    expect(Object.isFrozen(sourceMatrix)).toBe(false);
    expect(Object.isFrozen(sourceGraph)).toBe(false);
    expect(Object.keys(first.diagnostics[0])).toEqual(["code", "severity", "specialistIds", "message"]);
  });
});
