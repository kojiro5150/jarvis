import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { MODEL_CONTINUITY_PURPOSE } from "./model-continuity-contract";
import { createProductGapResolutionInitialVersion } from "./product-gap-resolution-persistence";

describe("Product Gap resolution canonical purpose boundary", () => {
  it("persists resolution assertions with the same visibility as captured Product Gaps", () => {
    const version = createProductGapResolutionInitialVersion({
      targetRecordId: "user-continuity:gap",
      statedAt: "2026-09-02T11:10:00.000Z",
    });
    expect(version?.record.visibility.purposes).toEqual([MODEL_CONTINUITY_PURPOSE]);
  });

  it("retrieves the live resolution projection through the canonical continuity purpose", () => {
    const source = readFileSync(
      "lib/operating-picture/production-product-gap-resolution.ts",
      "utf8",
    );
    expect(source).toContain('const PURPOSE = MODEL_CONTINUITY_PURPOSE;');
    expect(source).not.toContain('const PURPOSE = "model_continuity_context";');
  });
});
