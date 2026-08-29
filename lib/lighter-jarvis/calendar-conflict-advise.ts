import type { ChatMessage } from "../agents/types";
import type { ScopedCalendarEvidenceResult } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
import type { CalendarReadWindow } from "./calendar-read-window";
import { resolveCalendarConflictReasoningReference } from "./calendar-conflict-reasoning-reference";
import { resolveCalendarAdvicePreferenceReference, CALENDAR_ADVICE_PREFERENCE_KIND } from "./calendar-advice-preference-reference";
import { createCalendarAdviceReference, type CalendarAdviceReference } from "./calendar-advice-reference";

export type CalendarConflictAdviseModelCall = (systemPrompt: string, messages: ChatMessage[]) => Promise<string | Readonly<{ text: string }>>;

export type CalendarConflictAdviseResult = Readonly<{
  status: "resolved" | "current_situation_changed" | "insufficient_coverage" | "candidate_occupied" | "invalid" | "model_failed" | "model_invalid";
  reply: string;
  calendarAdviceReference?: CalendarAdviceReference;
}>;

export function isCalendarConflictAdviseQuestion(utterance: string): boolean {
  const normalized = utterance.normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, " ").trim();
  return normalized === "what would you do";
}

const ADVISE_PROMPT = [
  "You are a bounded recommendation classifier for one governed Calendar conflict.",
  "You receive one minimal current evidence object plus one explicit user preference.",
  "Return JSON only.",
  'Allowed outputs: {"recommendationType":"keep_invitation_move_deep_work_to_candidate"} or {"recommendationType":"insufficient_basis"}.',
  "Use the positive recommendation only when currentConflict is true, the candidate is free, the full deep-work duration is preserved, and the supplied preference is exactly the admitted preference.",
  "Do not invent another time, priority, urgency, importance, protected status, action authority, approval, or execution instruction.",
].join("\n");

const melbourneTime = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit", hour12: true });
function formatTime(value: string): string {
  return melbourneTime.format(new Date(value)).replace(/\b(am|pm)\b/gi, match => match.toUpperCase());
}

function parseModelJson(text: string): unknown {
  const trimmed = text.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  try { return JSON.parse(trimmed); } catch { return null; }
}

function validateModelOutput(raw: unknown): "keep_invitation_move_deep_work_to_candidate" | "insufficient_basis" | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  if (Object.keys(record).length !== 1 || !Object.hasOwn(record, "recommendationType")) return null;
  return record.recommendationType === "keep_invitation_move_deep_work_to_candidate" || record.recommendationType === "insufficient_basis"
    ? record.recommendationType : null;
}

function overlaps(start: string, end: string, candidateStart: string, candidateEnd: string): boolean {
  return Date.parse(start) < Date.parse(candidateEnd) && Date.parse(end) > Date.parse(candidateStart);
}

