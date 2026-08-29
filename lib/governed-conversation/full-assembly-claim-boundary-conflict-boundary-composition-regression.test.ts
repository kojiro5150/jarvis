import { constructBaseConflictEvaluableClaimSet } from "./conflict-boundary-publications";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateClaimBoundary } from "./claim-boundary-engine";
import { evaluateGovernedConversationalConflicts } from "./conflict-boundary-engine";
import { CONFLICT_EVALUATION_RULESET } from "./conflict-boundary-ruleset";
import { cassieFixture, unavailableFallbackFixture } from "./fixtures";
import { FULL_ASSEMBLY_SCENARIO_IDS, FULL_ASSEMBLY_TIME, runFullAssemblyRegressionMatrix, runFullAssemblyRegressionScenario } from "./full-assembly-claim-boundary-conflict-boundary-composition-regression";
import { invokeGovernedConversationModel } from "./model-invocation";
import { composeGovernedConversationalProjection, constructGovernedConflictSummary } from "./projection-composer";

describe("Sprint 3.102 full-assembly composition regression", () => {
  it("runs all ten mandatory/mixed/replay scenarios and reports results from runtime stages", async () => {
    const results = await runFullAssemblyRegressionMatrix();
    expect(results.map(result => result.scenarioId)).toEqual(FULL_ASSEMBLY_SCENARIO_IDS);
    expect(results.every(result => Object.values(result.stageResults).every(stage => typeof stage.passed === "boolean" && stage.evidence.length > 0))).toBe(true);
    expect(results.find(result => result.scenarioId === "single-contact-no-conflict")).toMatchObject({ passed: false, findings: [{ status: "semantic-incompatibility" }] });
  });

  it("preserves all six conflict outcomes instead of collapsing empty conflict arrays", async () => {
    const results = await runFullAssemblyRegressionMatrix();
    expect(new Set(results.map(result => result.statuses.conflictEvaluationOutcome))).toEqual(new Set(["evaluated_no_conflict", "evaluated_conflict_found", "partially_evaluated", "evaluation_unavailable", "evaluation_unsupported", "evaluation_failed"]));
    const direct = evaluateClaimBoundary({ text: "What's Cassie's email?", threadId: "t", requestId: "r", exchangeId: "e", referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME, entities: [{ entityId: "person:cassie", personName: "Cassie", displayLabel: "Cassie" }] });
    const claim = direct.claimSet!.claims[0];
    const observation = (id: string, value: string) => ({ sourcePublicationId: `p:${id}`, sourceOwnerId: `o:${id}`, sourceType: "governed_contact_observation" as const, resourceEntityId: "person:cassie", affectedClaimId: claim.claimId, comparisonKey: "resolved_contact_address", canonicalFactualValue: value, originalFactualValue: value, observedAt: FULL_ASSEMBLY_TIME, publishedAt: FULL_ASSEMBLY_TIME, provenance: id, comparisonScope: "primary", availability: "available" as const, coverage: "complete" as const, supersessionStatus: "current" as const, contentKind: "contact_address" as const, schemaVersion: "1" as const });
    const conflict = evaluateGovernedConversationalConflicts({ ruleset: CONFLICT_EVALUATION_RULESET, claimSet: constructBaseConflictEvaluableClaimSet(direct.claimSet!), observations: [observation("a", "a@example.com"), observation("b", "b@example.com")], requestedConflictClasses: ["source_value_contradiction"], referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME, evaluationDiscriminator: "direct-conflict" });
    expect(conflict.evaluation?.outcome).toBe("evaluated_conflict_found");
  });

  it("preserves unattested Memory exclusion, connector fallback truth, and partial-source independence", async () => {
    const [memory, connector, partial] = await Promise.all([runFullAssemblyRegressionScenario("legacy-memory-unattested"), runFullAssemblyRegressionScenario("connector-disconnected-local-fallback"), runFullAssemblyRegressionScenario("partial-source-failure")]);
    expect(memory.statuses.memoryPriorityCount).toBe(0);
    expect(connector.statuses.connectorAvailability).toEqual(expect.arrayContaining([expect.objectContaining({ connectorId: "gmail", availability: "unavailable", fallbackStatus: "unavailable" })]));
    expect(partial.statuses.sourceResults).toMatchObject({ gmail: { status: "unavailable" }, calendar: { status: "available" }, memoryPriority: { status: "available" }, connectorAvailability: { status: "available" } });
  });

  it("replays deterministic projection, publication, response and execution identities", async () => {
    const first = await runFullAssemblyRegressionScenario("deterministic-replay"), second = await runFullAssemblyRegressionScenario("deterministic-replay");
    expect(second.identities).toEqual(first.identities); expect(second.statuses).toEqual(first.statuses);
  });

  it("rejects claim-summary identity drift and deep conflict-owner drift after real publications", () => {
    const lineage = { threadId: "thread:mutation", requestId: "request:mutation", exchangeId: "exchange:mutation" };
    const claims = evaluateClaimBoundary({ text: "What's Cassie's email?", ...lineage, referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME, entities: [{ entityId: "person:cassie", personName: "Cassie", displayLabel: "Cassie" }] });
    const claim = claims.claimSet!.claims[0];
    const observation = (id: string, value: string) => ({ sourcePublicationId: `p:${id}`, sourceOwnerId: `o:${id}`, sourceType: "governed_contact_observation" as const, resourceEntityId: "person:cassie", affectedClaimId: claim.claimId, comparisonKey: "resolved_contact_address", canonicalFactualValue: value, originalFactualValue: value, observedAt: FULL_ASSEMBLY_TIME, publishedAt: FULL_ASSEMBLY_TIME, provenance: id, comparisonScope: "primary", availability: "available" as const, coverage: "complete" as const, supersessionStatus: "current" as const, contentKind: "contact_address" as const, schemaVersion: "1" as const });
    const conflicts = evaluateGovernedConversationalConflicts({ ruleset: CONFLICT_EVALUATION_RULESET, claimSet: constructBaseConflictEvaluableClaimSet(claims.claimSet!), observations: [observation("a", "a@example.com"), observation("b", "b@example.com")], requestedConflictClasses: ["source_value_contradiction"], referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME, evaluationDiscriminator: "mutation" });
    const base = { claimPublicationStage: "base" as const, schemaVersion: "1", evidenceRulesetId: "e", compatibilityRulesetId: "c", claimClassificationRulesetId: claims.evaluation.claimBoundaryRulesetId, claimBoundaryEvaluation: claims.evaluation, governedClaimSet: claims.claimSet!, conflictEvaluation: conflicts.evaluation, governedConflictSet: conflicts.conflictSet, ...lineage, referenceTime: FULL_ASSEMBLY_TIME, createdAt: FULL_ASSEMBLY_TIME, sourceEvidence: [], connectorAvailability: [], calendarEvidence: [], communicationEvidence: [], memoryPriorityReferences: [], compatibilityContext: [], conversationHistory: [], claims: claims.claimSet!.claims, conflicts: conflicts.conflictSet!.conflicts.map(constructGovernedConflictSummary) };
    expect(composeGovernedConversationalProjection(base).projectionId).toBeTruthy();
    expect(() => composeGovernedConversationalProjection({ ...base, claims: [{ ...claim, claimId: "claim:drift" }] })).toThrow("claim summaries do not match governed claim set");
    expect(() => composeGovernedConversationalProjection({ ...base, conflicts: [{ ...base.conflicts[0], sourceOwnerIds: ["owner:drift"] }] })).toThrow("conflict summary does not match canonical conflict set");
  });

  it("uses the unchanged model/validator boundary for bounded, laundering, certainty, and safe fallback cases", async () => {
    const ids = { attemptId: "attempt:validator", agentId: "mock", completedAt: FULL_ASSEMBLY_TIME, schemaVersion: "2", validationPolicyId: "validation/1", policyReferences: ["validation/1"] };
    const invoke = (input: typeof cassieFixture.input, value: unknown) => invokeGovernedConversationModel(input, { invoke: async () => typeof value === "string" ? value : JSON.stringify(value) }, ids);
    const valid = { interpretation: { ownership: "model_interpretation", claimIds: cassieFixture.input.claims.map(c => c.claimId), text: "Importance is unsupported.", evidenceReferences: [], uncertaintyReferences: ["importance"] } };
    expect((await invoke(cassieFixture.input, valid)).modelOutcome).toBe("accepted");
    const laundering = { ...valid, advisoryNextSteps: [{ ownership: "model_advisory", nonAuthoritative: true, kind: "review_consideration", claimIds: ["importance"], text: "Unread means important.", evidenceReferences: [] }] };
    expect((await invoke(cassieFixture.input, laundering)).modelOutcome).not.toBe("accepted");
    expect((await invoke(unavailableFallbackFixture.input as typeof cassieFixture.input, "not json")).modelOutcome).toBe("parse_failed");
  });
});

