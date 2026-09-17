import { describe, expect, it } from "vitest";

import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import { persistProductGapSupersessionAssertion, productGapSupersessionRecordId } from "./product-gap-supersession-persistence";

function projection(resolvedSuccessor = true): Extract<DurablePurposeProjectionResult, { status: "projected" }> {
  const gap = (id: string, statement: string) => ({
    recordId: id, versionId: `${id}:head`, purpose: "conversation", semanticClass: "user_assertion" as const,
    lifecycle: "current" as const, recoveryDisposition: "recoverable_user_continuity" as const,
    subject: { namespace: "user_continuity", entity: id, attribute: "user_assertion", revision: "append_only" as const },
    payload: { statement }, visibilityPurposes: ["conversation"], validFrom: null, validUntil: null, staleAfter: null,
    authorshipSource: "user" as const, authorshipAt: "2026-09-01T00:00:00.000Z",
  });
  const target = gap("gap:wrong", "JARVIS product gap correction — wrong retained-context diagnosis");
  const successor = gap("gap:correct", "JARVIS product gap correction — current-utterance regex diagnosis");
  const resolution = { ...successor, recordId: "resolution:correct", versionId: "resolution:head", semanticClass: "decision" as const,
    subject: { namespace: "product_gap_resolution", entity: successor.recordId, attribute: "status", revision: "append_only" as const },
    payload: { status: "resolved", targetRecordId: successor.recordId }, authorshipAt: "2026-09-02T00:00:00.000Z" };
  return { status: "projected", purpose: "conversation", items: resolvedSuccessor ? [target, successor, resolution] : [target, successor], decisions: [] };
}

describe("Product Gap supersession persistence", () => {
  it("appends superseded_by while leaving a resolved successor unchanged", async () => {
    const appended: unknown[] = [];
    const result = await persistProductGapSupersessionAssertion({
      pair: { target: { recordId: "gap:wrong", versionId: "gap:wrong:head" }, successor: { recordId: "gap:correct", versionId: "gap:correct:head" } },
      statedAt: "2026-09-03T00:00:00.000Z", retrieveProjection: async () => projection(),
      appendVersion: async version => { appended.push(version); return { status: "appended", version }; },
    });
    expect(result.status).toBe("persisted");
    expect(appended).toHaveLength(1);
    expect(appended[0]).toMatchObject({ recordId: productGapSupersessionRecordId("gap:wrong"), record: {
      subject: { namespace: "product_gap_supersession", entity: "gap:wrong", attribute: "successor", revision: "append_only" },
      value: { relationship: "superseded_by", targetRecordId: "gap:wrong", successorRecordId: "gap:correct", successorVersionId: "gap:correct:head" },
    } });
  });

  it("fails closed when target and successor are the same", async () => {
    const result = await persistProductGapSupersessionAssertion({
      pair: { target: { recordId: "gap:wrong", versionId: "gap:wrong:head" }, successor: { recordId: "gap:wrong", versionId: "gap:wrong:head" } },
      statedAt: "2026-09-03T00:00:00.000Z", retrieveProjection: async () => projection(false),
      appendVersion: async () => { throw new Error("must not append"); },
    });
    expect(result).toEqual({ status: "rejected", reason: "successor_ineligible" });
  });

  it("rejects a resolved target before append", async () => {
    const current = projection(false);
    const target = current.items[0];
    const resolvedTarget = { ...target, recordId: "resolution:wrong", versionId: "resolution:wrong:head", semanticClass: "decision" as const,
      subject: { namespace: "product_gap_resolution", entity: "gap:wrong", attribute: "status", revision: "append_only" as const }, payload: { status: "resolved", targetRecordId: "gap:wrong" } };
    const result = await persistProductGapSupersessionAssertion({
      pair: { target: { recordId: "gap:wrong", versionId: "gap:wrong:head" }, successor: { recordId: "gap:correct", versionId: "gap:correct:head" } },
      statedAt: "2026-09-03T00:00:00.000Z", retrieveProjection: async () => ({ ...current, items: [...current.items, resolvedTarget] }),
      appendVersion: async () => { throw new Error("must not append"); },
    });
    expect(result).toEqual({ status: "rejected", reason: "already_closed" });
  });

  it("permits only one append when independent writers race", async () => {
    const created = new Set<string>();
    const appendVersion = async (version: Parameters<Parameters<typeof persistProductGapSupersessionAssertion>[0]["appendVersion"]>[0]) => {
      await Promise.resolve();
      if (created.has(version.recordId)) return { status: "rejected" as const, reason: "record_already_exists" as const };
      created.add(version.recordId); return { status: "appended" as const, version };
    };
    const attempt = () => persistProductGapSupersessionAssertion({ pair: { target: { recordId: "gap:wrong", versionId: "gap:wrong:head" }, successor: { recordId: "gap:correct", versionId: "gap:correct:head" } }, statedAt: "2026-09-03T00:00:00.000Z", retrieveProjection: async () => projection(), appendVersion });
    const results = await Promise.all([attempt(), attempt()]);
    expect(results.filter(result => result.status === "persisted")).toHaveLength(1);
    expect(results.filter(result => result.status === "rejected" && result.reason === "already_closed")).toHaveLength(1);
  });
});
