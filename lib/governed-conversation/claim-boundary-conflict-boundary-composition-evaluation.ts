import type { CanonicalGovernedConflict } from "./conflict-boundary-types";
import { composeGovernedConversationalProjection, type GovernedConversationalProjectionInput } from "./projection-composer";
import { CASSIE_QUESTION, COMPOSITION_LINEAGE, COMPOSITION_TIME, makeCompositionScenario } from "./claim-boundary-conflict-boundary-composition-evaluation-fixtures";

export type CompositionStatus = "compatible" | "bounded-adapter-needed" | "semantic-incompatibility" | "unresolved";
export interface CompositionFinding { readonly seam: string; readonly upstreamType: string; readonly downstreamType: string; readonly compositionStatus: CompositionStatus; readonly blocking: boolean; readonly evidence: string; readonly requiredMeaning: string; readonly actualMeaning: string; readonly reason: string }
const finding = (seam: string, upstreamType: string, downstreamType: string, compositionStatus: CompositionStatus, blocking: boolean, evidence: string, requiredMeaning: string, actualMeaning: string, reason: string): CompositionFinding => Object.freeze({ seam, upstreamType, downstreamType, compositionStatus, blocking, evidence, requiredMeaning, actualMeaning, reason });

export function evaluateConflictShape(conflict: CanonicalGovernedConflict): CompositionFinding {
  const canonical = Object.keys(conflict).sort();
  const destination = ["affectedClaimIds", "conflictId", "descriptionReference", "sourceOwners", "statusRestriction"];
  return finding("Conflict → Projection conflict", "CanonicalGovernedConflict", "GovernedConflictInput", "semantic-incompatibility", true,
    `canonical=[${canonical.join(",")}]; destination=[${destination.join(",")}]`, "preserve the governed conflict publication and restrict-don't-adjudicate meaning", "the destination renames sourceOwnerIds and has no fields for class, publications, comparison, values, rule, coverage, or evaluated time", "direct entry fails structurally; mapping five fields would discard governed conflict meaning");
}

export function runCompositionEvaluation() {
  const scenario = makeCompositionScenario();
  const centralSet = scenario.centralClaims.claimSet!;
  const centralConflictAttempt = scenario.run(scenario.contradictory, "evaluation:central-compound", centralSet);
  const conflict = scenario.conflict.conflictSet!.conflicts[0];
  const findings = [
    finding("Claim engine → Claim Set", "BoundaryEngineResult", "GovernedClaimSet", "compatible", false, "real engine published evaluation and set", "constructor-owned claim publication", "constructor-owned claim publication", "direct real-function output"),
    finding("Claim Set → Conflict engine", "GovernedClaimSet", "ConflictEngineInput", "semantic-incompatibility", true, `compound set has ${centralSet.claims.length} claims and produces ${centralConflictAttempt.evaluation?.outcome}`, "evaluate the real compound Cassie set", "engine admits exactly one contact-address claim and rejects the compound set", "the two independently correct scopes do not compose for the mandated question"),
    finding("Claim identity → Conflict linkage", "claimId", "affectedClaimIds", "compatible", false, conflict.affectedClaimIds[0], "exact generated claim identity", "exact generated claim identity", "contact-only independent seam preserves identity"),
    finding("Claim lineage → Conflict lineage", "required thread/request/exchange", "optional evaluation lineage", "bounded-adapter-needed", true, "engine currently derives and populates equal values, but the output type makes each optional and the set omits them", "structurally mandatory exchange proof", "runtime preservation without type-level guarantee", "a governed publication contract must make preservation enforceable"),
    finding("Claim Set → Projection claims", "GovernedClaimSet", "GovernedClaimInput[]", "semantic-incompatibility", true, "projection retains claim values but has no claim-set/evaluation/ruleset reference", "retain authoritative publication lineage", "wrapper identities disappear", "dropping publication ownership is not authorized"),
    evaluateConflictShape(conflict),
    finding("Conflict Set → Projection lineage", "GovernedConflictSet", "projection conflicts", "semantic-incompatibility", true, "no conflictEvaluationRulesetId, conflictEvaluationId, governedConflictSetId, or governedClaimSetId destination", "retain evaluation and set lineage", "only conflict values are accepted", "publication lineage disappears"),
    finding("Claim classification ruleset", "claimBoundaryRulesetId", "claimClassificationRulesetId", "unresolved", true, "contracts define differently named fields and no mapping", "explicitly governed identity-domain equivalence", "no equivalence is established", "similar names do not authorize identity relabelling"),
    finding("Evaluation state → Projection", "six-state ConflictEvaluation", "conflicts[]", "semantic-incompatibility", true, "empty conflicts represents no-conflict, unavailable, unsupported, and never-ran identically", "preserve evaluation state", "state publication is absent", "the projection collapses governed distinctions"),
    finding("Projection → Governed Input", "GovernedConversationalProjection", "GovernedConversationalInput", "compatible", false, "current input uses threadId/requestId/exchangeId and run/session/interface fields are optional", "same conversational lineage", "same conversational lineage", "Sprint 3.85 correction is present"),
    finding("Conflict restriction → evidence/model", "statusRestriction", "claim.status/conflicts", "semantic-incompatibility", true, "model path reads claim-local legacy conflicts; no reducer owns post-conflict effective status", "restrict without adjudicating", "canonical restriction has no truthful input path", "downstream cannot consume the canonical restriction"),
  ] as const;
  const projectionInput: GovernedConversationalProjectionInput = { schemaVersion: "1", evidenceRulesetId: "evaluation:existing-evidence-ruleset", compatibilityRulesetId: "evaluation:existing-compatibility-ruleset", claimClassificationRulesetId: "unresolved:claim-classification-ruleset", ...COMPOSITION_LINEAGE, referenceTime: COMPOSITION_TIME, createdAt: COMPOSITION_TIME, sourceEvidence: [], connectorAvailability: [], calendarEvidence: [], communicationEvidence: [], memoryPriorityReferences: [], compatibilityContext: [], conversationHistory: [], claims: centralSet.claims, conflicts: [] };
  const projectionAttempt = composeGovernedConversationalProjection(projectionInput);
  return Object.freeze({ question: CASSIE_QUESTION, scenario, centralConflictAttempt, findings, projectionInput, projectionAttempt, overall: "Composition blocked by semantic incompatibility" as const });
}

export function detectsAffectedClaimMutation(claimIds: readonly string[], affectedClaimIds: readonly string[]) { return affectedClaimIds.every(id => claimIds.includes(id)); }
export function detectsExchangeMutation(expected: string, actual: string) { return expected === actual; }
export function detectsRestrictionMutation(actual: string) { return actual === "insufficient_coverage"; }
export function detectsPublicationMutation(expected: string, actual: string) { return expected === actual; }
