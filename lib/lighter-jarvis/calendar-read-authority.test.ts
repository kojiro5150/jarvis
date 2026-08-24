import { describe, expect, it } from "vitest";
import {
  evaluateCalendarReadAuthority,
} from "./calendar-read-authority";

describe("calendar.read authority", () => {
  it("ALLOW: accepts the canonical explicit Calendar read", () => {
    const decision = evaluateCalendarReadAuthority({
      proposedOperation: { capability: "calendar.read" },
      currentUserUtterance: "What’s on my calendar tomorrow?",
    });

    expect(decision).toEqual({
      capability: "calendar.read",
      decision: "ALLOW",
      reason: "explicit_calendar_read",
      readOnly: true,
    });
    expect(Object.isFrozen(decision)).toBe(true);
  });

  it("ASK: the proposed operation does not authorise an ambiguous current utterance", () => {
    expect(evaluateCalendarReadAuthority({
      proposedOperation: { capability: "calendar.read" },
      currentUserUtterance: "How does tomorrow look?",
    })).toEqual({
      capability: "calendar.read",
      decision: "ASK",
      reason: "explicit_calendar_read_not_established",
      readOnly: true,
    });
  });

  it("ASK: does not inherit authority for an ambiguous current request from prior Calendar context", () => {
    // A previous turn may have discussed the Calendar. It is deliberately not
    // an evaluator input and cannot make this follow-up an explicit read.
    expect(evaluateCalendarReadAuthority({
      proposedOperation: { capability: "calendar.read" },
      currentUserUtterance: "What should I do?",
    })).toEqual({
      capability: "calendar.read",
      decision: "ASK",
      reason: "explicit_calendar_read_not_established",
      readOnly: true,
    });
  });

  it.each([
    "Show my calendar.",
    "Can you check my calendar for Friday?",
    "Do I have anything on my calendar today?",
  ])("allows another explicit read: %j", (currentUserUtterance) => {
    expect(evaluateCalendarReadAuthority({ proposedOperation: { capability: "calendar.read" }, currentUserUtterance })).toMatchObject({
      decision: "ALLOW",
      reason: "explicit_calendar_read",
    });
  });

  it.each([
    "don't show my calendar",
    "do not check my calendar",
    "don't read my calendar",
  ])("never treats a negated read as explicit authority: %j", (currentUserUtterance) => {
    expect(evaluateCalendarReadAuthority({
      proposedOperation: { capability: "calendar.read" },
      currentUserUtterance,
    })).toMatchObject({
      decision: "ASK",
      reason: "explicit_calendar_read_not_established",
    });
  });

  it("does not let mutation wording establish read authority", () => {
    expect(evaluateCalendarReadAuthority({
      proposedOperation: { capability: "calendar.read" },
      currentUserUtterance: "Check my calendar and then add lunch.",
    })).toMatchObject({ decision: "ASK" });
  });
});
