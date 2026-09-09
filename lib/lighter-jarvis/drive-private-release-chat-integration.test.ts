import { beforeEach, describe, expect, it, vi } from "vitest";

import { createLighterChatHandler } from "./chat-handler";
import {
  DRIVE_PRIVATE_RELEASE_CONTAINMENT_REPLY,
  OMITTED_DRIVE_PRIVATE_RELEASE,
} from "./drive-private-release-contract";
import {
  createDrivePrivateReleaseReference,
  resetDrivePrivateReleaseReferencesForTests,
  resolveDrivePrivateReleaseReference,
} from "./drive-private-release-reference";
import { createGmailPrivateReleaseReference, resetGmailPrivateReleaseReferencesForTests } from "./gmail-private-release-reference";
import { compactModelTranscript } from "./runtime";

function request(messages: readonly Readonly<{ role: "user" | "assistant"; content: string }>[],
  references: Readonly<{ drive?: unknown; gmail?: unknown }> = {}): Request {
  return new Request("http://localhost/api/lighter/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ specialistId: "jarvis", messages,
      ...(references.drive ? { drivePrivateReleaseReference: references.drive } : {}),
      ...(references.gmail ? { gmailPrivateReleaseReference: references.gmail } : {}) }),
  });
}

describe("Drive private release chat containment", () => {
  beforeEach(() => {
    resetDrivePrivateReleaseReferencesForTests();
    resetGmailPrivateReleaseReferencesForTests();
  });

  it("prevents the synthetic Project Atlas fabrication before any model or provider call", async () => {
    const syntheticDocument = `Drive document:\nProject Atlas Governance Review\n${"Synthetic bounded recommendation. ".repeat(400)}`;
    const reference = createDrivePrivateReleaseReference({
      fileId: "synthetic-drive-provider-id",
      presentation: syntheticDocument,
    });
    const model = vi.fn(async () =>
      "The document confirms that the Board approved Project Atlas for immediate statewide implementation.");
    const driveProvider = vi.fn();
    const handler = createLighterChatHandler(model, undefined, undefined, undefined, undefined, {
      loadPolicy: vi.fn(), hasOAuthCapability: vi.fn(), createConnector: driveProvider,
    });
    const response = await handler(request([
      { role: "assistant", content: OMITTED_DRIVE_PRIVATE_RELEASE },
      { role: "user", content: "Summarize that document." },
    ], { drive: reference }));
    const body = await response.json();
    expect(body).toEqual({ reply: DRIVE_PRIVATE_RELEASE_CONTAINMENT_REPLY,
      specialistId: "jarvis", execution: "none", drivePrivateReleaseReference: reference });
    expect(model).not.toHaveBeenCalled();
    expect(driveProvider).not.toHaveBeenCalled();
    expect(body).not.toHaveProperty("pendingAuthorizationReference");
    expect(JSON.stringify(body)).not.toMatch(/synthetic-drive-provider-id|Synthetic bounded recommendation/);
    expect(body.reply).not.toMatch(/Board approved|statewide implementation/);
    expect(resolveDrivePrivateReleaseReference(reference)).not.toBeNull();
  });

  it("does not let a Gmail reference activate Drive containment", async () => {
    const gmail = createGmailPrivateReleaseReference({
      resourceId: "gmail-message", requestedFields: ["plain_text_body"],
      presentation: "Plain text body: " + "private ".repeat(1_500) });
    const model = vi.fn(async () => "ordinary bounded response");
    const response = await createLighterChatHandler(model)(request([
      { role: "assistant", content: OMITTED_DRIVE_PRIVATE_RELEASE },
      { role: "user", content: "Summarize that document." },
    ], { drive: gmail }));
    expect((await response.json()).reply).not.toBe(DRIVE_PRIVATE_RELEASE_CONTAINMENT_REPLY);
  });

  it("resolves server-owned state after the originating release falls outside retained history", async () => {
    const reference = createDrivePrivateReleaseReference({ fileId: "old-file",
      presentation: "Drive document:\n" + "private ".repeat(1_500) });
    const history = Array.from({ length: 49 }, (_, index) => ({
      role: index % 2 === 0 ? "assistant" as const : "user" as const,
      content: index === 0 ? OMITTED_DRIVE_PRIVATE_RELEASE : `later short turn ${index}`,
    }));
    const transcript = [
      ...history,
      { role: "user", content: "What does that document say?" },
    ] as const;
    expect(compactModelTranscript(transcript).some(
      ({ content }) => content === OMITTED_DRIVE_PRIVATE_RELEASE,
    )).toBe(false);
    const response = await createLighterChatHandler(vi.fn(async () => "unsafe"))(request(
      transcript, { drive: reference },
    ));
    expect((await response.json()).reply).toBe(DRIVE_PRIVATE_RELEASE_CONTAINMENT_REPLY);
  });
});
