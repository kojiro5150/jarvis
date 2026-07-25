import { describe, expect, it } from "vitest";

import { AGENTS } from "./index";
import { cowork } from "./cowork";
import { herald } from "./herald";
import { jarvis } from "./jarvis";
import { marcus } from "./marcus";
import { oracle } from "./oracle";
import { phdss } from "./phdss";
import { steve } from "./steve";
import {
  findAgentsByCapability,
  findAgentsByTrigger,
  getAgentById,
  listCapabilities,
  listContractedAgents,
  validateAgentRegistry,
} from "./registry";

describe("agent registry", () => {
  it("returns a registered agent by ID", () => {
    expect(getAgentById("jarvis")).toBe(jarvis);
  });

  it("falls back to JARVIS for an unknown ID", () => {
    expect(getAgentById("unknown-agent")).toBe(jarvis);
  });

  it("finds agents by capability", () => {
    const agents = findAgentsByCapability("orchestration");

    expect(agents).toContain(jarvis);
  });

  it("finds agents by hand-off trigger", () => {
    const agents = findAgentsByTrigger("planning");

    expect(agents).toContain(jarvis);
  });

  it("lists each declared capability once", () => {
    const capabilities = listCapabilities();

    expect(capabilities).toContain("orchestration");
    expect(new Set(capabilities).size).toBe(capabilities.length);
  });

  it("requires BOA behavioural contracts for every registered agent", () => {
    expect(listContractedAgents()).toEqual(AGENTS);
  });

  it("keeps advisory-only roles bounded to advice", () => {
    expect(marcus.behaviouralContract?.authority).toEqual(["advise"]);
    expect(phdss.behaviouralContract?.authority).toEqual(["advise"]);
  });

  it("allows drafting without independently authorising execution", () => {
    expect(herald.behaviouralContract?.authority).toContain("draft");
    expect(herald.behaviouralContract?.authority).not.toContain("propose-action");
    expect(steve.behaviouralContract?.authority).toContain("propose-action");
    expect(cowork.behaviouralContract?.authority).toContain("propose-action");
  });

  it("defines structurally complete contracts for every agent", () => {
    for (const agent of AGENTS) {
      const contract = agent.behaviouralContract;

      expect(contract).toBeDefined();
      expect(contract?.role.trim()).not.toBe("");
      expect(contract?.mandate.trim()).not.toBe("");
      expect(contract?.prevents.length).toBeGreaterThan(0);
      expect(contract?.obligations.length).toBeGreaterThan(0);
      expect(contract?.epistemicDiscipline.length).toBeGreaterThan(0);
      expect(contract?.authority.length).toBeGreaterThan(0);
      expect(contract?.escalationConditions.length).toBeGreaterThan(0);
      expect(contract?.outputContract.trim()).not.toBe("");
    }
  });

  it("preserves explicit human authority in governance outputs", () => {
    expect(phdss.behaviouralContract?.mandate).toContain(
      "preserving human decision authority"
    );
    expect(phdss.behaviouralContract?.outputContract).toContain(
      "without issuing the decision itself"
    );
  });

  it("preserves the reference contracts", () => {
    expect(listContractedAgents()).toEqual(
      expect.arrayContaining([jarvis, oracle])
    );
  });

  it("passes structural validation", () => {
    expect(validateAgentRegistry()).toEqual([]);
  });
});