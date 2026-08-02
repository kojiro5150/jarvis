import { computeEvidenceStatus } from "./evidence-status";
import { lineageIdentity } from "./lineage-types";
import { CLAIM_ENRICHMENT_RULESET } from "./claim-enrichment-ruleset";
import { constructEnrichedClaim, constructEnrichedClaimSet, constructEnrichmentEvaluation } from "./claim-enrichment-publications";
import type { AdmittedEvidenceCategoryCell, ClaimEnrichmentEngineInput, ClaimEnrichmentEngineResult, ClaimEnrichmentRecord, EnrichedGovernedClaimInput, ResolvedCommunicationAddressAssertion } from "./claim-enrichment-types";
import type { GovernedCommunicationEvidenceInput } from "./projection-composer";
import type { GovernedClaimInput, GovernedSourceReference } from "./types";

const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const instant = (value: string, field: string) => { if (!nonempty(value) || Number.isNaN(Date.parse(value))) throw new Error(`${field} must be an ISO instant`); };
const refKey = (value: GovernedSourceReference) => `${value.sourceId}|${value.resourceId}|${value.field}|${value.observedAt}`;
const uniqueRefs = (values: readonly GovernedSourceReference[]) => [...new Map(values.map(value => [refKey(value), structuredClone(value)])).values()].sort((a, b) => refKey(a).localeCompare(refKey(b)));
const deepFreeze = <T>(value: T): T => { if (value && typeof value === "object") { Object.freeze(value); for (const item of Object.values(value)) deepFreeze(item); } return value; };
const freeze = <T>(value: T): T => deepFreeze(structuredClone(value)) as T;

function validateInput(input: ClaimEnrichmentEngineInput): void {
  const set = input.baseClaimSet;
  if (![set.governedClaimSetId, set.threadId, set.requestId, set.exchangeId, set.claimBoundaryRulesetId, set.claimBoundaryEvaluationId, input.sourceAssemblyReference].every(nonempty)) throw new Error("enrichment lineage is required");
  instant(set.referenceTime, "baseClaimSet.referenceTime"); instant(input.referenceTime, "referenceTime"); instant(input.createdAt, "createdAt");
  const ids = set.claims.map(claim => claim.claimId);
  if (new Set(ids).size !== ids.length) throw new Error("duplicate base claim identity");
  if (ids.length !== set.claimIds.length || ids.some(id => !set.claimIds.includes(id)) || set.claimIds.some(id => !ids.includes(id))) throw new Error("base claimIds do not match claims");
  if (set.segmentLinks.some(link => !ids.includes(link.claimId))) throw new Error("base segment link references unknown claim");
}

function cells(claim: GovernedClaimInput): AdmittedEvidenceCategoryCell[] {
  return CLAIM_ENRICHMENT_RULESET.materialityMatrix.filter(rule => rule.claimType === claim.claimType).map(rule => freeze({ baseClaimId: claim.claimId, claimType: claim.claimType, evidenceCategory: rule.evidenceCategory, materiality: rule.materiality, outcome: rule.materiality === "not_material" ? "not_material" : "retained_insufficient_coverage", reason: rule.constraint }));
}

function validAssertion(assertion: ResolvedCommunicationAddressAssertion, evidence: GovernedCommunicationEvidenceInput): boolean {
  return nonempty(assertion.evidenceReference) && [evidence.communicationReference, evidence.recipientEvidenceReference].includes(assertion.evidenceReference)
    && refKey(assertion.sourceReference) === refKey(evidence.sourceReference)
    && assertion.policyReference === evidence.policyReference && assertion.provenanceReference === evidence.provenanceReference
    && assertion.observedAt === evidence.retrievalTime && nonempty(assertion.entityId) && nonempty(assertion.address);
}

type Draft = { readonly base: GovernedClaimInput; readonly status: GovernedClaimInput["status"]; readonly ownership: GovernedClaimInput["ownership"]; readonly sourceReferences: readonly GovernedSourceReference[]; readonly factualValues: readonly unknown[]; readonly sourceAvailable: boolean; readonly provenance: string; readonly observedAt: string; readonly boundedComplete: boolean; readonly outcome: Exclude<ClaimEnrichmentRecord["outcome"], "enrichment_failed">; readonly admittedCategories: ClaimEnrichmentRecord["admittedEvidenceCategories"]; readonly consulted: readonly GovernedSourceReference[]; readonly admitted: readonly GovernedSourceReference[]; readonly rejected: readonly GovernedSourceReference[]; readonly reason: string };

function importanceDraft(claim: GovernedClaimInput): Draft {
  return { base: claim, status: "unsupported", ownership: "unsupported", sourceReferences: [], factualValues: [], sourceAvailable: claim.sourceAvailable, provenance: claim.provenance, observedAt: claim.observedAt, boundedComplete: false, outcome: "retained_unsupported", admittedCategories: [], consulted: [], admitted: [], rejected: [], reason: "message_importance_has_no_admitted_evidence_rule" };
}

