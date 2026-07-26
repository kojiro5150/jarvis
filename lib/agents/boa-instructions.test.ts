import { describe, expect, it } from "vitest";

import { AGENTS } from "./index";
import {
  BOA_INSTRUCTION_SECTIONS,
  assembleAgentSystemPrompt,
  assembleBoaInstructionPrompt,
  createBoaInstructionFramework,
  validateBoaInstructionFile,
} from "./boa-instructions";
import {
  BOA_INSTRUCTIONS,
  getBoaInstruction,
  validateBoaInstructionRegistry,
} from "./boa-instruction-registry";

import type { BoaInstructionFile } from "./boa-instructions";

describe("BOA instruction framework", () => {
  it("registers one valid instruction framework for every agent", () => {
    expect(Object.keys(BOA_INSTRUCTIONS).sort()).toEqual(
      AGENTS.map((agent) => agent.id).sort()
    );
    expect(validateBoaInstructionRegistry()).toEqual([]);
  });

  it("creates every required section deterministically", () => {
    const file = createBoaInstructionFramework("oracle");
    expect(Object.keys(file.sections)).toEqual([...BOA_INSTRUCTION_SECTIONS]);
    expect(file.status).toBe("framework");
    expect(file.version).toBe("0.1.0");
  });

  it("rejects invalid metadata and missing sections", () => {
    const invalid = {
      agentId: "",
      version: "v1",
      status: "framework",
      sections: {},
    } as unknown as BoaInstructionFile;

    expect(validateBoaInstructionFile(invalid)).toContain("agentId is required");
    expect(validateBoaInstructionFile(invalid)).toContain("version must use semver");
    expect(validateBoaInstructionFile(invalid)).toContain("missing section: mission");
  });

  it("assembles shared BOA boundaries into a stable prompt", () => {
    const prompt = assembleBoaInstructionPrompt(getBoaInstruction("gecko"));
    expect(prompt).toContain("BOA INSTRUCTION FILE · gecko · v0.1.0 · framework");
    expect(prompt).toContain("EPISTEMIC RULES:");
    expect(prompt).toContain("AUTHORITY LIMITS:");
    expect(prompt).toContain("Do not exceed the authority granted");
  });

  it("assembles agent prompt, BOA file and context in order", () => {
    const agent = AGENTS.find((candidate) => candidate.id === "gecko")!;
    const prompt = assembleAgentSystemPrompt(
      agent,
      getBoaInstruction(agent.id),
      "CURRENT CONTEXT"
    );

    expect(prompt.indexOf(agent.systemPrompt)).toBeLessThan(
      prompt.indexOf("BOA INSTRUCTION FILE")
    );
    expect(prompt.indexOf("BOA INSTRUCTION FILE")).toBeLessThan(
      prompt.indexOf("CURRENT CONTEXT")
    );
  });

  it("rejects an instruction file assigned to the wrong agent", () => {
    const agent = AGENTS.find((candidate) => candidate.id === "gecko")!;
    expect(() =>
      assembleAgentSystemPrompt(agent, getBoaInstruction("oracle"))
    ).toThrow("BOA instruction agent mismatch");
  });
});
