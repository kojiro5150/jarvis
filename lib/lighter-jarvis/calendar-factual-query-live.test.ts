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
      targets: [{ calendarId: "primary", status: "complete" as const, returnedCount: 3, continuation: "none" as const }],
      mergedReturnedCount: 3, mergeTruncated: false, completeness: "complete" as const,
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
      "Next 3 timed Calendar events:",
      "- URGENT Board Crisis — Deep Work — Sat, 29 Aug, 11:00 AM–12:00 PM",
      "- Interview: Manager - Lived Experience Strategy & Policy — Tue, 1 Sep, 10:00 AM–11:00 AM",
      "- LLEGC September Meeting — Thu, 3 Sep, 6:00 PM–7:30 PM",
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