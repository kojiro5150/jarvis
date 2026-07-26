import { describe, expect, it } from "vitest";

import { getBoaInstruction } from "../boa-instruction-registry";
import { assembleAgentSystemPrompt } from "../boa-instructions";
import { AGENTS_BY_ID } from "../index";
import {
  BEHAVIOURAL_CONSTITUTIONS,
  CONSTITUTION_SPECIALIST_IDS,
  getEffectiveBehaviouralConstitution,
  hasBehaviouralConstitution,
  validateBehaviouralConstitutionRegistry,
} from "./registry";
import { SHARED_CONSTITUTION } from "./shared";

describe("behavioural constitution registry", () => {
  it("registers exactly the seven Sprint 3.9 constitutions", () => {
    expect(Object.keys(BEHAVIOURAL_CONSTITUTIONS).sort()).toEqual(
      [...CONSTITUTION_SPECIALIST_IDS].sort()
    );
    expect(hasBehaviouralConstitution("cowork")).toBe(false);
    expect(hasBehaviouralConstitution("phdss")).toBe(false);
  });

  it("loads valid constitutions without expanding legacy authority", () => {
    expect(validateBehaviouralConstitutionRegistry()).toEqual([]);
  });

  it("rejects duplicate constitutional authority entries", () => {
    const original = BEHAVIOURAL_CONSTITUTIONS.oracle;
    BEHAVIOURAL_CONSTITUTIONS.oracle = {
      ...original,
      authorityBoundaries: {
        ...original.authorityBoundaries,
        allowed: ["advise", "advise"],
      },
    };

    try {
      expect(validateBehaviouralConstitutionRegistry()).toContain(
        "oracle: constitution contains duplicate authority entries"
      );
    } finally {
      BEHAVIOURAL_CONSTITUTIONS.oracle = original;
    }
  });

  it("inherits the shared constitutional layer without mutating specialist data", () => {
    const effective = getEffectiveBehaviouralConstitution("oracle");
    expect(effective.shared).toBe(SHARED_CONSTITUTION);
    expect(effective.specialist).toBe(BEHAVIOURAL_CONSTITUTIONS.oracle);
    expect(effective.shared.principles.humanAuthority).not.toHaveLength(0);
    expect(effective.specialist).not.toHaveProperty("shared");
  });

  it("does not change existing BOA prompt assembly", () => {
    const agent = AGENTS_BY_ID.gecko;
    const instruction = getBoaInstruction(agent.id);
    const expected = [
      agent.systemPrompt,
      "BOA INSTRUCTION FILE · gecko · v0.1.0 · framework",
      "CURRENT CONTEXT",
    ];
    const prompt = assembleAgentSystemPrompt(agent, instruction, expected[2]);

    expect(prompt).toContain(expected[0]);
    expect(prompt).toContain(expected[1]);
    expect(prompt.indexOf(expected[0])).toBeLessThan(prompt.indexOf(expected[1]));
    expect(prompt.indexOf(expected[1])).toBeLessThan(prompt.indexOf(expected[2]));
    expect(prompt).not.toContain("BEHAVIOURAL CONSTITUTION");
  });

  it("leaves CO-WORK and PHDSS on their existing BOA framework", () => {
    for (const specialistId of ["cowork", "phdss"]) {
      const instruction = getBoaInstruction(specialistId);
      expect(instruction.status).toBe("framework");
      expect(instruction.version).toBe("0.1.0");
    }
  });
});
