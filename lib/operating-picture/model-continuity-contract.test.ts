import { describe, expect, it } from "vitest";
import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import {
  buildModelContinuityContext,
  MODEL_CONTINUITY_PURPOSE,
  parseAndValidateModelContinuityAssessment,
  validateModelContinuityAssessment,
  type ModelContinuityId,
} from "./model-continuity-contract";

function projected(
  overrides: Partial<Extract<DurablePurposeProjectionResult, { status: "projected" }>> = {},
): Extract<DurablePurposeProjectionResult, { status: "projected" }> {
  return Object.freeze({
    status: "projected",
    purpose: MODEL_CONTINUITY_PURPOSE,
    items: Object.freeze([
      Object.freeze({
        recordId: "record:user:1",
        versionId: "version:user:1",
        purpose: MODEL_CONTINUITY_PURPOSE,
        semanticClass: "user_assertion",
        lifecycle: "current",
        recoveryDisposition: "recoverable_user_continuity",
        subject: Object.freeze({
          namespace: "user",
          entity: "preference",
          attribute: "working_style",
          revision: "explicit_replacement",
        }),
        payload: Object.freeze({ statement: "I prefer short status updates." }),
        visibilityPurposes: Object.freeze([MODEL_CONTINUITY_PURPOSE]),
        validFrom: null,
        validUntil: null,
        staleAfter: null,
        authorshipSource: "user",
        authorshipAt: "2026-08-30T10:00:00.000Z",
      }),
      Object.freeze({
        recordId: "record:model:1",
        versionId: "version:model:1",
        purpose: MODEL_CONTINUITY_PURPOSE,
        semanticClass: "open_question",
        lifecycle: "current",
        recoveryDisposition: "recoverable_model_continuity",
        subject: Object.freeze({
          namespace: "model",
          entity: "question",
          attribute: "next_step",
          revision: "append_only",
        }),
        payload: "Whether the next step should be tested live.",
        visibilityPurposes: Object.freeze([MODEL_CONTINUITY_PURPOSE]),
        validFrom: null,
        validUntil: null,
        staleAfter: null,
        authorshipSource: "model",
        authorshipAt: "2026-08-30T10:01:00.000Z",
      }),
    ]),
    decisions: Object.freeze([]),
    ...overrides,
  });
}