export async function resolveCalendarConflictAdvise(input: {
  readonly reasoningReference: unknown;
  readonly preferenceReference: unknown;
  readonly evidence: ScopedCalendarEvidenceResult;
  readonly window: CalendarReadWindow;
  readonly callModel: CalendarConflictAdviseModelCall;
  readonly now?: Date;
}): Promise<CalendarConflictAdviseResult> {
  const historical = resolveCalendarConflictReasoningReference({ reference: input.reasoningReference, ...(input.now ? { now: input.now } : {}) });
  const preference = resolveCalendarAdvicePreferenceReference(input.preferenceReference);
  if (historical.status !== "resolved" || !preference || preference.kind !== CALENDAR_ADVICE_PREFERENCE_KIND) {
    return Object.freeze({ status: "invalid", reply: "I can't safely evaluate that advice request from the available governed state." });
  }
  if (input.evidence.status !== "available" || !Array.isArray(input.evidence.conflictEvents)) {
    return Object.freeze({ status: "invalid", reply: "I couldn't obtain the governed current Calendar state required for advice." });
  }
  if (input.evidence.coverageState !== "bounded_complete_request") {
    return Object.freeze({ status: "insufficient_coverage", reply: "I can't truthfully recommend from this Calendar read because the bounded current coverage was not complete." });
  }

  const historicalInvite = historical.observation.addedPendingInvitation;
  const historicalDeep = historical.observation.existingDeepWorkCommitment;
  const currentById = new Map(input.evidence.conflictEvents.map(event => [event.commitmentReference, event]));
  const invite = currentById.get(historicalInvite.commitmentReference);
  const deep = currentById.get(historicalDeep.commitmentReference);
  if (!invite || !deep
      || invite.selfAttendeeResponse !== "needsAction"
      || deep.timeMode !== "deep_work"
      || invite.start !== historicalInvite.start
      || invite.end !== historicalInvite.end
      || deep.start !== historicalDeep.start
      || deep.end !== historicalDeep.end
      || !overlaps(invite.start, invite.end, deep.start, deep.end)) {
    return Object.freeze({ status: "current_situation_changed", reply: "The current Calendar situation has changed from the earlier conflict, so I won't recommend from the stale assumptions." });
  }

  const durationMs = Date.parse(deep.end) - Date.parse(deep.start);
  if (!Number.isFinite(durationMs) || durationMs <= 0 || durationMs % 60000 !== 0) {
    return Object.freeze({ status: "invalid", reply: "I couldn't safely derive the current deep-work duration." });
  }
  const durationMinutes = durationMs / 60000;
  const candidateStart = deep.end;
  const candidateEnd = new Date(Date.parse(candidateStart) + durationMs).toISOString();
  if (Date.parse(candidateStart) < Date.parse(input.window.start) || Date.parse(candidateEnd) > Date.parse(input.window.end)) {
    return Object.freeze({ status: "insufficient_coverage", reply: "The deterministic candidate extends outside the complete bounded Calendar window, so I can't claim that slot is free." });
  }

  const occupied = input.evidence.conflictEvents.some(event =>
    event.commitmentReference !== deep.commitmentReference
      && overlaps(event.start, event.end, candidateStart, candidateEnd));
  if (occupied) {
    return Object.freeze({
      status: "candidate_occupied",
      reply: `The immediate ${durationMinutes}-minute slot after the deep-work block is not free, so I don't yet have a supported recommendation under this advice rule.`,
    });
  }

  const observedAt = input.evidence.observedAt;
  if (typeof observedAt !== "string") {
    return Object.freeze({ status: "invalid", reply: "The current Calendar observation has no valid observation time." });
  }

  const modelEvidence = Object.freeze({
    currentConflict: Object.freeze({ pendingInvitationPresent: true, deepWorkPresent: true, deepWorkDurationMinutes: durationMinutes }),
    candidate: Object.freeze({ start: candidateStart, end: candidateEnd, durationMinutes, availability: "free" as const, observedAt }),
    userPreference: Object.freeze({ kind: CALENDAR_ADVICE_PREFERENCE_KIND }),
    provenance: Object.freeze({
      historicalConflictReference: "calendar-conflict:historical" as const,
      currentAvailabilityObservationReference: "calendar-availability:current" as const,
    }),
  });

  try {
    const result = await input.callModel(ADVISE_PROMPT, [{ role: "user", content: JSON.stringify(modelEvidence) }]);
    const text = typeof result === "string" ? result : result.text;
    const recommendationType = validateModelOutput(parseModelJson(text));
    if (recommendationType !== "keep_invitation_move_deep_work_to_candidate") {
      return Object.freeze({ status: "model_invalid", reply: "I couldn't safely produce a bounded recommendation from the governed advice evidence." });
    }
    const adviceReference = createCalendarAdviceReference({
      sourceCommitmentReference: deep.commitmentReference,
      candidateStart, candidateEnd, durationMinutes, observedAt,
      ...(input.now ? { now: input.now } : {}),
    });
    if (!adviceReference) return Object.freeze({ status: "invalid", reply: "I couldn't safely preserve the recommendation state." });
    return Object.freeze({
      status: "resolved",
      reply: `Current Calendar fact: ${formatTime(candidateStart)}–${formatTime(candidateEnd)} is free.\nRecommendation: Given your preference to keep the invitation when the full deep-work block can be preserved, I'd keep the invitation and move the deep-work block to ${formatTime(candidateStart)}–${formatTime(candidateEnd)}.`,
      calendarAdviceReference: adviceReference,
    });
  } catch {
    return Object.freeze({ status: "model_failed", reply: "I couldn't safely produce the bounded recommendation right now." });
  }
}

export const CALENDAR_CONFLICT_ADVISE_PROMPT = ADVISE_PROMPT;