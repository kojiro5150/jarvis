import { describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";
import type { ProductionUserContinuityCaptureDependencies } from "../operating-picture/production-user-continuity-capture";
import type { UserContinuityCaptureCandidate } from "../operating-picture/user-continuity-capture-contract";

function longTranscript(currentUtterance: string) {
  return [
    ...Array.from({ length: 40 }, (_, index) => ({
      role: index % 2 === 0 ? "user" as const : "assistant" as const,
      content: `historical message ${index + 1}`,
    })),
    { role: "user" as const, content: currentUtterance },
  ];
}

function request(messages: readonly Readonly<{ role: "user" | "assistant"; content: string }>[]) {
  return new Request("http://localhost/api/lighter/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      specialistId: "jarvis",
      messages,
    }),
  });
}

describe("long-session current-turn boundary", () => {
  it("lets an explicit continuity capture complete before the ordinary-model transcript cap", async () => {
    const persist = vi.fn(async (_candidate: UserContinuityCaptureCandidate) => ({
      status: "persisted" as const,
      recordId: "user-continuity:long-session",
      versionId: "version-long-session",
    }));
    const captureDependencies: Partial<ProductionUserContinuityCaptureDependencies> = {
      clock: () => new Date("2026-09-01T12:20:00.000Z"),
      classify: async () => ({
        status: "classified",
        classification: {
          responseType: "user_continuity_capture_classification",
          status: "classified",
          semanticClass: "user_assertion",
        },
      }),
      persist,
    };
    const model = vi.fn();
    const handler = createLighterChatHandler(
      model,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      captureDependencies,
    );

    const response = await handler(request(longTranscript(
      "Remember this: JARVIS product gap — long-session capture regression.",
    )));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      reply: "Remembered.",
      userContinuityCapture: { status: "persisted" },
    });
    expect(persist).toHaveBeenCalledOnce();
    expect(model).not.toHaveBeenCalled();
  });

  it("lets a supported Gmail search reach governed ASK before the ordinary-model transcript cap", async () => {
    const model = vi.fn(async () => JSON.stringify({
      kind: "capability_request",
      capability: "gmail",
      operation: "search",
      requestedOutput: "subjects",
    }));
    const handler = createLighterChatHandler(model);

    const response = await handler(request(longTranscript(
      "What are my last five emails?",
    )));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      gmailSearchAuthority: {
        decision: "ASK",
        reason: "explicit_gmail_search_not_established",
      },
      pendingAuthorizationReference: {
        pendingAuthorizationId: expect.any(String),
      },
    });
    expect(body.reply).toContain("Please explicitly confirm");
    expect(model).toHaveBeenCalledTimes(1);
  });

  it("returns the bounded unsupported Gmail action boundary before the ordinary-model transcript cap", async () => {
    const model = vi.fn();
    const handler = createLighterChatHandler(model);

    const response = await handler(request(longTranscript(
      "My inbox is cluttered. Can you create a Gmail folder for subscriptions and move all future subscription emails to there?",
    )));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      reply: "I recognized that as a Gmail action request, but a governed Gmail action path for that operation is not yet available.",
      specialistId: "jarvis",
      execution: "none",
    });
    expect(model).not.toHaveBeenCalled();
  });

  it("keeps the 40-message cap for ordinary free-form model conversation", async () => {
    const model = vi.fn();
    const handler = createLighterChatHandler(model);

    const response = await handler(request(longTranscript(
      "Help me think through this problem.",
    )));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "`messages` must contain 1-40 valid conversation messages.",
    });
    expect(model).not.toHaveBeenCalled();
  });
});
