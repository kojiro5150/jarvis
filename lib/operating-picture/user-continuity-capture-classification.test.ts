import { describe, expect, it, vi } from "vitest";

import {
  classifyExplicitUserContinuityCapture,
  USER_CONTINUITY_CAPTURE_CLASSIFICATION_PROMPT,
} from "./user-continuity-capture-classification";
import {
  parseExplicitUserContinuityCaptureRequest,
} from "./user-continuity-capture-contract";

function request(utterance: string) {
  const parsed = parseExplicitUserContinuityCaptureRequest(utterance);
  if (parsed.status !== "matched") throw new Error("expected matched capture request");
  return parsed.request;
}

describe("bounded explicit user continuity capture classification", () => {
  it("classifies one closed semantic class without altering the supplied statement", async () => {
    const callModel = vi.fn(async (_systemPrompt: string, messages: { content: string }[]) => {
      expect(JSON.parse(messages[0].content)).toEqual({
        statement: "I prefer short status updates.",
      });
      return JSON.stringify({
        responseType: "user_continuity_capture_classification",
        status: "classified",
        semanticClass: "preference",
      });
    });

    expect(await classifyExplicitUserContinuityCapture({
      request: request("Remember that I prefer short status updates."),
      callModel,
    })).toEqual({
      status: "classified",
      classification: {
        responseType: "user_continuity_capture_classification",
        status: "classified",
        semanticClass: "preference",
      },
    });

    expect(callModel).toHaveBeenCalledOnce();
    expect(callModel.mock.calls[0][0]).toBe(USER_CONTINUITY_CAPTURE_CLASSIFICATION_PROMPT);
  });

  it("accepts ambiguity as a valid non-committal classification instead of coercing a class", async () => {
    const callModel = vi.fn(async () => JSON.stringify({
      responseType: "user_continuity_capture_classification",
      status: "ambiguous",
      semanticClass: null,
    }));

    expect(await classifyExplicitUserContinuityCapture({
      request: request("Remember that we should probably do X."),
      callModel,
    })).toEqual({
      status: "classified",
      classification: {
        responseType: "user_continuity_capture_classification",
        status: "ambiguous",
        semanticClass: null,
      },
    });
  });

  it.each([
    ["fact promotion", {
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass: "fact",
    }],
    ["ambiguous with guessed class", {
      responseType: "user_continuity_capture_classification",
      status: "ambiguous",
      semanticClass: "plan",
    }],
    ["extra rewritten statement", {
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass: "preference",
      statement: "The user prefers concise updates.",
    }],
    ["extra rationale", {
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass: "preference",
      rationale: "Sounds like a preference.",
    }],
  ])("fails closed on %s", async (_label, raw) => {
    const callModel = vi.fn(async () => JSON.stringify(raw));

    expect(await classifyExplicitUserContinuityCapture({
      request: request("Remember that I prefer short status updates."),
      callModel,
    })).toEqual({
      status: "model_invalid",
    });
  });

  it("fails closed on malformed model output", async () => {
    const callModel = vi.fn(async () => "preference");

    expect(await classifyExplicitUserContinuityCapture({
      request: request("Remember that I prefer short status updates."),
      callModel,
    })).toEqual({
      status: "model_invalid",
    });
  });

  it("distinguishes provider failure from invalid classification", async () => {
    const callModel = vi.fn(async () => {
      throw new Error("provider unavailable");
    });

    expect(await classifyExplicitUserContinuityCapture({
      request: request("Remember that I prefer short status updates."),
      callModel,
    })).toEqual({
      status: "model_failed",
    });
  });

  it("contains no capture-intent decision, persistence, record construction, or authority machinery", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/operating-picture/user-continuity-capture-classification.ts", "utf8"));

    for (const forbidden of [
      "CAPTURE_PATTERNS",
      "parseExplicitUserContinuityCaptureRequest(",
      "createSupabaseOperatingPicturePersistence",
      "appendVersion",
      "persistUserContinuityCaptureCandidate",
      "createPreferenceRecord",
      "createInitialOperatingPictureRecordVersion",
      "GovernedEvidence",
      "AuthorityEvidence",
      "CompletionProof",
      "chat-handler",
      "/api/lighter/chat",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
