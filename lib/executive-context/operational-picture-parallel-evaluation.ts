import type { CalendarEvent } from "../connectors/calendar-event";
import type { OperationalState } from "../operational-state";
import {
  CalendarProjectionAdapter,
  SituationalAwarenessEngine,
  createSituationalAwareness,
  createSituationalAwarenessSnapshot,
  type ExecutiveStateSnapshot,
} from "../executive-operating-system/situational-awareness";

export type DifferenceClassification =
  | "Equivalent"
  | "Intentional Improvement"
  | "Defect"
  | "Unsupported Boundary"
  | "Undocumented Failure Mode";

export interface ComparisonEvidence {
  readonly capability: string;
  readonly classification: DifferenceClassification;
  readonly evidence: string;
  readonly adr?: "ADR-0007";
  readonly matchedBoundary?: string;
}

export interface DashboardParallelEvaluation {
  readonly evaluationVersion: "sprint-3.57-v1";
  readonly consumer: "Dashboard";
  readonly authority: "OperationalState";
  readonly observedAt: string;
  readonly identicalInputEvidence: {
    readonly rule: "one-acquisition-one-event-array";
    readonly eventIds: readonly string[];
    readonly legacyEventCount: number;
  };
  readonly legacy: { readonly operationalState: OperationalState };
  readonly canonical: {
    readonly status: "available" | "unavailable";
    readonly executiveStateSnapshot: ExecutiveStateSnapshot | null;
    readonly failure: string | null;
  };
  readonly comparison: readonly ComparisonEvidence[];
  readonly recommendation: "DO_NOT_PROMOTE" | "PROMOTION_EVIDENCE_SUFFICIENT";
}

const identity = { userId: "dashboard-operator", displayName: "Dashboard Operator" } as const;

const boundaries: readonly { pattern: RegExp; reason: string }[] = [
  { pattern: /must be an RFC 3339 timestamp/, reason: "Bare-date all-day event or malformed timestamp" },
  { pattern: /must be a non-empty string/, reason: "Missing required field" },
  { pattern: /source must be google|requires the Google Calendar connector/, reason: "Unsupported source value" },
  { pattern: /status has invalid value/, reason: "Unsupported status value" },
  { pattern: /end must not precede start/, reason: "Reversed temporal range" },
  { pattern: /duplicate calendar event identifier/, reason: "Duplicate canonical identity" },
] as const;

export function classifyProjectionFailure(error: unknown): ComparisonEvidence {
  const message = error instanceof Error ? error.message : String(error);
  const boundary = boundaries.find(({ pattern }) => pattern.test(message));
  return boundary
    ? {
        capability: "Canonical calendar projection",
        classification: "Unsupported Boundary",
        adr: "ADR-0007",
        matchedBoundary: boundary.reason,
        evidence: `Fail-closed projection observed: ${message}`,
      }
    : {
        capability: "Canonical calendar projection",
        classification: "Undocumented Failure Mode",
        evidence: `Projection failed without an ADR-0007 rejection match: ${message}`,
      };
}

function compareCalendar(events: readonly CalendarEvent[], snapshot: ExecutiveStateSnapshot): readonly ComparisonEvidence[] {
  const commitments = snapshot.state.commitments;
  const byCanonicalId = new Map(commitments.map((commitment) => [commitment.id, commitment]));
  const semanticMatches = events.every((event) => {
    const commitment = byCanonicalId.get(`google-calendar:${encodeURIComponent(event.calendarId)}:${encodeURIComponent(event.id)}`);
    return commitment?.title === event.title && commitment.startsAt === event.start && commitment.dueAt === event.end
      && commitment.status === (event.status === "cancelled" ? "cancelled" : "scheduled");
  });
  return [
    {
      capability: "Calendar event coverage and semantics",
      classification: semanticMatches && commitments.length === events.length ? "Equivalent" : "Defect",
      evidence: `${events.length} legacy events and ${commitments.length} canonical commitments; title, range, and status ${semanticMatches ? "match" : "do not match"}.`,
    },
    {
      capability: "Stable event identity and ordering",
      classification: "Intentional Improvement",
      evidence: "Canonical commitments qualify provider IDs with calendar identity and sort by canonical ID, as documented by ADR-0007.",
      adr: "ADR-0007",
    },
    {
      capability: "Dashboard presentation metadata",
      classification: "Defect",
      evidence: "ExecutiveStateSnapshot commitments do not carry the legacy day, time, calendarName, calendarColor, or source labels required by the current Dashboard.",
    },
  ];
}

/**
 * Observes the Dashboard replacement boundary without changing authority.
 * The supplied OperationalState is acquired once; its exact calendar array is
 * handed to both the legacy response and the canonical adapter.
 */
export async function evaluateDashboardOperationalPicture(
  operationalState: OperationalState,
  observedAt: string,
): Promise<DashboardParallelEvaluation> {
  const events = operationalState.calendar;
  let snapshot: ExecutiveStateSnapshot | null = null;
  let failure: string | null = null;
  let comparison: readonly ComparisonEvidence[];

  try {
    const adapter = new CalendarProjectionAdapter({
      identity,
      observedAt,
      connector: {
        source: events.some(({ source }) => source !== "google") ? "local" : "google",
        listUpcoming: async () => events,
      },
      limit: events.length,
    });
    const artifact = await adapter.project();
    const emptyState = createSituationalAwareness({ identity });
    const previous = createSituationalAwarenessSnapshot({
      snapshotId: `dashboard-evaluation-previous:${observedAt}`,
      observedAt,
      state: emptyState,
    });
    const assembled = new SituationalAwarenessEngine().assemble({
      artifacts: [artifact],
      previousSnapshot: previous,
      snapshotId: `dashboard-evaluation:${observedAt}`,
      observedAt,
    });
    if (assembled.outcome === "failure") throw new Error(`${assembled.code}: ${assembled.message}`);
    snapshot = assembled.snapshot;
    comparison = compareCalendar(events, snapshot);
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
    comparison = [classifyProjectionFailure(error), {
      capability: "Dashboard availability when canonical projection fails",
      classification: "Equivalent",
      evidence: "OperationalState remains the response authority; canonical unavailability has no user-visible Dashboard impact, while operators must investigate the recorded failure.",
    }];
  }

  return {
    evaluationVersion: "sprint-3.57-v1",
    consumer: "Dashboard",
    authority: "OperationalState",
    observedAt,
    identicalInputEvidence: {
      rule: "one-acquisition-one-event-array",
      eventIds: events.map(({ id }) => id),
      legacyEventCount: events.length,
    },
    legacy: { operationalState },
    canonical: { status: snapshot ? "available" : "unavailable", executiveStateSnapshot: snapshot, failure },
    comparison,
    recommendation: comparison.every(({ classification }) => classification === "Equivalent" || classification === "Intentional Improvement")
      ? "PROMOTION_EVIDENCE_SUFFICIENT"
      : "DO_NOT_PROMOTE",
  };
}
