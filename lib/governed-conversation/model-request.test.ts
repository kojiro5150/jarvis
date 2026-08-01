import { describe, expect, it } from "vitest";
import { cassieFixture } from "./fixtures";
import { constructGovernedModelRequest, GOVERNED_MODEL_SYSTEM_INSTRUCTION } from "./model-request";

describe("governed model request", () => {
  it("is deterministic, status-preserving, and minimises compatibility data", () => {
    const first = constructGovernedModelRequest(cassieFixture.input, "request:1");
    const second = constructGovernedModelRequest(cassieFixture.input, "request:1");
    expect(first).toEqual(second);
    expect(first.systemInstruction).toBe(GOVERNED_MODEL_SYSTEM_INSTRUCTION);
    expect(first.governedContext.claims.map(({ claimId, status }) => ({ claimId, status }))).toEqual([
      { claimId: "contact", status: "available" },
      { claimId: "importance", status: "unsupported" },
    ]);
    expect(first.governedContext.claims[1].observedFacts).toEqual([]);
    expect(first.governedContext.compatibilityBoundaries[0]).toMatchObject({ ownership: "legacy_compatibility", authority: "none" });
    const governedContext = JSON.stringify(first.governedContext);
    expect(governedContext).not.toContain("Partial synthetic excerpt");
    expect(governedContext).not.toContain('"unread":true');
    expect(first.conversationHistory.find((turn) => turn.classification === "assistant_prior_output")?.canonicalEvidence).toBe(false);
  });
});
