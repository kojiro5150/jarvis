import { describe, expect, expectTypeOf, it } from "vitest";
import { CLAIM_ENRICHMENT_EVIDENCE_CATEGORIES, CLAIM_ENRICHMENT_OUTCOMES, type EnrichedGovernedClaimInput } from "./claim-enrichment-types";
import type { GovernedClaimInput } from "./types";

describe("claim enrichment closed types", () => {
  it("publishes the exact outcome and evidence-category vocabularies", () => {
    expect(CLAIM_ENRICHMENT_OUTCOMES).toEqual(["enriched_available", "retained_insufficient_coverage", "retained_unavailable", "retained_unsupported", "not_material", "enrichment_failed"]);
    expect(CLAIM_ENRICHMENT_EVIDENCE_CATEGORIES).toEqual(["communicationEvidence", "calendarEvidence", "memoryPriorityReferences", "connectorAvailability"]);
  });
  it("adds baseClaimId only through the adjacent enriched type", () => {
    expectTypeOf<EnrichedGovernedClaimInput>().toMatchTypeOf<GovernedClaimInput>();
    expectTypeOf<EnrichedGovernedClaimInput["baseClaimId"]>().toEqualTypeOf<string>();
    expectTypeOf<keyof GovernedClaimInput>().not.toEqualTypeOf<"baseClaimId">();
  });
});
