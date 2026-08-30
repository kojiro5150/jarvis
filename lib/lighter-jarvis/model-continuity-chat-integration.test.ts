import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "./chat-handler";
import type { ChatMessage } from "../agents/types";
import type { DurablePurposeProjectionResult } from "../operating-picture/purpose-projection-retrieval";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

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

const unusedCalendarActDependencies = {
  createReadConnector: () => {
    throw new Error("calendar read must not be reached");
  },
  createWriteConnector: () => {
    throw new Error("calendar write must not be reached");
  },
  hasWriteScope: async () => false,
  clock: () => new Date("2026-08-30T10:00:00.000Z"),
};

describe("durable continuity integration in the sole chat runtime", () => {
  it("routes explicit recall through exactly one bounded continuity model call and deterministic rendering", async () => {
    const retrieveProjection = vi.fn(async () => projected());
    const model = vi.fn(async (_prompt: string, messages: ChatMessage[]) => {
      const payload = JSON.parse(messages[0]?.content ?? "{}");
      expect(payload).toMatchObject({
        question: "What do you remember about status updates?",
        continuity: {
          purpose: "conversation",
          items: [{
            continuityId: "continuity:1",
            semanticClass: "preference",
            recoveryDisposition: "recoverable_user_continuity",
          }],
        },
      });
      expect(JSON.stringify(payload)).not.toContain("record:user:1");
      expect(JSON.stringify(payload)).not.toContain("version:user:1");
      return '{"responseType":"continuity_relevance","relevance":"relevant","relevantItemIds":["continuity:1"]}';
    });

    const response = await createLighterChatHandler(
      model,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      unusedCalendarActDependencies,
      { retrieveProjection },
    )(request({
      specialistId: "jarvis",
      messages: [{
        role: "user",
        content: "What do you remember about status updates?",
      }],
    }));

    expect(await response.json()).toEqual({
      reply: [
        "Relevant remembered context:",
        '- You previously stated a preference: {"statement":"I prefer short status updates."}',
      ].join("\n"),
      specialistId: "jarvis",
      execution: "none",
      modelContinuity: { status: "rendered" },
    });

    expect(retrieveProjection).toHaveBeenCalledTimes(1);
    expect(model).toHaveBeenCalledTimes(1);
  });

  it("does not fall through to ordinary model memory when durable continuity is unavailable", async () => {
    const retrieveProjection = vi.fn(async () => {
      throw new Error("persistence unavailable");
    });
    const model = vi.fn(async () => "I remember something plausible but unverified.");

    const response = await createLighterChatHandler(
      model,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      unusedCalendarActDependencies,
      { retrieveProjection },
    )(request({
      specialistId: "jarvis",
      messages: [{
        role: "user",
        content: "What do you remember about status updates?",
      }],
    }));

    expect(await response.json()).toEqual({
      reply: "I can't safely retrieve durable continuity for that request right now.",
      specialistId: "jarvis",
      execution: "none",
      modelContinuity: { status: "unavailable" },
    });

    expect(retrieveProjection).toHaveBeenCalledTimes(1);
    expect(model).not.toHaveBeenCalled();
  });

  it("does not invoke the conversational capability selector before continuity recall", async () => {
    const retrieveProjection = vi.fn(async () => projected());
    const model = vi.fn(async (_prompt: string, _messages: ChatMessage[]) =>
      '{"responseType":"continuity_relevance","relevance":"not_relevant","relevantItemIds":[]}');

    const response = await createLighterChatHandler(
      model,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      unusedCalendarActDependencies,
      { retrieveProjection },
    )(request({
      specialistId: "jarvis",
      messages: [{
        role: "user",
        content: "Show me what you remember about the project.",
      }],
    }));

    expect(await response.json()).toEqual({
      reply: "I don't have relevant durable continuity for that request.",
      specialistId: "jarvis",
      execution: "none",
      modelContinuity: { status: "not_relevant" },
    });

    expect(model).toHaveBeenCalledTimes(1);
  });

  it("leaves ordinary conversation on the existing ordinary model path without touching durable projection", async () => {
    const retrieveProjection = vi.fn();
    const model = vi.fn(async () => "Ordinary conversation is unchanged.");

    const response = await createLighterChatHandler(
      model,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      unusedCalendarActDependencies,
      { retrieveProjection },
    )(request({
      specialistId: "jarvis",
      messages: [{
        role: "user",
        content: "Help me think through this decision.",
      }],
    }));

    expect(await response.json()).toEqual({
      reply: "Ordinary conversation is unchanged.",
      specialistId: "jarvis",
      execution: "none",
    });

    expect(retrieveProjection).not.toHaveBeenCalled();
    expect(model).toHaveBeenCalledTimes(1);
  });
});
