import { describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";
import type {
  ProductionUserContinuityCaptureDependencies,
} from "../operating-picture/production-user-continuity-capture";
import type {
  UserContinuityCaptureCandidate,
} from "../operating-picture/user-continuity-capture-contract";

function request(
  messages: readonly Readonly<{ role: "user" | "assistant"; content: string }>[],
  extra: Record<string, unknown> = {},
) {
  return new Request("http://localhost/api/lighter/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      specialistId: "jarvis",
      messages,
      ...extra,
    }),
  });
}

function handler(
  captureDependencies: Partial<ProductionUserContinuityCaptureDependencies>,
  model = vi.fn(),
) {
  return {
    model,
    post: createLighterChatHandler(
      model,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      captureDependencies,
    ),
  };
}

describe("sole-runtime explicit user continuity capture integration", () => {
  it("intercepts a valid explicit capture before ordinary model routing and acknowledges only after persistence", async () => {
    const persist = vi.fn(async (_candidate: UserContinuityCaptureCandidate) => ({
      status: "persisted" as const,
      recordId: "user-continuity:live-1",
      versionId: "version-live-1",
    }));
    const { post, model } = handler({
      clock: () => new Date("2026-09-01T05:45:00.000Z"),
      classify: async () => ({
        status: "classified",
        classification: {
          responseType: "user_continuity_capture_classification",
          status: "classified",
          semanticClass: "preference",
        },
      }),
      persist,
    });

    const response = await post(request([
      { role: "user", content: "Remember that I prefer short status updates." },
    ]));

    expect(await response.json()).toEqual({
      reply: "Remembered.",
      specialistId: "jarvis",
      execution: "none",
      userContinuityCapture: { status: "persisted" },
      userContinuityCaptureClarificationReference: null,
    });
    expect(model).not.toHaveBeenCalled();
    expect(persist).toHaveBeenCalledOnce();
    expect(persist.mock.calls[0][0]).toMatchObject({
      semanticClass: "preference",
      value: { statement: "I prefer short status updates." },
      authorship: { source: "user" },
    });
  });

  it("does not let an explicit capture fall through to ordinary Claude when persistence fails", async () => {
    const { post, model } = handler({
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
        status: "rejected",
        reason: "persistence_unavailable",
      }),
    });

    const response = await post(request([
      { role: "user", content: "Remember that I prefer short status updates." },
    ]));

    expect(await response.json()).toEqual({
      reply: "I couldn't safely save that.",
      specialistId: "jarvis",
      execution: "none",
      userContinuityCapture: { status: "persistence_unavailable" },
      userContinuityCaptureClarificationReference: null,
    });
    expect(model).not.toHaveBeenCalled();
  });

  it("fails closed on an unrecognised clarification turn instead of falling through to ordinary Claude", async () => {
    const persist = vi.fn();
    const { post, model } = handler({
      clock: () => new Date("2026-09-01T05:45:00.000Z"),
      classify: async () => ({
        status: "classified",
        classification: {
          responseType: "user_continuity_capture_classification",
          status: "ambiguous",
          semanticClass: null,
        },
      }),
      persist,
    });

    const first = await (await post(request([
      { role: "user", content: "Remember that we should probably do X." },
    ]))).json();

    const second = await (await post(request([
      { role: "user", content: "Remember that we should probably do X." },
      { role: "assistant", content: first.reply },
      { role: "user", content: "Actually, what is on my calendar?" },
    ], {
      userContinuityCaptureClarificationReference:
        first.userContinuityCaptureClarificationReference,
    }))).json();

    expect(second).toEqual({
      reply: "I didn't recognise that as one of the five options, so I didn't save what you asked me to remember.",
      specialistId: "jarvis",
      execution: "none",
      userContinuityCapture: { status: "clarification_unrecognised" },
      userContinuityCaptureClarificationReference: null,
    });
    expect(model).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });

  it("round-trips only an opaque clarification handle and persists the original statement on the next exact class turn", async () => {
    const persist = vi.fn(async (_candidate: UserContinuityCaptureCandidate) => ({
      status: "persisted" as const,
      recordId: "user-continuity:live-2",
      versionId: "version-live-2",
    }));
    const { post, model } = handler({
      clock: () => new Date("2026-09-01T05:45:00.000Z"),
      classify: async () => ({
        status: "classified",
        classification: {
          responseType: "user_continuity_capture_classification",
          status: "ambiguous",
          semanticClass: null,
        },
      }),
      persist,
    });

    const first = await (await post(request([
      { role: "user", content: "Remember that we should probably do X." },
    ]))).json();

    expect(first).toMatchObject({
      userContinuityCapture: { status: "clarification_required" },
      userContinuityCaptureClarificationReference: {
        userContinuityCaptureClarificationReferenceId: expect.any(String),
      },
    });
    expect(JSON.stringify(first.userContinuityCaptureClarificationReference))
      .not.toContain("we should probably do X");
    expect(persist).not.toHaveBeenCalled();

    const second = await (await post(request([
      { role: "user", content: "Remember that we should probably do X." },
      { role: "assistant", content: first.reply },
      { role: "user", content: "plan" },
    ], {
      userContinuityCaptureClarificationReference:
        first.userContinuityCaptureClarificationReference,
    }))).json();

    expect(second).toEqual({
      reply: "Remembered.",
      specialistId: "jarvis",
      execution: "none",
      userContinuityCapture: { status: "persisted" },
      userContinuityCaptureClarificationReference: null,
    });
    expect(model).not.toHaveBeenCalled();
    expect(persist).toHaveBeenCalledOnce();
    expect(persist.mock.calls[0][0]).toMatchObject({
      semanticClass: "plan",
      value: { statement: "we should probably do X." },
    });
  });
});
