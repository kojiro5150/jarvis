import { lineageIdentity } from "./lineage-types";
import type { EntityIdentificationCandidate, EntityIdentificationEvaluation, EntityIdentificationRuleset } from "./entity-identification-types";
import type { GovernedCommunicationEvidenceInput } from "./projection-composer";

const freeze = <T>(value: T): Readonly<T> => Object.freeze(structuredClone(value));

export function constructEntityIdentificationCandidate(
  evidence: GovernedCommunicationEvidenceInput,
  displayReference: string,
  normalizedMatchValue: string,
  matchingBasis: EntityIdentificationCandidate["matchingBasis"],
): EntityIdentificationCandidate {
  const body = {
    entityKind: "person" as const,
    displayReference,
    normalizedMatchValue,
    sourceReference: evidence.sourceReference,
    sourceOwner: evidence.sourceReference.sourceId,
    provenanceReference: evidence.provenanceReference,
    evidenceReference: evidence.communicationReference,
    matchingBasis,
  };
  return freeze({ candidateId: lineageIdentity("entity-identification-candidate", body), ...body });
}

export function constructEntityIdentificationEvaluation(
  body: Omit<EntityIdentificationEvaluation, "entityIdentificationEvaluationId" | "resolvedEntityReference">,
): EntityIdentificationEvaluation {
  const identityBody = freeze(body);
  const entityIdentificationEvaluationId = lineageIdentity("entity-identification-evaluation", identityBody);
  const resolvedEntityReference = body.outcome === "resolved"
    ? lineageIdentity("exchange-scoped-resolved-entity", {
      exchangeId: body.exchangeId,
      entityIdentificationEvaluationId,
      entityIdentificationRulesetId: body.entityIdentificationRulesetId,
      unresolvedEntityReference: body.unresolvedEntityReference,
      resolvedCandidateReference: body.resolvedCandidateReference,
    })
    : undefined;
  return freeze({ ...identityBody, entityIdentificationEvaluationId, ...(resolvedEntityReference ? { resolvedEntityReference } : {}) });
}

export function assertDistinctPublicationIdentities(
  ruleset: EntityIdentificationRuleset,
  evaluation: EntityIdentificationEvaluation,
): void {
  const identities = [ruleset.entityIdentificationRulesetId, evaluation.entityIdentificationEvaluationId, ...evaluation.candidateReferences, ...(evaluation.resolvedEntityReference ? [evaluation.resolvedEntityReference] : [])];
  if (new Set(identities).size !== identities.length) throw new Error("entity-identification publication identities must be distinct");
}
