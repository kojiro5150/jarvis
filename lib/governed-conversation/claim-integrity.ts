import { createHash } from "node:crypto";
import type { EnrichedGovernedClaimInput } from "./claim-enrichment-types";
import type { GovernedClaimInput, GovernedConflict, GovernedSourceReference } from "./types";

export const GOVERNED_ENRICHED_CLAIM_INTEGRITY_POLICY_ID = "governed-enriched-claim-integrity.v1" as const;
export type ClaimIntegrityDigest = `sha256:${string}`;
export const ENRICHED_CLAIM_INTEGRITY_MISMATCH_CODES = [
  "published_claim_digest_mismatch", "observation_claim_digest_mismatch", "observation_digest_missing", "claim_digest_missing",
  "mixed_observation_claim_digests", "claim_integrity_policy_mismatch", "claim_integrity_digest_malformed",
] as const;
export type EnrichedClaimIntegrityMismatchCode = (typeof ENRICHED_CLAIM_INTEGRITY_MISMATCH_CODES)[number];

export class EnrichedClaimIntegrityError extends Error {
  readonly code: EnrichedClaimIntegrityMismatchCode;
  readonly claimId: string;
  readonly expectedDigest?: string;
  readonly observedDigest?: string;
  constructor(code: EnrichedClaimIntegrityMismatchCode, claimId: string, expectedDigest?: string, observedDigest?: string) {
    super(`enriched claim integrity ${code} for ${claimId}`);
    this.name = "EnrichedClaimIntegrityError"; this.code = code; this.claimId = claimId;
    this.expectedDigest = expectedDigest; this.observedDigest = observedDigest;
  }
}

export interface EnrichedClaimIntegrityContext { readonly enrichmentEvaluationId: string; readonly threadId: string; readonly requestId: string; readonly exchangeId: string; readonly segmentIds: readonly string[] }
export type EnrichedGovernedClaimInputWithoutIntegrityFields = Omit<EnrichedGovernedClaimInput, "claimIntegrityPolicyId" | "claimIntegrityDigest">;
export interface EnrichedClaimIntegrityBody {
  readonly policy: typeof GOVERNED_ENRICHED_CLAIM_INTEGRITY_POLICY_ID; readonly claimId: string; readonly baseClaimId: string;
  readonly claimType: GovernedClaimInput["claimType"]; readonly material: boolean; readonly status: GovernedClaimInput["status"];
  readonly ownership: GovernedClaimInput["ownership"]; readonly sourceReferences: readonly GovernedSourceReference[];
  readonly factualValues: readonly unknown[]; readonly sourceAvailable: boolean; readonly provenance: string; readonly observedAt: string;
  readonly contentKind: GovernedClaimInput["contentKind"]; readonly boundedComplete: boolean; readonly conflicts: readonly GovernedConflict[];
  readonly enrichmentEvaluationId: string; readonly threadId: string; readonly requestId: string; readonly exchangeId: string; readonly segmentIds: readonly string[];
}
const requiredText = (value: unknown, name: string): string => { if (typeof value !== "string" || value.length === 0) throw new TypeError(`${name} is required`); return value; };
const sourceReference = (value: GovernedSourceReference): GovernedSourceReference => ({ sourceId: requiredText(value.sourceId, "sourceId"), resourceId: requiredText(value.resourceId, "resourceId"), field: requiredText(value.field, "field"), observedAt: requiredText(value.observedAt, "observedAt") });
const referenceKey = (value: GovernedSourceReference) => [value.sourceId, value.resourceId, value.field, value.observedAt].join("\u0000");
function canonicalJsonValue(value: unknown, seen = new Set<object>()): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") { if (!Number.isFinite(value)) throw new TypeError("non-finite factual value"); return value; }
  if (typeof value !== "object") throw new TypeError("unsupported factual value");
  if (seen.has(value)) throw new TypeError("cyclic factual value"); seen.add(value);
  try {
    if (Array.isArray(value)) return value.map(item => canonicalJsonValue(item, seen));
    const prototype = Object.getPrototypeOf(value); if (prototype !== Object.prototype && prototype !== null) throw new TypeError("non-JSON factual value");
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as object).sort()) { const item = (value as Record<string, unknown>)[key]; if (item === undefined) throw new TypeError("undefined factual value"); result[key] = canonicalJsonValue(item, seen); }
    return result;
  } finally { seen.delete(value); }
}
const conflict = (value: GovernedConflict): GovernedConflict => ({ conflictId: requiredText(value.conflictId, "conflictId"), claimId: requiredText(value.claimId, "conflict.claimId"), governedReference: sourceReference(value.governedReference), compatibilityContextId: requiredText(value.compatibilityContextId, "compatibilityContextId"), description: requiredText(value.description, "description") });

