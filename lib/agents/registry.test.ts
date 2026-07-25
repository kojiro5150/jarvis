import { describe, expect, it } from "vitest";

import { jarvis } from "./jarvis";
import {
  findAgentsByCapability,
  findAgentsByTrigger,
  getAgentById,
  listCapabilities,
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

  it("passes structural validation", () => {
    expect(validateAgentRegistry()).toEqual([]);
  });
});