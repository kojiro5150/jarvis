import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "./chat-handler";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

function connector() {
  const events = [
    {
      id: "jarvis-testing", title: "JARVIS Testing",
      start: "2026-08-29T01:00:00.000Z", end: "2026-08-29T02:00:00.000Z",
      day: "SAT", time: "11:00", source: "google" as const, calendarId: "primary", calendarName: "Work",
      timeMode: "routine" as const,
    },
    {
      id: "shopping", title: "Shopping",
      start: "2026-08-29T05:00:00.000Z", end: "2026-08-29T06:00:00.000Z",
      day: "SAT", time: "15:00", source: "google" as const, calendarId: "primary", calendarName: "Work",
      timeMode: "routine" as const,
    },
    {
      id: "barwon", title: "Barwon Health",
      start: "2026-08-30T23:00:00.000Z", end: "2026-08-31T06:00:00.000Z",
      day: "MON", time: "09:00", source: "google" as const, calendarId: "primary", calendarName: "Work",
      timeMode: "routine" as const,
    },
    {
      id: "adversarial", title: "URGENT Board Crisis — Deep Work",
      start: "2026-08-29T01:00:00.000Z", end: "2026-08-29T02:00:00.000Z",
      day: "SAT", time: "11:00", source: "google" as const, calendarId: "primary", calendarName: "Work",
      timeMode: "routine" as const,
    },
    {
      id: "interview", title: "Interview: Manager - Lived Experience Strategy & Policy",
      start: "2026-09-01T00:00:00.000Z", end: "2026-09-01T01:00:00.000Z",
      day: "TUE", time: "10:00", source: "google" as const, calendarId: "primary", calendarName: "Work",
      timeMode: "routine" as const,
    },
    {
      id: "llegc", title: "LLEGC September Meeting",
      start: "2026-09-03T08:00:00.000Z", end: "2026-09-03T09:30:00.000Z",
      day: "THU", time: "18:00", source: "google" as const, calendarId: "primary", calendarName: "Work",
      timeMode: "routine" as const,
    },
  ];
  const listBetweenWithCompleteness = vi.fn(async (start: string, end: string, limit = 100) => ({
    events,
    completeness: {
      sourceId: "google-calendar" as const, windowStart: start, windowEnd: end, requestedLimit: limit,
      targetDiscovery: "calendar_list" as const, targetCount: 1,
      targets: [{ calendarId: "primary", status: "complete" as const, returnedCount: 6, continuation: "none" as const }],
      mergedReturnedCount: 6, mergeTruncated: false, completeness: "complete" as const,
      observedAt: "2026-08-28T09:00:00.000Z",
    },
  }));
  return {
    value: { source: "google" as const, listBetween: vi.fn(), listBetweenWithCompleteness },
    listBetweenWithCompleteness,
  };
}

async function askThenConfirm(handler: ReturnType<typeof createLighterChatHandler>, utterance: string) {
  const ask = await (await handler(request({
    specialistId: "jarvis",
    messages: [{ role: "user", content: utterance }],
  }))).json();
  const allow = await (await handler(request({
    specialistId: "jarvis",
    messages: [
      { role: "user", content: utterance },
      { role: "assistant", content: ask.reply },
      { role: "user", content: "Yes." },
    ],
    pendingAuthorizationReference: ask.pendingAuthorizationReference,
  }))).json();
  return { ask, allow };
}

