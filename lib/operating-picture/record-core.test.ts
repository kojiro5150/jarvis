import { describe, expect, it } from "vitest";
import {
  createInferenceRecord,
  createUserAssertionRecord,
  sameOperatingPictureSubject,
} from "./record-core";
import { markModelText } from "../governance-core/trust-types";

describe("Governed Operating Picture semantic record core", () => {
  it("preserves explicit semantic class, authorship, lifecycle and visibility", () => {
    const record = createUserAssertionRecord({
      id: "user:preference",
      subject: { namespace: "user", entity: "preferences", attribute: "time_of_day" },
      value: "I prefer mornings.",
      statedAt: "2026-08-30T04:30:00Z",
      visibility: ["planning", "conversation"],
      staleAfter: "2027-08-30T00:00:00Z",
    });

    expect(record).toEqual({
      id: "user:preference",
      subject: { namespace: "user", entity: "preferences", attribute: "time_of_day" },
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
    expect(Object.isFrozen(record.subject)).toBe(true);
    expect(Object.isFrozen(record.visibility)).toBe(true);
    expect(Object.isFrozen(record.visibility.purposes)).toBe(true);
  });

  it("keeps model-authored cognition explicitly low-trust", () => {
    const record = createInferenceRecord({
      id: "model:inference",
      subject: { namespace: "executive", entity: "attention", attribute: "assessment" },
      value: markModelText("This may need attention."),
      generatedAt: "2026-08-30T04:30:00Z",
      visibility: ["conversation"],
    });

    expect(record.class).toBe("inference");
    expect(record.authorship.source).toBe("model");
    expect(record.lifecycle).toBe("current");
  });

  it("distinguishes record identity from canonical subject identity", () => {
    const first = createUserAssertionRecord({
      id: "user:preference:1",
      subject: { namespace: "user", entity: "preferences", attribute: "time_of_day" },
      value: "I prefer mornings.",
      statedAt: "2026-08-30T04:30:00Z",
      visibility: ["planning"],
    });
    const second = createUserAssertionRecord({
      id: "user:preference:2",
      subject: { namespace: "user", entity: "preferences", attribute: "time_of_day" },
      value: "I now prefer afternoons.",
      statedAt: "2026-09-01T04:30:00Z",
      visibility: ["planning"],
    });
    const differentAttribute = createUserAssertionRecord({
      id: "user:preference:3",
      subject: { namespace: "user", entity: "preferences", attribute: "meeting_length" },
      value: "I prefer 30 minute meetings.",
      statedAt: "2026-09-01T04:30:00Z",
      visibility: ["planning"],
    });

    expect(first.id).not.toBe(second.id);
    expect(sameOperatingPictureSubject(first, second)).toBe(true);
    expect(sameOperatingPictureSubject(first, differentAttribute)).toBe(false);
  });
});
