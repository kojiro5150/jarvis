import { beforeEach, describe, expect, it } from "vitest";
import {
  createDurableContinuityReleaseReference,
  resetDurableContinuityReleaseReferencesForTests,
  resolveDurableContinuityReleaseReference,
} from "./durable-continuity-release-reference";

describe("durable continuity release references", () => {
  beforeEach(resetDurableContinuityReleaseReferencesForTests);

  it("keeps release identity server-side behind an opaque bounded reference", () => {
    const reference = createDurableContinuityReleaseReference({
      presentation: "Relevant remembered context:\n- remembered item",
      now: 1_000,
    });

    expect(reference).toEqual({
      durableContinuityReleaseReferenceId: expect.stringMatching(/^[0-9a-f-]{36}$/),
    });

    const record = resolveDurableContinuityReleaseReference(reference, 1_001);
    expect(record).toMatchObject({
      referenceId: reference.durableContinuityReleaseReferenceId,
      createdAt: 1_000,
      expiresAt: 901_000,
      status: "eligible",
    });
    expect(JSON.stringify(reference)).not.toContain("remembered item");
  });

  it("fails closed for fabricated and expired references", () => {
    expect(resolveDurableContinuityReleaseReference({
      durableContinuityReleaseReferenceId: "00000000-0000-4000-8000-000000000000",
    }, 1_000)).toBeNull();

    const reference = createDurableContinuityReleaseReference({
      presentation: "Stored JARVIS product gaps (1):\n1. gap",
      now: 1_000,
    });
    expect(resolveDurableContinuityReleaseReference(reference, 901_000)).toBeNull();
  });
});
