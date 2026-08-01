import { describe, expect, it } from "vitest";
import { CLAIM_BOUNDARY_RULESET, CLAIM_BOUNDARY_RULESET_BODY } from "./claim-boundary-ruleset";
import { constructClaimBoundaryRuleset } from "./claim-boundary-publications";
describe("claim-boundary ruleset", () => {
  it("is immutable, versioned, closed to two templates, and records exclusions", () => { expect(Object.isFrozen(CLAIM_BOUNDARY_RULESET)).toBe(true); expect(CLAIM_BOUNDARY_RULESET).toMatchObject({ schemaVersion: "1", rulesetVersion: "1.0.0" }); expect(CLAIM_BOUNDARY_RULESET.claimTemplates.map(x => x.claimType)).toEqual(["contact_address_lookup", "message_importance"]); expect(CLAIM_BOUNDARY_RULESET.prohibitedHeuristicFields).toEqual(["unread", "important", "needsReply", "labels", "messageOrdering", "legacyAttentionMetadata"]); });
  it("has stable content identity and changes identity for material changes", () => { expect(constructClaimBoundaryRuleset(structuredClone(CLAIM_BOUNDARY_RULESET_BODY)).claimBoundaryRulesetId).toBe(CLAIM_BOUNDARY_RULESET.claimBoundaryRulesetId); const changed = { ...CLAIM_BOUNDARY_RULESET_BODY, rules: CLAIM_BOUNDARY_RULESET_BODY.rules.map((rule, index) => index === 0 ? { ...rule, expression: "changed" } : rule) }; expect(constructClaimBoundaryRuleset(changed).claimBoundaryRulesetId).not.toBe(CLAIM_BOUNDARY_RULESET.claimBoundaryRulesetId); });
  it("rejects an open or incomplete template set", () => expect(() => constructClaimBoundaryRuleset({ ...CLAIM_BOUNDARY_RULESET_BODY, claimTemplates: [CLAIM_BOUNDARY_RULESET_BODY.claimTemplates[0]] })).toThrow(/exactly/));
});
