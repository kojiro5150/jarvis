import { describe, expect, it } from "vitest";
import { proposeCalendarRead } from "./calendar-read-proposal";

const clock = () => new Date("2026-09-07T07:00:00.000Z");

describe("Calendar free-time proposal", () => {
  it("admits the observed request and retains closed intent", () => {
    expect(proposeCalendarRead("Do I have any free time this week? I need to do some more testing on JARVIS.", clock)).toMatchObject({
      capability: "calendar.read", purpose: "calendar_free_time", freeTimeQuery: { includeWeekend: false }, window: { period: "this_week" },
    });
  });

  it("requires an explicit weekend phrase and rejects near misses", () => {
    expect(proposeCalendarRead("Do I have any free time this week, including the weekend?", clock)).toMatchObject({ freeTimeQuery: { includeWeekend: true } });
    expect(proposeCalendarRead("Find some free time whenever you think best.", clock)).toBeNull();
  });
});
