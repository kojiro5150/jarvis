import { describe, expect, it } from "vitest";

import { jarvis } from "./jarvis";
import { oracle } from "./oracle";
import { routeTask } from "./router";

import type { RoutingIntent } from "./types";

const baseIntent: RoutingIntent = {
  inferredCapabilities: [],
  inferredTriggers: [],
  reasoningDepth: "standard",
  source: "orchestrator",
  confidence: "medium",
};

describe("typed routing intent boundary", () => {
  it("honours an explicit valid specialist request", () => {
    expect(
      routeTask({
        ...baseIntent,
        requestedAgentId: oracle.id,
        source: "user-selection",
        confidence: "high",
      })
    ).toEqual({
      selectedAgentId: oracle.id,
      reason: `Explicit specialist request: ${oracle.id}`,
      confidence: "high",
      source: "user-selection",
      reasoningDepth: "standard",
    });
  });

  it("prefers an explicit specialist over inferred routing facts", () => {
    expect(
      routeTask({
        ...baseIntent,
        requestedAgentId: oracle.id,
        inferredCapabilities: ["orchestration"],
        inferredTriggers: ["planning"],
      }).selectedAgentId
    ).toBe(oracle.id);
  });

  it("routes by the first matching inferred capability", () => {
    expect(
      routeTask({
        ...baseIntent,
        inferredCapabilities: ["orchestration"],
      })
    ).toEqual({
      selectedAgentId: jarvis.id,
      reason: "Matched capability: orchestration",
      confidence: "medium",
      source: "orchestrator",
      reasoningDepth: "standard",
    });
  });

  it("evaluates capabilities before triggers", () => {
    expect(
      routeTask({
        ...baseIntent,
        inferredCapabilities: ["orchestration"],
        inferredTriggers: ["planning"],
      }).reason
    ).toBe("Matched capability: orchestration");
  });

  it("evaluates inferred triggers in declared order", () => {
    expect(
      routeTask({
        ...baseIntent,
        inferredTriggers: ["decision-support", "planning"],
      }).reason
    ).toBe("Matched hand-off trigger: decision-support");
  });

  it("falls back to JARVIS for an unknown explicit specialist", () => {
    expect(
      routeTask({
        ...baseIntent,
        requestedAgentId: "unknown-agent",
        reasoningDepth: "deep",
      })
    ).toEqual({
      selectedAgentId: jarvis.id,
      reason: "Unknown specialist requested: unknown-agent; routed to JARVIS",
      confidence: "low",
      source: "fallback",
      reasoningDepth: "deep",
    });
  });

  it("falls back to JARVIS when no routing facts match", () => {
    expect(routeTask(baseIntent)).toEqual({
      selectedAgentId: jarvis.id,
      reason: "No specialist match; routed to JARVIS",
      confidence: "low",
      source: "fallback",
      reasoningDepth: "standard",
    });
  });

  it("carries reasoning depth forward without reinterpretation", () => {
    expect(
      routeTask({
        ...baseIntent,
        inferredCapabilities: ["orchestration"],
        reasoningDepth: "high-stakes",
      }).reasoningDepth
    ).toBe("high-stakes");
  });

  it("returns stable decisions for identical intent", () => {
    const intent: RoutingIntent = {
      ...baseIntent,
      inferredCapabilities: ["orchestration"],
      inferredTriggers: ["planning"],
    };

    expect(routeTask(intent)).toEqual(routeTask(intent));
  });

  it("does not mutate the routing intent or its ordered facts", () => {
    const intent: RoutingIntent = {
      ...baseIntent,
      inferredCapabilities: ["orchestration"],
      inferredTriggers: ["planning", "decision-support"],
    };
    const snapshot: RoutingIntent = {
      ...intent,
      inferredCapabilities: [...intent.inferredCapabilities],
      inferredTriggers: [...intent.inferredTriggers],
    };

    routeTask(intent);

    expect(intent).toEqual(snapshot);
  });
});
