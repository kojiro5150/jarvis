import { describe, expect, it, vi } from "vitest";

import {
  resolveProductionUserContinuityCapture,
  USER_CONTINUITY_CAPTURE_CLARIFICATION_REPLY,
  type ProductionUserContinuityCaptureDependencies,
} from "./production-user-continuity-capture";
import type {
  UserContinuityCaptureCandidate,
} from "./user-continuity-capture-contract";

function dependencies(overrides: Partial<ProductionUserContinuityCaptureDependencies> = {}):
ProductionUserContinuityCaptureDependencies {
  return {
    clock: () => new Date("2026-09-01T05:45:00.000Z"),
    classify: async () => ({
      status: "classified",
      classification: {
        responseType: "user_continuity_capture_classification",
        status: "classified",
        semanticClass: "preference",
      },
    }),
    persist: async () => ({
      status: "persisted",
      recordId: "user-continuity:test-1",
      versionId: "version-1",
    }),
    ...overrides,
  };
}

describe("production explicit user continuity capture", () => {
  it("persists an unambiguous explicit capture and acknowledges only after persistence succeeds", async () => {
    const persist = vi.fn(async (candidate: UserContinuityCaptureCandidate) => ({
      status: "persisted" as const,
      recordId: "user-continuity:test-1",
      versionId: "version-1",
    }));

    const result = await resolveProductionUserContinuityCapture({
      utterance: "Remember that I prefer short status updates.",
      dependencies: dependencies({ persist }),
    });

    expect(result).toEqual({
      handled: true,
      status: "persisted",
      reply: "Remembered.",
      clarificationReference: null,
    });
    expect(persist).toHaveBeenCalledOnce();
    expect(persist.mock.calls[0][0]).toMatchObject({
      semanticClass: "preference",
      value: { statement: "I prefer short status updates." },
      authorship: {
        source: "user",
        statedAt: "2026-09-01T05:45:00.000Z",
      },
      visibilityPurposes: ["conversation"],
      revisionSemantics: "append_only",
    });
  });

  it("does not claim memory when durable persistence fails", async () => {
    const result = await resolveProductionUserContinuityCapture({
      utterance: "Remember that I prefer short status updates.",
      dependencies: dependencies({
        persist: async () => ({
          status: "rejected",
          reason: "persistence_unavailable",
        }),
      }),
    });

    expect(result).toEqual({
      handled: true,
      status: "persistence_unavailable",
      reply: "I couldn't safely save that.",
      clarificationReference: null,
    });
  });

  it("does not fall through when classification is invalid or unavailable", async () => {
    for (const classify of [
      async () => ({ status: "model_invalid" as const }),
      async () => ({ status: "model_failed" as const }),
      async () => ({ status: "invalid_input" as const }),
    ]) {
      const persist = vi.fn();
      expect(await resolveProductionUserContinuityCapture({
        utterance: "Remember that I prefer short status updates.",
        dependencies: dependencies({ classify, persist }),
      })).toEqual({
        handled: true,
        status: "classification_unavailable",
        reply: "I couldn't safely classify that memory, so I didn't save it.",
        clarificationReference: null,
      });
      expect(persist).not.toHaveBeenCalled();
    }
  });

  it("creates a one-shot opaque clarification reference for genuine ambiguity", async () => {
    const persist = vi.fn();
    const result = await resolveProductionUserContinuityCapture({
      utterance: "Remember that we should probably do X.",
      dependencies: dependencies({
        classify: async () => ({
          status: "classified",
          classification: {
            responseType: "user_continuity_capture_classification",
            status: "ambiguous",
            semanticClass: null,
          },
        }),
        persist,
      }),
    });

    expect(result).toMatchObject({
      handled: true,
      status: "clarification_required",
      reply: USER_CONTINUITY_CAPTURE_CLARIFICATION_REPLY,
      clarificationReference: {
        userContinuityCaptureClarificationReferenceId: expect.any(String),
      },
    });
    expect(Object.keys(result.clarificationReference ?? {})).toEqual([
      "userContinuityCaptureClarificationReferenceId",
    ]);
    expect(JSON.stringify(result.clarificationReference)).not.toContain("we should probably do X");
    expect(persist).not.toHaveBeenCalled();
  });

  it("binds a later exact class clarification to the original statement and original timestamp", async () => {
    const first = await resolveProductionUserContinuityCapture({
      utterance: "Remember that we should probably do X.",
      dependencies: dependencies({
        classify: async () => ({
          status: "classified",
          classification: {
            responseType: "user_continuity_capture_classification",
            status: "ambiguous",
            semanticClass: null,
          },
        }),
      }),
    });
    expect(first.clarificationReference).toBeTruthy();

    const persist = vi.fn(async (_candidate: UserContinuityCaptureCandidate) => ({
      status: "persisted" as const,
      recordId: "user-continuity:test-clarified",
      versionId: "version-2",
    }));

    const second = await resolveProductionUserContinuityCapture({
      utterance: "preference",
      clarificationReference: first.clarificationReference,
      dependencies: dependencies({
        clock: () => new Date("2026-09-01T05:50:00.000Z"),
        persist,
      }),
    });

    expect(second).toEqual({
      handled: true,
      status: "persisted",
      reply: "Remembered.",
      clarificationReference: null,
    });
    expect(persist).toHaveBeenCalledOnce();
    expect(persist.mock.calls[0][0]).toMatchObject({
      semanticClass: "preference",
      value: { statement: "we should probably do X." },
      authorship: {
        source: "user",
        statedAt: "2026-09-01T05:45:00.000Z",
      },
    });
    expect(JSON.stringify(persist.mock.calls[0][0])).not.toContain('"statement":"preference"');
  });

  it("fails closed and explicitly reports loss when a one-shot clarification is not one of the five classes", async () => {
    const first = await resolveProductionUserContinuityCapture({
      utterance: "Remember that we should probably do X.",
      dependencies: dependencies({
        classify: async () => ({
          status: "classified",
          classification: {
            responseType: "user_continuity_capture_classification",
            status: "ambiguous",
            semanticClass: null,
          },
        }),
      }),
    });

    const persist = vi.fn();
    expect(await resolveProductionUserContinuityCapture({
      utterance: "Actually, what is on my calendar?",
      clarificationReference: first.clarificationReference,
      dependencies: dependencies({ persist }),
    })).toEqual({
      handled: true,
      status: "clarification_unrecognised",
      reply: "I didn't recognise that as one of the five options, so I didn't save what you asked me to remember.",
      clarificationReference: null,
    });
    expect(persist).not.toHaveBeenCalled();

    expect(await resolveProductionUserContinuityCapture({
      utterance: "preference",
      clarificationReference: first.clarificationReference,
      dependencies: dependencies({ persist }),
    })).toEqual({
      handled: false,
    });
    expect(persist).not.toHaveBeenCalled();
  });

  it("leaves ordinary conversation completely outside the capture path", async () => {
    const classify = vi.fn();
    const persist = vi.fn();

    expect(await resolveProductionUserContinuityCapture({
      utterance: "I prefer short status updates.",
      dependencies: dependencies({ classify, persist }),
    })).toEqual({
      handled: false,
    });

    expect(classify).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });
});
