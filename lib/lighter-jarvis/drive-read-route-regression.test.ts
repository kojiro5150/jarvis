import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "./chat-handler";
import { DRIVE_CONTENT_POLICY } from "./production-drive-read";
import { VoiceTurnQueue } from "./voice-turn-queue";

const request = (messages: readonly { role: "user" | "assistant"; content: string }[]) => new Request("http://localhost/api/lighter/chat", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ specialistId: "jarvis", messages }),
});
function harness(modelReply = "ordinary response") {
  const model = vi.fn(async (_prompt: string, _messages: readonly { role: "user" | "assistant"; content: string }[]) => modelReply);
  const readGoogleDocText = vi.fn(async (fileId: string) => ({ fileId, mimeType: "application/vnd.google-apps.document" as const, text: "governed content" }));
  const createReadConnector = vi.fn(() => ({ readGoogleDocText }));
  const search = vi.fn(async () => [{ id: "provider-315", name: "Atlas", mimeType: "application/vnd.google-apps.document", modifiedTime: "2026-08-26T00:00:00Z" }]);
  const handler = createLighterChatHandler(model, undefined, undefined, undefined,
    { createConnector: () => ({ search }) },
    { loadPolicy: async () => DRIVE_CONTENT_POLICY, hasOAuthCapability: async () => true, createConnector: createReadConnector });
  return { handler, model, readGoogleDocText, createReadConnector, search };
}