const protectedHashes: Readonly<Record<string, string>> = {
  "lib/context-builder.ts":"8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d", "lib/agents/chat-execution.ts":"a8fc170c4273b0dc9e90ec1d85dfaf98c2b4aeddbae3e38380fbe4aad3533dc7", "lib/governed-conversation/source-evidence-assembly.ts":"01eacdbabdded56745820d0e09ca1ed1ed332ae4061ee09f4cbef2fa765fa8b7", "lib/governed-conversation/gmail-evidence-acquisition-adapter.ts":"00f60c8bc636b0b7c617a53f68d4e0f42d66a07fd0273dc27db434fa07530055", "lib/governed-conversation/calendar-evidence-acquisition-adapter.ts":"4631cfcc34a3789a74391526b5ca854d7117ae59423294dc27d26d466da30ee0", "lib/governed-conversation/memory-priority-acquisition-adapter.ts":"09eda3aeb6b3f9037acfa1953354c8113a3d2ed804279d38bc9aca1fc26a784a", "lib/governed-conversation/connector-availability-acquisition-adapter.ts":"f6f7f72b5a27778d71e2ad61b3c2c3dd09c1ed597e486d7c53783c14baf8db3e", "lib/governed-conversation/gmail-evidence-publisher.ts":"58a4dcadece2d303d11d6311aafd9c9629a9f1d0a8489fd9ecbf96dfe6bdf102", "lib/governed-conversation/calendar-evidence-publisher.ts":"5a7ad289102cc527a4dfe03640c87f048ab0927d4f9df013ca46cec533afff70", "lib/governed-conversation/memory-priority-evidence-publisher.ts":"8579eafeccde1ec5d3d3b8696a5eb570b7ae5c0093fe0eb722a043895d0fa176", "lib/governed-conversation/connector-availability-publisher.ts":"1078425229522654b440115480aa6ef4d4d2065694b8eb0e60bf2f0f167c6345", "lib/governed-conversation/claim-boundary-engine.ts":"9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a", "lib/governed-conversation/conflict-boundary-engine.ts":"ea0835339911d9a3d40af38333e0f0c39295477d70e1ebc63145375c47ff6064", "lib/governed-conversation/projection-composer.ts":"51b58941273e2b6ac748ce94e54368020928a384074cd3f062bd8d9b2dcd6106", "lib/governed-conversation/evidence-status.ts":"c83ada16f09a7f5e04b4c82d937c05115ef432c9e50a860ad0b30250b3a3039e", "lib/governed-conversation/input.ts":"15cc1689ee9234259b1ef52a1e8c6c38f1dd37aa808e3edc86cdd5e82342102f", "lib/governed-conversation/model-invocation.ts":"beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac5338d2f814f5b", "lib/governed-conversation/validator.ts":"1bd9692f56ef0794f070c41ae962375bed93c953af22d393e796911e3f349fef"
};
const walk = (root: string): string[] => readdirSync(root).flatMap(name => { const path = join(root, name); return statSync(path).isDirectory() ? walk(path) : [path]; });
describe("pure-Node Sprint 3.102 isolation", () => {
  it("preserves every protected byte and keeps the evaluator out of production", () => {
    for (const [path, hash] of Object.entries(protectedHashes)) expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(hash);
    const production = [...walk("app"), ...walk("components"), ...walk("lib/agents")].filter(path => /\.[cm]?[jt]sx?$/.test(path));
    for (const path of production) expect(readFileSync(path, "utf8"), path).not.toContain("full-assembly-claim-boundary-conflict-boundary-composition-regression");
    const evaluator = readFileSync("lib/governed-conversation/full-assembly-claim-boundary-conflict-boundary-composition-regression.ts", "utf8");
    for (const forbidden of ["context-builder", "useAgentConversation", "chat-execution"]) expect(evaluator).not.toContain(forbidden);
  });
});
