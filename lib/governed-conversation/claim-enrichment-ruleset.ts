import { createHash } from "node:crypto";
import { canonicalise } from "./lineage-types";
import { CLAIM_ENRICHMENT_EVIDENCE_CATEGORIES, CLAIM_ENRICHMENT_OUTCOMES, type ClaimEnrichmentMaterialityRule, type ClaimEnrichmentRuleset } from "./claim-enrichment-types";

const matrix = (["contact_address_lookup", "message_importance"] as const).flatMap(claimType =>
  CLAIM_ENRICHMENT_EVIDENCE_CATEGORIES.map((evidenceCategory): ClaimEnrichmentMaterialityRule => {
    if (claimType === "contact_address_lookup" && evidenceCategory === "communicationEvidence") return { claimType, evidenceCategory, materiality: "material", constraint: "factual_evidence" };
    if (claimType === "contact_address_lookup" && evidenceCategory === "connectorAvailability") return { claimType, evidenceCategory, materiality: "conditionally_material", constraint: "source_availability_only" };
    // Importance has no admitted evidentiary source. Connector state is deliberately
    // excluded here as well: it cannot influence the importance claim's outcome.
    return { claimType, evidenceCategory, materiality: "not_material", constraint: "excluded" };
  }),
);
const body = { schemaVersion: "1" as const, rulesetVersion: "1.0.0" as const, materialityMatrix: matrix, permittedOutcomes: [...CLAIM_ENRICHMENT_OUTCOMES], admittedClaimTypes: ["contact_address_lookup", "message_importance"] as const };
const publicationDigest = createHash("sha256").update(canonicalise(body)).digest("hex");
const deepFreeze = <T>(value: T): T => { if (value && typeof value === "object") { Object.freeze(value); for (const item of Object.values(value)) deepFreeze(item); } return value; };
export const CLAIM_ENRICHMENT_RULESET: ClaimEnrichmentRuleset = deepFreeze(structuredClone({ ...body, publicationDigest, enrichmentRulesetId: `claim-enrichment-ruleset:${publicationDigest}` }));
