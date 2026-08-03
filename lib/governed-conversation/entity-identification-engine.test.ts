import { describe, expect, it } from "vitest";
import { canonicalEntityIdentificationEvaluation, identifyGovernedEntity } from "./entity-identification-engine";
import { assembledEntityIdentificationEvidence, entityIdentificationInput, evidenceWithDisplay, realCassieParameter } from "./entity-identification-fixtures";

describe("isolated governed Entity Identification", () => {
  it("resolves the real Claim Boundary Cassie parameter from real assembled Gmail evidence with its exact citation", async () => {
    const boundary = realCassieParameter();
    expect(boundary.parameter).toEqual({ segmentId: "segment:1", name: "personName", value: "Cassie" });
    const assembled = await assembledEntityIdentificationEvidence(["Cassie Kozyrkov"]);
    const evidence = assembled.communicationEvidence[0];
    expect(evidence.senderDisplayName).toBe("Cassie Kozyrkov");

    const result = identifyGovernedEntity(entityIdentificationInput(assembled));
    expect(result).toMatchObject({ normalizedEntityReference: "cassie", qualifyingCandidateCount: 1, outcome: "resolved", disambiguationRequired: false });
    expect(result.resolvedEntityReference).toBeTruthy();
    expect(result.resolvedCandidateReference).toBe(result.candidates[0].candidateId);
    expect(result.candidates[0]).toMatchObject({
      displayReference: "Cassie Kozyrkov",
      normalizedMatchValue: "cassie kozyrkov",
      matchingBasis: "governed_first_token_display_name_alias_match",
      evidenceReference: evidence.communicationReference,
      sourceReference: evidence.sourceReference,
      provenanceReference: evidence.provenanceReference,
    });
    expect(JSON.stringify(result)).not.toContain("person:cassie");
    // This identifies an evidence-backed exchange candidate; it does not prove the sender mailbox is a personal contact address.
  });

  it.each([
    ["Cassandra Kozyrkov", "Cassie"],
    ["Cass Kozyrkov", "Cassie"],
    ["C. Kozyrkov", "Cassie"],
    ["Cassie Kozyrkov", "Cass"],
    ["Cassie Kozyrkov", "Cas"],
    ["Cassie Kozyrkov", "Cassiopeia"],
  ])("requires exact equality, never a partial first-token comparison: %s vs %s", async (displayName, reference) => {
    const assembled = await assembledEntityIdentificationEvidence([displayName]);
    const base = entityIdentificationInput(assembled);
    const result = identifyGovernedEntity({ ...base, parameter: { ...base.parameter, value: reference } });
    expect(result).toMatchObject({ outcome: "unresolved_no_match", qualifyingCandidateCount: 0, candidateReferences: [] });
  });

  it("gives complete exact-display-name equality precedence over the first-token basis", async () => {
    const assembled = await assembledEntityIdentificationEvidence(["Cassie"]);
    const result = identifyGovernedEntity(entityIdentificationInput(assembled));
    expect(result.candidates[0].matchingBasis).toBe("exact_governed_display_name_match");
  });

  it("retains two text-identical evidence publications as separate candidates without implicit identity fusion", async () => {
    const assembled = await assembledEntityIdentificationEvidence(["Cassie Kozyrkov", "Cassie Kozyrkov"]);
    const result = identifyGovernedEntity(entityIdentificationInput(assembled));
    expect(result).toMatchObject({ qualifyingCandidateCount: 2, outcome: "ambiguous_multiple_matches", disambiguationRequired: true });
    expect(new Set(result.candidateReferences).size).toBe(2);
    expect(result.resolvedCandidateReference).toBeUndefined();
    expect(result.resolvedEntityReference).toBeUndefined();
  });

  it("publishes two distinct Cassies without choosing a winner and is invariant to evidence arrival order", async () => {
    const assembled = await assembledEntityIdentificationEvidence(["Cassie Kozyrkov", "Cassie Chen"]);
    const forward = identifyGovernedEntity(entityIdentificationInput(assembled));
    const reversed = identifyGovernedEntity(entityIdentificationInput({ ...assembled, communicationEvidence: [...assembled.communicationEvidence].reverse() }));
    expect(forward).toMatchObject({ qualifyingCandidateCount: 2, outcome: "ambiguous_multiple_matches", disambiguationRequired: true });
    expect(forward.clarificationCandidateReferences).toHaveLength(2);
    expect(forward.resolvedCandidateReference).toBeUndefined();
    expect(forward.resolvedEntityReference).toBeUndefined();
    expect(reversed).toEqual(forward);
  });

  it("distinguishes available zero-match, unavailable, and failed acquisition", async () => {
    const noMatchAssembly = await assembledEntityIdentificationEvidence(["Ada Lovelace"]);
    expect(identifyGovernedEntity(entityIdentificationInput(noMatchAssembly))).toMatchObject({ outcome: "unresolved_no_match", candidateReferences: [] });
    for (const status of ["unavailable", "failed"] as const) {
      const result = identifyGovernedEntity(entityIdentificationInput({ ...noMatchAssembly, communicationEvidence: [], sourceResults: { ...noMatchAssembly.sourceResults, gmail: { status, failureReason: `gmail_${status}` } } }));
      expect(result).toMatchObject({ outcome: "entity_source_unavailable", sourceStatus: status, qualifyingCandidateCount: 0 });
      expect(result.outcome).not.toBe("unresolved_no_match");
    }
  });

  it("fails closed when required source provenance is missing", async () => {
    const assembled = await assembledEntityIdentificationEvidence(["Cassie Kozyrkov"]);
    const invalid = { ...assembled.communicationEvidence[0], provenanceReference: "" };
    const result = identifyGovernedEntity(entityIdentificationInput({ ...assembled, communicationEvidence: [invalid] }));
    expect(result).toMatchObject({ outcome: "unresolved_no_match", qualifyingCandidateCount: 0 });
  });

  it("replays byte-identically and changes identity with candidate cardinality or exchange scope", async () => {
    const singleAssembly = await assembledEntityIdentificationEvidence(["Cassie Kozyrkov"]);
    const multipleAssembly = await assembledEntityIdentificationEvidence(["Cassie Kozyrkov", "Cassie Chen"]);
    const first = identifyGovernedEntity(entityIdentificationInput(singleAssembly));
    const replay = identifyGovernedEntity(entityIdentificationInput(singleAssembly));
    const multiple = identifyGovernedEntity(entityIdentificationInput(multipleAssembly));
    const nextExchange = identifyGovernedEntity(entityIdentificationInput(singleAssembly, { exchangeId: "exchange:entity-identification:next" }));
    expect(canonicalEntityIdentificationEvaluation(replay)).toBe(canonicalEntityIdentificationEvaluation(first));
    expect(multiple.entityIdentificationEvaluationId).not.toBe(first.entityIdentificationEvaluationId);
    expect(nextExchange.entityIdentificationEvaluationId).not.toBe(first.entityIdentificationEvaluationId);
    expect(nextExchange.resolvedEntityReference).not.toBe(first.resolvedEntityReference);
  });

  it("does not alias ruleset, evaluation, candidate, resolution, evidence, or Claim Boundary identities", async () => {
    const assembled = await assembledEntityIdentificationEvidence(["Cassie Kozyrkov"]);
    const result = identifyGovernedEntity(entityIdentificationInput(assembled));
    const candidate = result.candidates[0];
    const identities = [result.entityIdentificationRulesetId, result.entityIdentificationEvaluationId, candidate.candidateId, result.resolvedEntityReference];
    expect(new Set(identities).size).toBe(identities.length);
    expect(result.resolvedEntityReference).not.toBe(candidate.evidenceReference);
    expect(result.resolvedEntityReference).not.toBe(result.claimBoundaryEvaluationReference);
  });

  it("does not deduplicate or rank candidates after direct real-shaped evidence construction", async () => {
    const assembled = await assembledEntityIdentificationEvidence(["Cassie Kozyrkov"]);
    const first = assembled.communicationEvidence[0];
    const second = evidenceWithDisplay(first, "Cassie Chen", "second");
    const result = identifyGovernedEntity(entityIdentificationInput({ ...assembled, communicationEvidence: [first, second] }));
    expect(result.candidates.map(item => item.displayReference).sort()).toEqual(["Cassie Chen", "Cassie Kozyrkov"]);
    expect(result.candidates.every(item => !("confidence" in item) && !("rank" in item) && !("preferred" in item))).toBe(true);
  });
});
