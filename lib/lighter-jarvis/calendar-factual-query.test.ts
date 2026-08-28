import { describe, expect, it } from "vitest";
import {
  parseCalendarFactualQuery,
  renderCalendarFactualSelection,
  selectCalendarFactualQuery,
} from "./calendar-factual-query";
import type { CalendarReadWindow } from "./calendar-read-window";

const window: CalendarReadWindow = Object.freeze({
  start: "2026-08-28T09:00:00.000Z",
  end: "2026-09-04T09:00:00.000Z",
  timeZone: "Australia/Melbourne",
  period: "default",
});

const events = Object.freeze([
  Object.freeze({ title: "LLEGC September Meeting", start: "2026-09-03T08:00:00.000Z", end: "2026-09-03T09:30:00.000Z", calendarName: "Governance" }),
  Object.freeze({ title: "Interview: Manager - Lived Experience Strategy & Policy", start: "2026-09-01T00:00:00.000Z", end: "2026-09-01T01:00:00.000Z", calendarName: "Personal" }),
  Object.freeze({ title: "URGENT Board Crisis — Deep Work", start: "2026-08-29T01:00:00.000Z", end: "2026-08-29T02:00:00.000Z", calendarName: "Work" }),
]);

describe("deterministic Calendar factual query", () => {
  it.each([
    ["What are my next 5 meetings?", { kind: "next_events", limit: 5 }],
    ["What are my next five meetings?", { kind: "next_events", limit: 5 }],
    ["When is my next LLEGC meeting?", { kind: "next_title_match", terms: ["llegc", "meeting"] }],
    ["What time is the interview on Tuesday?", { kind: "title_match_on_weekday", terms: ["interview"], weekday: "tuesday" }],
  ] as const)("parses the closed factual request: %s", (utterance, expected) => {
    expect(parseCalendarFactualQuery(utterance)).toEqual(expected);
  });

  it("returns the next named event by deterministic title-token match", () => {
    const query = parseCalendarFactualQuery("When is my next LLEGC meeting?")!;
    const selected = selectCalendarFactualQuery({ events, query, window });
    expect(selected).toMatchObject({ status: "matched", events: [{ title: "LLEGC September Meeting" }] });
    expect(renderCalendarFactualSelection(selected, query)).toContain("LLEGC September Meeting");
  });

  it("filters a title match by Melbourne weekday", () => {
    const query = parseCalendarFactualQuery("What time is the interview on Tuesday?")!;
    const selected = selectCalendarFactualQuery({ events, query, window });
    expect(selected).toMatchObject({ status: "matched", events: [{ title: "Interview: Manager - Lived Experience Strategy & Policy" }] });
  });

  it("treats adversarial title words as display evidence only", () => {
    const query = parseCalendarFactualQuery("What are my next 5 meetings?")!;
    const selected = selectCalendarFactualQuery({ events, query, window });
    const rendered = renderCalendarFactualSelection(selected, query);
    expect(rendered).toContain("URGENT Board Crisis — Deep Work");
    expect(rendered).not.toMatch(/Priority:|Mode:|Category:|Urgency:/i);
  });

  it("fails closed on an equally earliest named match", () => {
    const query = parseCalendarFactualQuery("When is my next LLEGC meeting?")!;
    const ambiguous = Object.freeze([
      events[0],
      Object.freeze({ ...events[0], title: "LLEGC Board Meeting" }),
    ]);
    expect(selectCalendarFactualQuery({ events: ambiguous, query, window })).toEqual({
      kind: "next_title_match", status: "ambiguous", events: [],
    });
  });
});