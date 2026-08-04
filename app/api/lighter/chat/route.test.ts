import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "./route";
import type { ChatMessage } from "@/lib/agents/types";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
});

describe("POST /api/lighter/chat", () => {
  it("invokes an active specialist with its governed prompt", async () => {
    const model = vi.fn(async (_systemPrompt: string, _messages: ChatMessage[]) => "A researched response");
    const response = await createLighterChatHandler(model)(request({
      specialistId: "oracle", messages: [{ role: "user", content: "Research this" }],
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reply: "A researched response", specialistId: "oracle", execution: "none" });
    expect(model.mock.calls[0][0]).toContain("Mark every substantive claim as Sourced");
  });

  it("rejects excluded and unknown specialists", async () => {
    const response = await createLighterChatHandler(vi.fn())(request({ specialistId: "phdss", messages: [{ role: "user", content: "Decide" }] }));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Unknown or inactive specialist." });
  });

  it("rejects malformed messages before model invocation", async () => {
    const model = vi.fn();
    const response = await createLighterChatHandler(model)(request({ specialistId: "herald", messages: [] }));
    expect(response.status).toBe(400);
    expect(model).not.toHaveBeenCalled();
  });
});
