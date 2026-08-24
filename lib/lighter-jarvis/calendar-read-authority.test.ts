import { describe, expect, it } from "vitest";
import {
  evaluateCalendarReadAuthority,
} from "./calendar-read-authority";

describe("calendar.read authority", () => {
  it("ALLOW: accepts the canonical explicit Calendar read", () => {
    const decision = evaluateCalendarReadAuthority({
      currentUserUtterance: "What's on my calendar tomorrow?",
    });

    expect(decision).toEqual({
      capability: "calendar.read",
      decision: "ALLOW",
      reason: "explicit_calendar_read",
      readOnly: true,
    });
    expect(Object.isFrozen(decision)).toBe(true);
  });

  it("DENY: rejects the canonical Calendar mutation request", () => {
    expect(evaluateCalendarReadAuthority({
      currentUserUtterance: "Add lunch to my calendar tomorrow.",
    })).toEqual({
      capability: "calendar.read",
      decision: "DENY",
      reason: "calendar_read_not_requested",
      readOnly: true,
    });
  });

  it("ASK: does not inherit authority for an ambiguous current request from prior Calendar context", () => {
    // A previous turn may have discussed the Calendar. It is deliberately not
    // an evaluator input and cannot make this follow-up an explicit read.
    expect(evaluateCalendarReadAuthority({
      currentUserUtterance: "What about tomorrow?",
    })).toEqual({
      capability: "calendar.read",
      decision: "ASK",
      reason: "ambiguous_current_request",
      readOnly: true,
    });
  });

  it.each([
    "Show my calendar.",
    "Can you check my calendar for Friday?",
    "Do I have anything on my calendar today?",
  ])("allows another explicit read: %j", (currentUserUtterance) => {
    expect(evaluateCalendarReadAuthority({ currentUserUtterance })).toMatchObject({
      decision: "ALLOW",
      reason: "explicit_calendar_read",
    });
  });

  it("does not let a read phrase override a mutation", () => {
    expect(evaluateCalendarReadAuthority({
      currentUserUtterance: "Check my calendar and then add lunch.",
    })).toMatchObject({ decision: "DENY" });
  });
});
