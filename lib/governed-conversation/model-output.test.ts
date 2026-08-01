import { describe, expect, it } from "vitest";
import { cassieFixture, gmailRef, snippetOnlyFixture } from "./fixtures";
import { parseGovernedModelOutput } from "./model-output";

const ref = `${gmailRef.sourceId}:${gmailRef.resourceId}:${gmailRef.field}`;
const interpretation = { ownership: "model_interpretation", claimIds: ["contact"], text: "The governed address shown for Cassie is cassie@example.invalid.", evidenceReferences: [ref], uncertaintyReferences: [] };
const parse = (value: unknown) => parseGovernedModelOutput(JSON.stringify(value), cassieFixture.input);

describe("governed model output parser", () => {
  it("accepts the closed model-owned schema", () => expect(parse({ interpretation })).toMatchObject({ ok: true }));
  it.each([
    ["malformed JSON", "not-json", "INVALID_JSON"],
    ["unknown fields/model facts", JSON.stringify({ observedFacts: [] }), "UNKNOWN_FIELD"],
    ["unknown claim", JSON.stringify({ interpretation: { ...interpretation, claimIds: ["invented"] } }), "UNKNOWN_CLAIM"],
    ["unknown source", JSON.stringify({ interpretation: { ...interpretation, evidenceReferences: ["fake:source:field"] } }), "UNKNOWN_SOURCE"],
    ["invented fact", JSON.stringify({ interpretation: { ...interpretation, text: "Cassie is at invented@example.invalid." } }), "INVENTED_FACT"],
    ["heuristic laundering", JSON.stringify({ interpretation: { ...interpretation, text: "This is important because it is unread." } }), "HEURISTIC_LAUNDERING"],
    ["authority violation", JSON.stringify({ advisoryNextSteps: [{ ownership: "model_advisory", nonAuthoritative: true, kind: "review_consideration", claimIds: ["contact"], text: "You must approve this.", evidenceReferences: [ref] }] }), "AUTHORITY_VIOLATION"],
    ["invalid advice marker", JSON.stringify({ advisoryNextSteps: [{ ownership: "model_advisory", nonAuthoritative: false, kind: "clarification", claimIds: ["contact"], text: "Consider asking.", evidenceReferences: [ref] }] }), "INVALID_ADVISORY_AUTHORITY"],
    ["prior assistant evidence", JSON.stringify({ interpretation: { ...interpretation, evidenceReferences: ["turn:assistant"] } }), "PRIOR_ASSISTANT_EVIDENCE"],
    ["status upgrade", JSON.stringify({ interpretation: { ...interpretation, claimIds: ["importance"], text: "The claim is established.", evidenceReferences: [], uncertaintyReferences: [] } }), "STATUS_OVERRIDDEN"],
  ])("rejects %s", (_name, raw, code) => {
    const result = parseGovernedModelOutput(raw, cassieFixture.input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failures.map((failure) => failure.code)).toContain(code);
  });
  it("rejects snippet-to-full-content certainty", () => {
    const result = parseGovernedModelOutput(JSON.stringify({ interpretation: { ...interpretation, text: "The full message confirms this." } }), snippetOnlyFixture.input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failures.map((failure) => failure.code)).toContain("CONTENT_SCOPE_VIOLATION");
  });
});
