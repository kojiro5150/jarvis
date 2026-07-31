import { getOpeningBrief } from "./briefing";
import {
  buildDawnwatchPresentation,
  getTomorrowAfternoonStatus,
  type DawnwatchCapabilityStatus,
  type DawnwatchPresentation,
  type DawnwatchPresentationInput,
} from "./dawnwatch-presentation";
import type { OperationalState } from "./operational-state";

export const DAWNWATCH_EVALUATION_REFERENCE_TIME = "2026-07-31T12:00:00Z";
export const DAWNWATCH_EVALUATION_LOCALE = "en-AU" as const;
export const DAWNWATCH_EVALUATION_TIME_ZONE = "Australia/Melbourne" as const;

export type DawnwatchEvaluationScenario =
  | "shared-priority-observation"
  | "empty-evidence"
  | "unavailable-evidence"
  | "tomorrow-afternoon";

export type DawnwatchBehaviouralClassification =
  | "Equivalent"
  | "Intentional Improvement"
  | "Defect"
  | "Unsupported Boundary"
  | "Undocumented Failure Mode";

export interface DawnwatchRuntimeEvidence {
  readonly capability: string;
  readonly legacyOutput: string;
  readonly governedOutput?: DawnwatchPresentation;
  readonly governedCapability?: DawnwatchCapabilityStatus;
  /** Comparable facts extracted from the two runtime results, never fixture expectations. */
  readonly legacyComparable: unknown;
  readonly governedComparable: unknown;
  readonly legacyContext?: string;
  readonly failure?: string;
}

export interface DawnwatchComparisonEvidence {
  readonly classification: DawnwatchBehaviouralClassification;
  readonly capability: string;
  readonly legacyRuntimeOutput: string;
  readonly governedRuntimeOutput: unknown;
  readonly comparison: { readonly legacy: unknown; readonly governed: unknown; readonly equal: boolean };
  readonly rationale: string;
  readonly governingSection?: string;
  readonly legacyContext?: string;
}

export interface DawnwatchEvaluationResult {
  readonly evaluationVersion: "sprint-3.66-v1";
  readonly fixtureNotice: "SYNTHETIC_EVALUATION_ARTEFACT_NOT_AUTHENTICATED_OPERATIONAL_EVIDENCE";
  readonly scenario: DawnwatchEvaluationScenario;
  readonly context: {
    readonly referenceTime: typeof DAWNWATCH_EVALUATION_REFERENCE_TIME;
    readonly locale: typeof DAWNWATCH_EVALUATION_LOCALE;
    readonly viewerTimeZone: typeof DAWNWATCH_EVALUATION_TIME_ZONE;
  };
  readonly input: OperationalState;
  readonly evidence: DawnwatchComparisonEvidence;
}

const serialise = (value: unknown): string => JSON.stringify(value);

/**
 * Comparison engine. It accepts already-executed runtime results and knows nothing about fixture
 * construction, routing, or either presentation implementation.
 */
export function compareDawnwatchRuntime(runtime: DawnwatchRuntimeEvidence): DawnwatchComparisonEvidence {
  const equal = serialise(runtime.legacyComparable) === serialise(runtime.governedComparable);
  const governedRuntimeOutput = runtime.governedOutput ?? runtime.governedCapability ?? runtime.failure;
  const base = {
    capability: runtime.capability,
    legacyRuntimeOutput: runtime.legacyOutput,
    governedRuntimeOutput,
    comparison: { legacy: runtime.legacyComparable, governed: runtime.governedComparable, equal },
    ...(runtime.legacyContext ? { legacyContext: runtime.legacyContext } : {}),
  };

  if (runtime.failure || governedRuntimeOutput === undefined) {
    return { ...base, classification: "Undocumented Failure Mode", rationale: "A runtime failed to produce a comparable governed result." };
  }
  if (equal) {
    return { ...base, classification: "Equivalent", rationale: "The independently collected runtime values are structurally equal." };
  }

  const boundary = runtime.governedCapability;
  if (boundary?.status === "unsupported" && boundary.availability === "pending_governance") {
    return {
      ...base,
      classification: "Unsupported Boundary",
      rationale: "The governed runtime explicitly refused a capability whose governance availability is pending.",
      governingSection: "Sprint 3.64 — Tomorrow Afternoon Rule (Outcome: Deferred; no architectural class authorised)",
    };
  }

  const governed = runtime.governedOutput;
  const legacyMakesProhibitedNegativeClaim = /Nothing urgent\.|Communications clear\.|No scheduled commitment currently in view\./.test(runtime.legacyOutput);
  const governedPreservesEvidenceStatus = governed
    ? [governed.priorities.status, governed.commitments.status, governed.communications.status]
      .some(status => status === "insufficient_coverage" || status === "unavailable")
    : false;
  const comparisonRecordsEvidenceStatus = typeof runtime.governedComparable === "object"
    && runtime.governedComparable !== null && "evidenceStatuses" in runtime.governedComparable;
  if (legacyMakesProhibitedNegativeClaim && governedPreservesEvidenceStatus && comparisonRecordsEvidenceStatus) {
    return {
      ...base,
      classification: "Intentional Improvement",
      rationale: "Runtime output replaces an unqualified legacy negative claim with an explicit evidence status.",
      governingSection: "Sprint 3.64 — Evidence Sufficiency Rules and Unavailable Evidence Behaviour",
    };
  }

  return { ...base, classification: "Defect", rationale: "Comparable runtime behaviour diverged without an authorised governed boundary or improvement." };
}

const configuration = {
  viewerTimeZone: DAWNWATCH_EVALUATION_TIME_ZONE,
  locale: DAWNWATCH_EVALUATION_LOCALE,
  referenceTime: DAWNWATCH_EVALUATION_REFERENCE_TIME,
  sourceScope: ["canonical"],
  identityTieBreakRule: "canonical_identity_ascending",
} as const;

