import { constructClaimBoundaryRuleset } from "./claim-boundary-publications";
import type { ClaimBoundaryRulesetBody } from "./claim-boundary-types";

export const CLAIM_BOUNDARY_RULESET_BODY: ClaimBoundaryRulesetBody = {
  schemaVersion: "1", rulesetVersion: "1.0.0",
  precedence: ["typed_capability", "typed_ui_intent", "exact_command_or_alias", "lexical_pattern_or_grammar", "clarification", "unsupported"],
  typedIntents: ["contact_address_lookup", "message_importance"],
  rules: [
    { ruleId: "contact.exact.whats-email", claimType: "contact_address_lookup", mechanism: "exact_command", expression: "What's <person>'s email?" },
    { ruleId: "contact.alias.give-email", claimType: "contact_address_lookup", mechanism: "alias", expression: "Give me <person>'s email." },
    { ruleId: "contact.lexical.email-address", claimType: "contact_address_lookup", mechanism: "lexical_pattern", expression: "What is <person>'s email address?" },
    { ruleId: "contact.grammar.have-email", claimType: "contact_address_lookup", mechanism: "grammar", expression: "Do you have <person>'s email?" },
    { ruleId: "importance.exact.anything", claimType: "message_importance", mechanism: "exact_command", expression: "Anything important?" },
    { ruleId: "importance.alias.any-messages", claimType: "message_importance", mechanism: "alias", expression: "Are any of <person>'s messages important?" },
    { ruleId: "importance.lexical.from", claimType: "message_importance", mechanism: "lexical_pattern", expression: "Is there anything important from <person>?" },
  ],
  claimTemplates: [
    { claimType: "contact_address_lookup", material: true, supported: true, sourceRequirement: "identity-qualified-contact-metadata/1", completenessRule: "source-qualified-address-coverage/1", contentKind: "metadata" },
    { claimType: "message_importance", material: true, supported: false, sourceRequirement: "unsupported-significance-contract/1", completenessRule: "unsupported-significance-completeness/1", contentKind: "metadata" },
  ],
  clarificationRules: ["missing_required_parameter", "ambiguous_governed_intent", "unresolved_entity"],
  unsupportedRules: ["unsupported_language", "unsupported_claim_type", "second_unresolved_clarification"],
  prohibitedHeuristicFields: ["unread", "important", "needsReply", "labels", "messageOrdering", "legacyAttentionMetadata"],
};
export const CLAIM_BOUNDARY_RULESET = constructClaimBoundaryRuleset(CLAIM_BOUNDARY_RULESET_BODY);
