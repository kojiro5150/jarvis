import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  executeAuditedChat: vi.fn(async () => "Audited reply"),
  assembleAgentSystemPrompt: vi.fn(() => "agent instructions\n\nBOA instructions"),
  routeChatCapability: vi.fn(async (..._args: any[]) => ({ operation: "gmail.get", result: "bounded" })),
  authorizeGmailCapability: vi.fn(({ capability, currentUserUtterance }): any => currentUserUtterance === "gmail.read message-1 [subject]"
    ? { decision: "ALLOW", operation: { request: capability.request } }
    : { decision: "ASK", reason: "explicit_gmail_read_not_established", operation: null,
      pendingAuthorizationReference: { pendingAuthorizationId: "opaque" } }),
  constructGmailConnector: vi.fn(),
}));

vi.mock("@/lib/agents", () => ({
  getAgent: vi.fn(() => ({ id: "jarvis", systemPrompt: "agent instructions" })),
}));
vi.mock("@/lib/agents/boa-instruction-registry", () => ({
  getBoaInstruction: vi.fn(() => ({ agentId: "jarvis" })),
}));
vi.mock("@/lib/agents/boa-instructions", () => ({
  assembleAgentSystemPrompt: mocks.assembleAgentSystemPrompt,
}));
vi.mock("@/lib/agents/chat-execution", () => ({
  executeAuditedChat: mocks.executeAuditedChat,
}));
vi.mock("@/lib/agents/execution-audit-store-factory", () => ({
  createExecutionAuditStore: vi.fn(() => ({ append: vi.fn(), list: vi.fn() })),
}));
vi.mock("@/lib/chat-capabilities", () => ({
  parseChatCapabilityRequest: vi.fn((value) => value),
  routeChatCapability: mocks.routeChatCapability,
  authorizeGmailCapability: mocks.authorizeGmailCapability,
}));
vi.mock("@/lib/chat-capabilities/google-gmail-content", () => ({
  GoogleGmailContentConnector: class { constructor() { mocks.constructGmailConnector(); } },
}));
vi.mock("@/lib/content-retrieval-policy", () => ({ loadContentRetrievalPolicy: vi.fn() }));

import { POST } from "./route";

function request(body: unknown): NextRequest {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("POST /api/chat", () => {
  beforeEach(() => vi.clearAllMocks());

  it("has no legacy OperationalState prompt-context dependency", () => {
    const source = readFileSync("app/api/chat/route.ts", "utf8");

    expect(source).not.toContain("buildOperationalState");
    expect(source).not.toContain("buildContextBlock");
    expect(source).not.toContain("@/lib/operational-state");
    expect(source).not.toContain("@/lib/context-builder");
  });

  it("assembles ordinary chat from agent and BOA instructions without implicit context", async () => {
    const response = await POST(request({ messages: [{ role: "user", content: "Hello" }] }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ reply: "Audited reply", agentId: "jarvis" });
    expect(mocks.assembleAgentSystemPrompt).toHaveBeenCalledOnce();
    expect(mocks.assembleAgentSystemPrompt.mock.calls[0]).toHaveLength(2);
    expect(mocks.executeAuditedChat).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: "user", content: "Hello" }],
        systemPrompt: "agent instructions\n\nBOA instructions",
      }),
      expect.objectContaining({ callModel: expect.any(Function), auditStore: expect.any(Object) })
    );
  });

  it("preserves the explicit capability branch", async () => {
    const capability = { operation: "governed_gmail_retrieval",
      request: { resource: { connectorType: "email", resourceId: "message-1" }, requestedFields: ["subject"], requestingRuntime: "api-chat" } };
    const response = await POST(request({ capability, messages: [{ role: "user", content: "gmail.read message-1 [subject]" }] }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      capability: { operation: "gmail.get", result: "bounded" },
    });
    expect(mocks.routeChatCapability).toHaveBeenCalledOnce();
    expect(mocks.authorizeGmailCapability).toHaveBeenCalledWith({ capability,
      currentUserUtterance: "gmail.read message-1 [subject]" });
    expect(mocks.executeAuditedChat).not.toHaveBeenCalled();
  });

  it("returns ASK before constructing a Gmail connector", async () => {
    const capability = { operation: "governed_gmail_retrieval", currentUserUtterance: "gmail.read message-1 [subject]",
      request: { resource: { connectorType: "email", resourceId: "message-1" }, requestedFields: ["subject"], requestingRuntime: "api-chat" } };
    const response = await POST(request({ capability, messages: [{ role: "user", content: "read it" }] }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ capability: { decision: "ASK",
      pendingAuthorizationReference: { pendingAuthorizationId: "opaque" } } });
    expect(mocks.constructGmailConnector).not.toHaveBeenCalled();
    expect(mocks.routeChatCapability).not.toHaveBeenCalled();
    expect(mocks.authorizeGmailCapability).toHaveBeenCalledWith({ capability, currentUserUtterance: "read it" });
  });

  it("uses the actual confirmation utterance with the opaque pending reference", async () => {
    const originalRequest = { resource: { connectorType: "email", resourceId: "message-1" },
      requestedFields: ["subject"], requestingRuntime: "api-chat" };
    mocks.authorizeGmailCapability.mockReturnValueOnce({ decision: "ALLOW", reason: "pending_authorization_confirmed",
      operation: { request: originalRequest }, pendingAuthorizationReference: null });
    const capability = { operation: "governed_gmail_retrieval", pendingAuthorizationReference: { pendingAuthorizationId: "opaque" },
      request: { ...originalRequest, resource: { ...originalRequest.resource, resourceId: "replacement" }, requestedFields: ["snippet"] } };
    await POST(request({ capability, messages: [{ role: "user", content: "confirm" }] }));
    expect(mocks.authorizeGmailCapability).toHaveBeenCalledWith({ capability, currentUserUtterance: "confirm" });
    expect(mocks.routeChatCapability).toHaveBeenCalledWith(expect.objectContaining({ request: originalRequest }), expect.any(Object));
    expect(mocks.constructGmailConnector).toHaveBeenCalledOnce();
  });
});
