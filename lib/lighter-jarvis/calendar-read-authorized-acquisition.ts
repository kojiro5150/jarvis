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
export async function acquireCalendarEvidenceForAuthorityDecision(
  authority: CalendarReadAuthorityDecision,
  acquisition: GovernedCalendarAcquisitionRequest,
): Promise<AuthorizedCalendarAcquisitionResult> {
  if (authority.decision !== "ALLOW") {
    return Object.freeze({ authority, evidence: null });
  }

  const evidence = await acquireGovernedCalendarEvidence(acquisition);
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