const source = {
  id: "canonical", kind: "operational", availability: "available", observedAt: "2026-07-31T11:00:00Z",
  snapshotId: "evaluation-snapshot", provenance: { sourceId: "canonical", assertionId: "source-evaluation" },
} as const;

const emptyState = (): OperationalState => ({
  priorities: [], projects: [], signals: [], blockers: [], calendar: [], calendarStatus: "online",
  gmailThreads: [], gmailStatus: "online", driveFiles: [], driveStatus: "online",
  connectorStatuses: [
    { name: "calendar", source: "local", connected: true },
    { name: "gmail", source: "local", connected: true },
    { name: "drive", source: "local", connected: true },
  ],
  updatedAt: DAWNWATCH_EVALUATION_REFERENCE_TIME,
});

/** Scenario runner fixture construction. Every environment-sensitive input is explicit. */
export function dawnwatchEvaluationFixture(scenario: DawnwatchEvaluationScenario): OperationalState {
  const state = emptyState();
  if (scenario === "shared-priority-observation") {
    state.priorities = [{ rank: 1, title: "Publish evaluation", detail: "Synthetic fixture", due: "Today", urgent: false }];
  }
  if (scenario === "unavailable-evidence") {
    state.calendarStatus = "unavailable";
    state.gmailStatus = "unavailable";
  }
  if (scenario === "tomorrow-afternoon") {
    state.calendar = [{
      id: "morning", title: "Morning review", start: "2026-08-01T00:00:00Z", end: "2026-08-01T01:00:00Z",
      day: "SAT", time: "10:00", source: "google", calendarId: "primary", calendarName: "Evaluation", status: "confirmed",
    }];
  }
  return state;
}

function governedInput(state: OperationalState, scenario: DawnwatchEvaluationScenario): DawnwatchPresentationInput {
  const unavailable = scenario === "unavailable-evidence";
  return {
    priorities: state.priorities.map((item, index) => ({ id: `priority-${index}`, title: item.title, provenance: { sourceId: "canonical", assertionId: `priority-${index}` } })),
    commitments: state.calendar.map(item => ({ id: item.id, title: item.title, start: item.start, end: item.end,
      status: item.status === "cancelled" ? "cancelled" : "scheduled", provenance: { sourceId: "canonical", assertionId: `commitment-${item.id}` } })),
    communications: state.gmailThreads.map(item => ({ id: item.id, sender: item.from, recipients: ["evaluation"], sentAt: item.receivedAt,
      subject: item.subject, provenance: { sourceId: "canonical", assertionId: `communication-${item.id}` } })),
    sources: [{ ...source, availability: unavailable ? "unavailable" : "available" }],
  };
}

/** Scenario runner. It executes and collects; all classification remains in the comparison engine. */
export function runDawnwatchScenario(scenario: DawnwatchEvaluationScenario): DawnwatchRuntimeEvidence & { readonly input: OperationalState } {
  const input = dawnwatchEvaluationFixture(scenario);
  const legacyOutput = getOpeningBrief("dawnwatch", input);
  if (scenario === "tomorrow-afternoon") {
    const governedCapability = getTomorrowAfternoonStatus();
    return {
      input, capability: "Do I have anything tomorrow afternoon?", legacyOutput, governedCapability,
      legacyComparable: /tomorrow afternoon/i.test(legacyOutput) ? legacyOutput : null,
      governedComparable: governedCapability,
      legacyContext: "Sprint 3.63 records index-zero calendar selection as incomplete and potentially correct only by coincidence; it is not a semantic temporal-window answer.",
    };
  }
  const governedOutput = buildDawnwatchPresentation(governedInput(input, scenario), configuration);
  const evidenceScenario = scenario === "empty-evidence" || scenario === "unavailable-evidence";
  const legacyComparable = evidenceScenario
    ? { negativeClaims: legacyOutput.match(/Nothing urgent\.|Communications clear\.|No scheduled commitment currently in view\./g) ?? [] }
    : input.priorities.filter(item => legacyOutput.includes(item.title)).map(item => item.title);
  const governedComparable = evidenceScenario
    ? { evidenceStatuses: [governedOutput.priorities.status, governedOutput.commitments.status, governedOutput.communications.status] }
    : governedOutput.priorities.observations.map(item => item.title);
  return { input, capability: "briefing presentation", legacyOutput, governedOutput, legacyComparable, governedComparable,
    ...(scenario === "empty-evidence" || scenario === "unavailable-evidence" ? {
      legacyContext: "Sprint 3.63 identifies legacy empty-state and clear/absence wording as non-semantic because array silence does not establish coverage.",
    } : {}),
  };
}

export function evaluateDawnwatchScenario(scenario: DawnwatchEvaluationScenario): DawnwatchEvaluationResult {
  const { input, ...runtime } = runDawnwatchScenario(scenario);
  return {
    evaluationVersion: "sprint-3.66-v1",
    fixtureNotice: "SYNTHETIC_EVALUATION_ARTEFACT_NOT_AUTHENTICATED_OPERATIONAL_EVIDENCE",
    scenario,
    context: { referenceTime: DAWNWATCH_EVALUATION_REFERENCE_TIME, locale: DAWNWATCH_EVALUATION_LOCALE, viewerTimeZone: DAWNWATCH_EVALUATION_TIME_ZONE },
    input,
    evidence: compareDawnwatchRuntime(runtime),
  };
}

export const DAWNWATCH_EVALUATION_SCENARIOS: readonly DawnwatchEvaluationScenario[] = [
  "shared-priority-observation", "empty-evidence", "unavailable-evidence", "tomorrow-afternoon",
];
