import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "./chat-handler";
import { DISCRETIONARY_AVAILABILITY_STATEMENT } from "../operating-picture/discretionary-availability-preference";
import type { DurablePurposeProjectionResult } from "../operating-picture/purpose-projection-retrieval";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
});

const projection = Object.freeze({
  status: "projected", purpose: "conversation", decisions: Object.freeze([]),
  items: Object.freeze([Object.freeze({
    recordId: "availability", versionId: "availability-v1", purpose: "conversation", semanticClass: "preference",
    lifecycle: "current", recoveryDisposition: "recoverable_user_continuity",
    subject: Object.freeze({ namespace: "user_continuity", entity: "user", attribute: "statement", revision: "append_only" }),
    payload: Object.freeze({ statement: DISCRETIONARY_AVAILABILITY_STATEMENT }), visibilityPurposes: Object.freeze(["conversation"]),
    validFrom: null, validUntil: null, staleAfter: null, authorshipSource: "user", authorshipAt: "2026-09-02T00:00:00.000Z",
  })]),
}) as DurablePurposeProjectionResult;

describe("live governed free-time composition", () => {
  it("asks before acquisition then combines complete Calendar evidence with the user-authored preference", async () => {
    const model = vi.fn(async () => "model must not run");
    const listBetweenWithCompleteness = vi.fn(async (start: string, end: string, limit = 5) => ({
      events: [{ id: "busy", title: "hidden", start: "2026-09-07T09:00:00.000Z", end: "2026-09-07T10:00:00.000Z", day: "MON", time: "19:00", source: "google" as const, calendarId: "private", calendarName: "Private", timeMode: "unclassified" as const }],
      completeness: { sourceId: "google-calendar" as const, windowStart: start, windowEnd: end, requestedLimit: limit,
        targetDiscovery: "calendar_list" as const, targetCount: 1,
        targets: [{ calendarId: "private", status: "complete" as const, returnedCount: 1, continuation: "none" as const }],
        mergedReturnedCount: 1, mergeTruncated: false, completeness: "complete" as const, observedAt: "2026-09-07T07:00:00.000Z" },
    }));
    const retrieveProjection = vi.fn(async () => projection);
    const handler = createLighterChatHandler(model, {
      createConnector: () => ({ source: "google", listBetween: vi.fn(), listBetweenWithCompleteness }),
      clock: () => new Date("2026-09-07T07:00:00.000Z"),
    }, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, { retrieveProjection });

    const ask = await (await handler(request({ specialistId: "jarvis", messages: [{ role: "user", content: "Do I have any free time this week?" }] }))).json();
    expect(ask).toMatchObject({ reply: "Please explicitly confirm that I may read your Calendar.", calendarAuthority: { decision: "ASK" } });
    expect(listBetweenWithCompleteness).not.toHaveBeenCalled();
    expect(retrieveProjection).not.toHaveBeenCalled();

    const allow = await (await handler(request({ specialistId: "jarvis", messages: [{ role: "user", content: "yes" }], pendingAuthorizationReference: ask.pendingAuthorizationReference }))).json();
    expect(listBetweenWithCompleteness).toHaveBeenCalledWith("2026-09-06T14:00:00.000Z", "2026-09-13T14:00:00.000Z", 100);
    expect(retrieveProjection).toHaveBeenCalledOnce();
    expect(allow.reply).toContain("Available discretionary time this week within your remembered discretionary work-availability window");
    expect(allow.reply).toContain("Monday 7 September, 6:00 pm–7:00 pm");
    expect(allow.reply).toContain("Monday 7 September, 8:00 pm–9:00 pm");
    expect(allow.reply).toContain("Weekends are excluded by your remembered preference.");
    expect(model).not.toHaveBeenCalled();
  });
});
