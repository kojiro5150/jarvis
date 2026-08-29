import type { CalendarAttentionObservationChangeSet } from "./calendar-attention-observation-comparison";
import {
  observeCalendarConflict,
  type GovernedCalendarConflictEvent,
  type GovernedCalendarConflictObservation,
} from "./calendar-conflict-observation";

export type GoldenScenarioGateKObservation = Readonly<{
  observedAt: string;
  addedPendingInvitation: GovernedCalendarConflictEvent;
  existingDeepWorkCommitment: GovernedCalendarConflictEvent;
  overlapStart: string;
  overlapEnd: string;
  overlapMinutes: number;
}>;

export type GoldenScenarioGateKResult =
  | Readonly<{ status: "matched"; observations: readonly GoldenScenarioGateKObservation[] }>
  | Readonly<{ status: "not_found" | "ambiguous_pending_invitation" | "invalid"; observations: readonly [] }>;

function empty(status: Exclude<GoldenScenarioGateKResult["status"], "matched">): GoldenScenarioGateKResult {
  return Object.freeze({ status, observations: Object.freeze([]) });
}

function compareDeepWork(left: GoldenScenarioGateKObservation, right: GoldenScenarioGateKObservation): number {
  const byStart = Date.parse(left.existingDeepWorkCommitment.start)
    - Date.parse(right.existingDeepWorkCommitment.start);
  if (byStart !== 0) return byStart;
  return left.existingDeepWorkCommitment.commitmentReference
    .localeCompare(right.existingDeepWorkCommitment.commitmentReference);
}

function gateKObservation(
  conflict: GovernedCalendarConflictObservation,
  invitation: GovernedCalendarConflictEvent,
  existing: GovernedCalendarConflictEvent,
): GoldenScenarioGateKObservation {
  return Object.freeze({
    observedAt: conflict.observedAt,
    addedPendingInvitation: invitation,
    existingDeepWorkCommitment: existing,
    overlapStart: conflict.overlapStart,
    overlapEnd: conflict.overlapEnd,
    overlapMinutes: conflict.overlapMinutes,
  });
}

/**
 * Binds the already-governed structural "added" observation to one exact
 * provider-backed pending invitation and any exact current deep-work overlaps.
 *
 * Scope is deliberately Golden Scenario 001 only:
 * - exactly one added needsAction invitation is supported;
 * - existing counterparts must not themselves be newly added;
 * - all purpose-specific events must come from the same current observation;
 * - no ranking, recommendation, model interpretation, source access or
 *   authority occurs here.
 */
export function bindGoldenScenarioCalendarConflictGateK(input: {
  readonly changes: CalendarAttentionObservationChangeSet;
  readonly currentEvents: readonly GovernedCalendarConflictEvent[];
}): GoldenScenarioGateKResult {
  if (!input.changes || !Array.isArray(input.currentEvents)) return empty("invalid");

  const currentByIdentity = new Map<string, GovernedCalendarConflictEvent>();
  for (const event of input.currentEvents) {
    if (currentByIdentity.has(event.commitmentReference)) return empty("invalid");
    if (event.observedAt !== input.changes.currentObservedAt) return empty("invalid");
    currentByIdentity.set(event.commitmentReference, event);
  }

  const added = input.changes.changes.filter(change => change.type === "added");
  const addedIds = new Set(added.map(change => change.id));
  const pendingInvitations: GovernedCalendarConflictEvent[] = [];

  for (const change of added) {
    const event = currentByIdentity.get(change.id);
    if (!event) return empty("invalid");
    if (change.current.observedAt !== input.changes.currentObservedAt
      || change.current.id !== event.commitmentReference
      || change.current.provenanceReference !== event.provenanceReference) {
      return empty("invalid");
    }
    if (event.selfAttendeeResponse === "needsAction") pendingInvitations.push(event);
  }

  if (pendingInvitations.length === 0) return empty("not_found");
  if (pendingInvitations.length !== 1) return empty("ambiguous_pending_invitation");

  const invitation = pendingInvitations[0];
  const observations: GoldenScenarioGateKObservation[] = [];

  for (const candidate of input.currentEvents) {
    if (candidate.commitmentReference === invitation.commitmentReference) continue;
    if (addedIds.has(candidate.commitmentReference)) continue;
    if (candidate.timeMode !== "deep_work") continue;

    const conflict = observeCalendarConflict({
      first: invitation,
      second: candidate,
      observedAt: input.changes.currentObservedAt,
    });
    if (!conflict) continue;
    observations.push(gateKObservation(conflict, invitation, candidate));
  }

  if (observations.length === 0) return empty("not_found");
  observations.sort(compareDeepWork);
  return Object.freeze({
    status: "matched",
    observations: Object.freeze(observations),
  });
}