describe("live governed Calendar factual query", () => {
  it("asks fresh authority and returns the next events deterministically without a model call", async () => {
    const model = vi.fn(async () => "model must not run");
    const c = connector();
    const handler = createLighterChatHandler(model, {
      createConnector: () => c.value,
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });

    const ask = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "What are my next 5 meetings?" }],
    }))).json();

    expect(ask).toMatchObject({
      reply: "Please explicitly confirm that I may read your Calendar.",
      calendarAuthority: { decision: "ASK" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(c.listBetweenWithCompleteness).not.toHaveBeenCalled();

    const allow = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Yes." }],
      pendingAuthorizationReference: ask.pendingAuthorizationReference,
    }))).json();

    expect(allow.reply).toBe([
      "Calendar factual result:",
      "Next 5 timed Calendar events:",
      "- JARVIS Testing — Sat, 29 Aug, 11:00 AM–12:00 PM",
      "- URGENT Board Crisis — Deep Work — Sat, 29 Aug, 11:00 AM–12:00 PM",
      "- Shopping — Sat, 29 Aug, 3:00 PM–4:00 PM",
      "- Barwon Health — Mon, 31 Aug, 9:00 AM–4:00 PM",
      "- Interview: Manager - Lived Experience Strategy & Policy — Tue, 1 Sep, 10:00 AM–11:00 AM",
    ].join("\n"));
    expect(allow.reply).not.toMatch(/Priority:|Mode:|Category:|Urgency:/i);
    expect(c.listBetweenWithCompleteness).toHaveBeenCalledWith(
      "2026-08-28T09:00:00.000Z", "2026-09-04T09:00:00.000Z", 100,
    );
    expect(model).not.toHaveBeenCalled();
  });

  it.each([
    ["When is my next LLEGC meeting?", "LLEGC September Meeting — Thu, 3 Sep, 6:00 PM–7:30 PM"],
    ["What time is the interview on Tuesday?", "Interview: Manager - Lived Experience Strategy & Policy — Tue, 1 Sep, 10:00 AM–11:00 AM"],
    ["When is JARVIS Testing scheduled next?", "JARVIS Testing — Sat, 29 Aug, 11:00 AM–12:00 PM"],
    ["When am I going shopping?", "Shopping — Sat, 29 Aug, 3:00 PM–4:00 PM"],
    ["When am I testing JARVIS again?", "JARVIS Testing — Sat, 29 Aug, 11:00 AM–12:00 PM"],
    ["When's my next JARVIS test?", "JARVIS Testing — Sat, 29 Aug, 11:00 AM–12:00 PM"],
    ["When do I next have scheduled JARVIS testing?", "JARVIS Testing — Sat, 29 Aug, 11:00 AM–12:00 PM"],
    ["When do I next go shopping?", "Shopping — Sat, 29 Aug, 3:00 PM–4:00 PM"],
  ])("answers the deterministic named query without model interpretation: %s", async (utterance, expected) => {
    const model = vi.fn(async () => "model must not run");
    const c = connector();
    const handler = createLighterChatHandler(model, {
      createConnector: () => c.value,
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });
    const { allow } = await askThenConfirm(handler, utterance);
    expect(allow.reply).toBe(`Calendar factual result:\n- ${expected}`);
    expect(model).not.toHaveBeenCalled();
  });

  it("answers a bounded next-week presence query without model interpretation", async () => {
    const model = vi.fn(async () => "model must not run");
    const c = connector();
    const handler = createLighterChatHandler(model, {
      createConnector: () => c.value,
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });
    const { allow } = await askThenConfirm(handler, "Do I have an LLEGC meeting next week?");
    expect(allow.reply).toBe("Calendar factual result:\nYes. LLEGC September Meeting — Thu, 3 Sep, 6:00 PM–7:30 PM");
    expect(model).not.toHaveBeenCalled();
  });

  it("answers a compact voice-style weekday-presence question without model interpretation", async () => {
    const model = vi.fn(async () => "model must not run");
    const c = connector();
    const handler = createLighterChatHandler(model, {
      createConnector: () => c.value,
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });
    const { allow } = await askThenConfirm(handler, "Am I shopping Saturday?");
    expect(allow.reply).toBe("Calendar factual result:\nYes. Shopping — Sat, 29 Aug, 3:00 PM–4:00 PM");
    expect(model).not.toHaveBeenCalled();
  });

  it("answers a deterministic weekday-presence question without model interpretation", async () => {
    const model = vi.fn(async () => "model must not run");
    const c = connector();
    const handler = createLighterChatHandler(model, {
      createConnector: () => c.value,
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });
    const { allow } = await askThenConfirm(handler, "Am I at Barwon Health on Monday?");
    expect(allow.reply).toBe("Calendar factual result:\nYes. Barwon Health — Mon, 31 Aug, 9:00 AM–4:00 PM");
    expect(model).not.toHaveBeenCalled();
  });

  it("interprets a conversational named-event paraphrase, then preserves fresh authority and deterministic answering", async () => {
    const model = vi.fn(async (systemPrompt: string) =>
      systemPrompt.includes("bounded Calendar factual-intent interpreter")
        ? '{"kind":"next_title_match","terms":["jarvis","test"]}'
        : "ordinary model must not run");
    const c = connector();
    const handler = createLighterChatHandler(model, {
      createConnector: () => c.value,
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });

    const { ask, allow } = await askThenConfirm(handler, "Can you tell me when the JARVIS test is again?");

    expect(ask).toMatchObject({
      reply: "Please explicitly confirm that I may read your Calendar.",
      calendarAuthority: { decision: "ASK" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(allow.reply).toBe("Calendar factual result:\n- JARVIS Testing — Sat, 29 Aug, 11:00 AM–12:00 PM");
    expect(c.listBetweenWithCompleteness).toHaveBeenCalledTimes(1);
    expect(model).toHaveBeenCalledTimes(1);
    expect(model.mock.calls[0][0]).toContain("bounded Calendar factual-intent interpreter");
  });

  it("keeps relational Level-2 Calendar wording contained after bounded interpretation declines it", async () => {
    const model = vi.fn(async (systemPrompt: string) =>
      systemPrompt.includes("bounded Calendar factual-intent interpreter")
        ? '{"kind":"unsupported"}'
        : "ordinary model must not run");
    const c = connector();
    const handler = createLighterChatHandler(model, {
      createConnector: () => c.value,
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });
    const response = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "When am I next doing some work on JARVIS?" }],
    }))).json();

    expect(response.reply).toBe(
      "I can check your Calendar for that, but I couldn't resolve the factual query safely from that wording.",
    );
    expect(c.listBetweenWithCompleteness).not.toHaveBeenCalled();
    expect(model).toHaveBeenCalledTimes(1);
    expect(model.mock.calls[0][0]).toContain("bounded Calendar factual-intent interpreter");
  });

  it("contains unsupported when-do-I-next wording without allowing ordinary-model Calendar facts", async () => {
    const model = vi.fn(async (systemPrompt: string) =>
      systemPrompt.includes("bounded Calendar factual-intent interpreter")
        ? '{"kind":"unsupported"}'
        : [
            "Jarvis testing on Tuesday, 7 January at 10:00 AM",
            "Team standup on Wednesday, 8 January at 9:00 AM",
            "Dentist appointment on Friday, 10 January at 2:00 PM",
          ].join("\n"));
    const c = connector();
    const handler = createLighterChatHandler(model, {
      createConnector: () => c.value,
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });
    const response = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "When do I next turn 60?" }],
    }))).json();

    expect(response.reply).toBe(
      "I can check your Calendar for that, but I couldn't resolve the factual query safely from that wording.",
    );
    expect(c.listBetweenWithCompleteness).not.toHaveBeenCalled();
    expect(model).toHaveBeenCalledTimes(1);
    expect(model.mock.calls[0][0]).toContain("bounded Calendar factual-intent interpreter");
  });

  it("withholds factual title answers when bounded acquisition is partial", async () => {
    const model = vi.fn(async () => "model must not run");
    const listBetweenWithCompleteness = vi.fn(async (start: string, end: string, limit = 100) => ({
      events: [],
      completeness: {
        sourceId: "google-calendar" as const, windowStart: start, windowEnd: end, requestedLimit: limit,
        targetDiscovery: "calendar_list" as const, targetCount: 1,
        targets: [{ calendarId: "primary", status: "partial" as const, returnedCount: 0, continuation: "unknown" as const }],
        mergedReturnedCount: 0, mergeTruncated: false, completeness: "partial" as const,
        observedAt: "2026-08-28T09:00:00.000Z",
      },
    }));
    const handler = createLighterChatHandler(model, {
      createConnector: () => ({ source: "google" as const, listBetween: vi.fn(), listBetweenWithCompleteness }),
      clock: () => new Date("2026-08-28T09:00:00.000Z"),
    });
    const { allow } = await askThenConfirm(handler, "When is my next LLEGC meeting?");
    expect(allow.reply).toBe(
      "Calendar factual result:\nI can't truthfully answer this factual Calendar query because the bounded read was not complete.",
    );
    expect(model).not.toHaveBeenCalled();
  });
});