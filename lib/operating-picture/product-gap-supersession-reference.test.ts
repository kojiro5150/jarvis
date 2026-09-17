import { describe, expect, it } from "vitest";
import { createProductGapSupersessionReference, parseProductGapSupersessionSuccessorSelection, parseProductGapSupersessionTargetSelection, parseProductGapSupersessionWriteIntent, selectProductGapSupersessionSuccessor, selectProductGapSupersessionTarget, consumeProductGapSupersessionPair } from "./product-gap-supersession-reference";

describe("Product Gap supersession references", () => {
  it("binds two exact stored records without exposing identity in the utterance", () => {
    const now = new Date("2026-09-03T00:00:00.000Z");
    const candidates = [{ recordId: "wrong", versionId: "w1", statement: "JARVIS product gap — wrong" }, { recordId: "correct", versionId: "c1", statement: "JARVIS product gap — correct" }];
    const listed = createProductGapSupersessionReference({ candidates, now });
    expect(listed?.reference).toMatch(/^[0-9a-f-]{36}$/);
    const target = selectProductGapSupersessionTarget({ reference: listed?.reference, ordinal: 1, successors: candidates, now });
    expect(target?.page).toEqual([candidates[1]]);
    const successor = selectProductGapSupersessionSuccessor({ reference: target?.reference, ordinal: 1, now });
    expect(consumeProductGapSupersessionPair({ reference: successor?.reference, now })).toEqual({ target: { recordId: "wrong", versionId: "w1" }, successor: { recordId: "correct", versionId: "c1" } });
    expect(consumeProductGapSupersessionPair({ reference: successor?.reference, now })).toBeNull();
  });
  it("uses a closed grammar", () => {
    expect(parseProductGapSupersessionTargetSelection("Select product gap 5 for supersession.")).toBe(5);
    expect(parseProductGapSupersessionSuccessorSelection("Select the second product gap as successor.")).toBe(2);
    expect(parseProductGapSupersessionWriteIntent("Mark this product gap as superseded.")).toBe(true);
    expect(parseProductGapSupersessionWriteIntent("Supersede the wrong diagnosis.")).toBe(false);
  });

  it("fails closed on expiry, fabrication, wrong stage, replay and out-of-range ordinals", () => {
    const now = new Date("2026-09-03T00:00:00.000Z");
    const candidates = [{ recordId: "wrong", versionId: "w1", statement: "JARVIS product gap — wrong" }, { recordId: "correct", versionId: "c1", statement: "JARVIS product gap — correct" }];
    const expired = createProductGapSupersessionReference({ candidates, now });
    expect(selectProductGapSupersessionTarget({ reference: expired?.reference, ordinal: 1, successors: candidates, now: new Date("2026-09-03T00:16:00.000Z") })).toBeNull();
    expect(selectProductGapSupersessionTarget({ reference: "fabricated", ordinal: 1, successors: candidates, now })).toBeNull();
    const listed = createProductGapSupersessionReference({ candidates, now });
    expect(selectProductGapSupersessionSuccessor({ reference: listed?.reference, ordinal: 1, now })).toBeNull();
    expect(selectProductGapSupersessionTarget({ reference: listed?.reference, ordinal: 10, successors: candidates, now })).toBeNull();
  });
});
