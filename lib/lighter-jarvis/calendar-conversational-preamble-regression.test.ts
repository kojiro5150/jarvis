import { describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";

function request(utterance: string) {
  return new Request("http://localhost/api/lighter/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      specialistId: "jarvis",
      messages: [{ role: "user", content: utterance }],
    }),
  });
}

describe("Calendar conversational preamble regression", () => {
  it.each([
    "morning Jarvis, what's on for today?",
    "morning Jarvis. What's on for today?",
  ])("routes the exact field utterance to governed Calendar ASK instead of ordinary-model fallback: %s", async (utterance) => {
    const model = vi.fn();
    const calendarConnector = vi.fn();
    const handler = createLighterChatHandler(model, {
      createConnector: calendarConnector,
      clock: () => new Date("2026-09-02T02:05:00.000Z"),
    });

    const response = await handler(request(utterance));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      reply: "Please explicitly confirm that I may read your Calendar.",
      specialistId: "jarvis",
      execution: "none",
      calendarAuthority: {
        decision: "ASK",
        reason: "explicit_calendar_read_not_established",
      },
      pendingAuthorizationReference: {
        pendingAuthorizationId: expect.any(String),
      },
    });
    expect(calendarConnector).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();
  });
});
