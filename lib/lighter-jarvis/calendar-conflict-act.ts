import type { ScopedCalendarEvidenceResult } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import type { GovernedCalendarConflictEvent } from "../governed-conversation/calendar-conflict-observation";
import type { CalendarReadWindow } from "./calendar-read-window";
import { resolveCalendarAdviceReference } from "./calendar-advice-reference";
import { createCalendarMoveProposalReference, type CalendarMoveProposalReference } from "./calendar-move-proposal-reference";
import { createCalendarMoveAuthorizationReference, type CalendarMoveAuthorizationReference } from "./calendar-move-authorization";

export type CalendarActValidationResult = Readonly<{
  status: "resolved" | "invalid_advice" | "current_situation_changed" | "insufficient_coverage" | "target_occupied" | "invalid";
  reply: string;
  calendarMoveProposalReference?: CalendarMoveProposalReference;
  calendarMoveAuthorizationReference?: CalendarMoveAuthorizationReference;
}>;

const melbourneTime = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit", hour12: true });
function formatTime(value: string): string {
  return melbourneTime.format(new Date(value)).replace(/\b(am|pm)\b/gi, value => value.toUpperCase());
}

function normalize(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, " ").trim();
}

export function isCalendarActInstruction(utterance: string): boolean {
  const value = normalize(utterance);
  return value === "okay do it" || value === "ok do it";
}

function parseCommitmentReference(reference: string): Readonly<{ calendarId: string; eventId: string }> | null {
  const match = reference.match(/^google-calendar:calendar:([^:]+):event:([^:]+)$/);
  return match ? Object.freeze({ calendarId: match[1]!, eventId: match[2]! }) : null;
}

function overlaps(start: string, end: string, candidateStart: string, candidateEnd: string): boolean {
  return Date.parse(start) < Date.parse(candidateEnd) && Date.parse(end) > Date.parse(candidateStart);
}

export function validateCalendarAdviceForAct(input: {
  readonly adviceReference: unknown;
  readonly evidence: ScopedCalendarEvidenceResult;
  readonly window: CalendarReadWindow;
  readonly now?: Date;
}): CalendarActValidationResult {
  const advice = resolveCalendarAdviceReference({ reference: input.adviceReference, ...(input.now ? { now: input.now } : {}) });
  if (!advice) return Object.freeze({ status: "invalid_advice", reply: "I don't have an eligible governed Calendar recommendation to execute." });
  if (input.evidence.status !== "available" || !input.evidence.conflictEvents) {
    return Object.freeze({ status: "invalid", reply: "I couldn't obtain the governed current Calendar state required to validate that move." });
  }
  if (input.evidence.coverageState !== "bounded_complete_request") {
    return Object.freeze({ status: "insufficient_coverage", reply: "I can't validate the move because the bounded current Calendar read was not complete." });
  }
  const observedAt = input.evidence.observedAt;
  if (typeof observedAt !== "string") return Object.freeze({ status: "invalid", reply: "The current Calendar validation has no valid observation time." });

  const durationMs = advice.durationMinutes * 60_000;
  const expectedEnd = advice.candidateStart;
  const expectedStart = new Date(Date.parse(expectedEnd) - durationMs).toISOString();
  const targetStart = advice.candidateStart;
  const targetEnd = advice.candidateEnd;
  if (Date.parse(targetStart) < Date.parse(input.window.start) || Date.parse(targetEnd) > Date.parse(input.window.end)) {
    return Object.freeze({ status: "insufficient_coverage", reply: "The recommended target is outside the complete bounded Calendar validation window." });
  }

  const currentById = new Map<string, GovernedCalendarConflictEvent>();
  for (const event of input.evidence.conflictEvents) {
    if (event.observedAt !== observedAt || currentById.has(event.commitmentReference)) {
      return Object.freeze({ status: "invalid", reply: "The current Calendar validation evidence is internally inconsistent." });
    }
    currentById.set(event.commitmentReference, event);
  }
  const source = currentById.get(advice.sourceCommitmentReference);
  if (!source || source.timeMode !== "deep_work" || source.start !== expectedStart || source.end !== expectedEnd) {
    return Object.freeze({ status: "current_situation_changed", reply: "The current Calendar state no longer matches the recommendation, so I won't construct a stale move proposal." });
  }

  const targetOccupied = input.evidence.conflictEvents.some(event =>
    event.commitmentReference !== source.commitmentReference && overlaps(event.start, event.end, targetStart, targetEnd));
  if (targetOccupied) {
    return Object.freeze({ status: "target_occupied", reply: "The recommended target slot is no longer free, so I won't construct a stale move proposal." });
  }

  const provider = parseCommitmentReference(source.commitmentReference);
  if (!provider) return Object.freeze({ status: "invalid", reply: "I couldn't resolve the exact provider-backed Calendar event for this move." });

  const proposalReference = createCalendarMoveProposalReference(Object.freeze({
    commitmentReference: source.commitmentReference,
    calendarId: provider.calendarId,
    eventId: provider.eventId,
    expectedStart, expectedEnd, targetStart, targetEnd,
    durationMinutes: advice.durationMinutes,
    observedAt,
  }));
  const authorizationReference = createCalendarMoveAuthorizationReference(proposalReference);
  return Object.freeze({
    status: "resolved",
    reply: `I can move the deep-work block from ${formatTime(expectedStart)}–${formatTime(expectedEnd)} to ${formatTime(targetStart)}–${formatTime(targetEnd)}. Please explicitly confirm this exact Calendar change.`,
    calendarMoveProposalReference: proposalReference,
    calendarMoveAuthorizationReference: authorizationReference,
  });
}