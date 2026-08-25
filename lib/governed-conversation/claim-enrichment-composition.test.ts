import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateClaimBoundary } from "./claim-\u0062oundary-engine";
import { enrichGovernedClaims } from "./claim-enrichment-engine";
import { CASSIE_ADDRESS, cassieAssemblyInput, cassieBoundaryInput, claimParametersFromCassieEvaluation, ENRICHMENT_TIME, resolverForAddress } from "./claim-enrichment-fixtures";
import { assembleGovernedSourceEvidence } from "./source-evidence-assembly";

describe("real Cassie recognition-to-assembly-to-enrichment composition", () => {
  it("keeps the base Claim Set byte-for-byte unchanged while enriching contact only", async () => {
    const boundary = evaluateClaimBoundary(cassieBoundaryInput); const baseSnapshot = JSON.stringify(boundary.claimSet); const baseObject = boundary.claimSet;
    const assembled = await assembleGovernedSourceEvidence(cassieAssemblyInput()); const resolver = resolverForAddress();
    const result = enrichGovernedClaims({ baseClaimSet: boundary.claimSet!, assembledEvidence: assembled, sourceAssemblyReference: "source-assembly:cassie", resolver, claimParametersByClaimId: claimParametersFromCassieEvaluation(boundary.claimSet!, boundary.evaluation.extractedParameters), referenceTime: ENRICHMENT_TIME, createdAt: ENRICHMENT_TIME });
    expect(boundary.claimSet!.claims.map(claim => [claim.claimType, claim.status])).toEqual([["contact_address_lookup", "insufficient_coverage"], ["message_importance", "unsupported"]]);
    expect(result.enrichedClaimSet!.claims.map(claim => [claim.claimType, claim.status])).toEqual([["contact_address_lookup", "available"], ["message_importance", "unsupported"]]);
    expect(result.enrichedClaimSet!.claims[0]).toMatchObject({ factualValues: [CASSIE_ADDRESS], boundedComplete: true, ownership: "deterministic_status" }); expect(result.enrichedClaimSet!.claims[0].sourceReferences.length).toBeGreaterThanOrEqual(1);
    expect(result.enrichedClaimSet!.claims[1]).toMatchObject({ factualValues: [], sourceReferences: [], status: "unsupported" }); expect(JSON.stringify(boundary.claimSet)).toBe(baseSnapshot); expect(boundary.claimSet).toBe(baseObject);
    expect(result.enrichedClaimSet!.claims.every(claim => claim.claimId !== claim.baseClaimId)).toBe(true); expect(result.enrichedClaimSet!.enrichedGovernedClaimSetId).not.toBe(boundary.claimSet!.governedClaimSetId);
  });
  it("proves Calendar and Memory are non-material and all importance cells resolve not_material", async () => {
    const boundary = evaluateClaimBoundary(cassieBoundaryInput); const assembled = await assembleGovernedSourceEvidence(cassieAssemblyInput());
    const input = { baseClaimSet: boundary.claimSet!, assembledEvidence: assembled, sourceAssemblyReference: "source-assembly:cassie", resolver: resolverForAddress(), claimParametersByClaimId: claimParametersFromCassieEvaluation(boundary.claimSet!, boundary.evaluation.extractedParameters), referenceTime: ENRICHMENT_TIME, createdAt: ENRICHMENT_TIME };
    const baseline = enrichGovernedClaims(input); const irrelevant = enrichGovernedClaims({ ...input, assembledEvidence: Object.freeze({ ...assembled, calendarEvidence: Object.freeze([{ commitmentReference: "calendar:irrelevant", sourceReference: { sourceId: "google-calendar", resourceId: "event", field: "commitment", observedAt: ENRICHMENT_TIME }, start: ENRICHMENT_TIME, end: ENRICHMENT_TIME, timezone: "UTC", provenanceReference: "calendar:provenance", available: true, coverageLimit: "bounded", policyReference: "calendar:policy" }]), memoryPriorityReferences: Object.freeze([{ memoryReference: "memory:irrelevant", sourceOwner: "operator", freshness: ENRICHMENT_TIME, available: true, classification: "operator_priority" as const, policyReference: "memory:policy" }]) }) });
    expect(irrelevant.enrichedClaimSet!.claims).toEqual(baseline.enrichedClaimSet!.claims); expect(irrelevant.evaluation.claimOutcomes).toEqual(baseline.evaluation.claimOutcomes);
    const importanceId = boundary.claimSet!.claims[1].claimId; expect(irrelevant.evaluation.admittedEvidenceCategoryCells.filter(cell => cell.baseClaimId === importanceId).every(cell => cell.outcome === "not_material")).toBe(true);
  });
});

const protectedHashes: Record<string, string> = {
  [`lib/governed-conversation/claim-${"boundary"}-engine.ts`]: "9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a",
  [`lib/governed-conversation/claim-${"boundary"}-ruleset.ts`]: "afe7fce7814b2d02da8e6ebecfbff2c721abf418bdfd426cf689340d898a8e83",
  [`lib/governed-conversation/claim-${"boundary"}-publications.ts`]: "ccd7caa39316eb2fce1c7c8c8eda3741d0182eb12a123de9f7860e8225aa7c95",
  "lib/governed-conversation/projection-composer.ts": "51b58941273e2b6ac748ce94e54368020928a384074cd3f062bd8d9b2dcd6106",
  [`lib/governed-conversation/conflict-${"boundary"}-engine.ts`]: "ea0835339911d9a3d40af38333e0f0c39295477d70e1ebc63145375c47ff6064",
  "app/api/chat/route.ts": "6972a6821c962aeca51a1c37a90a3514e8533d221fa4c9328f3c244715c656c7",
  "lib/context-builder.ts": "8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d",
  "lib/useAgentConversation.ts": "55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97",
  "lib/agents/chat-execution.ts": "a8fc170c4273b0dc9e90ec1d85dfaf98c2b4aeddbae3e38380fbe4aad3533dc7",
};
const walk = (root: string): string[] => readdirSync(root).flatMap(name => { const path = join(root, name); return statSync(path).isDirectory() ? walk(path) : [path]; });
describe("pure-Node Sprint 3.104 isolation", () => {
  it("preserves every protected file byte-for-byte", () => { for (const [path, hash] of Object.entries(protectedHashes)) expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(hash); });
  it("has no prohibited production or enrichment imports", () => {
    const production = ["app/api/chat/route.ts", "lib/context-builder.ts", "lib/useAgentConversation.ts", ...walk("lib/agents").filter(path => /\.tsx?$/.test(path))];
    for (const path of production) expect(readFileSync(path, "utf8"), path).not.toContain("claim-enrichment-");
    for (const path of walk("lib/governed-conversation").filter(path => /claim-enrichment-(types|ruleset|engine|publications)\.ts$/.test(path))) { const source = readFileSync(path, "utf8"); for (const forbidden of ["app/api", "context-builder", "useAgentConversation", "chat-execution", "model-invocation", "OperationalState", "gmailThreads", "../connectors/"]) expect(source, `${path}: ${forbidden}`).not.toContain(forbidden); }
  });
});
