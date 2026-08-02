import { lineageIdentity } from "./lineage-types";
import type { EnrichedGovernedClaimInput, EnrichedGovernedClaimSet, EvidenceToClaimEnrichmentEvaluation } from "./claim-enrichment-types";
import { computeEnrichedClaimIntegrityDigest, constructEnrichedClaimIntegrityBody, GOVERNED_ENRICHED_CLAIM_INTEGRITY_POLICY_ID, type EnrichedClaimIntegrityContext } from "./claim-integrity";

const deepFreeze = <T>(value: T): T => { if (value && typeof value === "object") { Object.freeze(value); for (const item of Object.values(value)) deepFreeze(item); } return value; };
const freeze = <T>(value: T): T => deepFreeze(structuredClone(value)) as T;
export function constructEnrichmentEvaluation(body: Omit<EvidenceToClaimEnrichmentEvaluation, "enrichmentEvaluationId">, enrichedClaimIdentityDiscriminators = body.claimOutcomes.map(outcome => outcome.enrichedClaimId)): EvidenceToClaimEnrichmentEvaluation {
  const identityBody = { ...body, claimOutcomes: body.claimOutcomes.map(({ enrichedClaimId: _enrichedClaimId, claimIntegrityPolicyId: _claimIntegrityPolicyId, claimIntegrityDigest: _claimIntegrityDigest, ...outcome }, index) => ({ ...outcome, enrichedClaimIdentityDiscriminator: enrichedClaimIdentityDiscriminators[index] })) };
  return freeze({ ...body, enrichmentEvaluationId: lineageIdentity("claim-enrichment-evaluation", identityBody) });
}
export function constructEnrichedClaim(baseClaimId: string, enrichmentEvaluationId: string, body: Omit<EnrichedGovernedClaimInput, "claimId" | "baseClaimId" | "claimIntegrityPolicyId" | "claimIntegrityDigest">, integrityContext: Omit<EnrichedClaimIntegrityContext, "enrichmentEvaluationId">): EnrichedGovernedClaimInput {
  const identityBody = { baseClaimId, enrichmentEvaluationId, ...body };
  const claimWithoutIntegrity = { ...body, baseClaimId, claimId: lineageIdentity("enriched-governed-claim", identityBody) };
  const context = { ...integrityContext, enrichmentEvaluationId };
  const claimIntegrityDigest = computeEnrichedClaimIntegrityDigest(constructEnrichedClaimIntegrityBody(claimWithoutIntegrity, context));
  return freeze({ ...claimWithoutIntegrity, claimIntegrityPolicyId: GOVERNED_ENRICHED_CLAIM_INTEGRITY_POLICY_ID, claimIntegrityDigest });
}
export function constructEnrichedClaimSet(body: Omit<EnrichedGovernedClaimSet, "enrichedGovernedClaimSetId" | "claimIds">): EnrichedGovernedClaimSet {
  const claimIds = body.claims.map(claim => claim.claimId);
  if (new Set(claimIds).size !== claimIds.length || body.claims.some(claim => claim.claimId === claim.baseClaimId)) throw new Error("impossible enriched claim identity");
  if (body.segmentLinks.some(link => !claimIds.includes(link.claimId))) throw new Error("enriched segment link references unknown claim");
  return freeze({ ...body, claimIds, enrichedGovernedClaimSetId: lineageIdentity("enriched-governed-claim-set", { ...body, claimIds }) });
}
