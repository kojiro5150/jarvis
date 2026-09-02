import { describe, expect, it } from "vitest";

import {
  advanceProductGapResolutionListReference,
  consumeProductGapResolutionTargetReference,
  createProductGapResolutionListReference,
  createProductGapResolutionTargetReference,
  parseProductGapResolutionSelection,
  parseProductGapResolutionWriteIntent,
  resolveProductGapResolutionListReference,
} from "./product-gap-resolution-reference";

const now = new Date("2026-09-02T10:00:00.000Z");

describe("Product Gap resolution references", () => {
  it("binds a closed ordinal to the exact record and head without exposing either", () => {
    const reference = createProductGapResolutionListReference({
      candidates: [
        { recordId: "user-continuity:one", versionId: "version-one", statement: "JARVIS product gap one" },
        { recordId: "user-continuity:two", versionId: "version-two", statement: "JARVIS product gap two" },
      ],
      now,
    });
    expect(reference).toMatch(/^[0-9a-f-]{36}$/);
    expect(reference).not.toContain("user-continuity");
    expect(parseProductGapResolutionSelection("Select the second product gap for resolution.")).toBe(2);

    const selected = resolveProductGapResolutionListReference({ reference, ordinal: 2, now });
    expect(selected).toEqual({
      recordId: "user-continuity:two",
      versionId: "version-two",
      statement: "JARVIS product gap two",
    });
  });

  it("keeps selection and resolution grammar whole-utterance anchored", () => {
    expect(parseProductGapResolutionSelection("Select product gap 10 for resolution.")).toBe(10);
    expect(parseProductGapResolutionSelection("Select the tenth product gap for resolution.")).toBe(10);
    expect(parseProductGapResolutionSelection("Please select product gap 1 for resolution.")).toBeNull();
    expect(parseProductGapResolutionSelection("Select product gap 11 for resolution.")).toBeNull();
    expect(parseProductGapResolutionWriteIntent("Mark this product gap as resolved.")).toBe(true);
    expect(parseProductGapResolutionWriteIntent("Resolve this product gap.")).toBe(true);
    expect(parseProductGapResolutionWriteIntent("I think this product gap is resolved.")).toBe(false);
  });

  it("makes target references opaque, one-shot and TTL bounded", () => {
    const reference = createProductGapResolutionTargetReference({
      target: { recordId: "user-continuity:one", versionId: "version-one" },
      now,
    });
    expect(consumeProductGapResolutionTargetReference({ reference, now })).toEqual({
      recordId: "user-continuity:one",
      versionId: "version-one",
    });
    expect(consumeProductGapResolutionTargetReference({ reference, now })).toBeNull();

    const expired = createProductGapResolutionTargetReference({
      target: { recordId: "user-continuity:two", versionId: "version-two" },
      now,
    });
    expect(consumeProductGapResolutionTargetReference({
      reference: expired,
      now: new Date(now.getTime() + 15 * 60 * 1000 + 1),
    })).toBeNull();
  });

  it("pages at ten exact IDs and rejects history references in active selection", () => {
    const candidates = Array.from({ length: 11 }, (_, index) => ({
      recordId: `user-continuity:${index + 1}`,
      versionId: `version-${index + 1}`,
      statement: `JARVIS product gap ${index + 1}`,
    }));
    const reference = createProductGapResolutionListReference({ candidates, now });
    expect(reference).not.toBeNull();
    const next = advanceProductGapResolutionListReference({ reference, now });
    expect(next?.candidates).toHaveLength(1);
    expect(next?.candidates[0]?.recordId).toBe("user-continuity:11");

    const history = createProductGapResolutionListReference({ candidates: candidates.slice(0, 1), now, kind: "history" });
    expect(resolveProductGapResolutionListReference({ reference: history, ordinal: 1, now })).toBeNull();
  });
});
