import type { ScopedCalendarEvidenceResult } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import type { GovernedCalendarConflictEvent } from "../governed-conversation/calendar-conflict-observation";
import type { CalendarReadWindow } from "./calendar-read-window";
import { resolveCalendarAdviceReference } from "./calendar-advice-reference";
import {
  createCalendarMoveProposalReference,
  type CalendarMoveProposalReference,
  type CalendarMoveProposalSnapshot,
} from "./calendar-move-proposal-reference";
import {
  createCalendarMoveAuthorizationReference,
  type CalendarMoveAuthorizationReference,
} from "./calendar-move-authorization";

export type CalendarActValidationResult = Readonly<{
  status:
    | "resolved"
    | "invalid_advice"
    | "current_situation_changed"
    | "insufficient_coverage"
    | "target_occupied"
    | "invalid";
  reply: string;
  calendarMoveProposalReference?: CalendarMoveProposalReference;
  calendarMoveAuthorizationReference?: CalendarMoveAuthorizationReference;
}>;

const melbourneTime = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatTime(value: string): string {
  return melbourneTime
    .format(new Date(value))
    .replace(/\b(am|pm)\b/gi, value => value.toUpperCase());
}

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isCalendarActInstruction(utterance: string): boolean {
  const value = normalize(utterance);
  return value === "okay do it" || value === "ok do it";
}

function parseCommitmentReference(
  reference: string,
): Readonly<{ calendarId: string; eventId: string }> | null {
  const match = reference.match(
    /^google-calendar:calendar:([^:]+):event:([^:]+)$/,
  );
  return match
    ? Object.freeze({ calendarId: match[1]!, eventId: match[2]! })
    : null;
}

function overlaps(
  start: string,
  end: string,
  candidateStart: string,
  candidateEnd: string,
): boolean {
  return (
    Date.parse(start) < Date.parse(candidateEnd) &&
    Date.parse(end) > Date.parse(candidateStart)
  );
}

export function validateCalendarMoveProposalAgainstEvidence(input: {
  readonly proposal: CalendarMoveProposalSnapshot;
  readonly evidence: ScopedCalendarEvidenceResult;
  readonly window: CalendarReadWindow;
}): Readonly<{
  status:
    | "resolved"
    | "current_situation_changed"
    | "insufficient_coverage"
    | "target_occupied"
    | "invalid";
  observedAt?: string;
}> {
  if (input.evidence.status !== "available" || !input.evidence.conflictEvents) {
    return Object.freeze({ status: "invalid" });
  }
  if (input.evidence.coverageState !== "bounded_complete_request") {
    return Object.freeze({ status: "insufficient_coverage" });
  }
  const observedAt = input.evidence.observedAt;
  if (typeof observedAt !== "string") {
    return Object.freeze({ status: "invalid" });
  }
  if (
    Date.parse(input.proposal.targetStart) < Date.parse(input.window.start) ||
    Date.parse(input.proposal.targetEnd) > Date.parse(input.window.end)
  ) {
    return Object.freeze({ status: "insufficient_coverage" });
  }

  const currentById = new Map<string, GovernedCalendarConflictEvent>();
  for (const event of input.evidence.conflictEvents) {
    if (
      event.observedAt !== observedAt ||
      currentById.has(event.commitmentReference)
    ) {
      return Object.freeze({ status: "invalid" });
    }
    currentById.set(event.commitmentReference, event);
  }

  const source = currentById.get(input.proposal.commitmentReference);
  if (
    !source ||
    source.timeMode !== "deep_work" ||
    Date.parse(source.start) !== Date.parse(input.proposal.expectedStart) ||
    Date.parse(source.end) !== Date.parse(input.proposal.expectedEnd)
  ) {
    return Object.freeze({ status: "current_situation_changed" });
  }

  const occupied = input.evidence.conflictEvents.some(
    event =>
      event.commitmentReference !== source.commitmentReference &&
      overlaps(
        event.start,
        event.end,
        input.proposal.targetStart,
        input.proposal.targetEnd,
      ),
  );
  return occupied
    ? Object.freeze({ status: "target_occupied" })
    : Object.freeze({ status: "resolved", observedAt });
}

export function validateCalendarAdviceForAct(input: {
  readonly adviceReference: unknown;
  readonly evidence: ScopedCalendarEvidenceResult;
  readonly window: CalendarReadWindow;
  readonly now?: Date;
}): CalendarActValidationResult {
  const advice = resolveCalendarAdviceReference({
    reference: input.adviceReference,
    ...(input.now ? { now: input.now } : {}),
  });
  if (!advice) {
    return Object.freeze({
      status: "invalid_advice",
      reply:
        "I don't have an eligible governed Calendar recommendation to execute.",
    });
  }

  const durationMs = advice.durationMinutes * 60_000;
  const expectedEnd = advice.candidateStart;
  const expectedStart = new Date(
    Date.parse(expectedEnd) - durationMs,
  ).toISOString();
  const targetStart = advice.candidateStart;
  const targetEnd = advice.candidateEnd;

  const provider = parseCommitmentReference(advice.sourceCommitmentReference);
  if (!provider) {
    return Object.freeze({
      status: "invalid",
      reply:
        "I couldn't resolve the exact provider-backed Calendar event for this move.",
    });
  }

  const provisional = Object.freeze({
    commitmentReference: advice.sourceCommitmentReference,
    calendarId: provider.calendarId,
    eventId: provider.eventId,
    expectedStart,
    expectedEnd,
    targetStart,
    targetEnd,
    durationMinutes: advice.durationMinutes,
    observedAt: advice.observedAt,
  });

  const validation = validateCalendarMoveProposalAgainstEvidence({
    proposal: provisional,
    evidence: input.evidence,
    window: input.window,
  });

  if (validation.status === "current_situation_changed") {
    return Object.freeze({
      status: validation.status,
      reply:
        "The current Calendar state no longer matches the recommendation, so I won't construct a stale move proposal.",
    });
  }
  if (validation.status === "target_occupied") {
    return Object.freeze({
      status: validation.status,
      reply:
        "The recommended target slot is no longer free, so I won't construct a stale move proposal.",
    });
  }
  if (validation.status === "insufficient_coverage") {
    return Object.freeze({
      status: validation.status,
      reply:
        "I can't validate the move because the bounded current Calendar read was not complete.",
    });
  }
  if (validation.status !== "resolved" || !validation.observedAt) {
    return Object.freeze({
      status: "invalid",
      reply:
        "The current Calendar validation evidence is internally inconsistent.",
    });
  }

  const proposalReference = createCalendarMoveProposalReference(
    Object.freeze({
      ...provisional,
      observedAt: validation.observedAt,
    }),
  );
  const authorizationReference =
    createCalendarMoveAuthorizationReference(proposalReference);

  return Object.freeze({
    status: "resolved",
    reply: `I can move the deep-work block from ${formatTime(
      expectedStart,
    )}–${formatTime(expectedEnd)} to ${formatTime(
      targetStart,
    )}–${formatTime(
      targetEnd,
    )}. Please explicitly confirm this exact Calendar change.`,
    calendarMoveProposalReference: proposalReference,
    calendarMoveAuthorizationReference: authorizationReference,
  });
}
