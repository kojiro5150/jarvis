import { describe, expect, it, vi } from "vitest";
import type { DurablePurposeProjectionResult } from "../operating-picture/purpose-projection-retrieval";
import { createLighterChatHandler } from "./chat-handler";

const request = (content: string, reference?: unknown) => new Request("http://localhost/api/lighter/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ specialistId: "jarvis", inputModality: "typed", messages: [{ role: "user", content }], ...(reference ? { productGapSupersessionReference: reference } : {}) }) });
const gap = (id: string, statement: string) => ({ recordId: id, versionId: `${id}:head`, purpose: "conversation", semanticClass: "user_assertion" as const, lifecycle: "current" as const, recoveryDisposition: "recoverable_user_continuity" as const, subject: { namespace: "user_continuity", entity: id, attribute: "user_assertion", revision: "append_only" as const }, payload: { statement }, visibilityPurposes: ["conversation"], validFrom: null, validUntil: null, staleAfter: null, authorshipSource: "user" as const, authorshipAt: "2026-09-01T00:00:00.000Z" });
function projection(): Extract<DurablePurposeProjectionResult, { status: "projected" }> {
  const wrong = gap("gap:wrong", "JARVIS product gap correction — retained Gmail context caused the classification.");
  const correct = gap("gap:correct", "JARVIS product gap correction — the current utterance contained both Reply and Gmail.");
  const resolved = { ...correct, recordId: "resolution:correct", versionId: "resolution:head", semanticClass: "decision" as const, subject: { namespace: "product_gap_resolution", entity: correct.recordId, attribute: "status", revision: "append_only" as const }, payload: { status: "resolved", targetRecordId: correct.recordId } };
  return { status: "projected", purpose: "conversation", items: [wrong, correct, resolved], decisions: [] };
}
const calendar = { createReadConnector: () => { throw new Error("unused"); }, createWriteConnector: () => { throw new Error("unused"); }, hasWriteScope: async () => false, clock: () => new Date("2026-09-03T00:00:00.000Z") };

describe("Product Gap supersession chat integration", () => {
  it("selects the wrong diagnosis and its exact resolved successor before appending", async () => {
    const model = vi.fn(async () => "must not run");
    const appendVersion = vi.fn(async version => ({ status: "appended" as const, version }));
    const dependencies = { clock: calendar.clock, retrieveProjection: async () => projection(), appendVersion };
    const handler = createLighterChatHandler(model, undefined, undefined, undefined, undefined, undefined, calendar, undefined, undefined, undefined, undefined, undefined, dependencies);
    const listed = await (await handler(request("Show me the active JARVIS product gaps for supersession."))).json();
    expect(listed.reply).toContain("retained Gmail context");
    const targeted = await (await handler(request("Select product gap 1 for supersession.", listed.productGapSupersessionReference))).json();
    expect(targeted.reply).toContain("current utterance contained both Reply and Gmail");
    const successor = await (await handler(request("Select product gap 1 as successor.", targeted.productGapSupersessionReference))).json();
    expect(successor.reply).toContain("Selected exact successor Product Gap");
    const persisted = await (await handler(request("Mark this product gap as superseded.", successor.productGapSupersessionReference))).json();
    expect(persisted).toMatchObject({ productGapSupersession: { status: "persisted" }, productGapSupersessionReference: null });
    expect(appendVersion).toHaveBeenCalledTimes(1);
    expect(model).not.toHaveBeenCalled();
  });

  it("contains descriptive/model-selected supersession language", async () => {
    const model = vi.fn(async () => "I selected it");
    const handler = createLighterChatHandler(model, undefined, undefined, undefined, undefined, undefined, calendar);
    const result = await (await handler(request("Supersede the retained Gmail context product gap."))).json();
    expect(result.productGapSupersession.status).toBe("rejected");
    expect(model).not.toHaveBeenCalled();
  });
});
