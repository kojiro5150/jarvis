import { describe, expect, it } from "vitest";
import { OMITTED_DURABLE_CONTINUITY_RELEASE } from "./durable-continuity-release-contract";
import { projectDurableContinuityReleasesForTransport } from "./durable-continuity-release-transport";

describe("durable continuity release transport", () => {
  it("omits only an oversized governed continuity release when an eligible reference exists", () => {
    const oversized = "Relevant remembered context:\n" + "x".repeat(8_100);
    const messages = [
      { role: "user" as const, content: "What do you remember about JARVIS product gaps?" },
      { role: "assistant" as const, content: oversized },
      { role: "user" as const, content: "What do you remember about status updates?" },
    ];

    expect(projectDurableContinuityReleasesForTransport(messages, true)).toEqual([
      messages[0],
      { role: "assistant", content: OMITTED_DURABLE_CONTINUITY_RELEASE },
      messages[2],
    ]);
    expect(messages[1]?.content).toBe(oversized);
  });

  it("does not omit without an eligible reference or for unrelated oversized assistant text", () => {
    const continuity = { role: "assistant" as const, content: "Relevant remembered context:\n" + "x".repeat(8_100) };
    const unrelated = { role: "assistant" as const, content: "ordinary " + "x".repeat(8_100) };

    expect(projectDurableContinuityReleasesForTransport([continuity], false)[0]).toEqual(continuity);
    expect(projectDurableContinuityReleasesForTransport([unrelated], true)[0]).toEqual(unrelated);
  });
});
