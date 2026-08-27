import { describe, expect, it } from "vitest";
import {
  guardOrdinaryModelReply,
  NEUTRALIZED_ORDINARY_AUTHORITY_REPLY,
  UNSUPPORTED_CALENDAR_PATH_REPLY,
  UNSUPPORTED_GMAIL_PATH_REPLY,
  EXCLUDED_DRIVE_PROVENANCE_REPLY,
  UNSUPPORTED_DRIVE_PATH_REPLY,
} from "./ordinary-model-reply-guard";
import {
  hasPriorVisibleCalendarReport,
  calendarRecallDiagnostics,
  priorVisibleCalendarReportIsScheduleOnly,
} from "./calendar-provenance-truthfulness";

describe("ordinary-model reply guard", () => {
  const liveReport = "Based on your calendar for tomorrow (Friday, 28 August 2026), you have two commitments:\n10:00 AM – 11:00 AM\n3:00 PM – 4:00 PM";

  it("proves the complete-history state and attribution for the live timing transcript", () => {
    const messages = [
      { role: "assistant" as const, content: liveReport },
      { role: "user" as const, content: "What times did you just see?" },
    ];
    const diagnostic = calendarRecallDiagnostics(messages);
    expect(diagnostic).toMatchObject({ priorCalendarReportPresent: true,
      calendarRecallFollowUp: true, hasCurrentCalendarGovernedContext: false,
      isCalendarRecollection: true });
    expect(guardOrdinaryModelReply("I just saw two time blocks on your calendar for tomorrow...",
      messages.at(-1)?.content, false, diagnostic))
      .toMatch(/^From the calendar result I reported earlier,/);
  });

  it("binds relevant user detail and rewrites current-source provenance with full history", () => {
    const messages = [
      { role: "user" as const, content: "My 10 AM meeting is the project review." },
      { role: "assistant" as const, content: liveReport },
      { role: "user" as const, content: "What are the meetings about?" },
    ];
    const diagnostic = calendarRecallDiagnostics(messages);
    expect(diagnostic).toMatchObject({ isCalendarRecollection: true,
      priorVisibleReportIsScheduleOnly: false, isDetailFollowUp: true,
      hasCurrentCalendarGovernedContext: false });
    expect(guardOrdinaryModelReply("From the calendar data I can access, I only see the timing...",
      messages.at(-1)?.content, false, diagnostic))
      .toMatch(/^From the earlier calendar result I reported/);
  });

  it("does not bind an unrelated 9 AM detail and keeps detail containment fail-closed", () => {
    const scheduleOnlyReport = "Based on your calendar for tomorrow, you have two commitments:\n10:00 AM – 11:00 AM\n3:00 PM – 4:00 PM";
    const messages = [
      { role: "user" as const, content: "My 9 AM meeting is the finance review." },
      { role: "assistant" as const, content: scheduleOnlyReport },
      { role: "user" as const, content: "What are the meetings about?" },
    ];
    const diagnostic = calendarRecallDiagnostics(messages);
    expect(diagnostic).toMatchObject({ isCalendarRecollection: true,
      priorVisibleReportIsScheduleOnly: true, isDetailFollowUp: true });
    expect(guardOrdinaryModelReply("The first is finance review and the second is unknown.",
      messages.at(-1)?.content, false, diagnostic))
      .toBe("The governed Calendar path available here includes timing information only, not titles or descriptions.");
  });
  it.each([
    "Please explicitly confirm that I may read your Calendar.",
    "Can I access your calendar? Reply yes to confirm.",
    "I need your permission to search Gmail. Say yes to continue.",
    "Please authorize me to check your inbox.",
  ])("neutralizes private-source confirmation UX: %s", (reply) => {
    expect(guardOrdinaryModelReply(reply)).toBe(NEUTRALIZED_ORDINARY_AUTHORITY_REPLY);
  });

  it.each([
    "[Governed private result omitted from ordinary model context.]",
    "[Prior governed Gmail read request omitted from ordinary model context.]",
  ])("never presents an internal history marker: %s", (marker) => {
    expect(guardOrdinaryModelReply(`Answer. ${marker}`)).toBe("Answer.");
    expect(guardOrdinaryModelReply(marker)).toBe(NEUTRALIZED_ORDINARY_AUTHORITY_REPLY);
  });

  it("preserves ordinary replies and non-authority Calendar discussion", () => {
    expect(guardOrdinaryModelReply("Monday is a weekday.")).toBe("Monday is a weekday.");
    expect(guardOrdinaryModelReply("Calendar access requires deterministic authority machinery."))
      .toBe("Calendar access requires deterministic authority machinery.");
  });

  const recollection = { hasCurrentCalendarGovernedContext: false, isCalendarRecollection: true } as const;

  it.each([
    ["I saw two time slots on your calendar: 10:00–11:00 AM and 3:00–4:00 PM.",
      "From the calendar result I reported earlier, the time slots were 10:00–11:00 AM and 3:00–4:00 PM."],
    ["I can see that you have two meetings tomorrow.",
      "From the calendar result I reported earlier, you have two meetings tomorrow."],
    ["Your calendar currently shows two meetings.",
      "From the calendar result I reported earlier, two meetings."],
    ["I saw two time blocks on your calendar for tomorrow: 10:00–11:00 AM and 3:00–4:00 PM.",
      "From the calendar result I reported earlier, two time blocks were 10:00–11:00 AM and 3:00–4:00 PM."],
    ["I saw two commitments in your calendar for tomorrow: 10:00–11:00 AM and 3:00–4:00 PM.",
      "From the calendar result I reported earlier, two commitments were 10:00–11:00 AM and 3:00–4:00 PM."],
    ["I identified these times on your calendar for tomorrow: 10:00–11:00 AM and 3:00–4:00 PM.",
      "From the calendar result I reported earlier, these times were 10:00–11:00 AM and 3:00–4:00 PM."],
    ["The calendar information I saw showed only that you have commitments at those two times.",
      "The earlier calendar result I reported showed only that you have commitments at those two times."],
    ["The Calendar result I saw: only the time blocks were included.",
      "From the earlier calendar result I reported, only the time blocks were included."],
    ["I saw:\n\n1. 10:00 AM – 11:00 AM\n2. 3:00 PM – 4:00 PM\n\nThose are the two time slots I reported from your calendar for tomorrow.",
      "From the calendar result I reported earlier, the two time slots were:\n\n1. 10:00 AM – 11:00 AM\n2. 3:00 PM – 4:00 PM"],
    ["The calendar evidence I have access to shows only the timing of the commitments.",
      "The earlier calendar result I reported contained only the timing of the commitments."],
    ["The calendar data I can see only includes the time blocks.",
      "The earlier calendar result I reported only included the time blocks."],
    ["The calendar shows the 3 PM time slot but no title.",
      "The earlier calendar result I reported showed the 3 PM time slot but no title."],
  ])("historically attributes false current Calendar provenance while retaining content", (reply, expected) => {
    expect(guardOrdinaryModelReply(reply, "What times did you just see?", false, recollection)).toBe(expected);
  });

  it.each([
    ["I can see the timing of your two meetings tomorrow (10:00 AM–11:00 AM and 3:00 PM–4:00 PM), but I don't have access to the subject lines, titles, or other details.",
      "From the calendar result I reported earlier, the timing of your two meetings tomorrow (10:00 AM–11:00 AM and 3:00 PM–4:00 PM), but I don't have access to the subject lines, titles, or other details."],
    ["I can see those times: 10:00–11:00 AM and 3:00–4:00 PM.",
      "From the calendar result I reported earlier, those times: 10:00–11:00 AM and 3:00–4:00 PM."],
    ["I saw two commitments, at 10 AM and 3 PM.",
      "From the calendar result I reported earlier, two commitments, at 10 AM and 3 PM."],
  ])("attributes bounded bare schedule perception: %s", (reply, expected) => {
    expect(guardOrdinaryModelReply(reply, "What are the meetings about?", false, {
      ...recollection, priorVisibleReportIsScheduleOnly: false, isDetailFollowUp: true,
    })).toBe(expected);
  });

  it.each([
    ["I just saw two time blocks for tomorrow:\n\n1. 10:00 AM – 11:00 AM\n2. 3:00 PM – 4:00 PM\n\nThese are the times I reported from the calendar view a moment ago.",
      "From the calendar result I reported earlier, there were two time blocks for tomorrow:\n\n1. 10:00 AM – 11:00 AM\n2. 3:00 PM – 4:00 PM"],
    ["The calendar view I saw only showed the time blocks (10:00 AM – 11:00 AM and 3:00 PM – 4:00 PM). It didn't include titles or subjects.",
      "The earlier Calendar result I reported contained only the time blocks (10:00 AM – 11:00 AM and 3:00 PM – 4:00 PM). It didn't include titles or subjects."],
    ["The calendar projection I can see shows when they occur but not what they're about.",
      "The earlier Calendar projection I reported showed when they occur but not what they're about."],
  ])("contains residual Calendar recall language: %s", (reply, expected) => {
    expect(guardOrdinaryModelReply(reply, "What are the meetings about?", false, {
      ...recollection, priorVisibleReportIsScheduleOnly: false, isDetailFollowUp: true,
    })).toBe(expected);
  });

  it.each([
    ["I just saw those times.", "From the calendar result I reported earlier, those times."],
    ["I just saw two commitments.", "From the calendar result I reported earlier, two commitments."],
    ["I just saw the timing.", "From the calendar result I reported earlier, the timing."],
    ["The Calendar view I saw showed two time blocks.", "The earlier Calendar result I reported contained two time blocks."],
    ["The calendar view I saw contained two time blocks.", "The earlier Calendar result I reported contained two time blocks."],
    ["The Calendar projection I can see contains two time blocks.", "The earlier Calendar projection I reported contained two time blocks."],
    ["The calendar projection I can see only includes the times.", "The earlier Calendar projection I reported only included the times."],
  ])("covers only the bounded residual phrase variants: %s", (reply, expected) => {
    expect(guardOrdinaryModelReply(reply, "What times did you just see?", false, recollection)).toBe(expected);
  });

  it("composes projection attribution, user detail, and false-reread containment", () => {
    const reply = "The calendar projection I can see shows the times only.\nEarlier you told me the 10 AM meeting is the project review.\nI don't have details for the 3 PM meeting.\nIf you'd like, I can check Calendar again for the 3 PM title.";
    expect(guardOrdinaryModelReply(reply, "What are the meetings about?", false, {
      ...recollection, priorVisibleReportIsScheduleOnly: false, isDetailFollowUp: true,
    })).toBe("The earlier Calendar projection I reported showed the times only.\nEarlier you told me the 10 AM meeting is the project review.\nI don't have details for the 3 PM meeting.\nThe governed Calendar path available here does not expose titles or descriptions.");
  });

  it("allows current Calendar language when current governed evidence exists", () => {
    const reply = "Based on your calendar for tomorrow, you have two commitments.";
    expect(guardOrdinaryModelReply(reply, "What is on tomorrow?", false, {
      hasCurrentCalendarGovernedContext: true, isCalendarRecollection: true,
    })).toBe(reply);
  });

  it.each(["I can see what you mean.", "I saw your previous message.",
    "I just saw your previous message.", "I just saw the note you pasted.",
    "The projection I can see in the chart is increasing.", "The view I saw in the document was different.",
    "The table view I saw contained three rows.",
    "The information I saw in the text you pasted...", "I saw two options in your note.",
    "I can see two options in the text you pasted.", "I saw that you wrote Atlas.",
    "I can see the difference between those approaches.",
    "I can see two options in your note.", "I can see the data in the table.",
    "The data I can see in the table has three rows.",
    "I have access to the variable inside this function.", "The note shows two options."])("does not overmatch non-Calendar sight language: %s", reply => {
    expect(guardOrdinaryModelReply(reply, "ordinary question", false, recollection)).toBe(reply);
  });

  it("does not rewrite bare schedule perception when current governed evidence exists", () => {
    const reply = "The calendar projection I can see shows two commitments.";
    expect(guardOrdinaryModelReply(reply, "What is on tomorrow?", false, {
      hasCurrentCalendarGovernedContext: true, isCalendarRecollection: true,
    })).toBe(reply);
  });

  it("attributes bare timing while preserving user detail and containing a false reread", () => {
    const reply = "I can see the timing of two meetings tomorrow.\nYou told me the 10 AM meeting is the project review.\nI don't have details for the 3 PM meeting.\nIf you'd like, I can check Calendar again for the 3 PM title.";
    expect(guardOrdinaryModelReply(reply, "What are the meetings about?", false, {
      ...recollection, priorVisibleReportIsScheduleOnly: false, isDetailFollowUp: true,
    })).toBe("From the calendar result I reported earlier, the timing of two meetings tomorrow.\nYou told me the 10 AM meeting is the project review.\nI don't have details for the 3 PM meeting.\nThe governed Calendar path available here does not expose titles or descriptions.");
  });

  it("contains invented meeting metadata when the visible report supplied only times", () => {
    expect(guardOrdinaryModelReply("The first is your team meeting and the second is a review.",
      "What are the meetings about?", false, { ...recollection, priorVisibleReportIsScheduleOnly: true, isDetailFollowUp: true }))
      .toBe("The governed Calendar path available here includes timing information only, not titles or descriptions.");
  });

  it("contains a false reread offer for metadata outside the governed projection", () => {
    expect(guardOrdinaryModelReply("I don't have the meeting titles. If you'd like, I can check the calendar again for those details.",
      "What are the meetings about?", false, { ...recollection, priorVisibleReportIsScheduleOnly: true, isDetailFollowUp: true }))
      .toBe("The governed Calendar path available here includes timing information only, not titles or descriptions.");
  });

  it("preserves user detail while containing a false reread when schedule-only is false", () => {
    const reply = "From what you told me earlier, the 10 AM commitment is the project review.\nI don't know the 3 PM title.\nIf you'd like, I can check the calendar again for those details.";
    expect(guardOrdinaryModelReply(reply, "What are the meetings about?", false, {
      ...recollection, priorVisibleReportIsScheduleOnly: false, isDetailFollowUp: true,
    })).toBe("From what you told me earlier, the 10 AM commitment is the project review.\nI don't know the 3 PM title.\nThe governed Calendar path available here does not expose titles or descriptions.");
  });

  it.each([
    "I can check your calendar again for the title.",
    "I can reread your calendar to get the subject.",
    "I can read the calendar again for more details.",
    "Would you like me to check the calendar again for the meeting title?",
    "Would you like me to access Calendar again for those locations?",
    "I can open the calendar again to get the description.",
  ])("contains a Calendar reread offer for omitted metadata: %s", reply => {
    expect(guardOrdinaryModelReply(reply, "What are the meetings about?", false, {
      ...recollection, priorVisibleReportIsScheduleOnly: false, isDetailFollowUp: true,
    })).toBe("The governed Calendar path available here does not expose titles or descriptions.");
  });

  it.each(["If you'd like, I can check the document again.", "I can reread the note for those details.",
    "Would you like me to check the table again?"])("preserves a non-Calendar reread offer: %s", reply => {
    expect(guardOrdinaryModelReply(reply, "What are the meetings about?", false, {
      ...recollection, priorVisibleReportIsScheduleOnly: false, isDetailFollowUp: true,
    })).toBe(reply);
  });

  it("proves schedule-only from the complete bounded report rather than interval presence", () => {
    const current = { role: "user" as const, content: "What are the meetings about?" };
    expect(priorVisibleCalendarReportIsScheduleOnly([
      { role: "assistant", content: "Based on your calendar for tomorrow, you have two commitments: 10:00–11:00 AM and 3:00–4:00 PM." },
      current,
    ])).toBe(true);
    expect(priorVisibleCalendarReportIsScheduleOnly([
      { role: "assistant", content: "Based on your calendar, you have a 10:00–11:00 AM commitment. From what you told me earlier, that is the project review." },
      current,
    ])).toBe(false);
    expect(priorVisibleCalendarReportIsScheduleOnly([
      { role: "user", content: "My 10 AM meeting is the project review." },
      { role: "assistant", content: "Thanks — the 10 AM meeting is the project review." },
      { role: "assistant", content: "Based on your calendar for tomorrow, you have two commitments: 10:00–11:00 AM and 3:00–4:00 PM." },
      current,
    ])).toBe(false);
  });

  it("recognizes both bounded prior Calendar report presentation families", () => {
    const current = { role: "user" as const, content: "What are the meetings about?" };
    expect(hasPriorVisibleCalendarReport([
      { role: "assistant", content: "Looking at your calendar for tomorrow (28 August 2026, Melbourne time), you have two commitments:\n\n1. 10:00 AM – 11:00 AM\n2. 3:00 PM – 4:00 PM" },
      current,
    ])).toBe(true);
    expect(hasPriorVisibleCalendarReport([
      { role: "assistant", content: "Based on your calendar for tomorrow, you have two commitments." },
      current,
    ])).toBe(true);
  });

  it.each([
    "Looking at your message, I think...", "Looking at the table...", "Looking at the document...",
    "Looking at your note...", "Looking at tomorrow's weather...", "Looking at your schedule options...",
  ])("does not mistake ordinary looking-at prose for a prior Calendar report: %s", content => {
    expect(hasPriorVisibleCalendarReport([
      { role: "assistant", content },
      { role: "user", content: "What are the meetings about?" },
    ])).toBe(false);
  });

  it("binds user detail only to a start time in the latest schedule report", () => {
    const schedule = { role: "assistant" as const,
      content: "Based on your calendar for tomorrow, you have two commitments: 10:00–11:00 AM and 3:00–4:00 PM." };
    const current = { role: "user" as const, content: "What are the meetings about?" };
    const isScheduleOnlyWith = (detail: string) => priorVisibleCalendarReportIsScheduleOnly([
      { role: "user", content: detail }, { role: "assistant", content: "Thanks." }, schedule, current,
    ]);

    expect(isScheduleOnlyWith("My 10 AM meeting is the project review.")).toBe(false);
    expect(isScheduleOnlyWith("My 10:00 AM meeting is the project review.")).toBe(false);
    expect(isScheduleOnlyWith("The 3 PM meeting is the team review.")).toBe(false);
    expect(isScheduleOnlyWith("My 9 AM meeting was the finance review.")).toBe(true);
    expect(isScheduleOnlyWith("My meeting is the project review.")).toBe(true);
  });

  it("does not bind user detail to an older Calendar report", () => {
    expect(priorVisibleCalendarReportIsScheduleOnly([
      { role: "assistant", content: "Based on your calendar for tomorrow, you have one commitment: 9:00–10:00 AM." },
      { role: "user", content: "My 9 AM meeting is the finance review." },
      { role: "assistant", content: "Thanks." },
      { role: "assistant", content: "Based on your calendar for tomorrow, you have two commitments: 10:00–11:00 AM and 3:00–4:00 PM." },
      { role: "user", content: "What are the meetings about?" },
    ])).toBe(true);
  });

  it.each([
    "I don't have access to your Calendar.",
    "Calendar is not connected.",
    "This capability does not exist.",
  ])("corrects false global Calendar capability claims without representing authority: %s", (reply) => {
    expect(guardOrdinaryModelReply(reply, "Show my calendar Monday"))
      .toBe(UNSUPPORTED_CALENDAR_PATH_REPLY);
  });

  it.each([
    "I cannot access Gmail.",
    "I don't have the capability to check your inbox.",
    "Gmail isn't available.",
  ])("corrects false global Gmail capability claims without representing authority: %s", (reply) => {
    expect(guardOrdinaryModelReply(reply, "Show me my emails"))
      .toBe(UNSUPPORTED_GMAIL_PATH_REPLY);
  });

  it("does not rewrite unrelated ordinary conversation or truthful path-scoped limitations", () => {
    expect(guardOrdinaryModelReply("I don't have access to the Moon.", "Tell me about the Moon"))
      .toBe("I don't have access to the Moon.");
    expect(guardOrdinaryModelReply("That inbox request is not supported on this path.", "Get my inbox"))
      .toBe("That inbox request is not supported on this path.");
  });

  it.each([
    "I'm showing you the result I already provided.",
    "I found this document earlier.",
    "The document ID was provider-secret.",
    "Your Drive search returned Atlas.",
  ])("neutralizes reconstructed Drive provenance only when governed history was excluded: %s", reply => {
    expect(guardOrdinaryModelReply(reply, "show it", true)).toBe(EXCLUDED_DRIVE_PROVENANCE_REPLY);
    expect(guardOrdinaryModelReply(reply, "ordinary question", false)).toBe(reply);
  });

  it.each(["read it", "open it", "show it", "summarize it"])(
    "corrects a false Drive-wide denial after excluded governed history: %s",
    utterance => {
      const reply = "I don't have the capability to read or retrieve the contents of files from Google Drive. My access is limited to orchestration and routing within this system.";
      expect(guardOrdinaryModelReply(reply, utterance, true)).toBe(UNSUPPORTED_DRIVE_PATH_REPLY);
      expect(guardOrdinaryModelReply(reply, utterance, false)).toBe(reply);
    },
  );

  it.each([
    "The document ID I found earlier was synthetic-id.",
    "The file ID I found before was synthetic-id.",
    "I previously found document ID synthetic-id.",
    "Earlier, your Drive search returned Atlas.",
    "The Drive file I found was Atlas.",
    "I found provider ID synthetic-id earlier.",
    "The document was Atlas and its ID was synthetic-id.",
    "I found that file earlier and its ID is synthetic-id.",
    "The ID from the earlier Drive result was synthetic-id.",
    "The document ID from the earlier search was `synthetic-id`.",
    "The only document ID we've discussed is `synthetic-id`, which was the result of your search.",
  ])("contains the prior/remembered Drive-result provenance family: %s", reply => {
    expect(guardOrdinaryModelReply(reply, "What was the document ID you found earlier?", true)).toBe(EXCLUDED_DRIVE_PROVENANCE_REPLY);
    expect(guardOrdinaryModelReply(reply, "What was the document ID you found earlier?", false)).toBe(reply);
  });

  it("does not globally rewrite unrelated capability or ordinary memory statements", () => {
    expect(guardOrdinaryModelReply("I don't have access to the Moon.", "open it", true))
      .toBe("I don't have access to the Moon.");
    expect(guardOrdinaryModelReply("I found that restaurant earlier.", "What was it?", true))
      .toBe("I found that restaurant earlier.");
  });

  it.each([
    ["What was the contract document ID we discussed?", "The document ID I found earlier was contract-123."],
    ["Remind me of the project document we discussed.", "The document was Project Charter and its ID was DOC-42."],
    ["Which local record was that?", "The file ID I found before was local-record-7."],
  ])("preserves non-Drive document memory despite earlier governed Drive history", (utterance, reply) => {
    expect(guardOrdinaryModelReply(reply, utterance, true)).toBe(reply);
  });

  it.each([
    "Earlier, your Drive search returned Atlas.",
    "The Drive file I found was Atlas.",
    "The ID from the earlier Drive result was synthetic-id.",
  ])("always contains explicitly Drive-marked provenance after excluded Drive history: %s", reply => {
    expect(guardOrdinaryModelReply(reply, "Tell me about contracts.", true)).toBe(EXCLUDED_DRIVE_PROVENANCE_REPLY);
  });
});