function contactDraft(input: ClaimEnrichmentEngineInput, claim: GovernedClaimInput): Draft {
  if (claim.ownership !== "deterministic_status" || !claim.material || claim.status !== "insufficient_coverage") throw new Error("contact claim has an unexplained base state");
  const connector = input.assembledEvidence.connectorAvailability.find(item => item.connectorId === "gmail");
  if (!connector) return { base: claim, status: "insufficient_coverage", ownership: claim.ownership, sourceReferences: [], factualValues: [], sourceAvailable: false, provenance: claim.provenance, observedAt: claim.observedAt, boundedComplete: false, outcome: "retained_insufficient_coverage", admittedCategories: ["connectorAvailability"], consulted: [], admitted: [], rejected: [], reason: "gmail_connector_availability_missing" };
  if (connector.availability === "unavailable") return { base: claim, status: "unavailable", ownership: claim.ownership, sourceReferences: [], factualValues: [], sourceAvailable: false, provenance: claim.provenance, observedAt: connector.observedAt, boundedComplete: false, outcome: "retained_unavailable", admittedCategories: ["connectorAvailability"], consulted: [], admitted: [], rejected: [], reason: "gmail_connector_unavailable" };
  const entityId = input.claimParametersByClaimId[claim.claimId]?.entityId;
  if (!nonempty(entityId)) return { base: claim, status: "insufficient_coverage", ownership: claim.ownership, sourceReferences: [], factualValues: [], sourceAvailable: true, provenance: claim.provenance, observedAt: claim.observedAt, boundedComplete: false, outcome: "retained_insufficient_coverage", admittedCategories: ["communicationEvidence", "connectorAvailability"], consulted: [], admitted: [], rejected: [], reason: "recognised_entity_parameter_missing" };
  const consulted: GovernedSourceReference[] = [], rejected: GovernedSourceReference[] = [], matching: ResolvedCommunicationAddressAssertion[] = [];
  for (const evidence of input.assembledEvidence.communicationEvidence) {
    consulted.push(evidence.sourceReference);
    const assertions = input.resolver.resolveCommunicationEvidence(freeze(evidence));
    if (!Array.isArray(assertions)) throw new Error("resolver returned a malformed assertion collection");
    for (const assertion of assertions.map(item => freeze(item))) {
      if (!validAssertion(assertion, evidence)) throw new Error("resolver assertion violates reference integrity");
      if (assertion.entityId === entityId) matching.push(assertion); else rejected.push(assertion.sourceReference);
    }
  }
  const admittedAssertions = matching.filter(item => item.available && item.fieldCoverage === "complete" && item.scopeComplete && item.fresh);
  rejected.push(...matching.filter(item => !admittedAssertions.includes(item)).map(item => item.sourceReference));
  const values = [...new Set(admittedAssertions.map(item => item.address))].sort();
  const admitted = uniqueRefs(admittedAssertions.map(item => item.sourceReference));
  const status = computeEvidenceStatus({ supported: true, sourceAvailable: true, governedEvidence: admittedAssertions.length > 0, identitySufficient: true, provenanceSufficient: admittedAssertions.length > 0, scopeComplete: admittedAssertions.length > 0 && admittedAssertions.every(item => item.scopeComplete), fieldCoverage: admittedAssertions.length > 0 && admittedAssertions.every(item => item.fieldCoverage === "complete"), fresh: admittedAssertions.length > 0 && admittedAssertions.every(item => item.fresh), conflictFree: values.length === 1, contentComplete: admittedAssertions.length > 0 });
  return { base: claim, status, ownership: claim.ownership, sourceReferences: admitted, factualValues: values, sourceAvailable: true, provenance: admittedAssertions.length ? admittedAssertions.map(item => item.provenanceReference).sort().join("|") : claim.provenance, observedAt: admittedAssertions.map(item => item.observedAt).sort().at(-1) ?? claim.observedAt, boundedComplete: status === "available", outcome: status === "available" ? "enriched_available" : "retained_insufficient_coverage", admittedCategories: ["communicationEvidence", "connectorAvailability"], consulted: uniqueRefs(consulted), admitted, rejected: uniqueRefs(rejected), reason: status === "available" ? "complete_identity_matched_governed_address_assertion" : "address_assertion_coverage_incomplete" };
}

