import { describe, expect, it } from "vitest";

import {
  BEHAVIOURAL_CONSTITUTION_REGISTRY,
  buildBehaviouralCapabilityMatrix,
} from "./capability-matrix";
import {
  BEHAVIOURAL_CONSTITUTIONS,
  CONSTITUTION_SPECIALIST_IDS,
} from "./registry";

describe("behavioural capability matrix", () => {
  it("extracts the complete registry with complete specialist coverage", () => {
    const matrix = buildBehaviouralCapabilityMatrix(
      BEHAVIOURAL_CONSTITUTION_REGISTRY
    );

    expect(matrix.capabilities.map(({ specialistId }) => specialistId)).toEqual(
      CONSTITUTION_SPECIALIST_IDS
    );
    expect(matrix.capabilities).toHaveLength(
      Object.keys(BEHAVIOURAL_CONSTITUTIONS).length
    );
  });

  it("extracts a single specialist", () => {
    const matrix = buildBehaviouralCapabilityMatrix({
      specialistIds: ["oracle"],
      constitutions: { oracle: BEHAVIOURAL_CONSTITUTIONS.oracle },
    });

    expect(matrix.capabilities).toHaveLength(1);
    expect(matrix.capabilities[0]?.specialistId).toBe("oracle");
  });

  it("uses explicit registry ordering rather than object insertion order", () => {
    const matrix = buildBehaviouralCapabilityMatrix({
      specialistIds: ["steve", "jarvis", "gecko"],
      constitutions: {
        gecko: BEHAVIOURAL_CONSTITUTIONS.gecko,
        jarvis: BEHAVIOURAL_CONSTITUTIONS.jarvis,
        steve: BEHAVIOURAL_CONSTITUTIONS.steve,
      },
    });

    expect(matrix.capabilities.map(({ specialistId }) => specialistId)).toEqual([
      "steve",
      "jarvis",
      "gecko",
    ]);
  });

  it("produces identical output on repeated builds", () => {
    expect(buildBehaviouralCapabilityMatrix(BEHAVIOURAL_CONSTITUTION_REGISTRY)).toEqual(
      buildBehaviouralCapabilityMatrix(BEHAVIOURAL_CONSTITUTION_REGISTRY)
    );
  });

  it("does not mutate its constitutional source and returns immutable results", () => {
    const before = JSON.stringify(BEHAVIOURAL_CONSTITUTIONS);
    const matrix = buildBehaviouralCapabilityMatrix(
      BEHAVIOURAL_CONSTITUTION_REGISTRY
    );

    expect(JSON.stringify(BEHAVIOURAL_CONSTITUTIONS)).toBe(before);
    expect(Object.isFrozen(matrix)).toBe(true);
    expect(Object.isFrozen(matrix.capabilities)).toBe(true);
    expect(Object.isFrozen(matrix.capabilities[0])).toBe(true);
    expect(Object.isFrozen(matrix.capabilities[0]?.responsibilities)).toBe(true);
  });

  it("preserves authority, collaboration and output declarations", () => {
    const matrix = buildBehaviouralCapabilityMatrix({
      specialistIds: ["oracle"],
      constitutions: { oracle: BEHAVIOURAL_CONSTITUTIONS.oracle },
    });
    const capability = matrix.capabilities[0];

    expect(capability?.authorityBoundaries).toEqual(
      [
        ...BEHAVIOURAL_CONSTITUTIONS.oracle.authorityBoundaries.allowed,
        ...BEHAVIOURAL_CONSTITUTIONS.oracle.authorityBoundaries.rules,
      ]
    );
    expect(capability?.collaborationPartners).toEqual(["jarvis", "gecko"]);
    expect(capability?.outputs).toEqual([
      BEHAVIOURAL_CONSTITUTIONS.oracle.outputContract,
    ]);
  });
});
