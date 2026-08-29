import type { ChatMessage } from "../agents/types";
import type { GoldenScenarioGateKObservation } from "../governed-conversation/golden-scenario-calendar-conflict-gate-k";
import {
  resolveCalendarConflictReasoningReference,
  type CalendarConflictReasoningReference,
} from "./calendar-conflict-reasoning-reference";

export type CalendarConflictUnderstandIntent = "calendar_conflict_understand";

export type CalendarConflictUnderstandEvidence = Readonly<{
  evidenceType: "calendar_conflict";
  invitation: Readonly<{
    start: string;
    end: string;
    attendeeState: "needsAction";
  }>;
  existingCommitment: Readonly<{
    start: string;
    end: string;
    timeMode: "deep_work";
  }>;
  overlapMinutes: number;
  observedAt: string;
  provenance: Readonly<{
    invitationObservationReference: "conflict-observation:invitation";
    existingCommitmentObservationReference: "conflict-observation:existing_commitment";
  }>;
}>;

export type CalendarConflictUnderstandModelCall = (
  systemPrompt: string,
  messages: ChatMessage[],
) => Promise<string | Readonly<{ text: string }>>;

export type CalendarConflictUnderstandResult = Readonly<{
  handled: boolean;
  status:
    | "resolved"
    | "absent"
    | "expired"
    | "invalid"
    | "unsupported_intent"
    | "model_failed"
    | "model_invalid";
  reply?: string;
  reasoningReference?: CalendarConflictReasoningReference;
}>;

const UNDERSTAND_PROMPT = [
  "You are a bounded private-evidence reasoning component for one Calendar conflict.",
  "You receive exactly one minimal governed evidence object and the user's current question.",
  "Return JSON only.",
  'Allowed outputs: {"interpretationType":"scheduling_conflict"} or {"interpretationType":"unsupported"}.',
  "Use scheduling_conflict only when the supplied evidence establishes a pending invitation overlapping an existing deep-work commitment.",
  "Do not infer importance, urgency, priority, protected status, recommendation, action, preference, or authority.",
  "Do not answer with prose. Do not request or imply Calendar access.",
].join("\n");

function normalize(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, " ").trim();
}

export function isCalendarConflictUnderstandIntent(utterance: string): boolean {
  const value = normalize(utterance);
  return value === "does that matter"
    || value === "does this matter"
    || value === "is that a conflict";
}

function parseModelJson(text: string): unknown {
  const trimmed = text.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  try { return JSON.parse(trimmed); }
  catch { return null; }
}

function validateModelOutput(raw: unknown): "scheduling_conflict" | "unsupported" | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  if (Object.keys(record).length !== 1 || !Object.hasOwn(record, "interpretationType")) return null;
  return record.interpretationType === "scheduling_conflict" || record.interpretationType === "unsupported"
    ? record.interpretationType
    : null;
}

function projectEvidence(observation: GoldenScenarioGateKObservation): CalendarConflictUnderstandEvidence | null {
  if (observation.addedPendingInvitation.selfAttendeeResponse !== "needsAction") return null;
  if (observation.existingDeepWorkCommitment.timeMode !== "deep_work") return null;
  if (!Number.isFinite(observation.overlapMinutes) || observation.overlapMinutes <= 0) return null;

  return Object.freeze({
    evidenceType: "calendar_conflict",
    invitation: Object.freeze({
      start: observation.addedPendingInvitation.start,
      end: observation.addedPendingInvitation.end,
      attendeeState: "needsAction" as const,
    }),
    existingCommitment: Object.freeze({
      start: observation.existingDeepWorkCommitment.start,
      end: observation.existingDeepWorkCommitment.end,
      timeMode: "deep_work" as const,
    }),
    overlapMinutes: observation.overlapMinutes,
    observedAt: observation.observedAt,
    provenance: Object.freeze({
      invitationObservationReference: "conflict-observation:invitation" as const,
      existingCommitmentObservationReference: "conflict-observation:existing_commitment" as const,
    }),
  });
}

export async function resolveCalendarConflictUnderstand(input: {
  readonly utterance: string;
  readonly reasoningReference?: unknown;
  readonly callModel: CalendarConflictUnderstandModelCall;
  readonly now?: Date;
}): Promise<CalendarConflictUnderstandResult> {
  if (!isCalendarConflictUnderstandIntent(input.utterance)) {
    return Object.freeze({ handled: false, status: "unsupported_intent" });
  }

  const resolved = resolveCalendarConflictReasoningReference({
    reference: input.reasoningReference,
    ...(input.now ? { now: input.now } : {}),
  });
  if (resolved.status !== "resolved") {
    const reply = resolved.status === "expired"
      ? "I can no longer safely interpret that earlier Calendar conflict because its bounded reasoning reference has expired."
      : resolved.status === "absent"
        ? "I don't have an eligible governed Calendar conflict to interpret."
        : "I can't safely use that Calendar conflict reasoning reference.";
    return Object.freeze({ handled: true, status: resolved.status, reply });
  }

  const evidence = projectEvidence(resolved.observation);
  if (!evidence) {
    return Object.freeze({
      handled: true,
      status: "invalid",
      reply: "I can't safely interpret that Calendar conflict because its governed evidence no longer satisfies the Level-2 contract.",
    });
  }

  try {
    const result = await input.callModel(UNDERSTAND_PROMPT, [{
      role: "user",
      content: JSON.stringify({
        question: input.utterance,
        evidence,
      }),
    }]);
    const text = typeof result === "string" ? result : result.text;
    const interpretationType = validateModelOutput(parseModelJson(text));
    if (interpretationType !== "scheduling_conflict") {
      return Object.freeze({
        handled: true,
        status: "model_invalid",
        reply: "I couldn't safely produce a bounded interpretation of that Calendar conflict.",
      });
    }

    return Object.freeze({
      handled: true,
      status: "resolved",
      reply: "Yes — in the limited sense that it creates a scheduling conflict with an existing deep-work block.",
    });
  } catch {
    return Object.freeze({
      handled: true,
      status: "model_failed",
      reply: "I couldn't safely interpret that Calendar conflict right now.",
    });
  }
}

export const CALENDAR_CONFLICT_UNDERSTAND_PROMPT = UNDERSTAND_PROMPT;
