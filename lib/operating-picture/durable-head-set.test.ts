import { describe, expect, it } from "vitest";

import type { DurableOperatingPictureHead } from "./durable-store-contract";
import {
  sameDurableOperatingPictureHeadSet,
} from "./durable-head-set";

function head(recordId: string, versionId: string): DurableOperatingPictureHead {
  return Object.freeze({ recordId, versionId });
}

describe("durable Operating Picture head-set equality", () => {
  it("treats equal record/version sets as equal regardless of order", () => {
    const a = head("record:a", "11111111-1111-4111-8111-111111111111");
    const b = head("record:b", "22222222-2222-4222-8222-222222222222");

    expect(sameDurableOperatingPictureHeadSet([a, b], [b, a])).toBe(true);
  });

  it("rejects a changed head version", () => {
    expect(sameDurableOperatingPictureHeadSet(
      [head("record:a", "11111111-1111-4111-8111-111111111111")],
      [head("record:a", "22222222-2222-4222-8222-222222222222")],
    )).toBe(false);
  });

  it("rejects duplicate record identities on either side", () => {
    const first = head("record:a", "11111111-1111-4111-8111-111111111111");
    const second = head("record:a", "22222222-2222-4222-8222-222222222222");

    expect(sameDurableOperatingPictureHeadSet(
      [first, second],
      [first, second],
    )).toBe(false);

    expect(sameDurableOperatingPictureHeadSet(
      [first],
      [first, second],
    )).toBe(false);
  });

  it("rejects additions or removals", () => {
    const a = head("record:a", "11111111-1111-4111-8111-111111111111");
    const b = head("record:b", "22222222-2222-4222-8222-222222222222");

    expect(sameDurableOperatingPictureHeadSet([a], [a, b])).toBe(false);
    expect(sameDurableOperatingPictureHeadSet([a, b], [a])).toBe(false);
  });
});
