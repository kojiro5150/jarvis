import {
  projectGovernedCalendarAttentionObservationSet,
  type CanonicalCalendarAttentionObservationSet,
} from "../governed-conversation/calendar-attention-observation";
import { compareCalendarAttentionObservationSets } from "../governed-conversation/calendar-attention-observation-comparison";
import {
  selectCalendarRemovalAttention,
  selectCalendarStartTimeAttention,
} from "../governed-conversation/calendar-attention-policy-adapter";
import { publishCalendarAttentionBrief } from "../governed-conversation/calendar-attention-brief-publisher";
import { renderCalendarAttentionBrief } from "../governed-conversation/calendar-attention-conversational-renderer";
import type { GovernedCalendarEvidenceInput } from "../governed-conversation/projection-composer";
import type { SourceAdapterResult } from "../governed-conversation/source-adapter-result";
import type { CalendarReadWindow } from "./calendar-read-window";
import {
  bindGoldenScenarioCalendarConflictGateK,
  type GoldenScenarioGateKObservation,
} from "../governed-conversation/golden-scenario-calendar-conflict-gate-k";
import type { GovernedCalendarConflictEvent } from "../governed-conversation/calendar-conflict-observation";
import {
  createCalendarAttentionObservationReference,
  resolveCalendarAttentionObservationReference,
  rotateCalendarAttentionObservationReference,
  type CalendarAttentionObservationReference,
} from "./calendar-attention-observation-reference";

const REQUESTED_LIMIT = 5;
type LiveCalendarCoverageState =
  | "bounded_complete_request"
  | "bounded_partial_request"
  | "bounded";
const CALENDAR_DISCLOSURE_POLICY_REFERENCE = "governed-calendar-conversational-metadata-disclosure.v1";

export type LiveCalendarAttentionResult = Readonly<{
  reply: string;
  calendarAttentionObservationReference: CalendarAttentionObservationReference;
  baselineEstablished: boolean;
  gateKStatus?: "matched" | "not_found" | "ambiguous_pending_invitation" | "invalid";
}>;

function currentObservationSet(
  evidence: SourceAdapterResult<GovernedCalendarEvidenceInput> & Readonly<{
    coverageState?: LiveCalendarCoverageState;
    conflictEvents?: readonly GovernedCalendarConflictEvent[];
  }>,
  window: CalendarReadWindow,
): CanonicalCalendarAttentionObservationSet {
  if (evidence.status !== "available" || typeof evidence.observedAt !== "string") {
    throw new Error("available governed Calendar evidence with observation time is required");
  }
  const coverageState = evidence.coverageState ?? "bounded";
  const coverageLimit = `window=${window.start}/${window.end};max_events=${REQUESTED_LIMIT};scope=visible_non_hidden_calendars;completeness=${coverageState}`;

  return projectGovernedCalendarAttentionObservationSet({
    sourceId: "google-calendar",
    available: true,
    observedAt: evidence.observedAt,
    windowStart: window.start,
    windowEnd: window.end,
    requestedLimit: REQUESTED_LIMIT,
    coverageState,
    coverageLimit,
    policyReference: CALENDAR_DISCLOSURE_POLICY_REFERENCE,
    evidence: evidence.evidence,
  });
}

function incompatibleBaselineReply(): string {
  return "I have a current Calendar baseline, but the previous baseline covered a different bounded window, so I cannot compare them.";
}

const melbourneTime = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatGateKTime(value: string): string {
  return melbourneTime.format(new Date(value)).replace(/\b(am|pm)\b/gi, match => match.toUpperCase());
}

function renderGateKObservation(observation: GoldenScenarioGateKObservation): string {
  const invite = observation.addedPendingInvitation;
  const existing = observation.existingDeepWorkCommitment;
  return `A pending Calendar invitation from ${formatGateKTime(invite.start)}–${formatGateKTime(invite.end)} overlaps an existing deep-work block from ${formatGateKTime(existing.start)}–${formatGateKTime(existing.end)} by ${observation.overlapMinutes} minutes.`;
}

