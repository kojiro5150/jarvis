import { describe, expect, it } from "vitest";
import {
  createInferenceRecord,
  createUserAssertionRecord,
} from "./record-core";
import { markModelText } from "../governance-core/trust-types";

describe("Governed Operating Picture semantic record core", () => {
  it("preserves explicit semantic class, authorship, lifecycle and visibility", () => {
    const record = createUserAssertionRecord({
      id: "user:preference",
      value: "I prefer mornings.",
      statedAt: "2026-08-30T04:30:00Z",
      visibility: ["planning", "conversation"],
      staleAfter: "2027-08-30T00:00:00Z",
    });

    expect(record).toEqual({
      id: "user:preference",
      class: "user_assertion",
      value: "I prefer mornings.",
      lifecycle: "current",
      visibility: { purposes: ["planning", "conversation"] },
      staleAfter: "2027-08-30T00:00:00Z",
      authorship: {
        source: "user",
        statedAt: "2026-08-30T04:30:00Z",
      },
    });
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.visibility)).toBe(true);
    expect(Object.isFrozen(record.visibility.purposes)).toBe(true);
  });

  it("keeps model-authored cognition explicitly low-trust", () => {
    const record = createInferenceRecord({
      id: "model:inference",
      value: markModelText("This may need attention."),
      generatedAt: "2026-08-30T04:30:00Z",
      visibility: ["conversation"],
    });

    expect(record.class).toBe("inference");
    expect(record.authorship.source).toBe("model");
    expect(record.lifecycle).toBe("current");
  });
});
