import { aggregateEvidenceStatus, isEvidenceStatus } from "./evidence-status";
import { VALIDATOR_VERSION } from "./response-envelope";
import type { GovernedConversationalInput, GovernedConversationalResponseEnvelope, GovernedValidationFailure, GovernedValidationResult } from "./types";

export function validateResponseEnvelope(input: GovernedConversationalInput, envelope: GovernedConversationalResponseEnvelope): GovernedValidationResult {
  const failures: GovernedValidationFailure[] = [];
  const fail = (ruleId: string, affectedId: string, reason: string) => failures.push({ ruleId, affectedId, reason, severity: "error", safeHandling: "safe_envelope" });
  if (!envelope.envelopeId || !envelope.inputId || envelope.inputId !== input.inputId) fail("GC-001-LINEAGE", envelope.envelopeId || "envelope", "Required envelope identity or input lineage is absent or inconsistent.");
  if (!isEvidenceStatus(envelope.overallStatus) || envelope.claims.some(c => !isEvidenceStatus(c.status))) fail("GC-002-STATUS-VOCABULARY", envelope.envelopeId, "An evidence status is outside the closed vocabulary.");
  for (const expected of input.claims) {
    const claim = envelope.claims.find(c => c.claimId === expected.claimId);
    if (!claim || claim.status !== expected.status) fail("GC-003-STATUS-PRESERVATION", expected.claimId, "Input claim status was omitted or changed.");
    if (expected.status === "unsupported" && !envelope.refusal?.claimIds.includes(expected.claimId) && !claim?.disclosure) fail("GC-004-UNSUPPORTED-VISIBILITY", expected.claimId, "Unsupported claim requires refusal or supported reframing.");
    if (expected.status === "unavailable" && !claim?.disclosure && !envelope.refusal?.claimIds.includes(expected.claimId)) fail("GC-005-UNAVAILABLE-DISCLOSURE", expected.claimId, "Unavailable evidence must be disclosed.");
    if (expected.conflicts.length && !expected.conflicts.every(c => envelope.conflicts.some(x => x.conflictId === c.conflictId))) fail("GC-017-CONFLICT-PRESERVATION", expected.claimId, "Input conflict was not preserved.");
  }
  for (const fact of envelope.observedFacts) {
    const sourceClaim = input.claims.find(c => c.claimId === fact.claimId);
    if (!fact.sourceReference?.sourceId || !fact.sourceReference.resourceId || !sourceClaim || !sourceClaim.sourceReferences.some(r => r.sourceId === fact.sourceReference.sourceId && r.resourceId === fact.sourceReference.resourceId)) fail("GC-006-SOURCE-REFERENCE", fact.factId, "Observed fact lacks a valid governed source reference.");
    if (fact.ownership !== "deterministic_observation") fail("GC-007-OWNERSHIP", fact.factId, "Observed facts require deterministic-observation ownership.");
    if (!sourceClaim || sourceClaim.status !== "available" || fact.status !== "available") fail("GC-008-FACT-STATUS", fact.factId, "A fact may not answer an unavailable, unsupported, or insufficient claim.");
    if (fact.contentKind === "partial_excerpt" && sourceClaim?.claimType === "message_full_content") fail("GC-011-CONTENT-KIND", fact.factId, "Partial excerpt cannot represent full content.");
    if (sourceClaim?.claimType === "message_absence" && !fact.boundedComplete) fail("GC-010-NEGATIVE-SCOPE", fact.factId, "Negative claim requires bounded-complete scope.");
  }
  const assistantHistory = input.conversationHistory.filter(t => t.classification === "assistant_prior_output");
  if (assistantHistory.some(t => envelope.observedFacts.some(f => f.sourceReference.resourceId === t.turnId))) fail("GC-009-PRIOR-ASSISTANT", envelope.envelopeId, "Prior assistant output cannot source an observed fact.");
  for (const step of envelope.advisoryNextSteps ?? []) {
    if (step.ownership !== "model_advisory" || step.subjectToOperatorJudgment !== true) fail("GC-015-ADVISORY-AUTHORITY", step.stepId, "Advice must be model-owned and subject to operator judgment.");
    for (const id of step.claimIds) { const status = input.claims.find(c => c.claimId === id)?.status; if (status === "unsupported" || (status === "unavailable" && step.kind !== "evidence_gathering" && step.kind !== "source_verification")) fail("GC-013-ADVISORY-STATUS", step.stepId, "Advice cannot substantively override unsupported or unavailable evidence."); }
  }
  if (envelope.overallStatus !== aggregateEvidenceStatus(envelope.claims)) fail("GC-016-OVERALL-STATUS", envelope.envelopeId, "Overall status is inconsistent with material claims.");
  const valid = failures.length === 0;
  return { validatorVersion: VALIDATOR_VERSION, valid, outcome: valid ? "passed" : "failed", failures, warnings: [], safeResponseRequired: !valid };
}
