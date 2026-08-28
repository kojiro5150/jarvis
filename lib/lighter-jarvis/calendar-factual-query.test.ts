import { describe, expect, it } from "vitest";
import {
  CALENDAR_FACTUAL_MORPHOLOGY,
  isUnsupportedCalendarFactualWording,
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
  Object.freeze({ title: "JARVIS Testing", start: "2026-08-29T01:00:00.000Z", end: "2026-08-29T02:00:00.000Z", calendarName: "Personal" }),
  Object.freeze({ title: "Shopping", start: "2026-08-29T05:00:00.000Z", end: "2026-08-29T06:00:00.000Z", calendarName: "Personal" }),
  Object.freeze({ title: "Barwon Health", start: "2026-08-30T23:00:00.000Z", end: "2026-08-31T06:00:00.000Z", calendarName: "Work" }),
  Object.freeze({ title: "LLEGC September Meeting", start: "2026-09-03T08:00:00.000Z", end: "2026-09-03T09:30:00.000Z", calendarName: "Governance" }),
  Object.freeze({ title: "Interview: Manager - Lived Experience Strategy & Policy", start: "2026-09-01T03:00:00.000Z", end: "2026-09-01T03:45:00.000Z", calendarName: "Personal" }),
  Object.freeze({ title: "URGENT Board Crisis — Deep Work", start: "2026-09-02T01:00:00.000Z", end: "2026-09-02T02:00:00.000Z", calendarName: "Work" }),
]);

