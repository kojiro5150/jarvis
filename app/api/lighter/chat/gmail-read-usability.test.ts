import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "@/lib/lighter-jarvis/chat-handler";
import { UNBOUND_ORDINAL_REFERENCE_REPLY } from "@/lib/governance-core/unbound-reference";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const listPolicy = Object.freeze({
  policyVersion: "test-v1",
  rules: [Object.freeze({
    id: "email",
    match: Object.freeze({ connectorType: "email" as const }),
    processing: "external_processing_permitted" as const,
    admissibleFields: Object.freeze(["sender", "subject"] as const),
  })],
});

describe("Gmail deterministic read usability route", () => {
  it("completes list → ordinal bind → exact confirmation → deterministic content without a model call", async () => {
    const model = vi.fn(async () => "ordinary model must not run");

    const search = vi.fn(async () => ["id-1", "id-2"]);
    const searchDependencies = {
      createConnector: () => ({ search }),
      createSubjectConnector: () => ({
        retrieveMessage: async (id: string) => ({
          sender: id === "id-1" ? "Georgia <georgia@example.com>" : "Other <other@example.com>",
          subject: id === "id-1" ? "Project update" : "Other message",
        }),
      }),
      loadPolicy: async () => listPolicy,
    };

    const retrieveMessage = vi.fn(async (id: string) => ({
      sender: "Georgia <georgia@example.com>",
      subject: "Project update",
      plainTextBody: "Authorised deterministic body",
      snippet: "MUST NOT LEAK",
      providerOnly: id,
    }));
    const readDependencies = {
      createConnector: () => ({ retrieveMessage }),
      loadPolicy: async () => ({
        policyVersion: "test-read-v1",
        rules: [{
          id: "email",
          match: { connectorType: "email" as const },
          processing: "external_processing_permitted" as const,
          admissibleFields: ["sender", "subject", "plain_text_body"] as const,
        }],
      }),
    };

    const handler = createLighterChatHandler(
      model,
      undefined,
      readDependencies,
      searchDependencies,
    );

    const searchAsk = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "What are my emails from the last week?" }],
    }))).json();

    expect(searchAsk.gmailSearchAuthority).toMatchObject({ decision: "ASK" });
    expect(searchAsk.pendingAuthorizationReference).toBeTruthy();
    expect(search).not.toHaveBeenCalled();

    const list = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Yes." }],
      pendingAuthorizationReference: searchAsk.pendingAuthorizationReference,
    }))).json();

    expect(list.gmailSearchAuthority).toMatchObject({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
    });
    expect(list.reply).toContain("1. From: Georgia <georgia@example.com>");
    expect(list.reply).toContain("Subject: Project update");
    expect(list.gmailMessageListReference).toBeTruthy();
    expect(list).not.toHaveProperty("messageIds");

    const ordinalAsk = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Read the first one." }],
      gmailMessageListReference: list.gmailMessageListReference,
    }))).json();

    expect(ordinalAsk.gmailAuthority).toEqual({
      decision: "ASK",
      reason: "ordinal_message_selected_requires_read_authority",
    });
    expect(ordinalAsk.pendingAuthorizationReference).toBeTruthy();
    expect(JSON.stringify(ordinalAsk)).not.toContain("id-1");
    expect(retrieveMessage).not.toHaveBeenCalled();

    const read = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Yes." }],
      pendingAuthorizationReference: ordinalAsk.pendingAuthorizationReference,
    }))).json();

    expect(read.gmailAuthority).toMatchObject({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
    });
    expect(read.reply).toBe(
      "From: Georgia <georgia@example.com>\nSubject: Project update\nPlain text body: Authorised deterministic body",
    );
    expect(read.reply).not.toContain("MUST NOT LEAK");
    expect(retrieveMessage).toHaveBeenCalledOnce();
    expect(retrieveMessage).toHaveBeenCalledWith("id-1");
    expect(model).not.toHaveBeenCalled();
  });

  it("completes recent list → unique sender-name bind → exact confirmation without a second Gmail search or model call", async () => {
    const model = vi.fn(async () => "ordinary model must not run");
    const search = vi.fn(async () => ["id-1", "id-2"]);
    const searchDependencies = {
      createConnector: () => ({ search }),
      createSubjectConnector: () => ({
        retrieveMessage: async (id: string) => ({
          sender: id === "id-1" ? "Raman Bhola <raman@example.com>" : "Alex Smith <alex@example.com>",
          subject: id === "id-1" ? "LinkedIn invitation" : "Other message",
        }),
      }),
      loadPolicy: async () => listPolicy,
    };

    const retrieveMessage = vi.fn(async (id: string) => ({
      sender: "Raman Bhola <raman@example.com>",
      subject: "LinkedIn invitation",
      plainTextBody: "You are invited to connect.",
      snippet: "MUST NOT LEAK",
      providerOnly: id,
    }));
    const readDependencies = {
      createConnector: () => ({ retrieveMessage }),
      loadPolicy: async () => ({
        policyVersion: "test-read-v1",
        rules: [{
          id: "email",
          match: { connectorType: "email" as const },
          processing: "external_processing_permitted" as const,
          admissibleFields: ["sender", "subject", "plain_text_body"] as const,
        }],
      }),
    };

    const handler = createLighterChatHandler(
      model,
      undefined,
      readDependencies,
      searchDependencies,
    );

    const searchAsk = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "What are my emails from the last week?" }],
    }))).json();

    const list = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Yes." }],
      pendingAuthorizationReference: searchAsk.pendingAuthorizationReference,
    }))).json();

    expect(list.reply).toContain("1. From: Raman Bhola <raman@example.com>");
    expect(list.gmailMessageListReference).toBeTruthy();
    expect(search).toHaveBeenCalledTimes(1);

    const namedAsk = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Read the email from Raman Bhola." }],
      gmailMessageListReference: list.gmailMessageListReference,
    }))).json();

    expect(namedAsk.gmailAuthority).toEqual({
      decision: "ASK",
      reason: "named_message_selected_requires_read_authority",
    });
    expect(namedAsk.pendingAuthorizationReference).toBeTruthy();
    expect(namedAsk.reply).toContain("position 1");
    expect(JSON.stringify(namedAsk)).not.toContain("id-1");
    expect(JSON.stringify(namedAsk)).not.toContain("raman@example.com");
    expect(search).toHaveBeenCalledTimes(1);
    expect(retrieveMessage).not.toHaveBeenCalled();

    const read = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Yes." }],
      pendingAuthorizationReference: namedAsk.pendingAuthorizationReference,
    }))).json();

    expect(read.gmailAuthority).toMatchObject({
      decision: "ALLOW",
      reason: "pending_authorization_confirmed",
    });
    expect(read.reply).toBe(
      "From: Raman Bhola <raman@example.com>\nSubject: LinkedIn invitation\nPlain text body: You are invited to connect.",
    );
    expect(read.reply).not.toContain("MUST NOT LEAK");
    expect(retrieveMessage).toHaveBeenCalledOnce();
    expect(retrieveMessage).toHaveBeenCalledWith("id-1");
    expect(search).toHaveBeenCalledTimes(1);
    expect(model).not.toHaveBeenCalled();
  });

  it("fails a hard-reset ordinal reference capability-neutrally without calling the model", async () => {
    const model = vi.fn(async () => "calendar-specific guess must not run");
    const handler = createLighterChatHandler(model);

    const result = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Read the first one." }],
    }))).json();

    expect(result).toEqual({
      reply: UNBOUND_ORDINAL_REFERENCE_REPLY,
      specialistId: "jarvis",
      execution: "none",
    });
    expect(result.reply).not.toMatch(/gmail|calendar|drive/i);
    expect(model).not.toHaveBeenCalled();
  });
});
