import { describe, expect, it, vi } from "vitest";

import type { DurablePurposeProjectionResult } from "../operating-picture/purpose-projection-retrieval";
import { createLighterChatHandler } from "./chat-handler";

const request = (content: string, references: Record<string, unknown> = {}) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ specialistId: "jarvis", messages: [{ role: "user", content }], ...references }),
});

function projection(): Extract<DurablePurposeProjectionResult, { status: "projected" }> {
  const item = Object.freeze({
    recordId: "user-continuity:drive-gap",
    versionId: "drive-gap-head",
    purpose: "conversation",
    semanticClass: "user_assertion" as const,
    lifecycle: "current" as const,
    recoveryDisposition: "recoverable_user_continuity" as const,
    subject: Object.freeze({ namespace: "user_continuity", entity: "user-continuity:drive-gap", attribute: "user_assertion", revision: "append_only" as const }),
    payload: Object.freeze({ statement: "JARVIS product gap — Drive ordinal continuity." }),
    visibilityPurposes: Object.freeze(["conversation"]),
    validFrom: null,
    validUntil: null,
    staleAfter: null,
    authorshipSource: "user" as const,
    authorshipAt: "2026-09-01T00:00:00.000Z",
  });
  return Object.freeze({ status: "projected", purpose: "conversation", items: Object.freeze([item]), decisions: Object.freeze([]) });
}

const unusedCalendarActDependencies = {
  createReadConnector: () => { throw new Error("calendar read must not run"); },
  createWriteConnector: () => { throw new Error("calendar write must not run"); },
  hasWriteScope: async () => false,
  clock: () => new Date("2026-09-02T10:00:00.000Z"),
};

describe("Product Gap explicit resolution integration", () => {
  it("routes list, exact selection and user-authored write without ordinary-model target choice", async () => {
    const ordinaryModel = vi.fn(async () => "must not run");
    const appendVersion = vi.fn(async (version) => ({ status: "appended" as const, version }));
    const dependencies = {
      clock: () => new Date("2026-09-02T10:00:00.000Z"),
      retrieveProjection: async () => projection(),
      appendVersion,
    };
    const handler = createLighterChatHandler(
      ordinaryModel, undefined, undefined, undefined, undefined, undefined,
      unusedCalendarActDependencies, undefined, undefined, dependencies,
    );

    const listResponse = await handler(request("Show me the active JARVIS product gaps for resolution."));
    const listed = await listResponse.json();
    expect(listed.reply).toContain("1. JARVIS product gap — Drive ordinal continuity.");
    expect(listed.productGapResolutionListReference).toMatch(/^[0-9a-f-]{36}$/);
    expect(JSON.stringify(listed)).not.toContain("user-continuity:drive-gap");

    const selectResponse = await handler(request("Select the first product gap for resolution.", {
      productGapResolutionListReference: listed.productGapResolutionListReference,
    }));
    const selected = await selectResponse.json();
    expect(selected.reply).toContain("Selected exact Product Gap:\nJARVIS product gap — Drive ordinal continuity.");
    expect(selected.productGapResolutionTargetReference).toMatch(/^[0-9a-f-]{36}$/);

    const writeResponse = await handler(request("Mark this product gap as resolved.", {
      productGapResolutionTargetReference: selected.productGapResolutionTargetReference,
    }));
    expect(await writeResponse.json()).toMatchObject({
      reply: "That exact JARVIS product gap is now marked resolved.",
      productGapResolution: { status: "persisted" },
      productGapResolutionTargetReference: null,
    });
    expect(appendVersion).toHaveBeenCalledTimes(1);
    expect(ordinaryModel).not.toHaveBeenCalled();
  });

  it("contains unsupported resolution language before ordinary-model inference", async () => {
    const ordinaryModel = vi.fn(async () => "I chose the Drive gap");
    const handler = createLighterChatHandler(
      ordinaryModel, undefined, undefined, undefined, undefined, undefined,
      unusedCalendarActDependencies, undefined, undefined,
      { retrieveProjection: async () => projection() },
    );
    const response = await handler(request("Mark the Drive product gap resolved."));
    expect(await response.json()).toMatchObject({ productGapResolution: { status: "rejected" } });
    expect(ordinaryModel).not.toHaveBeenCalled();
  });
});
