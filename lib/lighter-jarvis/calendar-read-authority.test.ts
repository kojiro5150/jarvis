import { describe, expect, it } from "vitest";
import {
  CALENDAR_READ_CAPABILITY,
  evaluateCalendarReadAuthority,
} from "./calendar-read-authority";

describe("calendar.read authority", () => {
  it("places an explicit user-initiated calendar read within authority", () => {
    const decision = evaluateCalendarReadAuthority({
      capability: CALENDAR_READ_CAPABILITY,
      userInitiated: true,
    });

    expect(decision).toEqual({
      capability: "calendar.read",
      decision: "within_authority",
      reason: "explicit_user_calendar_read",
      readOnly: true,
    });
    expect(Object.isFrozen(decision)).toBe(true);
  });

  it("fails closed when the read was not initiated by the user", () => {
    expect(evaluateCalendarReadAuthority({
      capability: CALENDAR_READ_CAPABILITY,
      userInitiated: false,
    })).toEqual({
      capability: "calendar.read",
      decision: "outside_authority",
      reason: "not_user_initiated",
      readOnly: true,
    });
  });

  it.each([
    "calendar.write",
    "calendar.create",
    "calendar.readwrite",
    "calendar.read ",
    "",
  ])("fails closed for non-calendar.read capability %j", (capability) => {
    expect(evaluateCalendarReadAuthority({
      capability,
      userInitiated: true,
    })).toMatchObject({
      decision: "outside_authority",
      reason: "capability_not_permitted",
    });
  });
});
