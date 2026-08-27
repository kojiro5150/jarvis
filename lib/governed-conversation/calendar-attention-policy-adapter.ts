import type { AttentionReason } from "../executive-operating-system/attention/types";
import type { CalendarAttentionObservationChangeSet } from "./calendar-attention-observation-comparison";

export const CALENDAR_START_TIME_ATTENTION_POLICY = Object.freeze({
  id: "attention.commitment.start-time-changed",
  version: "1.0.0",
  reasonCode: "commitment.start-time.changed",
  reasonMessage: "The commitment start time changed.",
});

export interface CalendarAttentionPolicyMatch {
  readonly matchId: string;
  readonly entityId: string;
  readonly changeType: "modified";
  readonly previousObservedAt: string;
  readonly currentObservedAt: string;
  readonly policy: Readonly<{ readonly id: string; readonly version: string }>;
  readonly reason: AttentionReason;
}

/**
 * Applies only the existing deterministic commitment start-time attention
 * semantics to an already-bounded Calendar observation change set.
 *
 * It does not reconstruct OperationalCommitment, invoke the full Attention
 * Engine, rank records, infer urgency, or interpret end/timezone-only changes.
 */
export function selectCalendarStartTimeAttention(
  changeSet: CalendarAttentionObservationChangeSet,
): readonly CalendarAttentionPolicyMatch[] {
  if (!changeSet || !Array.isArray(changeSet.changes)) throw new Error("Calendar attention observation change set is required");

  const matches = changeSet.changes.flatMap(change => {
    if (change.type !== "modified") return [];
    if (change.previous.startsAt === change.current.startsAt) return [];

    const reason: AttentionReason = Object.freeze({
      code: CALENDAR_START_TIME_ATTENTION_POLICY.reasonCode,
      message: CALENDAR_START_TIME_ATTENTION_POLICY.reasonMessage,
      evidence: Object.freeze([
        Object.freeze({ field: "commitment.id", value: change.id }),
        Object.freeze({ field: "previous.startsAt", value: change.previous.startsAt }),
        Object.freeze({ field: "current.startsAt", value: change.current.startsAt }),
      ]),
    });

    return [Object.freeze({
      matchId: [
        "calendar-attention",
        encodeURIComponent(changeSet.currentObservedAt),
        encodeURIComponent(change.id),
        encodeURIComponent(CALENDAR_START_TIME_ATTENTION_POLICY.id),
        encodeURIComponent(CALENDAR_START_TIME_ATTENTION_POLICY.version),
      ].join(":"),
      entityId: change.id,
      changeType: "modified" as const,
      previousObservedAt: changeSet.previousObservedAt,
      currentObservedAt: changeSet.currentObservedAt,
      policy: Object.freeze({
        id: CALENDAR_START_TIME_ATTENTION_POLICY.id,
        version: CALENDAR_START_TIME_ATTENTION_POLICY.version,
      }),
      reason,
    })];
  });

  matches.sort((left, right) => left.entityId < right.entityId ? -1 : left.entityId > right.entityId ? 1 : 0);
  return Object.freeze(matches);
}
