import { describe, expect, it } from "vitest";
import { evaluateCalendarReadAuthority } from "./calendar-read-authority";
import { proposeCalendarRead } from "./calendar-read-proposal";

describe("calendar.read proposal boundary", () => {
  it.each([
    "Show my calendar",
    "What's on my calendar?",
    "What's on for tomorrow?",
    "What do I have today?",
    "How does this week look?",
    "How does next week look?",
  ])("proposes an explicit high-precision Calendar request: %s", (utterance) => {
    expect(proposeCalendarRead(utterance)).toMatchObject({ capability: "calendar.read" });
  });

  it.each([
    "What did my calendar just say?",
    "Why did you ask to read my calendar?",
    "We were talking about my calendar.",
    "Did my calendar response work?",
    "I just checked my calendar.",
    "That calendar result was useful.",
    "What did you say about my calendar?",
  ])("does not turn Calendar meta, recall, or discussion language into a proposal: %s", (utterance) => {
    expect(proposeCalendarRead(utterance)).toBeNull();
  });

  it("does not propose an unsupported weekday-specific Calendar window", () => {
    expect(proposeCalendarRead("Show my calendar Monday")).toBeNull();
  });

  it("proposes a temporal schedule question without treating the proposal as authority", () => {
    const utterance = "How does tomorrow look?";
    const proposedOperation = proposeCalendarRead(utterance);
    expect(proposedOperation).toMatchObject({ capability: "calendar.read" });
    expect(evaluateCalendarReadAuthority({ proposedOperation: proposedOperation!, currentUserUtterance: utterance }))
      .toMatchObject({ decision: "ASK", authorityEvidence: [] });
  });

  it.each([
    "What’s on for tomorrow?",
    "What's on today?",
    "What is on this afternoon?",
    "What do I have tomorrow?",
    "What do I have for this morning?",
    "What have I got tomorrow?",
    "What appointments do I have tomorrow?",
    "What's scheduled tomorrow?",
    "What is scheduled for this evening?",
  ])("proposes a high-precision schedule question without granting authority: %s", (utterance) => {
    const proposedOperation = proposeCalendarRead(utterance);
    expect(proposedOperation).toMatchObject({ capability: "calendar.read" });
    expect(evaluateCalendarReadAuthority({ proposedOperation: proposedOperation!, currentUserUtterance: utterance }))
      .toEqual({
        capability: "calendar.read",
        decision: "ASK",
        reason: "explicit_calendar_read_not_established",
        readOnly: true,
        authorityEvidence: [],
      });
  });

  it.each([
    // Deliberately excluded: "happening" can ask about public/general events
    // and does not establish the bounded personal-schedule proposal precisely.
    "What's happening tomorrow?",
    "What should I do today?",
    "Are we on for tomorrow?",
    "Do I have time this afternoon?",
    "What's scheduled eventually?",
  ])("preserves ambiguous temporal conversation outside Calendar proposals: %s", (utterance) => {
    expect(proposeCalendarRead(utterance)).toBeNull();
  });

  it("does not propose Calendar acquisition for unrelated conversation", () => {
    expect(proposeCalendarRead("Help me draft a note")).toBeNull();
  });
  it.each([
    "How is my week allocated?",
    "How is this week allocated?",
    "What's my weekly allocation?",
    "Show me how my week is allocated.",
  ])("proposes a bounded weekly allocation read without granting authority: %s", (utterance) => {
    const clock = () => new Date("2026-08-28T01:00:00.000Z");
    const proposedOperation = proposeCalendarRead(utterance, clock);

    expect(proposedOperation).toMatchObject({
      capability: "calendar.read",
      purpose: "calendar_weekly_allocation",
      window: { period: "this_week", timeZone: "Australia/Melbourne" },
    });
    expect(evaluateCalendarReadAuthority({
      proposedOperation: proposedOperation!,
      currentUserUtterance: utterance,
    })).toMatchObject({ decision: "ASK", authorityEvidence: [] });
  });

  it.each([
    "How is next week allocated?",
    "How does next week break down?",
    "Show me how next week is allocated.",
  ])("proposes a bounded next-week allocation read without granting authority: %s", (utterance) => {
    const clock = () => new Date("2026-08-28T08:00:00.000Z");
    const proposedOperation = proposeCalendarRead(utterance, clock);

    expect(proposedOperation).toMatchObject({
      capability: "calendar.read",
      purpose: "calendar_weekly_allocation",
      window: {
        period: "next_week",
        start: "2026-08-30T14:00:00.000Z",
        end: "2026-09-06T14:00:00.000Z",
        timeZone: "Australia/Melbourne",
      },
    });
    expect(evaluateCalendarReadAuthority({
      proposedOperation: proposedOperation!,
      currentUserUtterance: utterance,
    })).toMatchObject({ decision: "ASK", authorityEvidence: [] });
  });

  it("proposes 'What needs my attention?' as a bounded today Calendar read without granting authority", () => {
    const clock = () => new Date("2026-08-28T01:00:00.000Z");
    const proposedOperation = proposeCalendarRead("What needs my attention?", clock);

    expect(proposedOperation).toMatchObject({
      capability: "calendar.read",
      purpose: "calendar_attention",
      window: { period: "today", timeZone: "Australia/Melbourne" },
    });
    expect(evaluateCalendarReadAuthority({
      proposedOperation: proposedOperation!,
      currentUserUtterance: "What needs my attention?",
    })).toMatchObject({ decision: "ASK", authorityEvidence: [] });
  });
});