describe("narrow model-facing continuity contract", () => {
  it("projects only low-trust semantic continuity with opaque model IDs", () => {
    const result = buildModelContinuityContext(projected());
    expect(result.status).toBe("ready");
    if (result.status !== "ready") throw new Error("expected ready");

    expect(result.context).toEqual({
      purpose: "conversation",
      items: [
        {
          continuityId: "continuity:1",
          semanticClass: "user_assertion",
          recoveryDisposition: "recoverable_user_continuity",
          value: { statement: "I prefer short status updates." },
        },
        {
          continuityId: "continuity:2",
          semanticClass: "open_question",
          recoveryDisposition: "recoverable_model_continuity",
          value: "Whether the next step should be tested live.",
        },
      ],
    });

    expect(result.bindings).toEqual([
      {
        continuityId: "continuity:1",
        recordId: "record:user:1",
        versionId: "version:user:1",
      },
      {
        continuityId: "continuity:2",
        recordId: "record:model:1",
        versionId: "version:model:1",
      },
    ]);

    const serializedModelContext = JSON.stringify(result.context);
    for (const forbidden of [
      "record:user:1",
      "version:user:1",
      "record:model:1",
      "version:model:1",
      "subject",
      "visibilityPurposes",
      "authorshipSource",
      "validFrom",
      "staleAfter",
    ]) {
      expect(serializedModelContext).not.toContain(forbidden);
    }
  });

  it("does not admit a projection for any purpose other than conversation", () => {
    expect(buildModelContinuityContext(projected({ purpose: "planning" }))).toEqual({
      status: "rejected",
      reason: "wrong_purpose",
    });
  });

  it("does not invoke a model when the admitted conversation projection is empty", () => {
    const empty: DurablePurposeProjectionResult = Object.freeze({
      status: "empty",
      purpose: MODEL_CONTINUITY_PURPOSE,
      items: Object.freeze([]) as readonly [],
      decisions: Object.freeze([]),
    });

    expect(buildModelContinuityContext(empty)).toEqual({
      status: "empty",
      purpose: "conversation",
    });
  });

  it("fails closed if an item no longer satisfies semantic/recovery/authorship integrity", () => {
    const invalid = projected({
      items: Object.freeze([
        Object.freeze({
          ...projected().items[0],
          semanticClass: "fact",
        }),
      ]),
    });

    expect(buildModelContinuityContext(invalid)).toEqual({
      status: "rejected",
      reason: "projection_integrity_failure",
    });
  });

  it("fails closed rather than truncating an over-broad projection", () => {
    const base = projected().items[0];
    const items = Object.freeze(Array.from({ length: 13 }, (_, index) =>
      Object.freeze({
        ...base,
        recordId: `record:${index}`,
        versionId: `version:${index}`,
      })));

    expect(buildModelContinuityContext(projected({ items }))).toEqual({
      status: "rejected",
      reason: "context_scope_exceeded",
    });
  });

  it("accepts only the exact closed relevance response", () => {
    const allowed = ["continuity:1", "continuity:2"] as const satisfies readonly ModelContinuityId[];

    expect(validateModelContinuityAssessment({
      responseType: "continuity_relevance",
      relevance: "relevant",
      relevantItemIds: ["continuity:2"],
    }, allowed)).toEqual({
      status: "valid",
      assessment: {
        responseType: "continuity_relevance",
        relevance: "relevant",
        relevantItemIds: ["continuity:2"],
      },
    });

    expect(validateModelContinuityAssessment({
      responseType: "continuity_relevance",
      relevance: "not_relevant",
      relevantItemIds: [],
    }, allowed)).toEqual({
      status: "valid",
      assessment: {
        responseType: "continuity_relevance",
        relevance: "not_relevant",
        relevantItemIds: [],
      },
    });
  });

  it.each([
    ["free-form narrative", "This seems relevant because the user prefers concise replies."],
    ["markdown-wrapped JSON", "```json\\n{\\\"responseType\\\":\\\"continuity_relevance\\\",\\\"relevance\\\":\\\"relevant\\\",\\\"relevantItemIds\\\":[\\\"continuity:1\\\"]}\\n```"],
    ["extra field", '{"responseType":"continuity_relevance","relevance":"relevant","relevantItemIds":["continuity:1"],"summary":"concise"}'],
    ["unknown vocabulary", '{"responseType":"continuity_relevance","relevance":"maybe","relevantItemIds":["continuity:1"]}'],
    ["unknown continuity ID", '{"responseType":"continuity_relevance","relevance":"relevant","relevantItemIds":["continuity:99"]}'],
    ["duplicate continuity ID", '{"responseType":"continuity_relevance","relevance":"relevant","relevantItemIds":["continuity:1","continuity:1"]}'],
    ["relevant without IDs", '{"responseType":"continuity_relevance","relevance":"relevant","relevantItemIds":[]}'],
    ["not relevant with IDs", '{"responseType":"continuity_relevance","relevance":"not_relevant","relevantItemIds":["continuity:1"]}'],
  ])("rejects %s without repair or interpretation", (_label, output) => {
    const allowed = ["continuity:1", "continuity:2"] as const satisfies readonly ModelContinuityId[];
    expect(parseAndValidateModelContinuityAssessment(output, allowed)).toEqual({
      status: "invalid",
    });
  });

  it("contains no model invocation, durable-store retrieval or trust promotion machinery", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/operating-picture/model-continuity-contract.ts", "utf8"));

    for (const forbidden of [
      "Anthropic",
      "messages.create",
      "callModel",
      "DurableOperatingPictureStore",
      "retrieveDurableOperatingPicture",
      "GovernedEvidence",
      "AuthorityEvidence",
      "CompletionProof",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
