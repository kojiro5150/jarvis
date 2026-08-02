import { describe, expect, it } from "vitest";
import { CLAIM_ENRICHMENT_RULESET } from "./claim-enrichment-ruleset";
import { CLAIM_ENRICHMENT_OUTCOMES } from "./claim-enrichment-types";

describe("claim enrichment ruleset", () => {
  it("is stable, frozen, versioned, and closed", async () => {
    const replay = (await import("./claim-enrichment-ruleset")).CLAIM_ENRICHMENT_RULESET;
    expect(CLAIM_ENRICHMENT_RULESET).toEqual(replay);
    expect(CLAIM_ENRICHMENT_RULESET).toMatchObject({ schemaVersion: "1", rulesetVersion: "1.0.0", permittedOutcomes: CLAIM_ENRICHMENT_OUTCOMES, admittedClaimTypes: ["contact_address_lookup", "message_importance"] });
    expect(CLAIM_ENRICHMENT_RULESET.enrichmentRulesetId).toContain(CLAIM_ENRICHMENT_RULESET.publicationDigest);
    expect(Object.isFrozen(CLAIM_ENRICHMENT_RULESET)).toBe(true);
    expect(CLAIM_ENRICHMENT_RULESET).not.toHaveProperty("register");
  });
  it("implements every cell and makes every importance evidence category not material", () => {
    expect(CLAIM_ENRICHMENT_RULESET.materialityMatrix).toHaveLength(8);
    const cell = (claimType: string, evidenceCategory: string) => CLAIM_ENRICHMENT_RULESET.materialityMatrix.find(rule => rule.claimType === claimType && rule.evidenceCategory === evidenceCategory);
    expect(cell("contact_address_lookup", "communicationEvidence")?.materiality).toBe("material");
    expect(cell("contact_address_lookup", "connectorAvailability")?.materiality).toBe("conditionally_material");
    expect(cell("contact_address_lookup", "calendarEvidence")?.materiality).toBe("not_material");
    expect(cell("contact_address_lookup", "memoryPriorityReferences")?.materiality).toBe("not_material");
    for (const category of ["communicationEvidence", "calendarEvidence", "memoryPriorityReferences", "connectorAvailability"]) expect(cell("message_importance", category)?.materiality).toBe("not_material");
  });
});