describe("deterministic Calendar factual query", () => {
  it.each([
    ["What are my next 5 meetings?", { kind: "next_events", limit: 5 }],
    ["What are my next five meetings?", { kind: "next_events", limit: 5 }],
    ["When is my next LLEGC meeting?", { kind: "next_title_match", terms: ["llegc", "meeting"] }],
    ["What time is the interview on Tuesday?", { kind: "title_match_on_weekday", terms: ["interview"], weekday: "tuesday" }],
    ["When is JARVIS Testing scheduled next?", { kind: "next_title_match", terms: ["jarvis", "test"] }],
    ["When am I going shopping?", { kind: "next_title_match", terms: ["shop"] }],
    ["When am I testing JARVIS again?", { kind: "next_title_match", terms: ["test", "jarvis"] }],
    ["Am I at Barwon Health on Monday?", { kind: "title_presence_on_weekday", terms: ["barwon", "health"], weekday: "monday" }],
    ["Am I shopping Saturday?", { kind: "title_presence_on_weekday", terms: ["shop"], weekday: "saturday" }],
    ["When's my next JARVIS test?", { kind: "next_title_match", terms: ["jarvis", "test"] }],
    ["When do I next have scheduled JARVIS testing?", { kind: "next_title_match", terms: ["jarvis", "test"] }],
    ["When do I next go shopping?", { kind: "next_title_match", terms: ["shop"] }],
    ["Do I have an LLEGC meeting next week?", { kind: "title_presence_in_period", terms: ["llegc", "meeting"] }],
  ] as const)("parses the closed Level-1 factual request: %s", (utterance, expected) => {
    expect(parseCalendarFactualQuery(utterance)).toEqual(expected);
  });

  it("matches every meaningful query token, order-independent", () => {
    const query = parseCalendarFactualQuery("When am I testing JARVIS again?")!;
    const candidates = Object.freeze([
      events[0],
      Object.freeze({ title: "Testing Governance Engineering Approach", start: "2026-08-29T02:00:00.000Z", end: "2026-08-29T03:00:00.000Z", calendarName: "Work" }),
    ]);
    const selected = selectCalendarFactualQuery({ events: candidates, query, window });
    expect(selected).toMatchObject({ status: "matched", events: [{ title: "JARVIS Testing" }] });
  });

  it("uses only the explicit closed morphology table", () => {
    expect(CALENDAR_FACTUAL_MORPHOLOGY).toEqual(expect.objectContaining({
      test: "test", testing: "test", meeting: "meeting", meetings: "meeting", shop: "shop", shopping: "shop",
    }));
    expect(parseCalendarFactualQuery("When am I testing JARVIS again?"))
      .toEqual({ kind: "next_title_match", terms: ["test", "jarvis"] });
    expect(CALENDAR_FACTUAL_MORPHOLOGY.worked).toBeUndefined();
  });

  it("returns the next named event by deterministic title-token match", () => {
    const query = parseCalendarFactualQuery("When is JARVIS Testing scheduled next?")!;
    const selected = selectCalendarFactualQuery({ events, query, window });
    expect(selected).toMatchObject({ status: "matched", events: [{ title: "JARVIS Testing" }] });
    expect(renderCalendarFactualSelection(selected, query)).toContain("JARVIS Testing");
  });

  it("renders complete negative presence evidence as deterministic no", () => {
    const query = parseCalendarFactualQuery("Am I shopping Monday?")!;
    const selected = selectCalendarFactualQuery({ events, query, window });
    expect(selected.status).toBe("not_found");
    expect(renderCalendarFactualSelection(selected, query)).toBe("Calendar factual result:\nNo.");
  });

  it("answers compact speech-style weekday presence from provider evidence", () => {
    const query = parseCalendarFactualQuery("Am I shopping Saturday?")!;
    const selected = selectCalendarFactualQuery({ events, query, window });
    expect(selected).toMatchObject({ status: "matched", events: [{ title: "Shopping" }] });
  });

  it("answers a deterministic weekday-presence query from provider evidence", () => {
    const query = parseCalendarFactualQuery("Am I at Barwon Health on Monday?")!;
    const selected = selectCalendarFactualQuery({ events, query, window });
    expect(selected).toMatchObject({ status: "matched", events: [{ title: "Barwon Health" }] });
    expect(renderCalendarFactualSelection(selected, query))
      .toBe("Calendar factual result:\nYes. Barwon Health — Mon, 31 Aug, 9:00 AM–4:00 PM");
  });

  it("fails closed when multiple distinct events satisfy the same weekday constraints", () => {
    const query = parseCalendarFactualQuery("Am I at Barwon Health on Monday?")!;
    const ambiguous = Object.freeze([
      events[2],
      Object.freeze({ title: "Barwon Health Team", start: "2026-08-31T00:00:00.000Z", end: "2026-08-31T01:00:00.000Z", calendarName: "Work" }),
    ]);
    const selected = selectCalendarFactualQuery({ events: ambiguous, query, window });
    expect(selected).toEqual({ kind: "title_presence_on_weekday", status: "ambiguous", events: [] });
    expect(renderCalendarFactualSelection(selected, query))
      .toBe("Calendar factual result:\nI found more than one Calendar event that matches that wording; please be more specific.");
  });

  it("uses chronology only when the query explicitly asks for the next occurrence", () => {
    const query = parseCalendarFactualQuery("When am I testing JARVIS again?")!;
    const candidates = Object.freeze([
      events[0],
      Object.freeze({ title: "JARVIS Testing Review", start: "2026-08-30T01:00:00.000Z", end: "2026-08-30T02:00:00.000Z", calendarName: "Personal" }),
    ]);
    expect(selectCalendarFactualQuery({ events: candidates, query, window }))
      .toMatchObject({ status: "matched", events: [{ title: "JARVIS Testing" }] });
  });

  it("treats adversarial title words as display evidence only", () => {
    const query = parseCalendarFactualQuery("What are my next 5 meetings?")!;
    const selected = selectCalendarFactualQuery({ events, query, window });
    const rendered = renderCalendarFactualSelection(selected, query);
    expect(rendered).not.toMatch(/Priority:|Mode:|Category:|Urgency:/i);
  });

  it("detects unsupported personal Calendar factual wording for containment", () => {
    expect(isUnsupportedCalendarFactualWording("When am I next doing some work on JARVIS?")).toBe(true);
    expect(isUnsupportedCalendarFactualWording("What meetings next week relate to governance work?")).toBe(true);
    expect(isUnsupportedCalendarFactualWording("When do I next have something related to JARVIS?")).toBe(true);
    expect(isUnsupportedCalendarFactualWording("When is something connected to Governance Engineering next?")).toBe(true);
    expect(isUnsupportedCalendarFactualWording("When do I next turn 60?")).toBe(true);
    expect(isUnsupportedCalendarFactualWording("My 9 a.m. meeting tomorrow is a finance review.")).toBe(false);
    expect(isUnsupportedCalendarFactualWording("When was the Eiffel Tower built?")).toBe(false);
    expect(isUnsupportedCalendarFactualWording("Help me draft a note")).toBe(false);
  });
});
