import { describe, expect, it, vi } from "vitest";
import { evaluateClaimBoundary } from "./claim-boundary-engine";
import { cassieBoundaryInput, inputFor } from "./claim-boundary-fixtures";

describe("fixed Option C claim-boundary engine", () => {
  it("decomposes the exact Cassie request into two real, ordered claims without a model", () => {
    const model = vi.fn();
    const result = evaluateClaimBoundary(cassieBoundaryInput);
    expect(result.evaluation.outcome).toBe("recognised");
    expect(result.evaluation.matchedSpans).toHaveLength(2);
    expect(result.claimSet?.claims).toHaveLength(2);
    const [contact, importance] = result.claimSet!.claims;
    expect(contact).toMatchObject({ claimType: "contact_address_lookup", material: true, sourceAvailable: true, status: "insufficient_coverage", ownership: "deterministic_status", sourceReferences: [], factualValues: [], boundedComplete: false, conflicts: [] });
    expect(importance).toMatchObject({ claimType: "message_importance", material: true, status: "unsupported", ownership: "unsupported", conflicts: [] });
    expect(contact.claimId).not.toBe(importance.claimId);
    expect(result.claimSet!.segmentLinks.map(x => x.segmentId)).toEqual(["segment:1", "segment:2"]);
    expect(result.claimSet!.claims.map(x => x.claimType)).toEqual(["contact_address_lookup", "message_importance"]);
    expect(model).not.toHaveBeenCalled();
  });

  it.each([
    ["What's Cassie's email?", "contact_address_lookup"], ["Give me Cassie's email.", "contact_address_lookup"],
    ["What is Cassie's email address?", "contact_address_lookup"], ["Do you have CASSIE'S email", "contact_address_lookup"],
    ["Anything important?", "message_importance"], ["Are any of Cassie's messages important?", "message_importance"],
    ["Is there anything important from Cassie?", "message_importance"],
  ])("recognises only declared bounded form %s", (text, type) => expect(evaluateClaimBoundary(inputFor(text)).claimSet?.claims[0].claimType).toBe(type));

  it.each(["Find Cassie's electronic mail", "Email Cassie tomorrow", "What matters most?", "What's on my calendar?", "Remember my priority", "Decide whether Cassie's note is significant"]) ("fails closed for %s", text => {
    const result = evaluateClaimBoundary(inputFor(text)); expect(result.evaluation.outcome).toBe("unsupported_language"); expect(result.claimSet).toBeUndefined();
  });

  it("publishes deterministic clarification and never a premature claim set", () => {
    const missing = evaluateClaimBoundary(inputFor("What's their email?"));
    expect(missing.evaluation.outcome).toBe("missing_required_parameter"); expect(missing.evaluation.clarification?.requiredField).toBe("personName"); expect(missing.claimSet).toBeUndefined();
    const multiple = evaluateClaimBoundary(inputFor("What's Cassie's email?", { entities: [{ entityId: "1", personName: "Cassie", displayLabel: "Cassie A" }, { entityId: "2", personName: "Cassie", displayLabel: "Cassie B" }] }));
    expect(multiple.evaluation.outcome).toBe("unresolved_entity"); expect(multiple.evaluation.clarification?.choices).toHaveLength(2); expect(multiple.claimSet).toBeUndefined();
    const none = evaluateClaimBoundary(inputFor("What's Cassie's email?", { entities: [] }));
    expect(none.evaluation.outcome).toBe("unresolved_entity"); expect(none.evaluation.clarification?.choices).toEqual([]);
    const ambiguous = evaluateClaimBoundary(inputFor("Cassie's important email?"));
    expect(ambiguous.evaluation.outcome).toBe("ambiguous_governed_intent"); expect(ambiguous.evaluation.clarification?.choices.map(x => x.value)).toEqual(["contact_address_lookup", "message_importance"]);
    const repeated = evaluateClaimBoundary(inputFor("What's Cassie's email?", { entities: [], clarificationAttempt: 2, priorEvaluationId: none.evaluation.claimBoundaryEvaluationId }));
    expect(repeated.evaluation).toMatchObject({ outcome: "unsupported_language", unsupportedReason: "second_unresolved_clarification" }); expect(repeated.claimSet).toBeUndefined();
  });

  it("gives valid or invalid typed input absolute precedence over free text", () => {
    const contact = evaluateClaimBoundary(inputFor("What's on my calendar?", { typedIntent: { type: "contact_address_lookup", personName: "Cassie" } }));
    expect(contact.evaluation.typedIntentResult).toBe("valid"); expect(contact.claimSet?.claims.map(x => x.claimType)).toEqual(["contact_address_lookup"]);
    const importance = evaluateClaimBoundary(inputFor("What's Cassie's email?", { typedIntent: { type: "message_importance", personName: "Cassie" } }));
    expect(importance.claimSet?.claims[0]).toMatchObject({ claimType: "message_importance", status: "unsupported" });
    const missing = evaluateClaimBoundary(inputFor("Anything important?", { typedIntent: { type: "contact_address_lookup" } })); expect(missing.evaluation.outcome).toBe("missing_required_parameter");
    for (const typedIntent of [{ type: "calendar_lookup" }, { type: 4 }, { type: "contact_address_lookup", personName: 3 }]) { const invalid = evaluateClaimBoundary(inputFor("What's Cassie's email?", { typedIntent })); expect(invalid.evaluation.outcome).toBe("unsupported_claim_type"); expect(invalid.claimSet).toBeUndefined(); }
  });

  it("is insensitive to every prohibited heuristic", () => {
    const baseline = evaluateClaimBoundary(cassieBoundaryInput);
    for (const compatibilityContext of [{ unread: true }, { important: true }, { needsReply: true }, { labels: ["urgent"] }, { messageOrdering: [9, 1] }, { legacyAttentionMetadata: { score: 100 } }]) {
      const mutated = evaluateClaimBoundary({ ...cassieBoundaryInput, compatibilityContext });
      expect(mutated.evaluation.matchedRuleIds).toEqual(baseline.evaluation.matchedRuleIds);
      expect(mutated.claimSet?.claims).toEqual(baseline.claimSet?.claims);
    }
  });

  it("publishes a valid empty set only for bounded non-factual conversation", () => { const result = evaluateClaimBoundary(inputFor("Help me write a thank-you note")); expect(result.evaluation.outcome).toBe("no_governed_factual_claim"); expect(result.claimSet?.claims).toEqual([]); });
});
