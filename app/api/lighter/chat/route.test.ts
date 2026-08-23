import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "@/lib/lighter-jarvis/chat-handler";
import type { ChatMessage } from "@/lib/agents/types";
import type { ClaudeResult, ClaudeTool } from "@/lib/claude";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
});

const handoffResult = (specialistId: unknown, text: string): ClaudeResult => ({
  text,
  content: [
    ...(text ? [{ type: "text", text }] : []),
    { type: "tool_use", name: "propose_handoff", input: { specialist_id: specialistId } },
  ],
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

  it("returns a validated JARVIS route from a tool call", async () => {
    const model = vi.fn(async (
      _systemPrompt: string,
      _messages: ChatMessage[],
      _tools?: ClaudeTool[],
    ) => handoffResult("dawnwatch", "I'll hand this to DAWNWATCH."));
    const response = await createLighterChatHandler(model)(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "Brief me" }],
    }));

    expect(await response.json()).toEqual({
      reply: "I'll hand this to DAWNWATCH.", specialistId: "jarvis", execution: "none", routeTo: "dawnwatch",
    });
    expect(model.mock.calls[0][2]).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "propose_handoff" }),
    ]));
  });

  it("fails closed on an invalid JARVIS handoff tool call", async () => {
    const model = vi.fn(async () => handoffResult("not-a-specialist", "I suggest a handoff."));
    const response = await createLighterChatHandler(model)(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "Do something" }],
    }));

    expect(await response.json()).toEqual({
      reply: "I suggest a handoff.", specialistId: "jarvis", execution: "none",
    });
  });

  it("supplies a non-empty fallback when a handoff tool call has no text", async () => {
    const response = await createLighterChatHandler(async () => handoffResult("dawnwatch", ""))(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "Brief me" }],
    }));

    expect(await response.json()).toEqual({
      reply: "I'd recommend handing this to DAWNWATCH.", specialistId: "jarvis", execution: "none", routeTo: "dawnwatch",
    });
  });

  it("leaves direct JARVIS and non-JARVIS replies unchanged", async () => {
    const direct = await createLighterChatHandler(async () => "Direct answer")(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "Hello" }],
    }));
    const specialist = await createLighterChatHandler(async () => handoffResult("oracle", "Text"))(request({
      specialistId: "steve", messages: [{ role: "user", content: "Hello" }],
    }));

    expect(await direct.json()).toEqual({ reply: "Direct answer", specialistId: "jarvis", execution: "none" });
    expect(await specialist.json()).toEqual({ reply: "Text", specialistId: "steve", execution: "none" });
  });

  it("relays a specialist reply through JARVIS when it is preserved verbatim", async () => {
    const specialistReply = "Recalled: The exact specialist answer.\nNothing is omitted.";
    const model = vi.fn(async (_systemPrompt: string, _messages: ChatMessage[]) => `ORACLE reports:\n\n${specialistReply}\n\nWould you like anything else?`);
    const messages: ChatMessage[] = [
      { role: "user", content: "Research this" },
      { role: "assistant", content: "I propose ORACLE." },
    ];
    const response = await createLighterChatHandler(model)(request({
      specialistId: "jarvis",
      messages,
      relaySpecialistReply: { specialistId: "oracle", reply: specialistReply },
    }));

    expect(await response.json()).toEqual({
      reply: `ORACLE reports:\n\n${specialistReply}\n\nWould you like anything else?`,
      specialistId: "jarvis",
      execution: "none",
    });
    expect(model.mock.calls[0][0]).toContain('"contract":"governed_specialist_reply"');
    expect(model.mock.calls[0][0]).toContain('"sourceSpecialistName":"ORACLE"');
    expect(model.mock.calls[0][0]).toContain(`"reply":"Recalled: The exact specialist answer.\\nNothing is omitted."`);
    expect(model.mock.calls[0][1]).toEqual(messages);
  });

  it("replaces a synthesis that fails the verbatim-preservation gate", async () => {
    const specialistReply = "First exact sentence.\nSecond exact sentence.";
    const response = await createLighterChatHandler(async () => "ORACLE says the first and second sentences.")(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Research this" }],
      relaySpecialistReply: { specialistId: "oracle", reply: specialistReply },
    }));

    expect(await response.json()).toEqual({
      reply: `ORACLE reports:\n\n${specialistReply}`,
      specialistId: "jarvis",
      execution: "none",
    });
  });

  it("rejects the relay field for a non-JARVIS request", async () => {
    const model = vi.fn();
    const response = await createLighterChatHandler(model)(request({
      specialistId: "herald",
      messages: [{ role: "user", content: "Draft this" }],
      relaySpecialistReply: { specialistId: "oracle", reply: "Research" },
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "`relaySpecialistReply` is valid only for JARVIS." });
    expect(model).not.toHaveBeenCalled();
  });

  it("rejects a malformed JARVIS relay field", async () => {
    const model = vi.fn();
    const response = await createLighterChatHandler(model)(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Research this" }],
      relaySpecialistReply: { specialistId: "inactive", reply: "Research" },
    }));

    expect(response.status).toBe(400);
    expect(model).not.toHaveBeenCalled();
  });

  it("rejects an empty specialist reply in a JARVIS relay", async () => {
    const model = vi.fn();
    const response = await createLighterChatHandler(model)(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Research this" }],
      relaySpecialistReply: { specialistId: "oracle", reply: "" },
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "`relaySpecialistReply` must contain a valid specialist id and reply." });
    expect(model).not.toHaveBeenCalled();
  });
});
