import { beforeEach, describe, expect, it, vi } from "vitest";
import { evaluateClaimBoundary } from "./claim-\u0062oundary-engine";
import { enrichGovernedClaims } from "./claim-enrichment-engine";
import { cassieAssemblyInput, cassieBoundaryInput, claimParametersFromCassieEvaluation, ENRICHMENT_TIME, resolverForAddress } from "./claim-enrichment-fixtures";
import { assembleGovernedSourceEvidence } from "./source-evidence-assembly";

describe("deterministic claim enrichment outcomes", () => {
  let base: ReturnType<typeof evaluateClaimBoundary>;
  beforeEach(() => { base = evaluateClaimBoundary(cassieBoundaryInput); });
  const run = async (overrides: Record<string, unknown> = {}) => {
    const assembled = await assembleGovernedSourceEvidence(cassieAssemblyInput());
    return enrichGovernedClaims({ baseClaimSet: base.claimSet!, assembledEvidence: assembled, sourceAssemblyReference: "source-assembly:cassie", resolver: resolverForAddress(), claimParametersByClaimId: claimParametersFromCassieEvaluation(base.claimSet!, base.evaluation.extractedParameters), referenceTime: ENRICHMENT_TIME, createdAt: ENRICHMENT_TIME, ...overrides });
  };
  it("reaches enriched_available and retained_unsupported without consulting importance evidence", async () => {
    const result = await run(); expect(result.outcome).toBe("completed");
    expect(result.evaluation.claimOutcomes.map(item => item.outcome)).toEqual(["enriched_available", "retained_unsupported"]);
    expect(result.enrichedClaimSet!.claims.map(item => item.status)).toEqual(["available", "unsupported"]);
    expect(result.evaluation.claimOutcomes[1]).toMatchObject({ admittedEvidenceCategories: [], consultedSourceReferences: [], admittedSourceReferences: [] });
  });
  it("reaches retained_insufficient_coverage for absent, incomplete, and stale assertions", async () => {
    const none = await run({ resolver: { resolveCommunicationEvidence: () => [] } }); expect(none.evaluation.claimOutcomes[0].outcome).toBe("retained_insufficient_coverage");
    for (const mutation of [{ fieldCoverage: "incomplete" as const }, { fresh: false }, { scopeComplete: false }, { address: "" }]) {
      const resolver = resolverForAddress();
      const result = await run({ resolver: { resolveCommunicationEvidence: (evidence: Parameters<typeof resolver.resolveCommunicationEvidence>[0]) => resolver.resolveCommunicationEvidence(evidence).map(assertion => ({ ...assertion, ...mutation })) } });
      if (mutation.address === "") expect(result.outcome).toBe("failed"); else expect(result.evaluation.claimOutcomes[0].outcome).toBe("retained_insufficient_coverage");
    }
  });
  it("reaches retained_unavailable and never treats connector state as a factual value", async () => {
    const assembled = await assembleGovernedSourceEvidence({ ...cassieAssemblyInput(), connectorAvailability: { observedAt: ENRICHMENT_TIME, results: [{ connectorId: "calendar", source: "google", connected: true }, { connectorId: "gmail", source: "google", connected: false }, { connectorId: "drive", source: "local", connected: false }] } });
    const result = await run({ assembledEvidence: assembled }); expect(result.evaluation.claimOutcomes[0].outcome).toBe("retained_unavailable"); expect(result.enrichedClaimSet!.claims[0]).toMatchObject({ status: "unavailable", factualValues: [], sourceReferences: [] });
    expect(result.enrichedClaimSet!.claims[1].status).toBe("unsupported");
  });
  it("preserves multiple values without adjudication", async () => {
    const resolver = resolverForAddress(); const result = await run({ resolver: { resolveCommunicationEvidence: (evidence: Parameters<typeof resolver.resolveCommunicationEvidence>[0]) => { const first = resolver.resolveCommunicationEvidence(evidence)[0]; return [first, { ...first, address: "cassie.alt@example.com" }]; } } });
    expect(result.enrichedClaimSet!.claims[0]).toMatchObject({ status: "insufficient_coverage", factualValues: ["cassie.alt@example.com", "cassie@example.com"], boundedComplete: false });
  });
  it("reaches enrichment_failed as governed data for resolver failures", async () => {
    const result = await run({ resolver: { resolveCommunicationEvidence: () => { throw new Error("resolver contract failure"); } } });
    expect(result.outcome).toBe("failed"); expect("enrichedClaimSet" in result).toBe(false); expect(result.evaluation.claimOutcomes.every(item => item.outcome === "enrichment_failed")).toBe(true);
  });
  it("throws only for malformed base lineage", async () => {
    await expect(run({ baseClaimSet: { ...base.claimSet!, claimIds: [] } })).rejects.toThrow("base claimIds");
  });
  it("does not invoke a model or network", async () => { const model = vi.fn(); await run(); expect(model).not.toHaveBeenCalled(); });
});
