import { getCalendarConnector } from "../connectors/calendar";
import type { CalendarAcquisitionPort } from "../governed-conversation/calendar-evidence-acquisition-adapter";
import type { GovernedCalendarEvidenceInput } from "../governed-conversation/projection-composer";
import type { SourceAdapterResult } from "../governed-conversation/source-adapter-result";
import {
  acquireAuthorizedCalendarEvidence,
  acquirePendingAuthorizedCalendarEvidence,
} from "./calendar-read-authorized-acquisition";
import { evaluateCalendarReadAuthority } from "./calendar-read-authority";
import {
  createPendingAuthorization,
  type PendingAuthorizationReference,
} from "./pending-authorization";
import { proposeCalendarRead } from "./calendar-read-proposal";

const STANDALONE_CONFIRMATION_OR_DECLINE = /^(?:yes|yes,?\s+please|confirm|confirmed|proceed|go\s+ahead|no|no,?\s+thanks|decline|cancel|never\s+mind)[.!]?$/i;

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
  authorityEvidence: readonly unknown[];
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
    const acquired = await acquirePendingAuthorizedCalendarEvidence({
      ...input,
      acquisition: () => ({ connector: dependencies.createConnector(), clock: dependencies.clock,
        requestedLimit: 5, horizonDays: 7 }),
    });
    const resolution = acquired.authority;
    if (resolution.decision !== "ALLOW") {
      return Object.freeze({
        handled: true,
        decision: resolution.decision,
        reason: resolution.reason,
        evidence: null,
        pendingAuthorizationReference: resolution.pendingAuthorizationReference,
        authorityEvidence: resolution.authorityEvidence,
      });
    }

    return Object.freeze({ handled: true, decision: "ALLOW", reason: resolution.reason,
      evidence: acquired.evidence, pendingAuthorizationReference: null,
      authorityEvidence: resolution.authorityEvidence });
  }

  const proposedOperation = proposeCalendarRead(input.currentUserUtterance);
  if (proposedOperation === null) {
    return Object.freeze({ handled: false, decision: null, reason: null, evidence: null,
      pendingAuthorizationReference: null, authorityEvidence: Object.freeze([]) });
  }

  const authority = evaluateCalendarReadAuthority({
    proposedOperation,
    currentUserUtterance: input.currentUserUtterance,
  });
  if (authority.decision === "ALLOW") {
    const acquired = await acquireAuthorizedCalendarEvidence({
      authority: { proposedOperation, currentUserUtterance: input.currentUserUtterance },
      acquisition: { connector: dependencies.createConnector(), clock: dependencies.clock,
        requestedLimit: 5, horizonDays: 7 },
    });
    return Object.freeze({ handled: true, decision: "ALLOW", reason: acquired.authority.reason,
      evidence: acquired.evidence, pendingAuthorizationReference: null,
      authorityEvidence: acquired.authority.authorityEvidence });
  }
  return Object.freeze({ handled: true, decision: "ASK", reason: authority.reason,
    evidence: null, pendingAuthorizationReference: createPendingAuthorization(proposedOperation),
    authorityEvidence: authority.authorityEvidence });
}
