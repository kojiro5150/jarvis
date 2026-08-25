import {
  acquireGovernedCalendarEvidence,
  type CalendarAcquisitionPort,
} from "../governed-conversation/calendar-evidence-acquisition-adapter";
import type { GovernedCalendarEvidenceInput } from "../governed-conversation/projection-composer";
import type { SourceAdapterResult } from "../governed-conversation/source-adapter-result";
import {
  evaluateCalendarReadAuthority,
  type CalendarReadAuthorityDecision,
  type CalendarReadAuthorityRequest,
} from "./calendar-read-authority";
import {
  resolvePendingAuthorization,
  type PendingAuthorizationResolution,
} from "./pending-authorization";

export interface GovernedCalendarAcquisitionRequest {
  readonly connector: CalendarAcquisitionPort;
  readonly clock: () => Date;
  readonly requestedLimit: number;
  readonly horizonDays: number;
}

export type AuthorizedCalendarAcquisitionResult = Readonly<{
  authority: CalendarReadAuthorityDecision;
  evidence: SourceAdapterResult<GovernedCalendarEvidenceInput> | null;
}>;

/**
 * Applies an already-evaluated authority decision immediately before the
 * existing governed Calendar acquisition seam.
 */
async function acquireCalendarEvidenceForAuthorityDecision(
  authority: CalendarReadAuthorityDecision,
  acquisition: GovernedCalendarAcquisitionRequest,
): Promise<AuthorizedCalendarAcquisitionResult> {
  if (authority.decision !== "ALLOW") {
    return Object.freeze({ authority, evidence: null });
  }

  const evidence = await acquireGovernedCalendarEvidence(acquisition);
  return Object.freeze({ authority, evidence });
}

export type PendingAuthorizedCalendarAcquisitionResult = Readonly<{
  authority: PendingAuthorizationResolution;
  evidence: SourceAdapterResult<GovernedCalendarEvidenceInput> | null;
}>;

/** Resolves trusted pending state and keeps its confirmation evidence attached to acquisition. */
export async function acquirePendingAuthorizedCalendarEvidence(input: {
  readonly currentUserUtterance: string;
  readonly pendingAuthorizationReference?: unknown;
  readonly acquisition: () => GovernedCalendarAcquisitionRequest;
}): Promise<PendingAuthorizedCalendarAcquisitionResult> {
  const authority = resolvePendingAuthorization(input);
  if (authority.decision !== "ALLOW" ||
      authority.proposedOperation?.capability !== "calendar.read") {
    return Object.freeze({ authority, evidence: null });
  }
  const evidence = await acquireGovernedCalendarEvidence(input.acquisition());
  return Object.freeze({ authority, evidence });
}

/** Adjudicates the PR1 calendar.read operation before any acquisition. */
export async function acquireAuthorizedCalendarEvidence(input: {
  readonly authority: CalendarReadAuthorityRequest;
  readonly acquisition: GovernedCalendarAcquisitionRequest;
}): Promise<AuthorizedCalendarAcquisitionResult> {
  return acquireCalendarEvidenceForAuthorityDecision(
    evaluateCalendarReadAuthority(input.authority),
    input.acquisition,
  );
}
