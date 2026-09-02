import { describe, expect, it } from "vitest";

import {
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
});
