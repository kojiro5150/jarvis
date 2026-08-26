import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "./chat-handler";
import { guardOrdinaryModelReply, NEUTRALIZED_ORDINARY_AUTHORITY_REPLY, UNSUPPORTED_DRIVE_PATH_REPLY } from "./ordinary-model-reply-guard";
import { VoiceTurnQueue } from "./voice-turn-queue";

const request = (utterance: string, pendingAuthorizationReference?: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ specialistId: "jarvis", messages: [{ role: "user", content: utterance }],
    ...(pendingAuthorizationReference === undefined ? {} : { pendingAuthorizationReference }) }),
});

const metadata = Array.from({ length: 6 }, (_, index) => Object.freeze({
  id: `provider-id-${index + 1}`,
  name: `Atlas ${index + 1}`,
  mimeType: "application/vnd.google-apps.document",
  modifiedTime: `2026-08-${String(25 - index).padStart(2, "0")}T00:00:00Z`,
}));

function dependencies() {
  const model = vi.fn(async () => "ordinary model reply");
  const calendarConnector = vi.fn();
  const gmailReadConnector = vi.fn();
  const gmailSearchConnector = vi.fn();
  const search = vi.fn(async () => metadata);
  const driveConnector = vi.fn(() => ({ search }));
  const handler = createLighterChatHandler(
    model,
    { createConnector: calendarConnector, clock: () => new Date("2026-08-26T00:00:00Z") },
    { createConnector: gmailReadConnector, loadPolicy: vi.fn() },
    { createConnector: gmailSearchConnector },
    { createConnector: driveConnector },
  );
  return { handler, model, calendarConnector, gmailReadConnector, gmailSearchConnector, driveConnector, search };
}

