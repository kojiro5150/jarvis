import { describe, expect, it } from "vitest";

import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import {
  persistProductGapResolutionAssertion,
  productGapResolutionRecordId,
} from "./product-gap-resolution-persistence";

function projection(options: { resolved?: boolean; versionId?: string } = {}): DurablePurposeProjectionResult {
  const original = {
    recordId: "user-continuity:gap",
    versionId: options.versionId ?? "gap-head",
    purpose: "model_continuity_context",
    semanticClass: "user_assertion" as const,
    lifecycle: "current" as const,
    recoveryDisposition: "recoverable_user_continuity" as const,
    subject: { namespace: "user_continuity", entity: "user-continuity:gap", attribute: "user_assertion", revision: "append_only" as const },
    payload: { statement: "JARVIS product gap: close it" },
    visibilityPurposes: ["model_continuity_context"],
    validFrom: null,
    validUntil: null,
    staleAfter: null,
    authorshipSource: "user" as const,
    authorshipAt: "2026-09-01T00:00:00.000Z",
  };
  const items = options.resolved ? [original, {
    ...original,
    recordId: productGapResolutionRecordId(original.recordId),
    versionId: "resolution-head",
    semanticClass: "decision" as const,
    subject: { namespace: "product_gap_resolution", entity: original.recordId, attribute: "status", revision: "append_only" as const },
    payload: { status: "resolved", targetRecordId: original.recordId },
    authorshipAt: "2026-09-02T10:00:00.000Z",
  }] : [original];
  return { status: "projected", purpose: "model_continuity_context", items, decisions: [] };
}

describe("Product Gap resolution persistence", () => {
  it("appends one deterministic user-authored decision after fresh exact-head validation", async () => {
    const appended: unknown[] = [];
    const result = await persistProductGapResolutionAssertion({
      target: { recordId: "user-continuity:gap", versionId: "gap-head" },
      statedAt: "2026-09-02T10:00:00.000Z",
      retrieveProjection: async () => projection(),
      appendVersion: async version => {
        appended.push(version);
        return { status: "appended", version };
      },
    });
    expect(result.status).toBe("persisted");
    expect(appended).toHaveLength(1);
    expect(appended[0]).toMatchObject({
      recordId: productGapResolutionRecordId("user-continuity:gap"),
      record: {
        class: "decision",
        subject: { namespace: "product_gap_resolution", entity: "user-continuity:gap", revision: "append_only" },
        value: { status: "resolved", targetRecordId: "user-continuity:gap" },
        authorship: { source: "user", statedAt: "2026-09-02T10:00:00.000Z" },
      },
    });
  });

  it("rejects changed heads, missing targets and sequential duplicates before append", async () => {
    let appends = 0;
    const appendVersion = async () => { appends += 1; return { status: "rejected" as const, reason: "record_already_exists" as const }; };
    for (const current of [projection({ versionId: "changed" }), projection({ resolved: true }), { status: "empty", purpose: "model_continuity_context", items: [], decisions: [] } as const]) {
      const result = await persistProductGapResolutionAssertion({
        target: { recordId: "user-continuity:gap", versionId: "gap-head" },
        statedAt: "2026-09-02T10:00:00.000Z",
        retrieveProjection: async () => current,
        appendVersion,
      });
      expect(result.status).toBe("rejected");
    }
    expect(appends).toBe(0);
  });

  it("maps an atomic deterministic-ID collision to duplicate failure", async () => {
    const result = await persistProductGapResolutionAssertion({
      target: { recordId: "user-continuity:gap", versionId: "gap-head" },
      statedAt: "2026-09-02T10:00:00.000Z",
      retrieveProjection: async () => projection(),
      appendVersion: async () => ({ status: "rejected", reason: "record_already_exists" }),
    });
    expect(result).toEqual({ status: "rejected", reason: "already_resolved" });
  });

  it("permits at most one success when two writers race from independent stale references", async () => {
    const created = new Set<string>();
    const appendVersion = async (version: Parameters<Parameters<typeof persistProductGapResolutionAssertion>[0]["appendVersion"]>[0]) => {
      await Promise.resolve();
      if (created.has(version.recordId)) return { status: "rejected" as const, reason: "record_already_exists" as const };
      created.add(version.recordId);
      return { status: "appended" as const, version };
    };
    const attempt = () => persistProductGapResolutionAssertion({
      target: { recordId: "user-continuity:gap", versionId: "gap-head" },
      statedAt: "2026-09-02T10:00:00.000Z",
      retrieveProjection: async () => projection(),
      appendVersion,
    });
    const results = await Promise.all([attempt(), attempt()]);
    expect(results.filter(result => result.status === "persisted")).toHaveLength(1);
    expect(results.filter(result => result.status === "rejected" && result.reason === "already_resolved")).toHaveLength(1);
    expect(created).toEqual(new Set([productGapResolutionRecordId("user-continuity:gap")]));
  });
});
