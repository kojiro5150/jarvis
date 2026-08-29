import { describe, expect, it, vi } from "vitest";
import type { ChatMessage } from "../agents/types";
import type { GoldenScenarioGateKObservation } from "../governed-conversation/golden-scenario-calendar-conflict-gate-k";
import { createCalendarConflictReasoningReference } from "./calendar-conflict-reasoning-reference";
import { CALENDAR_CONFLICT_UNDERSTAND_PROMPT, isCalendarConflictUnderstandIntent, resolveCalendarConflictUnderstand } from "./calendar-conflict-understand";

function observation(): GoldenScenarioGateKObservation {
  return Object.freeze({
    observedAt: "2026-08-29T06:30:00.000Z",
    addedPendingInvitation: Object.freeze({
      commitmentReference: "google-calendar:calendar:primary:event:invite-secret",
      title: "Gate K Test Invite SECRET",
      start: "2026-08-29T07:30:00.000Z",
      end: "2026-08-29T08:30:00.000Z",
      calendarName: "Private Work",
      timeMode: null,
      selfAttendeeResponse: "needsAction",
      observedAt: "2026-08-29T06:30:00.000Z",
      provenanceReference: "google-calendar:calendar:primary:event:invite-secret#provenance",
    }),
    existingDeepWorkCommitment: Object.freeze({
      commitmentReference: "google-calendar:calendar:primary:event:deep-secret",
      title: "URGENT PROTECTED PRIORITY JARVIS Deep Work SECRET",
      start: "2026-08-29T08:00:00.000Z",
      end: "2026-08-29T09:30:00.000Z",
      calendarName: "Private Work",
      timeMode: "deep_work",
      selfAttendeeResponse: null,
      observedAt: "2026-08-29T06:30:00.000Z",
      provenanceReference: "google-calendar:calendar:primary:event:deep-secret#provenance",
    }),
    overlapStart: "2026-08-29T08:00:00.000Z",
    overlapEnd: "2026-08-29T08:30:00.000Z",
    overlapMinutes: 30,
  });
}

function reference() {
  return createCalendarConflictReasoningReference({
    observation: observation(),
    now: new Date("2026-08-29T06:31:00.000Z"),
  })!;
}

