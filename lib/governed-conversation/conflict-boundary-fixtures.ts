import { constructGovernedClaimSet } from "./claim-boundary-conflict-fixture-adapter";
import { lineageIdentity } from "./lineage-types";
import type { GovernedClaimInput } from "./types";
import type { GovernedSourceObservation } from "./conflict-boundary-types";

export const FIXTURE_TIME = "2026-08-01T12:00:00.000Z";
const makeClaim = (claimType: "contact_address_lookup" | "message_importance", suffix: string): GovernedClaimInput => ({
  claimId: lineageIdentity("governed-claim", { claimType, suffix }), claimType, material: true, status: claimType === "contact_address_lookup" ? "insufficient_coverage" : "unsupported", ownership: claimType === "contact_address_lookup" ? "deterministic_status" : "unsupported", sourceReferences: [], factualValues: [], sourceAvailable: claimType === "contact_address_lookup", provenance: "claim-boundary:fixture", observedAt: FIXTURE_TIME, contentKind: "metadata", boundedComplete: false, conflicts: [],
});
export function makeConflictClaimSet(claimType: "contact_address_lookup" | "message_importance" = "contact_address_lookup") {
  const claim = makeClaim(claimType, "cassie");
  return constructGovernedClaimSet({ schemaVersion: "1", claimBoundaryEvaluationId: "claims-evaluation:fixture", claimBoundaryRulesetId: "claims-ruleset:fixture", threadId: "thread:fixture", requestId: "request:fixture", exchangeId: "exchange:fixture", referenceTime: FIXTURE_TIME, claims: [claim], segmentLinks: [{ segmentId: "segment:1", claimId: claim.claimId }], createdAt: FIXTURE_TIME }, "claim-set-event:fixture");
}
export function makeObservation(overrides: Partial<GovernedSourceObservation> = {}): GovernedSourceObservation {
  const claimSet = makeConflictClaimSet();
  const base: GovernedSourceObservation = { sourcePublicationId: "source-publication:contacts-a", sourceOwnerId: "source-owner:contacts-a", sourceType: "governed_contact_observation", resourceEntityId: "person:cassie", affectedClaimId: claimSet.claimIds[0], comparisonKey: "resolved_contact_address", canonicalFactualValue: "cassie.primary@example.com", originalFactualValue: "cassie.primary@example.com", observedAt: FIXTURE_TIME, publishedAt: FIXTURE_TIME, provenance: "synthetic-governed-contact-publisher:a", comparisonScope: "current_primary_deliverable_address", availability: "available", coverage: "complete", supersessionStatus: "current", contentKind: "contact_address", schemaVersion: "1" };
  return Object.freeze({ ...base, ...overrides });
}
export function contradictoryObservations(): readonly GovernedSourceObservation[] {
  return [makeObservation(), makeObservation({ sourcePublicationId: "source-publication:contacts-b", sourceOwnerId: "source-owner:contacts-b", canonicalFactualValue: "cassie.hayward@example.org", originalFactualValue: "cassie.hayward@example.org", provenance: "synthetic-governed-contact-publisher:b" })];
}
