import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "./chat-handler";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

function completeConnector() {
  const events = [
    {
      id: "barwon",
      title: "hidden",
      start: "2026-08-24T00:00:00.000Z",
      end: "2026-08-24T07:00:00.000Z",
      day: "MON",
      time: "10:00",
      source: "google" as const,
      calendarId: "barwon",
      calendarName: "Barwon Health",
      timeMode: "routine" as const,
    },
    {
      id: "lunch",
      title: "hidden",
      start: "2026-08-24T03:00:00.000Z",
      end: "2026-08-24T04:00:00.000Z",
      day: "MON",
      time: "13:00",
      source: "google" as const,
      calendarId: "personal",
      calendarName: "Personal",
      timeMode: "self_care" as const,
    },
  ];

  return {
    source: "google" as const,
    listBetween: vi.fn(),
    listBetweenWithCompleteness: vi.fn(async (start: string, end: string, limit = 5) => ({
      events,
      completeness: {
        sourceId: "google-calendar" as const,
        windowStart: start,
        windowEnd: end,
        requestedLimit: limit,
        targetDiscovery: "calendar_list" as const,
        targetCount: 2,
        targets: [
          { calendarId: "barwon", status: "complete" as const, returnedCount: 1, continuation: "none" as const },
          { calendarId: "personal", status: "complete" as const, returnedCount: 1, continuation: "none" as const },
        ],
        mergedReturnedCount: 2,
        mergeTruncated: false,
        completeness: "complete" as const,
        observedAt: "2026-08-28T00:00:00.000Z",
      },
    })),
  };
}

describe("live governed weekly Calendar allocation", () => {
  it("asks for fresh Calendar authority, then renders only the governed complete allocation", async () => {
    const model = vi.fn(async () => "model must not run");
    const connector = completeConnector();
    const handler = createLighterChatHandler(model, {
      createConnector: () => connector,
      clock: () => new Date("2026-08-28T00:00:00.000Z"),
    });

    const ask = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "How is my week allocated?" }],
    }))).json();

    expect(ask).toMatchObject({
      reply: "Please explicitly confirm that I may read your Calendar.",
      calendarAuthority: { decision: "ASK" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(connector.listBetweenWithCompleteness).not.toHaveBeenCalled();

    const allow = await (await handler(request({
      specialistId: "jarvis",
      messages: [
        { role: "user", content: "How is my week allocated?" },
        { role: "assistant", content: ask.reply },
        { role: "user", content: "Yes." },
      ],
      pendingAuthorizationReference: ask.pendingAuthorizationReference,
    }))).json();

    expect(allow.reply).toBe([
      "This week's resolved Calendar allocation:",
      "- Routine / Transactional: 6h",
      "- Deep Work / Discovery: 0m",
      "- Reflection: 0m",
      "- Development: 0m",
      "- Self-Care: 1h",
      "- Unclassified: 0m",
      "Resolved occupied timed-event total: 7h.",
      "Coverage: complete for this bounded weekly Calendar read.",
    ].join("\n"));
    expect(allow.calendarAuthority).toMatchObject({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
    });
    expect(model).not.toHaveBeenCalled();
  });

  it("withholds a full-week allocation when acquisition is partial", async () => {
    const model = vi.fn(async () => "model must not run");
    const connector = {
      source: "google" as const,
      listBetween: vi.fn(),
      listBetweenWithCompleteness: vi.fn(async (start: string, end: string, limit = 5) => ({
        events: [],
        completeness: {
          sourceId: "google-calendar" as const,
          windowStart: start,
          windowEnd: end,
          requestedLimit: limit,
          targetDiscovery: "calendar_list" as const,
          targetCount: 1,
          targets: [
            { calendarId: "barwon", status: "partial" as const, returnedCount: 0, continuation: "unknown" as const },
          ],
          mergedReturnedCount: 0,
          mergeTruncated: false,
          completeness: "partial" as const,
          observedAt: "2026-08-28T00:00:00.000Z",
        },
      })),
    };

    const handler = createLighterChatHandler(model, {
      createConnector: () => connector,
      clock: () => new Date("2026-08-28T00:00:00.000Z"),
    });

    const ask = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "How is my week allocated?" }],
    }))).json();

    const allow = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Yes." }],
      pendingAuthorizationReference: ask.pendingAuthorizationReference,
    }))).json();

    expect(allow.reply).toBe(
      "I can't truthfully report your full weekly allocation because this bounded Calendar read was not complete."
    );
    expect(allow.reply).not.toMatch(/Routine|Deep Work|Self-Care|total/i);
    expect(model).not.toHaveBeenCalled();
  });
});