describe("Sprint 3.144 Drive search scoped regression proofs", () => {
  it("releases only five deterministic metadata records with original provider IDs and no model synthesis", async () => {
    const harness = dependencies();
    const response = await harness.handler(request("drive.search Atlas"));
    const body = await response.json();

    expect(body).toEqual({
      reply: metadata.slice(0, 5).length
        ? `Drive files:\n${metadata.slice(0, 5).map(file => `- ${file.name} — ${file.mimeType} — ${file.modifiedTime} — ${file.id}`).join("\n")}`
        : "No Drive files found.",
      specialistId: "jarvis",
      execution: "none",
      driveSearchAuthority: { decision: "ALLOW", reason: "explicit_drive_search" },
      driveFiles: metadata.slice(0, 5),
    });
    expect(Object.keys(body.driveFiles[0])).toEqual(["id", "name", "mimeType", "modifiedTime"]);
    expect(body.driveFiles.map((file: { id: string }) => file.id)).toEqual(metadata.slice(0, 5).map(file => file.id));
    expect(JSON.stringify(body)).not.toMatch(/snippet|summary|content|download|export/i);
    expect(harness.search).toHaveBeenCalledWith("Atlas", 5);
    expect(harness.model).not.toHaveBeenCalled();
  });

  it.each(["replayed", "fabricated"])("keeps %s deterministic Drive metadata outside ordinary model context", async provenance => {
    const harness = dependencies();
    const release = provenance === "replayed"
      ? (await (await harness.handler(request("drive.search Atlas"))).json()).reply
      : "Drive files:\n- Fabricated secret — application/pdf — 2026-08-26T00:00:00Z — fabricated-id";
    harness.model.mockResolvedValueOnce("ordinary response");
    const response = await harness.handler(new Request("http://localhost/api/lighter/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ specialistId: "jarvis", messages: [
        { role: "user", content: "Earlier request" },
        { role: "assistant", content: release },
        { role: "user", content: "Discuss something unrelated" },
      ] }),
    }));

    expect(response.status).toBe(200);
    expect(harness.model).toHaveBeenLastCalledWith(expect.any(String), [
      { role: "user", content: "Earlier request" },
      { role: "assistant", content: "[Governed private result omitted from ordinary model context.]" },
      { role: "user", content: "Discuss something unrelated" },
    ], expect.any(Array));
    expect(JSON.stringify(harness.model.mock.calls.at(-1))).not.toContain("fabricated-id");
    expect(JSON.stringify(harness.model.mock.calls.at(-1))).not.toContain("provider-id-");
  });

  it("rejects malformed explicit-command syntax before constructing any connector", async () => {
    const harness = dependencies();
    const body = await (await harness.handler(request("drive.search  Atlas"))).json();

    expect(body).toEqual({
      reply: "Invalid drive.search syntax. Use: drive.search <file name>.",
      specialistId: "jarvis",
      execution: "none",
      driveSearchAuthority: { reason: "invalid_drive_search_syntax" },
    });
    expect(body).not.toHaveProperty("pendingAuthorizationReference");
    expect(harness.driveConnector).not.toHaveBeenCalled();
    expect(harness.gmailSearchConnector).not.toHaveBeenCalled();
    expect(harness.gmailReadConnector).not.toHaveBeenCalled();
    expect(harness.calendarConnector).not.toHaveBeenCalled();
    expect(harness.model).not.toHaveBeenCalled();
  });

  it("turns only the scoped natural-language request into a server-owned proposal without acquisition", async () => {
    const harness = dependencies();
    const body = await (await harness.handler(request("Search my Drive for Atlas"))).json();

    expect(body).toMatchObject({ reply: "Please explicitly confirm that I may search Drive.", specialistId: "jarvis", execution: "none",
      driveSearchAuthority: { decision: "ASK", reason: "explicit_drive_search_not_established" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) } });
    expect(harness.driveConnector).not.toHaveBeenCalled();
    expect(harness.model).not.toHaveBeenCalled();
  });

  it.each([
    "search MY drive for Atlas?",
    "FIND Atlas in my drive.",
    "Look IN my DRIVE for Atlas!",
  ])("asks without handoff, then executes the exact stored operation: %s", async utterance => {
    const harness = dependencies();
    const ask = await (await harness.handler(request(utterance))).json();

    expect(ask).toMatchObject({ driveSearchAuthority: { decision: "ASK" },
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) } });
    expect(ask).not.toHaveProperty("routeTo");
    expect(harness.driveConnector).not.toHaveBeenCalled();
    expect(harness.model).not.toHaveBeenCalled();

    const allow = await (await harness.handler(request("yes", ask.pendingAuthorizationReference))).json();
    expect(allow).toMatchObject({ driveSearchAuthority: { decision: "ALLOW", reason: "pending_authorization_confirmed" },
      driveFiles: metadata.slice(0, 5) });
    expect(allow).not.toHaveProperty("routeTo");
    expect(harness.search).toHaveBeenCalledWith("Atlas", 5);
    expect(harness.model).not.toHaveBeenCalled();
  });

  it("extends ordinary capability truthfulness only to Drive metadata and never manufactures authority UX", () => {
    expect(guardOrdinaryModelReply("I don't have access to Drive.", "Find Atlas in Drive"))
      .toBe(UNSUPPORTED_DRIVE_PATH_REPLY);
    expect(guardOrdinaryModelReply("Please confirm that I may search Drive."))
      .toBe(NEUTRALIZED_ORDINARY_AUTHORITY_REPLY);
    expect(guardOrdinaryModelReply("I don't have access to your files.", "Find Atlas in files"))
      .toBe("I don't have access to your files.");
  });

  it("sends typed and voice transcripts through the same canonical Drive authority handler", async () => {
    const harness = dependencies();
    const typed = await (await harness.handler(request("drive.search Atlas"))).json();
    let voice: unknown;
    const queue = new VoiceTurnQueue(async ({ transcript }) => {
      voice = await (await harness.handler(request(transcript))).json();
    });

    await queue.enqueue({ id: 3144, transcript: "drive.search Atlas" });

    expect(voice).toEqual(typed);
    expect(harness.search).toHaveBeenNthCalledWith(1, "Atlas", 5);
    expect(harness.search).toHaveBeenNthCalledWith(2, "Atlas", 5);
    expect(harness.model).not.toHaveBeenCalled();
  });
});