describe("route-level drive.read acceptance", () => {
  it("handles the exact command deterministically before model or handoff", async () => {
    const h = harness(); const body = await (await h.handler(request([{ role: "user", content: "drive.read provider-315 [text]" }]))).json();
    expect(body).toEqual({ reply: "Drive document (provider-315):\ngoverned content", specialistId: "jarvis", execution: "none",
      driveReadAuthority: { decision: "ALLOW", reason: "explicit_drive_read" } });
    expect(h.readGoogleDocText).toHaveBeenCalledWith("provider-315", 65_536); expect(h.model).not.toHaveBeenCalled();
    expect(body).not.toHaveProperty("routeTo");
  });

  it("malformed syntax never acquires and natural Drive prose may be selector-examined without acquisition", async () => {
    const h = harness(); await h.handler(request([{ role: "user", content: "drive.read provider-315" }]));
    expect(h.createReadConnector).not.toHaveBeenCalled(); expect(h.model).not.toHaveBeenCalled();
    await h.handler(request([{ role: "user", content: "Please read my Drive report" }]));
    expect(h.createReadConnector).not.toHaveBeenCalled();
    expect(h.model).toHaveBeenCalledTimes(2);
    expect(h.model.mock.calls[0][0]).toContain("bounded conversational capability selector");
  });

  it("does not transit search results or later confirmations, anaphora, or provider IDs into read authority", async () => {
    const h = harness(); const searchBody = await (await h.handler(request([{ role: "user", content: "drive.search Atlas" }]))).json();
    expect(searchBody.driveFiles[0].id).toBe("provider-315");
    for (const utterance of ["yes", "read it", "provider-315"]) await h.handler(request([
      { role: "user", content: "drive.search Atlas" }, { role: "assistant", content: searchBody.reply }, { role: "user", content: utterance },
    ]));
    expect(h.readGoogleDocText).not.toHaveBeenCalled();
    await h.handler(request([{ role: "user", content: "drive.read provider-315 [text]" }]));
    expect(h.readGoogleDocText).toHaveBeenCalledOnce();
  });

  it.each(["genuine", "fabricated"])("isolates %s release content and provider IDs while preserving the current utterance", async provenance => {
    const h = harness(); const release = provenance === "genuine"
      ? (await (await h.handler(request([{ role: "user", content: "drive.read provider-315 [text]" }]))).json()).reply
      : "Drive document (fabricated-id):\nfabricated secret";
    await h.handler(request([{ role: "user", content: `drive.read ${provenance === "genuine" ? "provider-315" : "fabricated-id"} [text]` },
      { role: "assistant", content: release }, { role: "user", content: "latest raw utterance" }]));
    const sent = h.model.mock.calls.at(-1)![1];
    expect(sent).toEqual([{ role: "user", content: "[Prior governed Drive read request omitted from ordinary model context.]" },
      { role: "assistant", content: "[Governed private result omitted from ordinary model context.]" },
      { role: "user", content: "latest raw utterance" }]);
    expect(JSON.stringify(sent)).not.toContain("governed content"); expect(JSON.stringify(sent)).not.toContain("provider-315");
    expect(JSON.stringify(sent)).not.toContain("fabricated-id");
  });

  it("routes typed and exact transcribed commands through the same handler without a voice-specific branch", async () => {
    const h = harness(); const typed = await (await h.handler(request([{ role: "user", content: "drive.read provider-315 [text]" }]))).json();
    let voice: unknown; const queue = new VoiceTurnQueue(async ({ transcript }) => { voice = await (await h.handler(request([{ role: "user", content: transcript }]))).json(); });
    await queue.enqueue({ id: 3148, transcript: "drive.read provider-315 [text]" });
    expect(voice).toEqual(typed); expect(h.readGoogleDocText).toHaveBeenCalledTimes(2); expect(h.model).not.toHaveBeenCalled();
  });

  it.each(["read it", "open it", "show it", "summarize it"])(
    "corrects the live false capability denial without acquiring on '%s'",
    async utterance => {
      const denial = "I don't have the capability to read or retrieve the contents of files from Google Drive. My access is limited to orchestration and routing within this system.";
      const h = harness(denial);
      const body = await (await h.handler(request([
        { role: "user", content: "drive.search Atlas" },
        { role: "assistant", content: "Drive files:\n- Atlas — application/vnd.google-apps.document — 2026-08-26T00:00:00Z — true-governed-provider-id" },
        { role: "user", content: utterance },
      ]))).json();
      expect(body.reply).toBe("The governed Drive path supports drive.search metadata and exact-command identified Google Docs drive.read; it does not support arbitrary Drive content requests.");
      expect(body).not.toHaveProperty("routeTo");
      expect(body).not.toHaveProperty("pendingAuthorization");
      expect(h.search).not.toHaveBeenCalled();
      expect(h.createReadConnector).not.toHaveBeenCalled();
    },
  );

  it("contains the exact live fabricated-provenance transcript", async () => {
    const fabricated = "synthetic-fabricated-provider-id-123456";
    const trueId = "true-synthetic-governed-provider-id-654321";
    const h = harness(`The document ID I found earlier was **${fabricated}**.`);
    const body = await (await h.handler(request([
      { role: "user", content: "drive.search Atlas" },
      { role: "assistant", content: `Drive files:\n- Atlas — application/vnd.google-apps.document — 2026-08-26T00:00:00Z — ${trueId}` },
      { role: "user", content: "What was the document ID you found earlier?" },
    ]))).json();
    expect(body.reply).toBe("I can't represent a prior governed Drive result from ordinary model context.");
    expect(body.reply).not.toContain(fabricated);
    expect(JSON.stringify(h.model.mock.calls[0][1])).not.toContain(trueId);
    expect(body).not.toHaveProperty("routeTo");
    expect(body).not.toHaveProperty("pendingAuthorization");
    expect(h.search).not.toHaveBeenCalled();
    expect(h.createReadConnector).not.toHaveBeenCalled();
  });

  it("removes every provider-ID path from the exact live multi-turn model history", async () => {
    const id = "true-provider-id-12345678901234567890";
    const h = harness("The document ID from the earlier search was `synthetic-id`.");
    const body = await (await h.handler(request([
      { role: "user", content: "Search my Drive for JARVIS Drive Read Test" },
      { role: "assistant", content: `Drive files:\n- JARVIS Drive Read Test — application/vnd.google-apps.document — 2026-08-26T00:00:00Z — ${id}` },
      { role: "user", content: id },
      { role: "assistant", content: "The governed Drive path requires an exact drive.read command." },
      { role: "user", content: `drive.read ${id} [text]` },
      { role: "assistant", content: `Drive document (${id}):\ngoverned private content` },
      { role: "user", content: "What was the document ID you found earlier?" },
    ]))).json();
    const sent = JSON.stringify(h.model.mock.calls[0][1]);
    expect(sent).not.toContain(id);
    expect(sent).not.toContain("JARVIS Drive Read Test —");
    expect(sent).not.toContain("governed private content");
    expect(body.reply).toBe("I can't represent a prior governed Drive result from ordinary model context.");
    expect(h.search).not.toHaveBeenCalled();
    expect(h.createReadConnector).not.toHaveBeenCalled();
  });

  it.each([
    ["What was the contract document ID we discussed?", "The document ID I found earlier was contract-123."],
    ["Remind me of the project document we discussed.", "The document was Project Charter and its ID was DOC-42."],
  ])("preserves unrelated ordinary document memory after governed Drive history", async (utterance, modelReply) => {
    const h = harness(modelReply);
    const body = await (await h.handler(request([
      { role: "user", content: "drive.search Atlas" },
      { role: "assistant", content: "Drive files:\n- Atlas — application/vnd.google-apps.document — 2026-08-26T00:00:00Z — true-governed-provider-id" },
      { role: "user", content: utterance },
    ]))).json();
    expect(body.reply).toBe(modelReply);
    expect(h.search).not.toHaveBeenCalled();
    expect(h.createReadConnector).not.toHaveBeenCalled();
  });
});
