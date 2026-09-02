import { describe, expect, it, vi } from "vitest";
import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import {
  isDurableContinuityRecallRequest,
  MODEL_CONTINUITY_NO_RELEVANT_REPLY,
  MODEL_CONTINUITY_UNAVAILABLE_REPLY,
  resolveProductionModelContinuityRecall,
} from "./production-model-continuity";

function projectedMany(count: number): Extract<DurablePurposeProjectionResult, { status: "projected" }> {
  const items = Array.from({ length: count }, (_, index) => Object.freeze({
    recordId: `record:user:${index + 1}`,
    versionId: `version:user:${index + 1}`,
    purpose: "conversation",
    semanticClass: "user_assertion" as const,
    lifecycle: "current" as const,
    recoveryDisposition: "recoverable_user_continuity" as const,
    subject: Object.freeze({
      namespace: "user",
      entity: "product_gap",
      attribute: `gap_${index + 1}`,
      revision: "append_only" as const,
    }),
    payload: Object.freeze({ statement: `JARVIS product gap ${index + 1}` }),
    visibilityPurposes: Object.freeze(["conversation"]),
    validFrom: null,
    validUntil: null,
    staleAfter: null,
    authorshipSource: "user" as const,
    authorshipAt: "2026-09-01T10:00:00.000Z",
  }));

  return Object.freeze({
    status: "projected",
    purpose: "conversation",
    items: Object.freeze(items),
    decisions: Object.freeze(items.map(item => Object.freeze({
      recordId: item.recordId,
      headVersionId: item.versionId,
      status: "admitted" as const,
    }))),
  });
}

function projected(): Extract<DurablePurposeProjectionResult, { status: "projected" }> {
  return Object.freeze({
    status: "projected",
    purpose: "conversation",
    items: Object.freeze([
      Object.freeze({
        recordId: "record:user:1",
        versionId: "version:user:1",
        purpose: "conversation",
        semanticClass: "preference",
        lifecycle: "current",
        recoveryDisposition: "recoverable_user_continuity",
        subject: Object.freeze({
          namespace: "user",
          entity: "preference",
          attribute: "status_updates",
          revision: "explicit_replacement",
        }),
        payload: Object.freeze({ statement: "I prefer short status updates." }),
        visibilityPurposes: Object.freeze(["conversation"]),
        validFrom: null,
        validUntil: null,
        staleAfter: null,
        authorshipSource: "user",
        authorshipAt: "2026-08-30T10:00:00.000Z",
      }),
    ]),
    decisions: Object.freeze([
      Object.freeze({
        recordId: "record:user:1",
        headVersionId: "version:user:1",
        status: "admitted",
      }),
    ]),
  });
}

