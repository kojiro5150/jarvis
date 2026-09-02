import { describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";

function request(messages: readonly Readonly<{ role: "user" | "assistant"; content: string }>[], extra: Record<string, unknown> = {}) {
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

function completeness(state: "complete" | "partial") {
  return {
    sourceId: "google-calendar" as const,
    windowStart: "2026-09-01T14:00:00.000Z",
    windowEnd: "2026-09-02T14:00:00.000Z",
    requestedLimit: 5,
    targetDiscovery: "calendar_list" as const,
    targetCount: 1,
    targets: [{
      calendarId: "primary",
      status: state === "complete" ? "complete" as const : "partial" as const,
      returnedCount: 1,
      continuation: state === "complete" ? "none" as const : "present" as const,
    }],
    mergedReturnedCount: 1,
    mergeTruncated: state !== "complete",
    completeness: state,
    observedAt: "2026-09-02T02:05:00.000Z",
  };
}

const event = {
  id: "evt-1",
  title: "Undisclosed title",
  start: "2026-09-01T23:00:00.000Z",
  end: "2026-09-02T06:00:00.000Z",
  day: "WED",
  time: "09:00",
  source: "google" as const,
  calendarId: "primary",
  calendarName: "Work",
};

describe("Calendar completeness reply boundary", () => {
  it("withholds model presentation and reports only observed commitments when coverage is partial", async () => {
    const model = vi.fn(async () => "That's your only item today. The rest of your day is clear.");
    const listBetweenWithCompleteness = vi.fn(async () => ({
      events: [event],
      completeness: completeness("partial"),
    }));
    const handler = createLighterChatHandler(model, {
      createConnector: () => ({
        source: "google" as const,
        listBetween: vi.fn(),
        listBetweenWithCompleteness,
      }),
      clock: () => new Date("2026-09-02T02:05:00.000Z"),
    });

    const ask = await (await handler(request([
      { role: "user", content: "What's on for today?" },
    ]))).json();

    const response = await handler(request([
      { role: "user", content: "yes" },
    ], {
      pendingAuthorizationReference: ask.pendingAuthorizationReference,
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.reply).toContain("this bounded Calendar read found 1 commitment");
    expect(body.reply).toContain("9:00 AM");
    expect(body.reply).toContain("4:00 PM");
    expect(body.reply).not.toMatch(/only scheduled item|rest of your day is clear/i);
    expect(model).not.toHaveBeenCalled();
  });

  it("allows model presentation only after complete coverage is proven", async () => {
    const model = vi.fn(async () => "Today you have one commitment: 9:00 AM – 4:00 PM. That's your only scheduled item today.");
    const listBetweenWithCompleteness = vi.fn(async () => ({
      events: [event],
      completeness: completeness("complete"),
    }));
    const handler = createLighterChatHandler(model, {
      createConnector: () => ({
        source: "google" as const,
        listBetween: vi.fn(),
        listBetweenWithCompleteness,
      }),
      clock: () => new Date("2026-09-02T02:05:00.000Z"),
    });

    const ask = await (await handler(request([
      { role: "user", content: "What's on for today?" },
    ]))).json();

    const response = await handler(request([
      { role: "user", content: "yes" },
    ], {
      pendingAuthorizationReference: ask.pendingAuthorizationReference,
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.reply).toContain("9:00 AM – 4:00 PM");
    expect(body.reply).toContain("only scheduled item");
    expect(model).toHaveBeenCalledOnce();
  });
});
