import { createHash } from "node:crypto";
import { canonicalise, lineageIdentity } from "./lineage-types";
import type { EntityIdentificationRuleset, EntityIdentificationRulesetBody } from "./entity-identification-types";

const body: EntityIdentificationRulesetBody = {
  schemaVersion: "1",
  rulesetVersion: "1.0.0",
  admittedParameterNames: ["personName"],
  admittedEntityKinds: ["person"],
  admittedEvidenceCategories: ["Governed Communication Evidence"],
  admittedPolicyReferences: ["governed-gmail-conversational-metadata-disclosure.v2"],
  normalizationRules: ["unicode_nfc", "trim_surrounding_whitespace", "collapse_internal_whitespace", "lowercase_en_us"],
  matchingBases: ["exact_governed_display_name_match", "governed_first_token_display_name_alias_match"],
  matchingPrecedence: ["exact_governed_display_name_match", "governed_first_token_display_name_alias_match"],
  cardinalityRules: { zero: "unresolved_no_match", one: "resolved", multiple: "ambiguous_multiple_matches" },
  sourceAvailabilityRules: { unavailable: "entity_source_unavailable", failed: "entity_source_unavailable" },
  prohibitedMechanisms: ["substring", "prefix", "fuzzy", "semantic", "model", "ranking", "external_search", "identity_fusion"],
};

const frozenBody = Object.freeze(structuredClone(body));
const publicationDigest = createHash("sha256").update(canonicalise(frozenBody)).digest("hex");

export const ENTITY_IDENTIFICATION_RULESET: EntityIdentificationRuleset = Object.freeze({
  ...frozenBody,
  publicationDigest,
  entityIdentificationRulesetId: lineageIdentity("entity-identification-ruleset", frozenBody),
});
