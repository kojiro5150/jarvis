import { describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "../agents/types";
import { sourceResult } from "../governed-conversation/source-adapter-result";
import type { GoldenScenarioGateKObservation } from "../governed-conversation/golden-scenario-calendar-conflict-gate-k";
import type { ScopedCalendarEvidenceResult } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import { createCalendarConflictReasoningReference } from "./calendar-conflict-reasoning-reference";
import { createCalendarAdvicePreferenceReference, isSupportedCalendarAdvicePreferenceUtterance } from "./calendar-advice-preference-reference";
import { resolveCalendarAdviceReference } from "./calendar-advice-reference";
import { CALENDAR_CONFLICT_ADVISE_PROMPT, isCalendarConflictAdviseQuestion, resolveCalendarConflictAdvise } from "./calendar-conflict-advise";

const observedAt = "2026-08-29T07:20:00.000Z";
const window = Object.freeze({
  start: "2026-08-28T14:00:00.000Z",
  end: "2026-08-29T14:00:00.000Z",
  timeZone: "Australia/Melbourne",
  period: "today" as const,
});

function historical(): GoldenScenarioGateKObservation {
  return Object.freeze({
    observedAt: "2026-08-29T07:00:00.000Z",
    addedPendingInvitation: Object.freeze({
      commitmentReference: "google-calendar:calendar:primary:event:invite",
      title: "SECRET Gate K Invite",
      start: "2026-08-29T07:30:00.000Z",
      end: "2026-08-29T08:30:00.000Z",
      calendarName: "Private",
      timeMode: null,
      selfAttendeeResponse: "needsAction",
      observedAt: "2026-08-29T07:00:00.000Z",
      provenanceReference: "google-calendar:calendar:primary:event:invite#provenance",
    }),
    existingDeepWorkCommitment: Object.freeze({
      commitmentReference: "google-calendar:calendar:primary:event:deep",
      title: "URGENT PROTECTED PRIORITY SECRET",
      start: "2026-08-29T08:00:00.000Z",
      end: "2026-08-29T09:30:00.000Z",
      calendarName: "Private",
      timeMode: "deep_work",
      selfAttendeeResponse: null,
      observedAt: "2026-08-29T07:00:00.000Z",
      provenanceReference: "google-calendar:calendar:primary:event:deep#provenance",
    }),
    overlapStart: "2026-08-29T08:00:00.000Z",
    overlapEnd: "2026-08-29T08:30:00.000Z",
    overlapMinutes: 30,
  });
}

function refs() {
  return {
    reasoningReference: createCalendarConflictReasoningReference({ observation: historical(), now: new Date("2026-08-29T07:01:00.000Z") })!,
    preferenceReference: createCalendarAdvicePreferenceReference(new Date("2026-08-29T07:02:00.000Z"))!,
  };
}

function evidence(extra: readonly any[] = [], coverageState: "bounded_complete_request" | "bounded_partial_request" = "bounded_complete_request"): ScopedCalendarEvidenceResult {
  const conflictEvents = Object.freeze([
    Object.freeze({ ...historical().addedPendingInvitation, observedAt }),
    Object.freeze({ ...historical().existingDeepWorkCommitment, observedAt }),
    ...extra,
  ]);
  return Object.freeze({
    ...sourceResult("available", [], { observedAt }),
    coverageState,
    conflictEvents,
  });
}

describe("first bounded Calendar Advise capability", () => {
  it("recognizes only the closed advice question and explicit preference forms", () => {
    expect(isCalendarConflictAdviseQuestion("What would you do?")).toBe(true);
    expect(isCalendarConflictAdviseQuestion("What should I do?")).toBe(false);
    expect(isSupportedCalendarAdvicePreferenceUtterance("I'd rather keep the invitation if I can still get the full deep-work block in afterwards.")).toBe(true);
    expect(isSupportedCalendarAdvicePreferenceUtterance("Keep the invitation if you can preserve all the deep work later.")).toBe(true);
    expect(isSupportedCalendarAdvicePreferenceUtterance("Keep meetings whenever possible.")).toBe(false);
  });

  it("proves one immediate full-duration candidate is free, calls the model once, and separates fact from recommendation", async () => {
    const { reasoningReference, preferenceReference } = refs();
    const model = vi.fn(async (_prompt: string, _messages: ChatMessage[]) => '{"recommendationType":"keep_invitation_move_deep_work_to_candidate"}');
    const result = await resolveCalendarConflictAdvise({
      reasoningReference, preferenceReference, evidence: evidence(), window, callModel: model,
      now: new Date("2026-08-29T07:03:00.000Z"),
    });
    expect(result).toMatchObject({
      status: "resolved",
      reply: "Current Calendar fact: 7:30 PM–9:00 PM is free.\nRecommendation: Given your preference to keep the invitation when the full deep-work block can be preserved, I'd keep the invitation and move the deep-work block to 7:30 PM–9:00 PM.",
      calendarAdviceReference: { calendarAdviceReferenceId: expect.any(String) },
    });
    expect(model).toHaveBeenCalledTimes(1);
    expect(model.mock.calls[0]?.[0]).toBe(CALENDAR_CONFLICT_ADVISE_PROMPT);
    const payload = JSON.parse(model.mock.calls[0]?.[1]?.[0]?.content ?? "{}");
    expect(payload).toEqual({
      currentConflict: { pendingInvitationPresent: true, deepWorkPresent: true, deepWorkDurationMinutes: 90 },
      candidate: { start: "2026-08-29T09:30:00.000Z", end: "2026-08-29T11:00:00.000Z", durationMinutes: 90, availability: "free", observedAt },
      userPreference: { kind: "prefer_keep_invitation_if_full_deep_work_preserved_later" },
      provenance: { historicalConflictReference: "calendar-conflict:historical", currentAvailabilityObservationReference: "calendar-availability:current" },
    });
    const serialized = JSON.stringify(payload);
    for (const forbidden of ["SECRET", "URGENT", "PROTECTED", "PRIORITY", "google-calendar:", "event:deep", "event:invite"]) expect(serialized).not.toContain(forbidden);
    const advice = resolveCalendarAdviceReference({ reference: result.calendarAdviceReference, now: new Date("2026-08-29T07:03:01.000Z") });
    expect(advice).toMatchObject({
      recommendationType: "keep_invitation_move_deep_work_to_candidate",
      sourceCommitmentReference: "google-calendar:calendar:primary:event:deep",
      candidateStart: "2026-08-29T09:30:00.000Z",
      candidateEnd: "2026-08-29T11:00:00.000Z",
      durationMinutes: 90,
    });
    expect(JSON.stringify(result.calendarAdviceReference)).not.toMatch(/google-calendar|09:30|11:00|deep_work/);
  });

  it("treats a touching event boundary as free", async () => {
    const { reasoningReference, preferenceReference } = refs();
    const touching = Object.freeze({
      commitmentReference: "google-calendar:calendar:primary:event:touch", title: "hidden",
      start: "2026-08-29T11:00:00.000Z", end: "2026-08-29T11:30:00.000Z", calendarName: "Private",
      timeMode: null, selfAttendeeResponse: null, observedAt, provenanceReference: "touch#provenance",
    });
    const model = vi.fn(async () => '{"recommendationType":"keep_invitation_move_deep_work_to_candidate"}');
    const result = await resolveCalendarConflictAdvise({ reasoningReference, preferenceReference, evidence: evidence([touching]), window, callModel: model, now: new Date("2026-08-29T07:03:00.000Z") });
    expect(result.status).toBe("resolved");
  });

  it("does not search another slot when the deterministic candidate is occupied", async () => {
    const { reasoningReference, preferenceReference } = refs();
    const blocker = Object.freeze({
      commitmentReference: "google-calendar:calendar:primary:event:block", title: "hidden",
      start: "2026-08-29T10:00:00.000Z", end: "2026-08-29T10:30:00.000Z", calendarName: "Private",
      timeMode: null, selfAttendeeResponse: null, observedAt, provenanceReference: "block#provenance",
    });
    const model = vi.fn();
    const result = await resolveCalendarConflictAdvise({ reasoningReference, preferenceReference, evidence: evidence([blocker]), window, callModel: model, now: new Date("2026-08-29T07:03:00.000Z") });
    expect(result).toMatchObject({ status: "candidate_occupied" });
    expect(result.reply).toContain("immediate 90-minute slot");
    expect(model).not.toHaveBeenCalled();
  });

  it("requires complete bounded coverage before claiming free", async () => {
    const { reasoningReference, preferenceReference } = refs();
    const model = vi.fn();
    const result = await resolveCalendarConflictAdvise({ reasoningReference, preferenceReference, evidence: evidence([], "bounded_partial_request"), window, callModel: model, now: new Date("2026-08-29T07:03:00.000Z") });
    expect(result.status).toBe("insufficient_coverage");
    expect(model).not.toHaveBeenCalled();
  });

  it("fails stale when either relevant current event changes instead of rewriting history", async () => {
    const { reasoningReference, preferenceReference } = refs();
    const changed = evidence();
    const changedEvents = Object.freeze(changed.conflictEvents!.map(event => event.commitmentReference.endsWith(":deep")
      ? Object.freeze({ ...event, end: "2026-08-29T09:45:00.000Z" }) : event));
    const model = vi.fn();
    const result = await resolveCalendarConflictAdvise({ reasoningReference, preferenceReference, evidence: Object.freeze({ ...changed, conflictEvents: changedEvents }), window, callModel: model, now: new Date("2026-08-29T07:03:00.000Z") });
    expect(result.status).toBe("current_situation_changed");
    expect(model).not.toHaveBeenCalled();
  });

  it.each([
    "not json",
    '{"recommendationType":"keep_invitation_move_deep_work_to_candidate","time":"later"}',
    '{"recommendationType":"move_to_10pm"}',
    '{"recommendationType":"insufficient_basis"}',
  ])("fails closed for malformed, widened or unsupported model output", async (output) => {
    const { reasoningReference, preferenceReference } = refs();
    const model = vi.fn(async () => output);
    const result = await resolveCalendarConflictAdvise({ reasoningReference, preferenceReference, evidence: evidence(), window, callModel: model, now: new Date("2026-08-29T07:03:00.000Z") });
    expect(result.status).toBe("model_invalid");
  });

  it("contains no Calendar mutation machinery", async () => {
    const source = await import("node:fs").then(({ readFileSync }) => readFileSync("lib/lighter-jarvis/calendar-conflict-advise.ts", "utf8"));
    for (const forbidden of ["calendar.create", "calendar.update", "calendar.delete", "moveEvent", "updateEvent", "createEvent"]) expect(source).not.toContain(forbidden);
  });
});