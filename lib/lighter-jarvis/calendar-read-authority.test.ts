import { describe, expect, it } from "vitest";
import {
  evaluateCalendarReadAuthority,
} from "./calendar-read-authority";

const TEST_WINDOW = Object.freeze({ start: "2026-08-25T00:00:00.000Z", end: "2026-09-01T00:00:00.000Z", timeZone: "Australia/Melbourne", period: "default" as const });
describe("calendar.read authority", () => {
  it("ALLOW: accepts the canonical explicit Calendar read", () => {
    const decision = evaluateCalendarReadAuthority({
      proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
      currentUserUtterance: "What’s on my calendar tomorrow?",
    });

    expect(decision).toEqual({
      capability: "calendar.read",
      decision: "ALLOW",
      reason: "explicit_calendar_read",
      readOnly: true,
      authorityEvidence: [{
        source: "current_user_utterance",
        utterance: "What’s on my calendar tomorrow?",
        basis: "explicit_calendar_read",
      }],
    });
    expect(Object.isFrozen(decision)).toBe(true);
    expect(Object.isFrozen(decision.authorityEvidence)).toBe(true);
    expect(Object.isFrozen(decision.authorityEvidence[0])).toBe(true);
  });

  it("ASK: the proposed operation does not authorise an ambiguous current utterance", () => {
    expect(evaluateCalendarReadAuthority({
      proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
      currentUserUtterance: "How does tomorrow look?",
    })).toEqual({
      capability: "calendar.read",
      decision: "ASK",
      reason: "explicit_calendar_read_not_established",
      readOnly: true,
      authorityEvidence: [],
    });
  });

  it("ASK: does not inherit authority for an ambiguous current request from prior Calendar context", () => {
    // A previous turn may have discussed the Calendar. It is deliberately not
    // an evaluator input and cannot make this follow-up an explicit read.
    expect(evaluateCalendarReadAuthority({
      proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
      currentUserUtterance: "What should I do?",
    })).toEqual({
      capability: "calendar.read",
      decision: "ASK",
      reason: "explicit_calendar_read_not_established",
      readOnly: true,
      authorityEvidence: [],
    });
  });

  it.each([
    "Show my calendar.",
    "Can you check my calendar for Friday?",
    "Do I have anything on my calendar today?",
  ])("allows another explicit read: %j", (currentUserUtterance) => {
    expect(evaluateCalendarReadAuthority({ proposedOperation: { capability: "calendar.read", window: TEST_WINDOW }, currentUserUtterance })).toMatchObject({
      decision: "ALLOW",
      reason: "explicit_calendar_read",
    });
  });

  it.each([
    "don't show my calendar",
    "do not check my calendar",
    "don't read my calendar",
    "please don't show my calendar",
    "I don't want you to check my calendar",
    "do not ever read my calendar",
    "never show my calendar",
    "please do not open my calendar",
    "Can you not show my calendar?",
    "I don’t want you to read my calendar.",
    "Never, under any circumstances, check my calendar.",
  ])("never treats a negated read as explicit authority: %j", (currentUserUtterance) => {
    expect(evaluateCalendarReadAuthority({
      proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
      currentUserUtterance,
    })).toMatchObject({
      decision: "ASK",
      reason: "explicit_calendar_read_not_established",
      authorityEvidence: [],
    });
  });

  it("does not let mutation wording establish read authority", () => {
    expect(evaluateCalendarReadAuthority({
      proposedOperation: { capability: "calendar.read", window: TEST_WINDOW },
      currentUserUtterance: "Check my calendar and then add lunch.",
    })).toMatchObject({ decision: "ASK" });
  });
});
