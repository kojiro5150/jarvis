import { getCalendarConnector } from "../connectors/calendar";
import type {
  ScopedCalendarAcquisitionPort,
  ScopedCalendarEvidenceResult,
} from "../governed-conversation/scoped-calendar-evidence-acquisition-adapter";
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
import { composeProductionMorningExecutiveOrientation } from "./production-morning-executive-orientation";
import type { MorningExecutiveOrientationBrief } from "../governed-conversation/morning-executive-orientation-contract";

export interface ProductionCalendarDependencies {
  readonly createConnector: () => ScopedCalendarAcquisitionPort;
  readonly clock: () => Date;
}

export type ProductionCalendarReadResult = Readonly<{
  handled: boolean;
  decision: "ALLOW" | "ASK" | "DENY" | null;
  reason: string | null;
  evidence: ScopedCalendarEvidenceResult | null;
  pendingAuthorizationReference: PendingAuthorizationReference | null;
  authorityEvidence: readonly unknown[];
  window: import("./calendar-read-window").CalendarReadWindow | null;
  purpose: "calendar_attention" | "calendar_weekly_allocation" | "calendar_factual_query" | "calendar_morning_brief" | "calendar_advise" | "calendar_act_validation" | null;
  factualQuery: import("./calendar-factual-query").CalendarFactualQuery | null;
  morningBriefTodayWindow: import("./calendar-read-window").CalendarReadWindow | null;
  morningBrief: MorningExecutiveOrientationBrief | null;
}>;

const CALENDAR_DEFAULT_REQUESTED_LIMIT = 5;
const CALENDAR_WEEKLY_ALLOCATION_REQUESTED_LIMIT = 100;
const CALENDAR_MORNING_BRIEF_REQUESTED_LIMIT = 100;
const CALENDAR_FACTUAL_QUERY_REQUESTED_LIMIT = 100;
const CALENDAR_ADVISE_REQUESTED_LIMIT = 100;
const CALENDAR_ACT_VALIDATION_REQUESTED_LIMIT = 100;

function requestedLimitFor(operation: import("./calendar-read-authority").ProposedCalendarReadOperation): number {
  if (operation.purpose === "calendar_weekly_allocation") return CALENDAR_WEEKLY_ALLOCATION_REQUESTED_LIMIT;
  if (operation.purpose === "calendar_morning_brief") return CALENDAR_MORNING_BRIEF_REQUESTED_LIMIT;
  if (operation.purpose === "calendar_factual_query") return CALENDAR_FACTUAL_QUERY_REQUESTED_LIMIT;
  if (operation.purpose === "calendar_advise") return CALENDAR_ADVISE_REQUESTED_LIMIT;
  if (operation.purpose === "calendar_act_validation") return CALENDAR_ACT_VALIDATION_REQUESTED_LIMIT;
  return CALENDAR_DEFAULT_REQUESTED_LIMIT;
}

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
  readonly interpretedFactualQuery?: import("./calendar-factual-query").CalendarFactualQuery | null;
}, dependencies: ProductionCalendarDependencies = defaults): Promise<ProductionCalendarReadResult> {
  const hasTransportReference = input.pendingAuthorizationReference !== undefined;

  if (hasTransportReference) {
    const acquired = await acquirePendingAuthorizedCalendarEvidence({
      ...input,
      acquisition: (operation) => ({ connector: dependencies.createConnector(), clock: dependencies.clock,
        requestedLimit: requestedLimitFor(operation), horizonDays: 7, window: operation.window }),
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
        purpose: operation?.purpose ?? null,
        factualQuery: operation?.factualQuery ?? null,
        morningBriefTodayWindow: operation?.morningBriefTodayWindow ?? null,
        morningBrief: null,
      });
    }

    const evidence = acquired.evidence as ScopedCalendarEvidenceResult | null;
    const morningBrief = operation.purpose === "calendar_morning_brief" && operation.morningBriefTodayWindow && evidence
      ? composeProductionMorningExecutiveOrientation({ evidence, weeklyWindow: operation.window, todayWindow: operation.morningBriefTodayWindow })
      : null;
    return Object.freeze({ handled: true, decision: "ALLOW", reason: resolution.reason,
      evidence, pendingAuthorizationReference: null,
      authorityEvidence: resolution.authorityEvidence, window: operation.window,
      purpose: operation.purpose ?? null, factualQuery: operation.factualQuery ?? null,
      morningBriefTodayWindow: operation.morningBriefTodayWindow ?? null, morningBrief });
  }

  const proposedOperation = proposeCalendarRead(input.currentUserUtterance, dependencies.clock, input.interpretedFactualQuery);
  if (proposedOperation === null) {
    return Object.freeze({ handled: false, decision: null, reason: null, evidence: null,
      pendingAuthorizationReference: null, authorityEvidence: Object.freeze([]), window: null, purpose: null, factualQuery: null,
      morningBriefTodayWindow: null, morningBrief: null });
  }

  const authority = evaluateCalendarReadAuthority({
    proposedOperation,
    currentUserUtterance: input.currentUserUtterance,
  });
  if (authority.decision === "ALLOW") {
    const acquired = await acquireAuthorizedCalendarEvidence({
      authority: { proposedOperation, currentUserUtterance: input.currentUserUtterance },
      acquisition: { connector: dependencies.createConnector(), clock: dependencies.clock,
        requestedLimit: requestedLimitFor(proposedOperation), horizonDays: 7, window: proposedOperation.window },
    });
    const evidence = acquired.evidence as ScopedCalendarEvidenceResult | null;
    const morningBrief = proposedOperation.purpose === "calendar_morning_brief" && proposedOperation.morningBriefTodayWindow && evidence
      ? composeProductionMorningExecutiveOrientation({ evidence, weeklyWindow: proposedOperation.window, todayWindow: proposedOperation.morningBriefTodayWindow })
      : null;
    return Object.freeze({ handled: true, decision: "ALLOW", reason: acquired.authority.reason,
      evidence, pendingAuthorizationReference: null,
      authorityEvidence: acquired.authority.authorityEvidence, window: proposedOperation.window,
      purpose: proposedOperation.purpose ?? null, factualQuery: proposedOperation.factualQuery ?? null,
      morningBriefTodayWindow: proposedOperation.morningBriefTodayWindow ?? null, morningBrief });
  }
  return Object.freeze({ handled: true, decision: "ASK", reason: authority.reason,
    evidence: null, pendingAuthorizationReference: createPendingAuthorization(proposedOperation),
    authorityEvidence: authority.authorityEvidence, window: proposedOperation.window,
    purpose: proposedOperation.purpose ?? null, factualQuery: proposedOperation.factualQuery ?? null,
    morningBriefTodayWindow: proposedOperation.morningBriefTodayWindow ?? null, morningBrief: null });
}