function renderGateKObservations(observations: readonly GoldenScenarioGateKObservation[]): string {
  if (observations.length === 1) return renderGateKObservation(observations[0]!);
  return [
    `${observations.length} pending-invitation conflicts matched this bounded Calendar check:`,
    ...observations.map(observation => `- ${renderGateKObservation(observation)}`),
  ].join("\n");
}

/**
 * Applies the already-proven attention path after a current Calendar read has
 * independently passed the existing authority gate.
 *
 * This function performs no acquisition and grants no authority.
 */
export function resolveLiveCalendarAttention(input: {
  readonly evidence: SourceAdapterResult<GovernedCalendarEvidenceInput> & Readonly<{
    coverageState?: LiveCalendarCoverageState;
    conflictEvents?: readonly GovernedCalendarConflictEvent[];
  }>;
  readonly window: CalendarReadWindow;
  readonly previousObservationReference?: unknown;
}): LiveCalendarAttentionResult {
  const current = currentObservationSet(input.evidence, input.window);
  const previous = input.previousObservationReference === undefined
    ? null
    : resolveCalendarAttentionObservationReference(input.previousObservationReference);

  if (previous === null) {
    return Object.freeze({
      reply: "I have established a bounded Calendar baseline for today. A later authorised check can compare against it for supported attention changes.",
      calendarAttentionObservationReference: createCalendarAttentionObservationReference(current),
      baselineEstablished: true,
    });
  }

  try {
    const changeSet = compareCalendarAttentionObservationSets(previous, current);
    const gateK = input.evidence.conflictEvents
      ? bindGoldenScenarioCalendarConflictGateK({
          changes: changeSet,
          currentEvents: input.evidence.conflictEvents,
        })
      : null;
    const nextReference = rotateCalendarAttentionObservationReference({
      previousReference: input.previousObservationReference,
      currentSet: current,
    });

    if (gateK?.status === "matched") {
      return Object.freeze({
        reply: renderGateKObservations(gateK.observations),
        calendarAttentionObservationReference: nextReference,
        baselineEstablished: false,
        gateKStatus: "matched",
      });
    }
    if (gateK?.status === "ambiguous_pending_invitation") {
      return Object.freeze({
        reply: "I found more than one newly added pending Calendar invitation in this bounded check, so I can't safely bind the conflict to one invitation.",
        calendarAttentionObservationReference: nextReference,
        baselineEstablished: false,
        gateKStatus: "ambiguous_pending_invitation",
      });
    }
    if (gateK?.status === "invalid") {
      return Object.freeze({
        reply: "I couldn't safely bind the current Calendar evidence to the previous bounded observation.",
        calendarAttentionObservationReference: nextReference,
        baselineEstablished: false,
        gateKStatus: "invalid",
      });
    }

    const matches = Object.freeze([
      ...selectCalendarStartTimeAttention(changeSet),
      ...selectCalendarRemovalAttention(changeSet),
    ]);
    const brief = publishCalendarAttentionBrief({
      previousObservedAt: changeSet.previousObservedAt,
      currentObservedAt: changeSet.currentObservedAt,
      matches,
    });
    return Object.freeze({
      reply: renderCalendarAttentionBrief(brief),
      calendarAttentionObservationReference: nextReference,
      baselineEstablished: false,
      ...(gateK ? { gateKStatus: gateK.status } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("incompatible coverage") ||
        message.includes("incompatible disclosure policy") ||
        message.includes("incompatible source identity")) {
      return Object.freeze({
        reply: incompatibleBaselineReply(),
        calendarAttentionObservationReference: rotateCalendarAttentionObservationReference({
          previousReference: input.previousObservationReference,
          currentSet: current,
        }),
        baselineEstablished: true,
      });
    }
    throw error;
  }
}
