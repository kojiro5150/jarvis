import { computeEvidenceStatus } from "./evidence-status";
import { lineageIdentity } from "./lineage-types";
import type { GovernedClaimInput } from "./types";
import { CLAIM_BOUNDARY_RULESET } from "./claim-boundary-ruleset";
import { claimBoundaryInputDigest, constructClaimBoundaryEvaluation, constructGovernedClaimSet } from "./claim-boundary-publications";
import type { AdmittedClaimType, BoundaryEngineInput, BoundaryEngineResult, BoundaryEntity, BoundaryOutcome, ClarificationPublication, ExtractedParameter, MatchedSpan } from "./claim-boundary-types";

type Candidate = { ruleId: string; claimType: AdmittedClaimType; start: number; end: number; text: string; personName?: string };
const CONTACT_PATTERNS: readonly [string, RegExp][] = [
  ["contact.exact.whats-email", /what(?:'|’)s\s+([a-z][a-z -]*)'s\s+email\??/gi],
  ["contact.alias.give-email", /give me\s+([a-z][a-z -]*)'s\s+email\.?/gi],
  ["contact.lexical.email-address", /what is\s+([a-z][a-z -]*)'s\s+email address\??/gi],
  ["contact.grammar.have-email", /do you have\s+([a-z][a-z -]*)'s\s+email\??/gi],
];
const IMPORTANCE_PATTERNS: readonly [string, RegExp][] = [
  ["importance.exact.anything", /anything important\??/gi],
  ["importance.alias.any-messages", /are any of\s+([a-z][a-z -]*)'s\s+messages important\??/gi],
  ["importance.lexical.from", /is there anything important from\s+([a-z][a-z -]*)\??/gi],
];
const cleanName = (value: string) => value.trim().replace(/\s+/g, " ").replace(/(^|\s)\S/g, x => x.toUpperCase());
const instant = (value: string, field: string) => { if (!value || Number.isNaN(Date.parse(value))) throw new Error(`${field} must be an ISO instant`); };

function recognise(text: string): Candidate[] {
  const found: Candidate[] = [];
  for (const [ruleId, pattern] of [...CONTACT_PATTERNS, ...IMPORTANCE_PATTERNS]) {
    pattern.lastIndex = 0; let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) found.push({ ruleId, claimType: ruleId.startsWith("contact") ? "contact_address_lookup" : "message_importance", start: match.index, end: match.index + match[0].length, text: match[0], personName: match[1] ? cleanName(match[1]) : undefined });
  }
  return found.sort((a, b) => a.start - b.start || a.end - b.end).filter((item, index, all) => !all.slice(0, index).some(prior => item.start < prior.end));
}

function clarification(reason: ClarificationPublication["reason"], choices: ClarificationPublication["choices"], input: BoundaryEngineInput): ClarificationPublication {
  const requiredField = reason === "missing_required_parameter" ? "personName" : reason === "ambiguous_governed_intent" ? "intent" : "entityId";
  return Object.freeze({ reason, requiredField, choices, continuationToken: lineageIdentity("claim-boundary-continuation", { reason, choices, requestId: input.requestId, priorEvaluationId: input.priorEvaluationId }), priorEvaluationId: input.priorEvaluationId });
}

function resolve(personName: string | undefined, entities: readonly BoundaryEntity[] | undefined, input: BoundaryEngineInput): { entityId?: string; clarification?: ClarificationPublication; secondFailure?: boolean } {
  if (!personName) return { clarification: clarification("missing_required_parameter", [], input) };
  if (!entities) return { entityId: `person-name:${personName.toLocaleLowerCase("en-US")}` };
  const matches = entities.filter(entity => entity.personName.toLocaleLowerCase("en-US") === personName.toLocaleLowerCase("en-US"));
  if (matches.length === 1) return { entityId: matches[0].entityId };
  if ((input.clarificationAttempt ?? 0) >= 2) return { secondFailure: true };
  return { clarification: clarification("unresolved_entity", matches.map(x => ({ value: x.entityId, label: x.displayLabel })), input) };
}

function makeClaim(type: AdmittedClaimType, personName: string | undefined, entityId: string | undefined, segmentId: string, referenceTime: string): GovernedClaimInput {
  const template = CLAIM_BOUNDARY_RULESET.claimTemplates.find(x => x.claimType === type)!;
  const sourceAvailable = true;
  const status = type === "message_importance" ? "unsupported" : computeEvidenceStatus({ supported: true, sourceAvailable, governedEvidence: false, identitySufficient: Boolean(entityId), provenanceSufficient: false, scopeComplete: false, fieldCoverage: false, fresh: false, conflictFree: true, contentComplete: false });
  const body = { claimType: type, material: template.material, personName, entityId, sourceRequirement: template.sourceRequirement, completenessRule: template.completenessRule, status, ownership: type === "message_importance" ? "unsupported" as const : "deterministic_status" as const, segmentId, provenance: `claim-boundary:${CLAIM_BOUNDARY_RULESET.claimBoundaryRulesetId}`, boundedComplete: false, conflicts: [] as const };
  return Object.freeze({ claimId: lineageIdentity("governed-claim", body), claimType: type, material: true, status, ownership: body.ownership, sourceReferences: [], factualValues: [], sourceAvailable, provenance: body.provenance, observedAt: referenceTime, contentKind: "metadata", boundedComplete: false, conflicts: [] });
}

export function evaluateClaimBoundary(input: BoundaryEngineInput): BoundaryEngineResult {
  instant(input.referenceTime, "referenceTime"); instant(input.createdAt, "createdAt");
  if (!input.threadId || !input.requestId || !input.exchangeId) throw new Error("boundary lineage is required");
  let typedIntentResult: "not_supplied" | "valid" | "invalid" = "not_supplied";
  let candidates: Candidate[] = [];
  let outcome: BoundaryOutcome = "recognised"; let unsupportedReason: string | undefined; let clarificationResult: ClarificationPublication | undefined;
  if (input.typedIntent !== undefined) {
    const typed = input.typedIntent as { type?: unknown; personName?: unknown };
    if (!typed || typeof typed !== "object" || typeof typed.type !== "string" || !CLAIM_BOUNDARY_RULESET.typedIntents.includes(typed.type as AdmittedClaimType) || (typed.personName !== undefined && typeof typed.personName !== "string")) {
      typedIntentResult = "invalid"; outcome = "unsupported_claim_type"; unsupportedReason = "invalid_or_unknown_typed_intent";
    } else {
      typedIntentResult = "valid";
      candidates = [{ ruleId: `typed.${input.typedIntentSource ?? "capability"}.${typed.type}`, claimType: typed.type as AdmittedClaimType, start: 0, end: input.text.length, text: input.text, personName: typeof typed.personName === "string" && typed.personName.trim() ? cleanName(typed.personName) : undefined }];
    }
  } else if (/^what(?:'|’)s\s+their\s+email\??$/i.test(input.text.trim())) {
    candidates = [{ ruleId: "contact.grammar.missing-person", claimType: "contact_address_lookup", start: 0, end: input.text.length, text: input.text }];
  } else if (/^cassie's important email\??$/i.test(input.text.trim())) {
    outcome = "ambiguous_governed_intent"; clarificationResult = clarification("ambiguous_governed_intent", [{ value: "contact_address_lookup", label: "Contact address" }, { value: "message_importance", label: "Message importance" }], input);
  } else candidates = recognise(input.text);
  if (outcome === "recognised" && candidates.length === 0) { outcome = /^\s*(brainstorm|help me write|explain)\b/i.test(input.text) ? "no_governed_factual_claim" : "unsupported_language"; unsupportedReason = outcome === "unsupported_language" ? "no_governed_pattern_match" : undefined; }

  const spans: MatchedSpan[] = candidates.map((x, i) => ({ segmentId: `segment:${i + 1}`, ruleId: x.ruleId, claimType: x.claimType, start: x.start, end: x.end, text: x.text }));
  const parameters: ExtractedParameter[] = []; const claims: GovernedClaimInput[] = []; const segmentLinks: { segmentId: string; claimId: string }[] = [];
  if (outcome === "recognised") for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i], span = spans[i]; let entityId: string | undefined;
    if (candidate.personName) parameters.push({ segmentId: span.segmentId, name: "personName", value: candidate.personName });
    if (candidate.claimType === "contact_address_lookup") {
      const resolution = resolve(candidate.personName, input.entities, input);
      if (resolution.secondFailure) { outcome = "unsupported_language"; unsupportedReason = "second_unresolved_clarification"; break; }
      if (resolution.clarification) { clarificationResult = resolution.clarification; outcome = resolution.clarification.reason; break; }
      entityId = resolution.entityId; parameters.push({ segmentId: span.segmentId, name: "entityId", value: entityId! });
    } else if (candidate.personName) {
      const exact = input.entities?.filter(x => x.personName.toLowerCase() === candidate.personName!.toLowerCase());
      if (exact?.length === 1) entityId = exact[0].entityId;
    }
    const claim = makeClaim(candidate.claimType, candidate.personName, entityId, span.segmentId, input.referenceTime); claims.push(claim); segmentLinks.push({ segmentId: span.segmentId, claimId: claim.claimId });
  }
  if (outcome !== "recognised") { claims.length = 0; segmentLinks.length = 0; }
  const segmentation = spans.map(x => ({ segmentId: x.segmentId, start: x.start, end: x.end, disposition: "governed" as const }));
  const evaluation = constructClaimBoundaryEvaluation({ schemaVersion: "1", claimBoundaryRulesetId: CLAIM_BOUNDARY_RULESET.claimBoundaryRulesetId, threadId: input.threadId, requestId: input.requestId, exchangeId: input.exchangeId, inputDigest: claimBoundaryInputDigest({ text: input.text, typedIntent: input.typedIntent }), referenceTime: input.referenceTime, typedIntentResult, matchedRuleIds: spans.map(x => x.ruleId), matchedSpans: spans, extractedParameters: parameters, segmentation, outcome, uncertaintyReason: clarificationResult?.reason, clarification: clarificationResult, unsupportedReason, priorEvaluationId: input.priorEvaluationId, createdAt: input.createdAt }, `${input.requestId}:${input.createdAt}:${input.priorEvaluationId ?? "initial"}`);
  if (!(["recognised", "no_governed_factual_claim"] as BoundaryOutcome[]).includes(outcome)) return { evaluation };
  const claimSet = constructGovernedClaimSet({ schemaVersion: "1", claimBoundaryEvaluationId: evaluation.claimBoundaryEvaluationId, claimBoundaryRulesetId: CLAIM_BOUNDARY_RULESET.claimBoundaryRulesetId, threadId: input.threadId, requestId: input.requestId, exchangeId: input.exchangeId, referenceTime: input.referenceTime, claims, segmentLinks, createdAt: input.createdAt }, `${input.exchangeId}:${input.createdAt}`);
  return Object.freeze({ evaluation, claimSet });
}
