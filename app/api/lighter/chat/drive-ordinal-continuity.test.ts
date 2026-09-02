import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "@/lib/lighter-jarvis/chat-handler";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("Drive governed ordinal continuity route", () => {
  it("completes search to ordinal bind to separate confirmation to exact read without model selection", async () => {
    const model = vi.fn(async () => "ordinary model must not run");
    const search = vi.fn(async () => [
      { id: "file-1", name: "Atlas plan", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-09-02T00:00:00Z" },
      { id: "file-2", name: "Atlas notes", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-09-01T00:00:00Z" },
    ]);
    const readGoogleDocText = vi.fn(async (fileId: string) => ({
      fileId,
      mimeType: "application/vnd.google-apps.document" as const,
      text: fileId === "file-1" ? "First Atlas document" : "Second Atlas document",
    }));

    const handler = createLighterChatHandler(
      model,
      undefined,
      undefined,
      undefined,
      { createConnector: () => ({ search }) },
      {
        loadPolicy: async () => ({ mimeType: "application/vnd.google-apps.document" as const, contentMode: "text" as const, maxBytes: 65536 as const, releaseMode: "complete_verbatim" as const }),
        hasOAuthCapability: async () => true,
        createConnector: () => ({ readGoogleDocText }),
      },
    );

    const ask = await (await handler(request({ specialistId: "jarvis", messages: [{ role: "user", content: "Search my Drive for Atlas" }] }))).json();
    expect(ask.driveSearchAuthority).toMatchObject({ decision: "ASK" });

    const list = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "yes" }],
      pendingAuthorizationReference: ask.pendingAuthorizationReference,
    }))).json();
    expect(list.governedReferentialScopeReference).toBeTruthy();
    expect(list.governedResultSetReference).toBeTruthy();
    expect(search).toHaveBeenCalledOnce();

    const ordinalAsk = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Read the first one." }],
      governedReferentialScopeReference: list.governedReferentialScopeReference,
      governedResultSetReference: list.governedResultSetReference,
    }))).json();
    expect(ordinalAsk.driveReadAuthority).toEqual({ decision: "ASK", reason: "ordinal_drive_file_selected_requires_read_authority" });
    expect(ordinalAsk.pendingAuthorizationReference).toBeTruthy();
    expect(JSON.stringify(ordinalAsk)).not.toContain("file-1");
    expect(readGoogleDocText).not.toHaveBeenCalled();

    const read = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "yes" }],
      pendingAuthorizationReference: ordinalAsk.pendingAuthorizationReference,
      governedReferentialScopeReference: ordinalAsk.governedReferentialScopeReference,
      governedResultSetReference: ordinalAsk.governedResultSetReference,
    }))).json();
    expect(read.driveReadAuthority).toMatchObject({ decision: "ALLOW", reason: "pending_authorization_confirmed" });
    expect(read.reply).toBe("Drive document (file-1):\nFirst Atlas document");
    expect(readGoogleDocText).toHaveBeenCalledWith("file-1", 65536);
    expect(search).toHaveBeenCalledOnce();
    expect(model).not.toHaveBeenCalled();
  });

  it.each(["Read the sixth one.", "read the seventh one"])(
    "fails closed for overflow ordinals on the live route: %s",
    async utterance => {
      const model = vi.fn(async () => "ordinary model must not run");
      const search = vi.fn(async () => [
        { id: "file-1", name: "One", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-09-02T00:00:00Z" },
        { id: "file-2", name: "Two", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-09-02T00:00:00Z" },
        { id: "file-3", name: "Three", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-09-02T00:00:00Z" },
        { id: "file-4", name: "Four", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-09-02T00:00:00Z" },
        { id: "file-5", name: "Five", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-09-02T00:00:00Z" },
      ]);
      const readGoogleDocText = vi.fn();
      const handler = createLighterChatHandler(
        model, undefined, undefined, undefined,
        { createConnector: () => ({ search }) },
        {
          loadPolicy: async () => ({ mimeType: "application/vnd.google-apps.document" as const, contentMode: "text" as const, maxBytes: 65536 as const, releaseMode: "complete_verbatim" as const }),
          hasOAuthCapability: async () => true,
          createConnector: () => ({ readGoogleDocText }),
        },
      );

      const list = await (await handler(request({
        specialistId: "jarvis",
        messages: [{ role: "user", content: "drive.search Atlas" }],
      }))).json();

      const overflow = await (await handler(request({
        specialistId: "jarvis",
        messages: [{ role: "user", content: utterance }],
        governedReferentialScopeReference: list.governedReferentialScopeReference,
        governedResultSetReference: list.governedResultSetReference,
      }))).json();

      expect(overflow.reply).toBe("That position is outside the bounded recent Drive result.");
      expect(overflow).not.toHaveProperty("pendingAuthorizationReference");
      expect(overflow).not.toHaveProperty("driveReadAuthority");
      expect(readGoogleDocText).not.toHaveBeenCalled();
      expect(model).not.toHaveBeenCalled();
    },
  );

  it("supersedes an older Drive result set within the same governed scope", async () => {
    const model = vi.fn(async () => "ordinary model must not run");
    const search = vi.fn()
      .mockResolvedValueOnce([{ id: "old-file", name: "Old Atlas", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-09-01T00:00:00Z" }])
      .mockResolvedValueOnce([{ id: "new-file", name: "New Atlas", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-09-02T00:00:00Z" }]);
    const handler = createLighterChatHandler(
      model, undefined, undefined, undefined,
      { createConnector: () => ({ search }) },
      {
        loadPolicy: async () => ({ mimeType: "application/vnd.google-apps.document" as const, contentMode: "text" as const, maxBytes: 65536 as const, releaseMode: "complete_verbatim" as const }),
        hasOAuthCapability: async () => true,
        createConnector: () => ({ readGoogleDocText: vi.fn() }),
      },
    );

    const first = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "drive.search Atlas" }],
    }))).json();
    expect(first.governedReferentialScopeReference).toBeTruthy();
    expect(first.governedResultSetReference).toBeTruthy();

    const second = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "drive.search Atlas" }],
      governedReferentialScopeReference: first.governedReferentialScopeReference,
      governedResultSetReference: first.governedResultSetReference,
    }))).json();
    expect(second.governedReferentialScopeReference).toEqual(first.governedReferentialScopeReference);
    expect(second.governedResultSetReference).not.toEqual(first.governedResultSetReference);

    const stale = await (await handler(request({
      specialistId: "jarvis",
      messages: [{ role: "user", content: "Read the first one." }],
      governedReferentialScopeReference: first.governedReferentialScopeReference,
      governedResultSetReference: first.governedResultSetReference,
    }))).json();
    expect(stale.reply).toContain("no longer available");
    expect(stale).not.toHaveProperty("pendingAuthorizationReference");
    expect(search).toHaveBeenCalledTimes(2);
    expect(model).not.toHaveBeenCalled();
  });
});