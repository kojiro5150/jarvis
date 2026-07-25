import { describe, expect, it } from "vitest";

import { jarvis } from "./jarvis";
import { oracle } from "./oracle";
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

  it("lists agents with BOA behavioural contracts", () => {
    expect(listContractedAgents()).toEqual(
      expect.arrayContaining([jarvis, oracle])
    );
  });

  it("keeps authority bounded to declared hand-off authority", () => {
    expect(jarvis.behaviouralContract?.authority).toEqual([
      "advise",
      "draft",
      "propose-action",
    ]);
    expect(oracle.behaviouralContract?.authority).toEqual([
      "advise",
      "draft",
    ]);
  });

  it("defines non-empty reference contracts", () => {
    for (const agent of [jarvis, oracle]) {
      const contract = agent.behaviouralContract;

      expect(contract).toBeDefined();
      expect(contract?.role.trim()).not.toBe("");
      expect(contract?.mandate.trim()).not.toBe("");
      expect(contract?.prevents.length).toBeGreaterThan(0);
      expect(contract?.obligations.length).toBeGreaterThan(0);
      expect(contract?.epistemicDiscipline.length).toBeGreaterThan(0);
      expect(contract?.escalationConditions.length).toBeGreaterThan(0);
      expect(contract?.outputContract.trim()).not.toBe("");
    }
  });

  it("passes structural validation", () => {
    expect(validateAgentRegistry()).toEqual([]);
  });
});