describe("bounded Calendar conflict Understand reasoning", () => {
  it.each(["Does that matter?", "Does this matter?", "Is that a conflict?"])("recognizes the closed Level-2 follow-up: %s", (utterance) => {
    expect(isCalendarConflictUnderstandIntent(utterance)).toBe(true);
  });

  it.each(["What should I do?", "Is it urgent?", "Move it", "Does my email matter?"])("does not widen Level-2 intent: %s", (utterance) => {
    expect(isCalendarConflictUnderstandIntent(utterance)).toBe(false);
  });

  it("invokes the model once over only the admitted projection and renders a bounded answer", async () => {
    const model = vi.fn(async (_systemPrompt: string, _messages: ChatMessage[]) => '{"interpretationType":"scheduling_conflict"}');
    const result = await resolveCalendarConflictUnderstand({
      utterance: "Does that matter?",
      reasoningReference: reference(),
      callModel: model,
      now: new Date("2026-08-29T06:31:30.000Z"),
    });
    expect(result).toEqual({
      handled: true,
      status: "resolved",
      reply: "Yes — in the limited sense that it creates a scheduling conflict with an existing deep-work block.",
    });
    expect(model).toHaveBeenCalledTimes(1);
    expect(model.mock.calls[0]?.[0]).toBe(CALENDAR_CONFLICT_UNDERSTAND_PROMPT);
    const messages = model.mock.calls[0]?.[1];
    expect(messages).toHaveLength(1);
    const payload = JSON.parse(messages?.[0]?.content ?? "{}");
    expect(payload).toEqual({
      question: "Does that matter?",
      evidence: {
        evidenceType: "calendar_conflict",
        invitation: { start: "2026-08-29T07:30:00.000Z", end: "2026-08-29T08:30:00.000Z", attendeeState: "needsAction" },
        existingCommitment: { start: "2026-08-29T08:00:00.000Z", end: "2026-08-29T09:30:00.000Z", timeMode: "deep_work" },
        overlapMinutes: 30,
        observedAt: "2026-08-29T06:30:00.000Z",
        provenance: {
          invitationObservationReference: "conflict-observation:invitation",
          existingCommitmentObservationReference: "conflict-observation:existing_commitment",
        },
      },
    });
    const serialized = JSON.stringify(payload);
    for (const forbidden of ["Gate K Test Invite", "SECRET", "Private Work", "invite-secret", "deep-secret", "URGENT", "PROTECTED", "PRIORITY", "google-calendar:", "recommendation", "importance", "urgency", "priority"]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("exposes no private evidence for unsupported intent", async () => {
    const model = vi.fn(async () => '{"interpretationType":"scheduling_conflict"}');
    const result = await resolveCalendarConflictUnderstand({ utterance: "What should I do?", reasoningReference: reference(), callModel: model });
    expect(result).toEqual({ handled: false, status: "unsupported_intent" });
    expect(model).not.toHaveBeenCalled();
  });

  it("fails closed for absent, fabricated and expired references without invoking the model", async () => {
    const model = vi.fn(async () => '{"interpretationType":"scheduling_conflict"}');
    const absent = await resolveCalendarConflictUnderstand({ utterance: "Does that matter?", callModel: model });
    expect(absent).toMatchObject({ handled: true, status: "absent" });
    const invalid = await resolveCalendarConflictUnderstand({ utterance: "Does that matter?", reasoningReference: { calendarConflictReasoningReferenceId: "fake" }, callModel: model });
    expect(invalid).toMatchObject({ handled: true, status: "invalid" });
    const expiredRef = createCalendarConflictReasoningReference({ observation: observation(), now: new Date("2026-08-29T06:00:00.000Z") })!;
    const expired = await resolveCalendarConflictUnderstand({
      utterance: "Does that matter?",
      reasoningReference: expiredRef,
      callModel: model,
      now: new Date("2026-08-29T06:15:00.000Z"),
    });
    expect(expired).toMatchObject({ handled: true, status: "expired" });
    expect(model).not.toHaveBeenCalled();
  });

  it.each([
    "not json",
    '{"interpretationType":"scheduling_conflict","importance":"high"}',
    '{"interpretationType":"urgent"}',
    '{"interpretationType":"unsupported"}',
    '{"interpretationType":"scheduling_conflict","recommendation":"move it"}',
  ])("rejects malformed, widened or unsupported model output", async (output) => {
    const model = vi.fn(async () => output);
    const result = await resolveCalendarConflictUnderstand({
      utterance: "Does that matter?",
      reasoningReference: reference(),
      callModel: model,
      now: new Date("2026-08-29T06:31:30.000Z"),
    });
    expect(result).toMatchObject({ handled: true, status: "model_invalid" });
  });

  it("fails closed on model error and never retries", async () => {
    const model = vi.fn(async () => { throw new Error("model down"); });
    const result = await resolveCalendarConflictUnderstand({
      utterance: "Does that matter?",
      reasoningReference: reference(),
      callModel: model,
      now: new Date("2026-08-29T06:31:30.000Z"),
    });
    expect(result).toMatchObject({ handled: true, status: "model_failed" });
    expect(model).toHaveBeenCalledTimes(1);
  });

  it("contains no connector, PendingAuthorization, mutation or recommendation machinery", async () => {
    const source = await import("node:fs").then(({ readFileSync }) => readFileSync("lib/lighter-jarvis/calendar-conflict-understand.ts", "utf8"));
    for (const forbidden of ["createConnector", "PendingAuthorization", "pendingAuthorizationReference", "calendar.update", "calendar.create", "recommendation:", "protected:", "importance:", "urgency:", "priority:"]) {
      expect(source).not.toContain(forbidden);
    }
  });
});