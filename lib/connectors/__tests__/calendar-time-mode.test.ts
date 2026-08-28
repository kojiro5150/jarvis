import { describe, expect, it } from "vitest";
import {
  CALENDAR_EVENT_LABEL_NAME_MODE_MAP,
  classifyCalendarEventTimeMode,
  resolveCalendarEventLabelModeMap,
} from "../calendar-time-mode";

describe("Calendar event time mode mapping", () => {
  it("maps only the five exact governed label names", () => {
    expect(CALENDAR_EVENT_LABEL_NAME_MODE_MAP).toEqual({
      "Routine / Transactional": "routine",
      "Deep Work / Discovery": "deep_work",
      Reflection: "reflection",
      Development: "development",
      "Self-Care": "self_care",
    });
  });

  it("materializes native label ids from matching label definitions", () => {
    const map = resolveCalendarEventLabelModeMap([
      { id: "id-routine", name: "Routine / Transactional", backgroundColor: "#d50000" },
      { id: "id-deep", name: "Deep Work / Discovery", backgroundColor: "#3f51b5" },
      { id: "id-reflect", name: "Reflection", backgroundColor: "#0b8043" },
      { id: "id-dev", name: "Development", backgroundColor: "#8e24aa" },
      { id: "id-self", name: "Self-Care", backgroundColor: "#ef6c00" },
    ]);

    expect(map).toEqual({
      "id-routine": "routine",
      "id-deep": "deep_work",
      "id-reflect": "reflection",
      "id-dev": "development",
      "id-self": "self_care",
    });
  });

  it("does not use color as semantic identity", () => {
    const map = resolveCalendarEventLabelModeMap([
      { id: "wrong-name", name: "Something Else", backgroundColor: "#3f51b5" },
    ]);

    expect(map).toEqual({});
    expect(classifyCalendarEventTimeMode({ eventLabelId: "wrong-name" }, map)).toBe("unclassified");
  });

  it("classifies an explicitly mapped native label id", () => {
    const map = resolveCalendarEventLabelModeMap([
      { id: "id-deep", name: "Deep Work / Discovery" },
    ]);

    expect(classifyCalendarEventTimeMode({ eventLabelId: "id-deep" }, map)).toBe("deep_work");
  });

  it("keeps an absent event label unclassified rather than treating it as routine", () => {
    const map = resolveCalendarEventLabelModeMap([
      { id: "id-routine", name: "Routine / Transactional" },
    ]);

    expect(classifyCalendarEventTimeMode({}, map)).toBe("unclassified");
  });

  it("keeps an unknown event label unclassified", () => {
    const map = resolveCalendarEventLabelModeMap([
      { id: "id-routine", name: "Routine / Transactional" },
    ]);

    expect(classifyCalendarEventTimeMode({ eventLabelId: "unknown-id" }, map)).toBe("unclassified");
  });

  it("ignores the event title entirely", () => {
    const map = resolveCalendarEventLabelModeMap([]);

    expect(
      classifyCalendarEventTimeMode(
        { eventLabelId: undefined },
        map,
      ),
    ).toBe("unclassified");
  });
});