describe("production durable continuity recall adapter", () => {
  it.each([
    "What do you remember about status updates?",
    "What have I told you about status updates?",
    "Show me what you remember about status updates.",
    "Do you remember what I said about status updates?",
    "Show me everything you remember about JARVIS product gaps.",
  ])("recognizes only explicit durable recall forms: %s", (utterance) => {
    expect(isDurableContinuityRecallRequest(utterance)).toBe(true);
  });

  it.each([
    "Remember this.",
    "What do you remember?",
    "Tell me about status updates.",
    "What's on my calendar?",
    "What did that email say?",
  ])("does not widen recall routing: %s", (utterance) => {
    expect(isDurableContinuityRecallRequest(utterance)).toBe(false);
  });

  it("runs the bounded projection→assessment→resolution→render path for relevant continuity", async () => {
    const retrieveProjection = vi.fn(async () => projected());
    const model = vi.fn(async (_prompt: string, _messages: { role: "user" | "assistant"; content: string }[]) =>
      '{"responseType":"continuity_relevance","relevance":"relevant","relevantItemIds":["continuity:1"]}');
    const createContinuityModelCall = vi.fn(() => model);

    const result = await resolveProductionModelContinuityRecall({
      utterance: "What do you remember about status updates?",
      dependencies: { retrieveProjection, createContinuityModelCall },
    });

    expect(result).toEqual({
      handled: true,
      status: "rendered",
      reply: [
        "Relevant remembered context:",
        '- You previously stated a preference: {"statement":"I prefer short status updates."}',
      ].join("\n"),
    });

    expect(retrieveProjection).toHaveBeenCalledTimes(1);
    expect(model).toHaveBeenCalledTimes(1);

    expect(createContinuityModelCall).toHaveBeenCalledWith(["continuity:1"] as const);
    const serializedModelPayload = JSON.stringify(model.mock.calls[0]?.[1]);
    expect(serializedModelPayload).not.toContain("record:user:1");
    expect(serializedModelPayload).not.toContain("version:user:1");
  });

  it("enumerates every current durable JARVIS product-gap record without model relevance selection", async () => {
    const projection = projectedMany(13);
    const createContinuityModelCall = vi.fn();

    const result = await resolveProductionModelContinuityRecall({
      utterance: "Show me everything you remember about JARVIS product gaps.",
      dependencies: {
        retrieveProjection: async () => projection,
        createContinuityModelCall,
      },
    });

    expect(result.status).toBe("rendered");
    expect(createContinuityModelCall).not.toHaveBeenCalled();
    if (result.status === "rendered") {
      expect(result.reply).toContain("Stored JARVIS product gaps (13):");
      expect(result.reply).toContain("1. JARVIS product gap 1");
      expect(result.reply).toContain("13. JARVIS product gap 13");
    }
  });

  it("recalls continuity beyond the single-context item limit by using bounded relevance chunks", async () => {
    const createContinuityModelCall = vi.fn((allowedContinuityIds: readonly string[]) =>
      vi.fn(async () => JSON.stringify({
        responseType: "continuity_relevance",
        relevance: "relevant",
        relevantItemIds: allowedContinuityIds,
      })));

    const result = await resolveProductionModelContinuityRecall({
      utterance: "What do you remember about JARVIS product gaps?",
      dependencies: {
        retrieveProjection: async () => projectedMany(13),
        createContinuityModelCall,
      },
    });

    expect(result.status).toBe("rendered");
    expect(createContinuityModelCall).toHaveBeenCalledTimes(2);
    expect(createContinuityModelCall.mock.calls[0]?.[0]).toHaveLength(12);
    expect(createContinuityModelCall.mock.calls[1]?.[0]).toHaveLength(1);

    if (result.status === "rendered") {
      expect(result.reply).toContain('{"statement":"JARVIS product gap 1"}');
      expect(result.reply).toContain('{"statement":"JARVIS product gap 13"}');
      expect(result.reply.match(/Relevant remembered context:/g)).toHaveLength(1);
    }
  });

  it("returns deterministic no-relevant continuity without a model call for an empty projection", async () => {
    const retrieveProjection = vi.fn(async (): Promise<DurablePurposeProjectionResult> =>
      Object.freeze({
        status: "empty",
        purpose: "conversation",
        items: Object.freeze([]) as readonly [],
        decisions: Object.freeze([]),
      }));
    const model = vi.fn();
    const createContinuityModelCall = vi.fn(() => model);

    expect(await resolveProductionModelContinuityRecall({
      utterance: "What do you remember about status updates?",
      dependencies: { retrieveProjection, createContinuityModelCall },
    })).toEqual({
      handled: true,
      status: "not_relevant",
      reply: MODEL_CONTINUITY_NO_RELEVANT_REPLY,
    });

    expect(createContinuityModelCall).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  it("returns deterministic no-relevant continuity when the closed model assessment says not relevant", async () => {
    const model = vi.fn(async () =>
      '{"responseType":"continuity_relevance","relevance":"not_relevant","relevantItemIds":[]}');

    expect(await resolveProductionModelContinuityRecall({
      utterance: "What do you remember about status updates?",
      dependencies: {
        retrieveProjection: async () => projected(),
        createContinuityModelCall: () => model,
      },
    })).toEqual({
      handled: true,
      status: "not_relevant",
      reply: MODEL_CONTINUITY_NO_RELEVANT_REPLY,
    });
  });

  it.each([
    "not json",
    '{"responseType":"continuity_relevance","relevance":"relevant","relevantItemIds":["continuity:99"]}',
    '{"responseType":"continuity_relevance","relevance":"relevant","relevantItemIds":["continuity:1"],"summary":"invented"}',
  ])("fails closed for invalid model output: %s", async (output) => {
    const model = vi.fn(async () => output);

    expect(await resolveProductionModelContinuityRecall({
      utterance: "What do you remember about status updates?",
      dependencies: {
        retrieveProjection: async () => projected(),
        createContinuityModelCall: () => model,
      },
    })).toEqual({
      handled: true,
      status: "unavailable",
      reply: MODEL_CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: "assessment_model_invalid",
    });

    expect(model).toHaveBeenCalledTimes(1);
  });

  it("fails closed rather than falling back to model-authored memory if persistence retrieval fails", async () => {
    const model = vi.fn();
    const createContinuityModelCall = vi.fn(() => model);

    expect(await resolveProductionModelContinuityRecall({
      utterance: "What do you remember about status updates?",
      dependencies: {
        retrieveProjection: async () => {
          throw new Error("database unavailable");
        },
        createContinuityModelCall,
      },
    })).toEqual({
      handled: true,
      status: "unavailable",
      reply: MODEL_CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: "projection_exception",
    });

    expect(createContinuityModelCall).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  it("classifies a rejected durable projection without widening the user-facing reply", async () => {
    expect(await resolveProductionModelContinuityRecall({
      utterance: "What do you remember about status updates?",
      dependencies: {
        retrieveProjection: async () => Object.freeze({
          status: "rejected",
          purpose: "conversation",
          reason: "persistence_unavailable",
        }),
      },
    })).toEqual({
      handled: true,
      status: "unavailable",
      reply: MODEL_CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: "context_projection_not_available",
    });
  });

  it("does nothing for ordinary conversation", async () => {
    const retrieveProjection = vi.fn();
    const model = vi.fn();
    const createContinuityModelCall = vi.fn(() => model);

    expect(await resolveProductionModelContinuityRecall({
      utterance: "Help me think through this decision.",
      dependencies: { retrieveProjection, createContinuityModelCall },
    })).toEqual({
      handled: false,
      status: "unsupported",
    });

    expect(retrieveProjection).not.toHaveBeenCalled();
    expect(createContinuityModelCall).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });

  it("production source uses only the verified durable purpose projection before model continuity", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/operating-picture/production-model-continuity.ts", "utf8"));

    expect(source).toContain("retrieveDurableOperatingPictureForPurpose");
    expect(source).toContain("MODEL_CONTINUITY_PURPOSE");
    expect(source).toContain("createSupabaseOperatingPicturePersistence");
    expect(source).not.toContain("getVersion(");
    expect(source).not.toContain("getHeadVersion(");
    expect(source).not.toContain("listRecordVersions(");
    expect(source).not.toContain("appendVersion(");
  });
});
