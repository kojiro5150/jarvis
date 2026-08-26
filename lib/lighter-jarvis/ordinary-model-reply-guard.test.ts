import { describe, expect, it } from "vitest";
import {
  guardOrdinaryModelReply,
  NEUTRALIZED_ORDINARY_AUTHORITY_REPLY,
} from "./ordinary-model-reply-guard";

describe("ordinary-model reply guard", () => {
  it.each([
    "Please explicitly confirm that I may read your Calendar.",
    "Can I access your calendar? Reply yes to confirm.",
    "I need your permission to search Gmail. Say yes to continue.",
    "Please authorize me to check your inbox.",
  ])("neutralizes private-source confirmation UX: %s", (reply) => {
    expect(guardOrdinaryModelReply(reply)).toBe(NEUTRALIZED_ORDINARY_AUTHORITY_REPLY);
  });

  it.each([
    "[Governed private result omitted from ordinary model context.]",
    "[Prior governed Gmail read request omitted from ordinary model context.]",
  ])("never presents an internal history marker: %s", (marker) => {
    expect(guardOrdinaryModelReply(`Answer. ${marker}`)).toBe("Answer.");
    expect(guardOrdinaryModelReply(marker)).toBe(NEUTRALIZED_ORDINARY_AUTHORITY_REPLY);
  });

  it("preserves ordinary replies and non-authority Calendar discussion", () => {
    expect(guardOrdinaryModelReply("Monday is a weekday.")).toBe("Monday is a weekday.");
    expect(guardOrdinaryModelReply("Calendar access requires deterministic authority machinery."))
      .toBe("Calendar access requires deterministic authority machinery.");
  });
});