export function constructEnrichedClaimIntegrityBody(claim: EnrichedGovernedClaimInputWithoutIntegrityFields, context: EnrichedClaimIntegrityContext): EnrichedClaimIntegrityBody {
  const segments = [...new Set(context.segmentIds.map(value => requiredText(value, "segmentId")))].sort(); if (!segments.length) throw new TypeError("segmentIds are required");
  for (const [name, value] of Object.entries({ claimId: claim.claimId, baseClaimId: claim.baseClaimId, claimType: claim.claimType, status: claim.status, ownership: claim.ownership, provenance: claim.provenance, observedAt: claim.observedAt, contentKind: claim.contentKind, enrichmentEvaluationId: context.enrichmentEvaluationId, threadId: context.threadId, requestId: context.requestId, exchangeId: context.exchangeId })) requiredText(value, name);
  if ([claim.material, claim.sourceAvailable, claim.boundedComplete].some(value => typeof value !== "boolean") || !Array.isArray(claim.sourceReferences) || !Array.isArray(claim.factualValues) || !Array.isArray(claim.conflicts)) throw new TypeError("claim canonical fields are required");
  return {
    policy: GOVERNED_ENRICHED_CLAIM_INTEGRITY_POLICY_ID, claimId: claim.claimId, baseClaimId: claim.baseClaimId, claimType: claim.claimType,
    material: claim.material, status: claim.status, ownership: claim.ownership,
    sourceReferences: claim.sourceReferences.map(sourceReference).sort((a, b) => referenceKey(a).localeCompare(referenceKey(b))),
    factualValues: claim.factualValues.map(value => canonicalJsonValue(value)), sourceAvailable: claim.sourceAvailable, provenance: claim.provenance,
    observedAt: claim.observedAt, contentKind: claim.contentKind, boundedComplete: claim.boundedComplete,
    conflicts: claim.conflicts.map(conflict).sort((a, b) => a.conflictId.localeCompare(b.conflictId)),
    enrichmentEvaluationId: context.enrichmentEvaluationId, threadId: context.threadId, requestId: context.requestId, exchangeId: context.exchangeId, segmentIds: segments,
  };
}
export const serializeEnrichedClaimIntegrityBody = (body: EnrichedClaimIntegrityBody): string => JSON.stringify(body);
export function computeEnrichedClaimIntegrityDigest(body: EnrichedClaimIntegrityBody): ClaimIntegrityDigest { return `sha256:${createHash("sha256").update(serializeEnrichedClaimIntegrityBody(body), "utf8").digest("hex")}`; }
export function isClaimIntegrityDigest(value: string): value is ClaimIntegrityDigest { return /^sha256:[0-9a-f]{64}$/.test(value); }
export function recomputeEnrichedClaimIntegrityDigest(claim: EnrichedGovernedClaimInput, context: EnrichedClaimIntegrityContext): ClaimIntegrityDigest { return computeEnrichedClaimIntegrityDigest(constructEnrichedClaimIntegrityBody(claim, context)); }
