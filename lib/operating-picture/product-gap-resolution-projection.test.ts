import { describe, expect, it } from "vitest";

import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import { projectProductGapResolutionStatus } from "./product-gap-resolution-projection";

const original = Object.freeze({
  recordId: "user-continuity:gap",
  versionId: "gap-head",
  purpose: "conversation",
  semanticClass: "user_assertion" as const,
  lifecycle: "current" as const,
  recoveryDisposition: "recoverable_user_continuity" as const,
  subject: Object.freeze({ namespace: "user_continuity", entity: "user-continuity:gap", attribute: "user_assertion", revision: "append_only" as const }),
  payload: Object.freeze({ statement: "JARVIS product gap — exact original" }),
  visibilityPurposes: Object.freeze(["conversation"]),
  validFrom: null,
  validUntil: null,
  staleAfter: null,
  authorshipSource: "user" as const,
  authorshipAt: "2026-09-01T00:00:00.000Z",
});

const resolution = Object.freeze({
  ...original,
  recordId: "product-gap-resolution:hash",
  versionId: "resolution-head",
  semanticClass: "decision" as const,
  subject: Object.freeze({ namespace: "product_gap_resolution", entity: original.recordId, attribute: "status", revision: "append_only" as const }),
  payload: Object.freeze({ status: "resolved", targetRecordId: original.recordId }),
  authorshipAt: "2026-09-02T10:00:00.000Z",
});

function projected(items: Extract<DurablePurposeProjectionResult, { status: "projected" }>["items"]): DurablePurposeProjectionResult {
  return Object.freeze({ status: "projected", purpose: "conversation", items, decisions: Object.freeze([]) });
}

describe("Product Gap effective-status projection", () => {
  it("excludes resolved originals from active while preserving immutable history", () => {
    expect(projectProductGapResolutionStatus(projected([original, resolution]))).toEqual({
      status: "projected",
      active: [],
      history: [{ recordId: original.recordId, versionId: original.versionId, statement: original.payload.statement, status: "resolved", resolvedAt: resolution.authorshipAt }],
    });
  });

  it("fails closed on duplicate assertions or an assertion targeting no Product Gap", () => {
    const duplicate = Object.freeze({ ...resolution, recordId: "product-gap-resolution:other", versionId: "resolution-other" });
    expect(projectProductGapResolutionStatus(projected([original, resolution, duplicate]))).toEqual({ status: "rejected", reason: "resolution_integrity_failure" });
    expect(projectProductGapResolutionStatus(projected([resolution]))).toEqual({ status: "rejected", reason: "resolution_integrity_failure" });
  });
});
