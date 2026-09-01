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
      id: "morning",
      title: "Morning review",
      start: "2026-08-31T23:00:00.000Z",
      end: "2026-09-01T00:00:00.000Z",
      day: "TUE",
      time: "09:00",
      source: "google" as const,
      calendarId: "primary",
      calendarName: "Work",
      timeMode: "routine" as const,
    },
    {
      id: "afternoon",
      title: "Afternoon review",
      start: "2026-09-01T05:00:00.000Z",
      end: "2026-09-01T06:00:00.000Z",
      day: "TUE",
      time: "15:00",
      source: "google" as const,
      calendarId: "primary",
      calendarName: "Work",
      timeMode: "deep_work" as const,
    },
    {
      id: "tomorrow",
      title: "Tomorrow review",
      start: "2026-09-02T00:00:00.000Z",
      end: "2026-09-02T01:00:00.000Z",
      day: "WED",
      time: "10:00",
      source: "google" as const,
      calendarId: "primary",
      calendarName: "Work",
      timeMode: "reflection" as const,
    },
  ];
  const listBetween = vi.fn();
  const listBetweenWithCompleteness = vi.fn(async (start: string, end: string, limit = 5) => ({
    events,
    completeness: {
      sourceId: "google-calendar" as const,
      windowStart: start,
      windowEnd: end,
      requestedLimit: limit,
      targetDiscovery: "calendar_list" as const,
      targetCount: 1,
      targets: [{
        calendarId: "primary",
        status: "complete" as const,
        returnedCount: events.length,
        continuation: "none" as const,
      }],
      mergedReturnedCount: events.length,
      mergeTruncated: false,
      completeness: "complete" as const,
      observedAt: "2026-09-01T08:30:00.000Z",
    },
  }));
  return { source: "google" as const, listBetween, listBetweenWithCompleteness };
}

describe("live Morning Executive Orientation", () => {
  it("asks, acquires once after confirmation, and renders the governed brief without a model call", async () => {
    const model = vi.fn(async () => "model must not run");
    const connector = completeConnector();
    const handler = createLighterChatHandler(model, {
      createConnector: () => connector,
      clock: () => new Date("2026-09-01T08:30:00.000Z"),
    });

    const ask = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Give me my morning brief." }],
    }))).json();

    expect(ask).toMatchObject({
      reply: "Please explicitly confirm that I may read your Calendar.",
      calendarAuthority: { decision: "ASK" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(connector.listBetweenWithCompleteness).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();

    const allow = await (await handler(request({
      specialistId: "jarvis",
      messages: [
        { role: "user", content: "Give me my morning brief." },
        { role: "assistant", content: ask.reply },
        { role: "user", content: "Yes." },
      ],
      pendingAuthorizationReference: ask.pendingAuthorizationReference,
    }))).json();

    expect(connector.listBetweenWithCompleteness).toHaveBeenCalledOnce();
    expect(connector.listBetweenWithCompleteness).toHaveBeenCalledWith(
      "2026-08-30T14:00:00.000Z",
      "2026-09-06T14:00:00.000Z",
      100,
    );
    expect(allow.reply).toBe([
      "Morning brief",
      "",
      "Today:",
      "- 9:00 AM–10:00 AM — Morning review",
      "- 3:00 PM–4:00 PM — Afternoon review",
      "",
      "This week\'s resolved Calendar allocation:",
      "- Routine / Transactional: 1h",
      "- Deep Work / Discovery: 1h",
      "- Reflection: 1h",
      "- Development: 0m",
      "- Self-Care: 0m",
      "- Unclassified: 0m",
      "Resolved occupied timed-event total: 3h.",
      "Coverage: complete for this bounded weekly Calendar read.",
      "",
      "Limitations:",
      "- supported change comparison not included.",
      "- priority not assessed.",
      "- schedule adequacy not assessed.",
      "- recommendation not produced.",
      "- remembered context not included.",
      "- cross-source information not included.",
    ].join("\n"));
    expect(allow.reply).not.toContain("Tomorrow review");
    expect(allow.calendarAuthority).toMatchObject({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
    });
    expect(model).not.toHaveBeenCalled();
  });

  it("withholds the live brief when the bounded weekly acquisition is partial", async () => {
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
          targets: [{
            calendarId: "primary",
            status: "partial" as const,
            returnedCount: 0,
            continuation: "unknown" as const,
          }],
          mergedReturnedCount: 0,
          mergeTruncated: false,
          completeness: "partial" as const,
          observedAt: "2026-09-01T08:30:00.000Z",
        },
      })),
    };
    const handler = createLighterChatHandler(model, {
      createConnector: () => connector,
      clock: () => new Date("2026-09-01T08:30:00.000Z"),
    });

    const ask = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Give me my morning brief." }],
    }))).json();
    const allow = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Yes." }],
      pendingAuthorizationReference: ask.pendingAuthorizationReference,
    }))).json();

    expect(allow.reply).toBe("I couldn\'t safely construct your morning brief from this bounded Calendar read.");
    expect(allow.reply).not.toMatch(/No timed Calendar commitments|Routine|Deep Work|priority/i);
    expect(model).not.toHaveBeenCalled();
  });
});