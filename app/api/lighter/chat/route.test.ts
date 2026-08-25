import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler, resolveMarketScopeDomains } from "@/lib/lighter-jarvis/chat-handler";
import type { ChatMessage } from "@/lib/agents/types";
import type { ClaudeResult, ClaudeTool } from "@/lib/claude";
import { createPendingAuthorization } from "@/lib/lighter-jarvis/pending-authorization";
import { proposeGmailRead } from "@/lib/lighter-jarvis/gmail-read-authority";
import { loadContentRetrievalPolicy } from "@/lib/content-retrieval-policy";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
});

const handoffResult = (
  specialistId: unknown,
  text: string,
  taskSummary: unknown = "A self-contained restatement of the task.",
  marketScopes?: unknown,
): ClaudeResult => ({
  text,
  content: [
    ...(text ? [{ type: "text", text }] : []),
    { type: "tool_use", name: "propose_handoff", input: { specialist_id: specialistId, task_summary: taskSummary, ...(marketScopes === undefined ? {} : { market_scopes: marketScopes }) } },
  ],
});

describe("POST /api/lighter/chat", () => {
  it.each([
    ["Search my Gmail from the last day.", "1d"],
    ["Search my Gmail from the last week.", "7d"],
  ] as const)("asks, then restores and executes the bounded natural-language Gmail search: %s", async (utterance, newerThan) => {
    const model = vi.fn(async () => handoffResult("dawnwatch", "handoff must not run"));
    const calendarConnector = vi.fn();
    const readConnector = vi.fn();
    const search = vi.fn(async () => ["id-1", "id-2", "id-3", "id-4", "id-5", "id-6"]);
    const searchConnector = vi.fn(() => ({ search }));
    const handler = createLighterChatHandler(
      model,
      { createConnector: calendarConnector, clock: () => new Date("2026-08-25T00:00:00Z") },
      { createConnector: readConnector, loadPolicy: vi.fn() },
      { createConnector: searchConnector },
    );

    const askResponse = await handler(request({ specialistId: "jarvis", messages: [{ role: "user", content: utterance }] }));
    const ask = await askResponse.json();
    expect(ask).toEqual({
      reply: "Please explicitly confirm that I may search Gmail.", specialistId: "jarvis", execution: "none",
      gmailSearchAuthority: { decision: "ASK", reason: "explicit_gmail_search_not_established" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(Object.keys(ask.pendingAuthorizationReference)).toEqual(["pendingAuthorizationId"]);
    expect(ask).not.toHaveProperty("routeTo");
    expect(searchConnector).not.toHaveBeenCalled(); expect(search).not.toHaveBeenCalled();
    expect(readConnector).not.toHaveBeenCalled(); expect(calendarConnector).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();

    const allowResponse = await handler(request({ specialistId: "jarvis", messages: [{ role: "user", content: "Yes" }],
      pendingAuthorizationReference: ask.pendingAuthorizationReference }));
    const allow = await allowResponse.json();
    expect(allow).toEqual({
      reply: "Gmail message IDs:\n- id-1\n- id-2\n- id-3\n- id-4\n- id-5", specialistId: "jarvis", execution: "none",
      gmailSearchAuthority: { decision: "ALLOW", reason: "pending_authorization_confirmed" },
      messageIds: ["id-1", "id-2", "id-3", "id-4", "id-5"],
    });
    expect(JSON.stringify(allow)).not.toMatch(/subject|snippet|body/i);
    expect(searchConnector).toHaveBeenCalledOnce(); expect(search).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledWith(newerThan, 5);
    expect(readConnector).not.toHaveBeenCalled(); expect(calendarConnector).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled(); expect(allow).not.toHaveProperty("routeTo");
  });

  it("freezes explicit Gmail search followed by a separate explicit, policy-gated read", async () => {
    const model = vi.fn(async () => "A message ID alone is not read authority.");
    const calendarConnector = vi.fn();
    const search = vi.fn(async () => ["live-message-1", "data-2", "data-3", "data-4", "data-5", "data-6"]);
    const retrieveMessage = vi.fn(async () => ({
      subject: "Your Google Account was recovered successfully",
      snippet: "Private content must not be released",
    }));
    const readConnector = vi.fn(() => ({ retrieveMessage }));
    const loadPolicy = vi.fn(() => loadContentRetrievalPolicy("config/content-retrieval-policy.dev.json"));
    const handler = createLighterChatHandler(
      model,
      { createConnector: calendarConnector, clock: () => new Date("2026-08-25T00:00:00Z") },
      { createConnector: readConnector, loadPolicy },
      { createConnector: () => ({ search }) },
    );

    const searchResponse = await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "gmail.search [newer_than:1d]" }],
    }));
    expect(await searchResponse.json()).toEqual({
      reply: "Gmail message IDs:\n- live-message-1\n- data-2\n- data-3\n- data-4\n- data-5",
      specialistId: "jarvis",
      execution: "none",
      gmailSearchAuthority: { decision: "ALLOW", reason: "explicit_gmail_search" },
      messageIds: ["live-message-1", "data-2", "data-3", "data-4", "data-5"],
    });
    expect(search).toHaveBeenCalledWith("1d", 5);
    expect(readConnector).not.toHaveBeenCalled();
    expect(loadPolicy).not.toHaveBeenCalled();
    expect(calendarConnector).not.toHaveBeenCalled();
    expect(model).not.toHaveBeenCalled();

    // Even when copied verbatim from discovery, an ID is data, not inherited read authority.
    const idOnlyResponse = await handler(request({
      specialistId: "jarvis",
      messages: [
        { role: "user", content: "gmail.search [newer_than:1d]" },
        { role: "assistant", content: "Gmail message IDs:\n- live-message-1" },
        { role: "user", content: "live-message-1" },
      ],
    }));
    expect(await idOnlyResponse.json()).toEqual({
      reply: "A message ID alone is not read authority.", specialistId: "jarvis", execution: "none",
    });
    expect(readConnector).not.toHaveBeenCalled();
    expect(loadPolicy).not.toHaveBeenCalled();

    const readResponse = await handler(request({
      specialistId: "jarvis",
      messages: [
        { role: "user", content: "gmail.search [newer_than:1d]" },
        { role: "assistant", content: "Gmail message IDs:\n- live-message-1" },
        { role: "user", content: "gmail.read live-message-1 [subject]" },
      ],
    }));
    const readBody = await readResponse.json();
    expect(readBody).toEqual({
      reply: "Subject: Your Google Account was recovered successfully",
      specialistId: "jarvis",
      execution: "none",
      gmailAuthority: { decision: "ALLOW", reason: "explicit_gmail_read" },
    });
    expect(loadPolicy).toHaveBeenCalledOnce();
    expect(retrieveMessage).toHaveBeenCalledWith("live-message-1");
    expect(JSON.stringify(readBody)).not.toContain("Private content");
    expect(model).toHaveBeenCalledOnce();
    expect(calendarConnector).not.toHaveBeenCalled();
  });

  it("intercepts exact Gmail searches before read, model, Calendar, and specialist routing", async () => {
    const model = vi.fn(); const readConnector = vi.fn(); const calendarConnector = vi.fn();
    const search = vi.fn(async () => ["message-1", "message-2"]);
    const response = await createLighterChatHandler(model, { createConnector: calendarConnector, clock: () => new Date() },
      { createConnector: readConnector, loadPolicy: vi.fn() }, { createConnector: () => ({ search }) })(request({
        specialistId: "jarvis", messages: [{ role: "user", content: "gmail.search [newer_than:1d]" }],
      }));
    expect(await response.json()).toEqual({ reply: "Gmail message IDs:\n- message-1\n- message-2", specialistId: "jarvis", execution: "none",
      gmailSearchAuthority: { decision: "ALLOW", reason: "explicit_gmail_search" }, messageIds: ["message-1", "message-2"] });
    expect(search).toHaveBeenCalledWith("1d", 5); expect(readConnector).not.toHaveBeenCalled();
    expect(calendarConnector).not.toHaveBeenCalled(); expect(model).not.toHaveBeenCalled();
  });

  it("rejects malformed Gmail searches before constructing any connector", async () => {
    const model = vi.fn(); const searchConnector = vi.fn(); const readConnector = vi.fn();
    const response = await createLighterChatHandler(model, undefined, { createConnector: readConnector, loadPolicy: vi.fn() },
      { createConnector: searchConnector })(request({ specialistId: "jarvis", messages: [{ role: "user", content: "gmail.search [q:anything]" }] }));
    expect(await response.json()).toMatchObject({ gmailSearchAuthority: { reason: "invalid_gmail_search_syntax" } });
    expect(searchConnector).not.toHaveBeenCalled(); expect(readConnector).not.toHaveBeenCalled(); expect(model).not.toHaveBeenCalled();
  });

  it("intercepts exact Gmail reads before model and specialist routing", async () => {
    const model = vi.fn(async () => handoffResult("dawnwatch", "handoff"));
    const createConnector = vi.fn(() => ({ retrieveMessage: vi.fn(async () => ({ subject: "Actual governed subject" })) }));
    const response = await createLighterChatHandler(model, undefined, {
      createConnector,
      loadPolicy: vi.fn(async () => ({ policyVersion: "test-v1", rules: [{ id: "email", match: { connectorType: "email" as const },
        processing: "external_processing_permitted" as const, admissibleFields: ["subject"] }] })),
    })(request({ specialistId: "jarvis", messages: [{ role: "user", content: "gmail.read message-1 [subject]" }] }));
    expect(await response.json()).toEqual({ reply: "Subject: Actual governed subject", specialistId: "jarvis", execution: "none",
      gmailAuthority: { decision: "ALLOW", reason: "explicit_gmail_read" } });
    expect(model).not.toHaveBeenCalled(); expect(createConnector).toHaveBeenCalledOnce();
  });

  it("returns Gmail syntax guidance without model, Calendar, connector, or handoff execution", async () => {
    const model = vi.fn(async () => handoffResult("dawnwatch", "handoff"));
    const calendarConnector = vi.fn(); const gmailConnector = vi.fn();
    const response = await createLighterChatHandler(model, { createConnector: calendarConnector,
      clock: () => new Date("2026-08-25T00:00:00Z") }, { createConnector: gmailConnector, loadPolicy: vi.fn() })(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "gmail.read message-1 subject" }],
    }));
    const body = await response.json();
    expect(body.reply).toContain("Invalid gmail.read syntax"); expect(body.routeTo).toBeUndefined();
    expect(model).not.toHaveBeenCalled(); expect(calendarConnector).not.toHaveBeenCalled(); expect(gmailConnector).not.toHaveBeenCalled();
  });
  it("rejects angle-bracketed Gmail resource IDs with no connector, model, or handoff", async () => {
    const model = vi.fn(async () => handoffResult("dawnwatch", "handoff")); const createConnector = vi.fn();
    const response = await createLighterChatHandler(model, undefined, { createConnector, loadPolicy: vi.fn() })(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "gmail.read <message-1> [subject]" }],
    }));
    const body = await response.json();
    expect(body).toMatchObject({ gmailAuthority: { reason: "invalid_gmail_read_syntax" } });
    expect(body.reply).toContain("Invalid gmail.read syntax"); expect(body.routeTo).toBeUndefined();
    expect(createConnector).not.toHaveBeenCalled(); expect(model).not.toHaveBeenCalled();
  });

  it("resolves an opaque Gmail confirmation through the stored operation without model or handoff", async () => {
    const model = vi.fn(async () => handoffResult("dawnwatch", "handoff"));
    const pendingAuthorizationReference = createPendingAuthorization(proposeGmailRead({
      resource: { resourceId: "stored-message", connectorType: "email" }, requestedFields: ["subject"], requestingRuntime: "api-chat",
    }));
    const retrieveMessage = vi.fn(async () => ({ subject: "Stored subject" }));
    const response = await createLighterChatHandler(model, undefined, { createConnector: () => ({ retrieveMessage }),
      loadPolicy: vi.fn(async () => ({ policyVersion: "test-v1", rules: [{ id: "email", match: { connectorType: "email" as const },
        processing: "external_processing_permitted" as const, admissibleFields: ["subject"] }] })) })(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "confirm" }], pendingAuthorizationReference,
    }));
    expect(await response.json()).toMatchObject({ reply: "Subject: Stored subject",
      gmailAuthority: { decision: "ALLOW", reason: "pending_authorization_confirmed" } });
    expect(retrieveMessage).toHaveBeenCalledWith("stored-message"); expect(model).not.toHaveBeenCalled();
  });
  it.each(["yes", "no"])("keeps bare %s outside Calendar confirmation without a pending reference", async (utterance) => {
    const model = vi.fn(async () => `Normal response to ${utterance}`);
    const connector = vi.fn();
    const response = await createLighterChatHandler(model, {
      createConnector: connector,
      clock: () => new Date("2026-08-25T00:00:00Z"),
    })(request({ specialistId: "jarvis", messages: [{ role: "user", content: utterance }] }));
    expect(await response.json()).toEqual({
      reply: `Normal response to ${utterance}`,
      specialistId: "jarvis",
      execution: "none",
    });
    expect(model).toHaveBeenCalledOnce();
    expect(connector).not.toHaveBeenCalled();
  });

  it("resolves pending Calendar authority before any model call", async () => {
    const model = vi.fn();
    const connector = vi.fn();
    const handler = createLighterChatHandler(model, {
      createConnector: connector,
      clock: () => new Date("2026-08-25T00:00:00Z"),
    });
    const ask = await handler(request({ specialistId: "jarvis", messages: [{ role: "user", content: "About my calendar" }] }));
    const reference = (await ask.json()).pendingAuthorizationReference;
    expect(model).not.toHaveBeenCalled();
    expect(connector).not.toHaveBeenCalled();

    const denied = await handler(request({ specialistId: "jarvis", messages: [{ role: "user", content: "no" }],
      pendingAuthorizationReference: reference }));
    expect((await denied.json()).calendarAuthority.decision).toBe("DENY");
    expect(model).not.toHaveBeenCalled();
    expect(connector).not.toHaveBeenCalled();
  });

  it("answers an authorized Calendar read deterministically without sending evidence to the model", async () => {
    const model = vi.fn();
    const listUpcoming = vi.fn(async () => [{ id: "event", title: "Private title",
      start: "2026-08-26T09:00:00Z", end: "2026-08-26T10:00:00Z", day: "WED", time: "09:00",
      source: "google" as const, calendarId: "primary", calendarName: "Private" }]);
    const response = await createLighterChatHandler(model, {
      createConnector: () => ({ source: "google", listUpcoming, listBetween: vi.fn(async () => listUpcoming()) }),
      clock: () => new Date("2026-08-25T00:00:00Z"),
    })(request({ specialistId: "jarvis", messages: [{ role: "user", content: "Show my calendar" }] }));
    const body = await response.json();
    expect(body.reply).toBe("Next seven days you have 1 commitment:\n- Wed, 26 Aug, 7:00 PM – 8:00 PM");
    expect(body.reply).not.toContain("2026-08-26T09:00:00Z");
    expect(body.reply).not.toContain("Private title");
    expect(model).not.toHaveBeenCalled();
  });

  it.each([
    "What’s on for tomorrow?",
    "What do I have today?",
    "What have I got tomorrow?",
    "What appointments do I have tomorrow?",
    "What's scheduled this afternoon?",
  ])("asks before a deterministic schedule read without model, handoff, Gmail scope, or connector execution: %s", async (utterance) => {
    const model = vi.fn(async () => handoffResult("dawnwatch", "I'll hand this to DAWNWATCH."));
    const connector = vi.fn();
    const response = await createLighterChatHandler(model, {
      createConnector: connector,
      clock: () => new Date("2026-08-25T00:00:00Z"),
    })(request({ specialistId: "jarvis", messages: [{ role: "user", content: utterance }] }));
    const body = await response.json();

    expect(body).toEqual({
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
    expect(body).not.toHaveProperty("routeTo");
    expect(body).not.toHaveProperty("marketScopes");
    expect(JSON.stringify(body)).not.toMatch(/gmail/i);
    expect(model).not.toHaveBeenCalled();
    expect(connector).not.toHaveBeenCalled();
  });

  it("acquires Calendar only after yes confirms the exact schedule-question reference, then consumes it", async () => {
    const model = vi.fn();
    const listUpcoming = vi.fn(async () => []);
    const listBetween = vi.fn(async () => []);
    const createConnector = vi.fn(() => ({ source: "google" as const, listUpcoming, listBetween }));
    const handler = createLighterChatHandler(model, {
      createConnector,
      clock: () => new Date("2026-08-25T00:00:00Z"),
    });

    const askResponse = await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "What’s on for tomorrow?" }],
    }));
    const ask = await askResponse.json();
    const exactReference = ask.pendingAuthorizationReference;
    expect(ask.calendarAuthority.decision).toBe("ASK");
    expect(exactReference).toEqual({ pendingAuthorizationId: expect.any(String) });
    expect(createConnector).not.toHaveBeenCalled();

    const allowedResponse = await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "yes" }],
      pendingAuthorizationReference: exactReference,
    }));
    expect(await allowedResponse.json()).toEqual({
      reply: "Tomorrow is clear.",
      specialistId: "jarvis",
      execution: "none",
      calendarAuthority: {
        decision: "ALLOW",
        reason: "pending_authorization_confirmed",
      },
    });
    expect(createConnector).toHaveBeenCalledOnce();
    expect(listBetween).toHaveBeenCalledOnce();
    expect(model).not.toHaveBeenCalled();

    const consumedResponse = await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "yes" }],
      pendingAuthorizationReference: exactReference,
    }));
    expect(await consumedResponse.json()).toMatchObject({
      calendarAuthority: {
        decision: "ASK",
        reason: "pending_authorization_already_consumed",
      },
      pendingAuthorizationReference: null,
    });
    expect(createConnector).toHaveBeenCalledOnce();
    expect(listBetween).toHaveBeenCalledOnce();
    expect(model).not.toHaveBeenCalled();
  });
  it("resolves market scope domains deterministically with union and deduplication", () => {
    expect(resolveMarketScopeDomains(["fx", "australia"])).toEqual([
      "federalreserve.gov", "ecb.europa.eu", "bankofengland.co.uk", "rba.gov.au",
      "asx.com.au", "asic.gov.au", "abs.gov.au", "apra.gov.au", "treasury.gov.au",
    ]);
    expect(resolveMarketScopeDomains([])).toBeUndefined();
    expect(resolveMarketScopeDomains(["f\u00f8x"])).toBeUndefined();
    expect(resolveMarketScopeDomains(["toString"])).toBeUndefined();
  });

  it("excludes reuters.com from every market scope, Anthropic's web_search crawler cannot access it", () => {
    for (const scope of ["australia", "us_equities", "fx", "global_macro"] as const) {
      expect(resolveMarketScopeDomains([scope])).not.toContain("reuters.com");
    }
  });

  it.each([undefined, [], ["crypto"]])("fails GECKO closed for invalid market scopes: %j", async (marketScopes) => {
    const model = vi.fn();
    const response = await createLighterChatHandler(model)(request({
      specialistId: "gecko", marketScopes, messages: [{ role: "user", content: "Scan markets" }],
    }));
    expect(response.status).toBe(400);
    expect(model).not.toHaveBeenCalled();
  });

  it("restricts GECKO search to the resolved server-side domain union", async () => {
    const model = vi.fn(async (
      _systemPrompt: string,
      _messages: ChatMessage[],
      _tools?: ClaudeTool[],
    ) => "Recalled: not_fetched");
    const response = await createLighterChatHandler(model)(request({
      specialistId: "gecko", marketScopes: ["us_equities", "fx"], messages: [{ role: "user", content: "Scan markets" }],
    }));
    expect(response.status).toBe(200);
    expect(model.mock.calls[0][2]).toEqual([{ type: "web_search_20250305", name: "web_search", allowed_domains: [
      "nasdaq.com", "sec.gov", "federalreserve.gov", "ecb.europa.eu", "bankofengland.co.uk", "rba.gov.au",
    ] }]);
  });

  it.each([
    ["oracle", undefined],
    ["gecko", ["australia"]],
  ])("downgrades %s Sourced claims when no cited evidence survives", async (specialistId, marketScopes) => {
    const response = await createLighterChatHandler(async () => ({ text: "Sourced: claim", content: [{ type: "text", text: "Sourced: claim" }] }))(request({
      specialistId, marketScopes, messages: [{ role: "user", content: "Research" }],
    }));
    expect((await response.json()).reply).toBe("Recalled: claim");
  });

  it("retains GECKO Sourced labeling only for cited in-domain search evidence", async () => {
    const response = await createLighterChatHandler(async () => ({
      text: "Sourced: filing", content: [
        { type: "web_search_tool_result", content: [{ url: "https://www.sec.gov/filing" }] },
        { type: "text", text: "Sourced: filing", citations: [{ type: "web_search_result_location", url: "https://www.sec.gov/filing" }] },
      ],
    }))(request({ specialistId: "gecko", marketScopes: ["us_equities"], messages: [{ role: "user", content: "Research" }] }));
    expect((await response.json()).reply).toBe("Sourced: filing");
  });

  it("downgrades GECKO when a search result is outside its declared domains", async () => {
    const response = await createLighterChatHandler(async () => ({
      text: "Sourced: claim", content: [
        { type: "web_search_tool_result", content: [{ url: "https://example.com/claim" }] },
        { type: "text", text: "Sourced: claim", citations: [{ type: "web_search_result_location", url: "https://example.com/claim" }] },
      ],
    }))(request({ specialistId: "gecko", marketScopes: ["us_equities"], messages: [{ role: "user", content: "Research" }] }));
    expect((await response.json()).reply).toBe("Recalled: claim");
  });

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
      taskSummary: "A self-contained restatement of the task.",
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

  it("fails closed on a handoff tool call missing a task_summary", async () => {
    const model = vi.fn(async (): Promise<ClaudeResult> => ({
      text: "I'll hand this to DAWNWATCH.",
      content: [
        { type: "text", text: "I'll hand this to DAWNWATCH." },
        { type: "tool_use", name: "propose_handoff", input: { specialist_id: "dawnwatch" } },
      ],
    }));
    const response = await createLighterChatHandler(model)(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "Brief me" }],
    }));

    expect(await response.json()).toEqual({
      reply: "I'll hand this to DAWNWATCH.", specialistId: "jarvis", execution: "none",
    });
  });

  it("fails closed on a handoff tool call with an empty task_summary", async () => {
    const model = vi.fn(async () => handoffResult("dawnwatch", "I'll hand this to DAWNWATCH.", "   "));
    const response = await createLighterChatHandler(model)(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "Brief me" }],
    }));

    expect(await response.json()).toEqual({
      reply: "I'll hand this to DAWNWATCH.", specialistId: "jarvis", execution: "none",
    });
  });

  it.each([undefined, [], ["crypto"]])("fails a GECKO handoff closed for invalid market_scopes: %j", async (marketScopes) => {
    const response = await createLighterChatHandler(async () => handoffResult("gecko", "I suggest GECKO.", undefined, marketScopes))(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "Scan markets" }],
    }));
    expect((await response.json()).routeTo).toBeUndefined();
  });

  it("returns declared scopes with a valid GECKO handoff", async () => {
    const response = await createLighterChatHandler(async () => handoffResult("gecko", "I suggest GECKO.", undefined, ["fx", "global_macro"]))(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "Scan currencies" }],
    }));
    expect(await response.json()).toMatchObject({ routeTo: "gecko", marketScopes: ["fx", "global_macro"] });
  });

  it("supplies a non-empty fallback when a handoff tool call has no text", async () => {
    const response = await createLighterChatHandler(async () => handoffResult("dawnwatch", ""))(request({
      specialistId: "jarvis", messages: [{ role: "user", content: "Brief me" }],
    }));

    expect(await response.json()).toEqual({
      reply: "I'd recommend handing this to DAWNWATCH.", specialistId: "jarvis", execution: "none", routeTo: "dawnwatch",
      taskSummary: "A self-contained restatement of the task.",
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
