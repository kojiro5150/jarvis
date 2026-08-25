import { getCalendarConnector } from "../connectors/calendar";
import type { ScopedCalendarAcquisitionPort } from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
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

export interface ProductionCalendarDependencies {
  readonly createConnector: () => ScopedCalendarAcquisitionPort;
  readonly clock: () => Date;
}

export type ProductionCalendarReadResult = Readonly<{
  handled: boolean;
  decision: "ALLOW" | "ASK" | "DENY" | null;
  reason: string | null;
  evidence: SourceAdapterResult<GovernedCalendarEvidenceInput> | null;
  pendingAuthorizationReference: PendingAuthorizationReference | null;
  authorityEvidence: readonly unknown[];
  window: import("./calendar-read-window").CalendarReadWindow | null;
}>;

const defaults: ProductionCalendarDependencies = {
  createConnector: () => getCalendarConnector() as unknown as ScopedCalendarAcquisitionPort,
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

  if (hasTransportReference) {
    const acquired = await acquirePendingAuthorizedCalendarEvidence({
      ...input,
      acquisition: (operation) => ({ connector: dependencies.createConnector(), clock: dependencies.clock,
        requestedLimit: 5, horizonDays: 7, window: operation.window }),
    });
    const resolution = acquired.authority;
    const operation = resolution.proposedOperation?.capability === "calendar.read" ? resolution.proposedOperation : null;
    if (resolution.decision !== "ALLOW" || operation === null) {
      return Object.freeze({
        handled: true,
        decision: operation === null && resolution.decision === "ALLOW" ? "ASK" : resolution.decision,
        reason: resolution.reason,
        evidence: null,
        pendingAuthorizationReference: resolution.pendingAuthorizationReference,
        authorityEvidence: resolution.authorityEvidence,
        window: operation?.window ?? null,
      });
    }

    return Object.freeze({ handled: true, decision: "ALLOW", reason: resolution.reason,
      evidence: acquired.evidence, pendingAuthorizationReference: null,
      authorityEvidence: resolution.authorityEvidence, window: operation.window });
  }

  const proposedOperation = proposeCalendarRead(input.currentUserUtterance, dependencies.clock);
  if (proposedOperation === null) {
    return Object.freeze({ handled: false, decision: null, reason: null, evidence: null,
      pendingAuthorizationReference: null, authorityEvidence: Object.freeze([]), window: null });
  }

  const authority = evaluateCalendarReadAuthority({
    proposedOperation,
    currentUserUtterance: input.currentUserUtterance,
  });
  if (authority.decision === "ALLOW") {
    const acquired = await acquireAuthorizedCalendarEvidence({
      authority: { proposedOperation, currentUserUtterance: input.currentUserUtterance },
      acquisition: { connector: dependencies.createConnector(), clock: dependencies.clock,
        requestedLimit: 5, horizonDays: 7, window: proposedOperation.window },
    });
    return Object.freeze({ handled: true, decision: "ALLOW", reason: acquired.authority.reason,
      evidence: acquired.evidence, pendingAuthorizationReference: null,
      authorityEvidence: acquired.authority.authorityEvidence, window: proposedOperation.window });
  }
  return Object.freeze({ handled: true, decision: "ASK", reason: authority.reason,
    evidence: null, pendingAuthorizationReference: createPendingAuthorization(proposedOperation),
    authorityEvidence: authority.authorityEvidence, window: proposedOperation.window });
}
