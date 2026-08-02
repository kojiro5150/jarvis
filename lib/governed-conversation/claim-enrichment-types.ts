import type { GovernedClaimSet } from "./claim-\u0062oundary-types";
import type { GovernedSourceEvidenceAssemblyResult } from "./source-evidence-assembly";
import type { GovernedCommunicationEvidenceInput } from "./projection-composer";
import type { GovernedClaimInput, GovernedSourceReference } from "./types";

export const CLAIM_ENRICHMENT_OUTCOMES = [
  "enriched_available",
  "retained_insufficient_coverage",
  "retained_unavailable",
  "retained_unsupported",
  "not_material",
  "enrichment_failed",
] as const;
export type ClaimEnrichmentOutcome = (typeof CLAIM_ENRICHMENT_OUTCOMES)[number];

export const CLAIM_ENRICHMENT_EVIDENCE_CATEGORIES = [
  "communicationEvidence",
  "calendarEvidence",
  "memoryPriorityReferences",
  "connectorAvailability",
] as const;
export type ClaimEnrichmentEvidenceCategory = (typeof CLAIM_ENRICHMENT_EVIDENCE_CATEGORIES)[number];
export type ClaimEvidenceMateriality = "material" | "conditionally_material" | "not_material";

export interface EnrichedGovernedClaimInput extends GovernedClaimInput { readonly baseClaimId: string }
export interface ClaimEnrichmentMaterialityRule { readonly claimType: "contact_address_lookup" | "message_importance"; readonly evidenceCategory: ClaimEnrichmentEvidenceCategory; readonly materiality: ClaimEvidenceMateriality; readonly constraint: "factual_evidence" | "source_availability_only" | "excluded" }
export interface AdmittedEvidenceCategoryCell { readonly baseClaimId: string; readonly claimType: GovernedClaimInput["claimType"]; readonly evidenceCategory: ClaimEnrichmentEvidenceCategory; readonly materiality: ClaimEvidenceMateriality; readonly outcome: ClaimEnrichmentOutcome; readonly reason: string }
export interface ClaimEnrichmentRecord { readonly baseClaimId: string; readonly enrichedClaimId: string; readonly claimType: GovernedClaimInput["claimType"]; readonly outcome: ClaimEnrichmentOutcome; readonly admittedEvidenceCategories: readonly ClaimEnrichmentEvidenceCategory[]; readonly consultedSourceReferences: readonly GovernedSourceReference[]; readonly admittedSourceReferences: readonly GovernedSourceReference[]; readonly rejectedSourceReferences: readonly GovernedSourceReference[]; readonly reason: string }
export interface EvidenceToClaimEnrichmentEvaluation { readonly enrichmentRulesetId: string; readonly enrichmentEvaluationId: string; readonly baseGovernedClaimSetId: string; readonly threadId: string; readonly requestId: string; readonly exchangeId: string; readonly sourceAssemblyReference: string; readonly referenceTime: string; readonly evaluatedClaimIds: readonly string[]; readonly admittedEvidenceCategoryCells: readonly AdmittedEvidenceCategoryCell[]; readonly sourceReferencesConsulted: readonly GovernedSourceReference[]; readonly sourceReferencesAdmitted: readonly GovernedSourceReference[]; readonly sourceReferencesRejected: readonly GovernedSourceReference[]; readonly claimOutcomes: readonly ClaimEnrichmentRecord[]; readonly createdAt: string }
export interface EnrichedGovernedClaimSet { readonly enrichedGovernedClaimSetId: string; readonly baseGovernedClaimSetId: string; readonly enrichmentEvaluationId: string; readonly claimBoundaryRulesetId: string; readonly claimBoundaryEvaluationId: string; readonly threadId: string; readonly requestId: string; readonly exchangeId: string; readonly referenceTime: string; readonly claims: readonly EnrichedGovernedClaimInput[]; readonly segmentLinks: readonly { readonly segmentId: string; readonly claimId: string }[]; readonly claimIds: readonly string[]; readonly createdAt: string }
export type ClaimEnrichmentEngineResult = { readonly outcome: "completed"; readonly evaluation: EvidenceToClaimEnrichmentEvaluation; readonly enrichedClaimSet: EnrichedGovernedClaimSet } | { readonly outcome: "failed"; readonly evaluation: EvidenceToClaimEnrichmentEvaluation; readonly enrichedClaimSet?: undefined };

export interface ResolvedCommunicationAddressAssertion { readonly evidenceReference: string; readonly sourceReference: GovernedSourceReference; readonly entityId: string; readonly address: string; readonly provenanceReference: string; readonly observedAt: string; readonly available: boolean; readonly policyReference: string; readonly fieldCoverage: "complete" | "incomplete"; readonly scopeComplete: boolean; readonly fresh: boolean }
export interface GovernedEvidenceResolver { resolveCommunicationEvidence(input: GovernedCommunicationEvidenceInput): readonly ResolvedCommunicationAddressAssertion[] }
export interface GovernedClaimParameters { readonly entityId: string }
export interface ClaimEnrichmentEngineInput { readonly baseClaimSet: GovernedClaimSet; readonly assembledEvidence: GovernedSourceEvidenceAssemblyResult; readonly sourceAssemblyReference: string; readonly resolver: GovernedEvidenceResolver; readonly claimParametersByClaimId: Readonly<Record<string, GovernedClaimParameters>>; readonly referenceTime: string; readonly createdAt: string }

export interface ClaimEnrichmentRuleset { readonly schemaVersion: "1"; readonly rulesetVersion: "1.0.0"; readonly enrichmentRulesetId: string; readonly publicationDigest: string; readonly materialityMatrix: readonly ClaimEnrichmentMaterialityRule[]; readonly permittedOutcomes: readonly ClaimEnrichmentOutcome[]; readonly admittedClaimTypes: readonly ["contact_address_lookup", "message_importance"] }
