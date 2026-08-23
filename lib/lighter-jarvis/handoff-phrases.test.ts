import { describe, expect, it } from "vitest";
import { CONFIRM_PHRASES, DECLINE_PHRASES, handoffResponse } from "@/lib/lighter-jarvis/handoff-phrases";

describe("handoffResponse", () => {
  it.each(CONFIRM_PHRASES)("recognizes the confirmation phrase %s", phrase => {
    expect(handoffResponse(`  ${phrase.toUpperCase()}!  `)).toBe("confirm");
  });

  it.each(DECLINE_PHRASES)("recognizes the decline phrase %s", phrase => {
    expect(handoffResponse(`${phrase}?`)).toBe("decline");
  });

  it("strips only one trailing punctuation character and requires an exact match", () => {
    expect(handoffResponse("yes please tell me more")).toBeUndefined();
    expect(handoffResponse("okay!!")).toBeUndefined();
    expect(handoffResponse("do")).toBeUndefined();
  });
});
