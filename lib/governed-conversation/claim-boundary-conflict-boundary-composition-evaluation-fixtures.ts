import { evaluateClaimBoundary } from "./claim-boundary-engine";
import { evaluateGovernedConversationalConflicts } from "./conflict-boundary-engine";
import { constructBaseConflictEvaluableClaimSet } from "./conflict-boundary-publications";
import { CONFLICT_EVALUATION_RULESET } from "./conflict-boundary-ruleset";
import type { GovernedSourceObservation } from "./conflict-boundary-types";

export const COMPOSITION_TIME = "2026-08-01T12:00:00.000Z";
export const CASSIE_QUESTION = "What's Cassie's email? Anything important?";
export const COMPOSITION_LINEAGE = Object.freeze({ threadId: "thread:3.93:cassie", requestId: "request:3.93:cassie", exchangeId: "exchange:3.93:cassie" });

const claimInput = (text: string, discriminator: string) => ({
  text, ...COMPOSITION_LINEAGE, referenceTime: COMPOSITION_TIME, createdAt: COMPOSITION_TIME,
  entities: [{ entityId: "person:cassie", personName: "Cassie", displayLabel: "Cassie" }],
  compatibilityContext: { discriminator },
});

export function makeCompositionScenario() {
  const centralClaims = evaluateClaimBoundary(claimInput(CASSIE_QUESTION, "central"));
  if (!centralClaims.claimSet) throw new Error("central claim set was not published");
  const contactClaims = evaluateClaimBoundary(claimInput("What's Cassie's email?", "contact-only"));
  if (!contactClaims.claimSet) throw new Error("contact claim set was not published");
  const claimId = contactClaims.claimSet.claimIds[0];
  const observation = (suffix: "a" | "b", address: string): GovernedSourceObservation => Object.freeze({
    sourcePublicationId: `source-publication:contacts-${suffix}`, sourceOwnerId: `source-owner:contacts-${suffix}`,
    sourceType: "governed_contact_observation", resourceEntityId: "person:cassie", affectedClaimId: claimId,
    comparisonKey: "resolved_contact_address", canonicalFactualValue: address, originalFactualValue: address,
    observedAt: COMPOSITION_TIME, publishedAt: COMPOSITION_TIME, provenance: `synthetic-governed-contact-publisher:${suffix}`,
    comparisonScope: "current_primary_deliverable_address", availability: "available", coverage: "complete",
    supersessionStatus: "current", contentKind: "contact_address", schemaVersion: "1",
  });
  const contradictory = [observation("a", "cassie.primary@example.com"), observation("b", "cassie.hayward@example.org")];
  const compatible = [observation("a", "cassie.primary@example.com"), observation("b", "CASSIE.PRIMARY@example.com")];
  const run = (observations: readonly GovernedSourceObservation[], discriminator: string, claimSet = contactClaims.claimSet) =>
    evaluateGovernedConversationalConflicts({ ruleset: CONFLICT_EVALUATION_RULESET, claimSet: constructBaseConflictEvaluableClaimSet(claimSet!), observations, requestedConflictClasses: ["source_value_contradiction"], referenceTime: COMPOSITION_TIME, createdAt: COMPOSITION_TIME, evaluationDiscriminator: discriminator });
  return Object.freeze({ centralClaims, contactClaims, contradictory, compatible, conflict: run(contradictory, "evaluation:contradiction"), noConflict: run(compatible, "evaluation:no-conflict"), run });
}
