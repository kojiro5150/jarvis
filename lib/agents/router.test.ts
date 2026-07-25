import { describe, expect, it } from "vitest";

import { jarvis } from "./jarvis";
import { oracle } from "./oracle";
import { routeTask } from "./router";

import type { RoutingInput } from "./router";

const baseInput: RoutingInput = {
  source: "orchestrator",
  confidence: "medium",
};

describe("deterministic typed router", () => {
  it("honours an explicit valid specialist request", () => {
    expect(
      routeTask({
        ...baseInput,
        requestedAgentId: oracle.id,
        source: "user-selection",
        confidence: "high",
      })
    ).toEqual({
      selectedAgentId: oracle.id,
      reason: `Explicit specialist request: ${oracle.id}`,
      confidence: "high",
      source: "user-selection",
    });
  });

  it("prefers an explicit specialist over capability and trigger matches", () => {
    expect(
      routeTask({
        ...baseInput,
        requestedAgentId: oracle.id,
        capability: "orchestration",
        trigger: "planning",
      }).selectedAgentId
    ).toBe(oracle.id);
  });

  it("routes by capability when no valid explicit specialist is supplied", () => {
    expect(
      routeTask({
        ...baseInput,
        capability: "orchestration",
      })
    ).toEqual({
      selectedAgentId: jarvis.id,
      reason: "Matched capability: orchestration",
      confidence: "medium",
      source: "orchestrator",
    });
  });

  it("routes by trigger when no capability match is supplied", () => {
    expect(
      routeTask({
        ...baseInput,
        trigger: "planning",
      })
    ).toEqual({
      selectedAgentId: jarvis.id,
      reason: "Matched hand-off trigger: planning",
      confidence: "medium",
      source: "orchestrator",
    });
  });

  it("falls back to JARVIS for an unknown explicit specialist", () => {
    expect(
      routeTask({
        ...baseInput,
        requestedAgentId: "unknown-agent",
      })
    ).toEqual({
      selectedAgentId: jarvis.id,
      reason: "Unknown specialist requested: unknown-agent; routed to JARVIS",
      confidence: "low",
      source: "fallback",
    });
  });

  it("falls back to JARVIS when no routing facts match", () => {
    expect(routeTask(baseInput)).toEqual({
      selectedAgentId: jarvis.id,
      reason: "No specialist match; routed to JARVIS",
      confidence: "low",
      source: "fallback",
    });
  });

  it("returns stable decisions for identical input", () => {
    const input: RoutingInput = {
      ...baseInput,
      capability: "orchestration",
      trigger: "planning",
    };

    expect(routeTask(input)).toEqual(routeTask(input));
  });

  it("does not mutate the routing input", () => {
    const input: RoutingInput = {
      ...baseInput,
      capability: "orchestration",
    };
    const snapshot = { ...input };

    routeTask(input);

    expect(input).toEqual(snapshot);
  });
});