export function enrichGovernedClaims(input: ClaimEnrichmentEngineInput): ClaimEnrichmentEngineResult {
  validateInput(input);
  const allCells = input.baseClaimSet.claims.flatMap(cells);
  let drafts: Draft[];
  try {
    drafts = input.baseClaimSet.claims.map(claim => claim.claimType === "contact_address_lookup" ? contactDraft(input, claim) : importanceDraft(claim));
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown deterministic resolver failure";
    const records = input.baseClaimSet.claims.map(claim => freeze({ baseClaimId: claim.claimId, enrichedClaimId: lineageIdentity("failed-enriched-claim", { baseClaimId: claim.claimId, reason }), claimType: claim.claimType, outcome: "enrichment_failed" as const, admittedEvidenceCategories: [], consultedSourceReferences: [], admittedSourceReferences: [], rejectedSourceReferences: [], reason }));
    const evaluation = constructEnrichmentEvaluation({ enrichmentRulesetId: CLAIM_ENRICHMENT_RULESET.enrichmentRulesetId, baseGovernedClaimSetId: input.baseClaimSet.governedClaimSetId, threadId: input.baseClaimSet.threadId, requestId: input.baseClaimSet.requestId, exchangeId: input.baseClaimSet.exchangeId, sourceAssemblyReference: input.sourceAssemblyReference, referenceTime: input.referenceTime, evaluatedClaimIds: input.baseClaimSet.claimIds, admittedEvidenceCategoryCells: allCells, sourceReferencesConsulted: [], sourceReferencesAdmitted: [], sourceReferencesRejected: [], claimOutcomes: records, createdAt: input.createdAt });
    return freeze({ outcome: "failed", evaluation });
  }
  const seedRecords = drafts.map(draft => freeze({ baseClaimId: draft.base.claimId, enrichedClaimId: lineageIdentity("enriched-claim-seed", draft), claimType: draft.base.claimType, outcome: draft.outcome, admittedEvidenceCategories: draft.admittedCategories, consultedSourceReferences: draft.consulted, admittedSourceReferences: draft.admitted, rejectedSourceReferences: draft.rejected, reason: draft.reason }));
  const evaluationBody = { enrichmentRulesetId: CLAIM_ENRICHMENT_RULESET.enrichmentRulesetId, baseGovernedClaimSetId: input.baseClaimSet.governedClaimSetId, threadId: input.baseClaimSet.threadId, requestId: input.baseClaimSet.requestId, exchangeId: input.baseClaimSet.exchangeId, sourceAssemblyReference: input.sourceAssemblyReference, referenceTime: input.referenceTime, evaluatedClaimIds: input.baseClaimSet.claimIds, admittedEvidenceCategoryCells: allCells, sourceReferencesConsulted: uniqueRefs(drafts.flatMap(item => item.consulted)), sourceReferencesAdmitted: uniqueRefs(drafts.flatMap(item => item.admitted)), sourceReferencesRejected: uniqueRefs(drafts.flatMap(item => item.rejected)), claimOutcomes: seedRecords, createdAt: input.createdAt };
  const seedIdentityDiscriminators = seedRecords.map(record => record.enrichedClaimId);
  const seedEvaluation = constructEnrichmentEvaluation(evaluationBody as unknown as Omit<import("./claim-enrichment-types").EvidenceToClaimEnrichmentEvaluation, "enrichmentEvaluationId">, seedIdentityDiscriminators);
  const enrichedClaims = drafts.map(draft => constructEnrichedClaim(draft.base.claimId, seedEvaluation.enrichmentEvaluationId, { claimType: draft.base.claimType, material: draft.base.material, status: draft.status, ownership: draft.ownership, sourceReferences: draft.sourceReferences, factualValues: draft.factualValues, sourceAvailable: draft.sourceAvailable, provenance: draft.provenance, observedAt: draft.observedAt, contentKind: draft.base.contentKind, boundedComplete: draft.boundedComplete, conflicts: draft.base.conflicts }, { threadId: input.baseClaimSet.threadId, requestId: input.baseClaimSet.requestId, exchangeId: input.baseClaimSet.exchangeId, segmentIds: input.baseClaimSet.segmentLinks.filter(link => link.claimId === draft.base.claimId).map(link => link.segmentId) }));
  const claimOutcomes = seedRecords.map((record, index) => ({ ...record, enrichedClaimId: enrichedClaims[index].claimId, claimIntegrityPolicyId: enrichedClaims[index].claimIntegrityPolicyId, claimIntegrityDigest: enrichedClaims[index].claimIntegrityDigest }));
  const evaluation = constructEnrichmentEvaluation({ ...evaluationBody, claimOutcomes }, seedIdentityDiscriminators);
  if (evaluation.enrichmentEvaluationId !== seedEvaluation.enrichmentEvaluationId) throw new Error("enrichment evaluation identity is unstable");
  const byBase = new Map(enrichedClaims.map(claim => [claim.baseClaimId, claim]));
  const enrichedClaimSet = constructEnrichedClaimSet({ baseGovernedClaimSetId: input.baseClaimSet.governedClaimSetId, enrichmentEvaluationId: evaluation.enrichmentEvaluationId, claimBoundaryRulesetId: input.baseClaimSet.claimBoundaryRulesetId, claimBoundaryEvaluationId: input.baseClaimSet.claimBoundaryEvaluationId, threadId: input.baseClaimSet.threadId, requestId: input.baseClaimSet.requestId, exchangeId: input.baseClaimSet.exchangeId, referenceTime: input.referenceTime, claims: enrichedClaims, segmentLinks: input.baseClaimSet.segmentLinks.map(link => ({ segmentId: link.segmentId, claimId: byBase.get(link.claimId)!.claimId })), createdAt: input.createdAt });
  return freeze({ outcome: "completed", evaluation, enrichedClaimSet });
}
