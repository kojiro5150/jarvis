import { describe, expect, it } from "vitest";
import { evaluateCalendarReadAuthority } from "./calendar-read-authority";
import { proposeCalendarRead } from "./calendar-read-proposal";

describe("calendar.read proposal boundary", () => {
  it("proposes a temporal schedule question without treating the proposal as authority", () => {
    const utterance = "How does tomorrow look?";
    const proposedOperation = proposeCalendarRead(utterance);
    expect(proposedOperation).toEqual({ capability: "calendar.read" });
    expect(evaluateCalendarReadAuthority({ proposedOperation: proposedOperation!, currentUserUtterance: utterance }))
      .toMatchObject({ decision: "ASK", authorityEvidence: [] });
  });

  it("does not propose Calendar acquisition for unrelated conversation", () => {
    expect(proposeCalendarRead("Help me draft a note")).toBeNull();
  });
});
