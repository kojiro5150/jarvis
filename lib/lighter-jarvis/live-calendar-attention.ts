import { CALENDAR_CONVERSATIONAL_DISCLOSURE_POLICY } from "../governed-conversation/calendar-evidence-publisher";
import {
  projectGovernedCalendarAttentionObservationSet,
  type CanonicalCalendarAttentionObservationSet,
} from "../governed-conversation/calendar-attention-observation";
import { compareCalendarAttentionObservationSets } from "../governed-conversation/calendar-attention-observation-comparison";
import { selectCalendarStartTimeAttention } from "../governed-conversation/calendar-attention-policy-adapter";
import { publishCalendarAttentionBrief } from "../governed-conversation/calendar-attention-brief-publisher";
import { renderCalendarAttentionBrief } from "../governed-conversation/calendar-attention-conversational-renderer";
import type { GovernedCalendarEvidenceInput } from "../governed-conversation/projection-composer";
import type { SourceAdapterResult } from "../governed-conversation/source-adapter-result";
import type { CalendarReadWindow } from "./calendar-read-window";
import {
  createCalendarAttentionObservationReference,
  resolveCalendarAttentionObservationReference,
  rotateCalendarAttentionObservationReference,
  type CalendarAttentionObservationReference,
} from "./calendar-attention-observation-reference";

const REQUESTED_LIMIT = 5;
const COVERAGE_STATE = "bounded" as const;

export type LiveCalendarAttentionResult = Readonly<{
  reply: string;
  calendarAttentionObservationReference: CalendarAttentionObservationReference;
  baselineEstablished: boolean;
}>;

function currentObservationSet(
  evidence: SourceAdapterResult<GovernedCalendarEvidenceInput>,
  window: CalendarReadWindow,
): CanonicalCalendarAttentionObservationSet {
  if (evidence.status !== "available" || typeof evidence.observedAt !== "string") {
    throw new Error("available governed Calendar evidence with observation time is required");
  }
  const coverageLimit = `window=${window.start}/${window.end};max_events=${REQUESTED_LIMIT};scope=visible_non_hidden_calendars;completeness=${COVERAGE_STATE}`;

  return projectGovernedCalendarAttentionObservationSet({
    sourceId: "google-calendar",
    available: true,
    observedAt: evidence.observedAt,
    windowStart: window.start,
    windowEnd: window.end,
    requestedLimit: REQUESTED_LIMIT,
    coverageState: COVERAGE_STATE,
    coverageLimit,
    policyReference: CALENDAR_CONVERSATIONAL_DISCLOSURE_POLICY,
    evidence: evidence.evidence,
  });
}

function incompatibleBaselineReply(): string {
  return "I have a current Calendar baseline, but the previous baseline covered a different bounded window, so I cannot compare them.";
}

/**
 * Applies the already-proven attention path after a current Calendar read has
 * independently passed the existing authority gate.
 *
 * This function performs no acquisition and grants no authority.
 */
export function resolveLiveCalendarAttention(input: {
  readonly evidence: SourceAdapterResult<GovernedCalendarEvidenceInput>;
  readonly window: CalendarReadWindow;
  readonly previousObservationReference?: unknown;
}): LiveCalendarAttentionResult {
  const current = currentObservationSet(input.evidence, input.window);
  const previous = input.previousObservationReference === undefined
    ? null
    : resolveCalendarAttentionObservationReference(input.previousObservationReference);

  if (previous === null) {
    return Object.freeze({
      reply: "I have established a bounded Calendar baseline for today. A later authorised check can compare against it for start-time changes.",
      calendarAttentionObservationReference: createCalendarAttentionObservationReference(current),
      baselineEstablished: true,
    });
  }

  try {
    const changeSet = compareCalendarAttentionObservationSets(previous, current);
    const matches = selectCalendarStartTimeAttention(changeSet);
    const brief = publishCalendarAttentionBrief({
      previousObservedAt: changeSet.previousObservedAt,
      currentObservedAt: changeSet.currentObservedAt,
      matches,
    });
    return Object.freeze({
      reply: renderCalendarAttentionBrief(brief),
      calendarAttentionObservationReference: rotateCalendarAttentionObservationReference({
        previousReference: input.previousObservationReference,
        currentSet: current,
      }),
      baselineEstablished: false,
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
