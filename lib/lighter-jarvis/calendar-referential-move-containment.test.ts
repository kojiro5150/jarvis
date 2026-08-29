import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "./chat-handler";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("Calendar referential move containment", () => {
  it("freezes the live JARVIS TEST failure: an unbound 'move it' never reaches the ordinary model or writes", async () => {
    const model = vi.fn(async () => "Project Atlas review at 3:00 PM");
    const createReadConnector = vi.fn();
    const createWriteConnector = vi.fn();
    const handler = createLighterChatHandler(
      model,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        createReadConnector,
        createWriteConnector,
        hasWriteScope: vi.fn(async () => true),
        clock: () => new Date("2026-08-29T13:00:00.000Z"),
      },
    );

    const response = await handler(request({
      specialistId: "jarvis",
      messages: [
        { role: "user", content: "When is my next Jarvis test?" },
        { role: "assistant", content: "Please explicitly confirm that I may read your Calendar." },
        { role: "user", content: "Yes." },
        { role: "assistant", content: "Calendar factual result:\n- JARVIS TEST — Sat, 29 Aug, 11:30 PM–12:30 AM" },
        { role: "user", content: "Move it to tomorrow at 10 a.m." },
      ],
    }));

    expect(await response.json()).toEqual({
      reply: "I can't safely bind that referential Calendar change to a governed event yet. No Calendar write was attempted.",
      specialistId: "jarvis",
      execution: "none",
      calendarConflictAct: { status: "unbound_reference" },
    });
    expect(model).not.toHaveBeenCalled();
    expect(createReadConnector).not.toHaveBeenCalled();
    expect(createWriteConnector).not.toHaveBeenCalled();
  });

  it.each([
    "Move it to tomorrow at 10 a.m.",
    "Reschedule that to tomorrow at 10 a.m.",
    "Shift this to tomorrow at 10 a.m.",
    "Change it to tomorrow at 10 a.m.",
  ])("fails closed for referential Calendar mutation wording: %s", async (utterance) => {
    const model = vi.fn(async () => "must not run");
    const handler = createLighterChatHandler(model);
    const response = await handler(request({
      specialistId: "jarvis",
      messages: [
        { role: "assistant", content: "Calendar factual result:\n- JARVIS TEST — Sat, 29 Aug, 11:30 PM–12:30 AM" },
        { role: "user", content: utterance },
      ],
    }));
    expect((await response.json()).calendarConflictAct).toEqual({ status: "unbound_reference" });
    expect(model).not.toHaveBeenCalled();
  });
});
