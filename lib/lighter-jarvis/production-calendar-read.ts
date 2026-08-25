import { getCalendarConnector } from "../connectors/calendar";
import type { CalendarAcquisitionPort } from "../governed-conversation/calendar-evidence-acquisition-adapter";
import type { GovernedCalendarEvidenceInput } from "../governed-conversation/projection-composer";
import type { SourceAdapterResult } from "../governed-conversation/source-adapter-result";
import { acquireCalendarEvidenceForAuthorityDecision } from "./calendar-read-authorized-acquisition";
import {
  CALENDAR_READ_CAPABILITY,
  evaluateCalendarReadAuthority,
  type CalendarReadAuthorityDecision,
} from "./calendar-read-authority";
import {
  createPendingAuthorization,
  resolvePendingAuthorization,
  type PendingAuthorizationReference,
} from "./pending-authorization";

const CALENDAR_REFERENCE = /\b(?:my\s+)?calendars?\b/i;
const STANDALONE_CONFIRMATION_OR_DECLINE = /^(?:yes|yes,?\s+please|confirm|confirmed|proceed|go\s+ahead|no|no,?\s+thanks|decline|cancel|never\s+mind)[.!]?$/i;
const PROPOSED_CALENDAR_READ = Object.freeze({ capability: CALENDAR_READ_CAPABILITY });

export interface ProductionCalendarDependencies {
  readonly createConnector: () => CalendarAcquisitionPort;
  readonly clock: () => Date;
}

export type ProductionCalendarReadResult = Readonly<{
  handled: boolean;
  decision: "ALLOW" | "ASK" | "DENY" | null;
  reason: string | null;
  evidence: SourceAdapterResult<GovernedCalendarEvidenceInput> | null;
  pendingAuthorizationReference: PendingAuthorizationReference | null;
}>;

const defaults: ProductionCalendarDependencies = {
  createConnector: getCalendarConnector,
  clock: () => new Date(),
};

/**
 * Resolves the only live authority slice before conversational model work.
 * Acquisition bounds are production policy, not caller-controlled operation scope.
 */
export async function resolveProductionCalendarRead(input: {
  readonly currentUserUtterance: string;
  readonly pendingAuthorizationReference?: unknown;
}, dependencies: ProductionCalendarDependencies = defaults): Promise<ProductionCalendarReadResult> {
  const hasTransportReference = input.pendingAuthorizationReference !== undefined;
  const isBareResolution = STANDALONE_CONFIRMATION_OR_DECLINE.test(input.currentUserUtterance.trim());

  if (hasTransportReference || isBareResolution) {
    const resolution = resolvePendingAuthorization(input);
    if (resolution.decision !== "ALLOW" || resolution.proposedOperation === null) {
      return Object.freeze({
        handled: true,
        decision: resolution.decision,
        reason: resolution.reason,
        evidence: null,
        pendingAuthorizationReference: resolution.pendingAuthorizationReference,
      });
    }

    const authority: CalendarReadAuthorityDecision = Object.freeze({
      capability: CALENDAR_READ_CAPABILITY,
      decision: "ALLOW",
      reason: "explicit_calendar_read",
      readOnly: true,
      authorityEvidence: Object.freeze([]),
    });
    const acquired = await acquireCalendarEvidenceForAuthorityDecision(authority, {
      connector: dependencies.createConnector(), clock: dependencies.clock,
      requestedLimit: 5, horizonDays: 7,
    });
    return Object.freeze({ handled: true, decision: "ALLOW", reason: resolution.reason,
      evidence: acquired.evidence, pendingAuthorizationReference: null });
  }

  if (!CALENDAR_REFERENCE.test(input.currentUserUtterance)) {
    return Object.freeze({ handled: false, decision: null, reason: null, evidence: null,
      pendingAuthorizationReference: null });
  }

  const authority = evaluateCalendarReadAuthority({
    proposedOperation: PROPOSED_CALENDAR_READ,
    currentUserUtterance: input.currentUserUtterance,
  });
  if (authority.decision === "ALLOW") {
    const acquired = await acquireCalendarEvidenceForAuthorityDecision(authority, {
      connector: dependencies.createConnector(), clock: dependencies.clock,
      requestedLimit: 5, horizonDays: 7,
    });
    return Object.freeze({ handled: true, decision: "ALLOW", reason: acquired.authority.reason,
      evidence: acquired.evidence, pendingAuthorizationReference: null });
  }
  return Object.freeze({ handled: true, decision: "ASK", reason: authority.reason,
    evidence: null, pendingAuthorizationReference: createPendingAuthorization(PROPOSED_CALENDAR_READ) });
}
