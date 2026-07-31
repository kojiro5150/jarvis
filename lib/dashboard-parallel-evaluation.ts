import type { OperationalState } from "./operational-state";
import type { DashboardCanonicalSource, DashboardPresentation, DashboardPresentationConfiguration } from "./dashboard-presentation";
import { buildDashboardPresentation } from "./dashboard-presentation";

export const DASHBOARD_EVALUATION_REFERENCE_TIME = "2026-07-31T12:00:00Z";
export const DASHBOARD_EVALUATION_CONFIGURATION = Object.freeze({
  locale: "en-AU", viewerTimeZone: "Australia/Melbourne",
  referenceTime: DASHBOARD_EVALUATION_REFERENCE_TIME,
  sourceScope: ["calendar", "email", "drive"] as const,
}) satisfies DashboardPresentationConfiguration;

export type DashboardEvaluationScenario =
  | "empty" | "single-commitment" | "multiple-commitments" | "cancelled-commitment"
  | "bare-date-commitment" | "timed-commitment" | "mixed-connectors" | "relative-duration" | "operational-content";

export type DashboardDifferenceClassification = "Equivalent" | "Intentional Improvement" | "Defect" | "Unsupported Boundary" | "Undocumented Failure Mode";

export interface LegacyDashboardConstruction {
  readonly nextCommitment: OperationalState["calendar"][number] | null;
  readonly followingCommitments: OperationalState["calendar"];
  readonly topProject: OperationalState["projects"][number] | null;
  readonly needsReply: OperationalState["gmailThreads"];
  readonly connectors: OperationalState["connectorStatuses"];
}

export interface DashboardEvaluationRow {
  readonly capability: string;
  readonly observedBehaviour: string;
  readonly governedBehaviour: string;
  readonly classification: DashboardDifferenceClassification;
  readonly supportingEvidence: string;
  readonly governingArtefact?: string;
}

export interface DashboardParallelEvaluationResult {
  readonly evaluationVersion: "sprint-3.60.1-v1";
  readonly scenario: DashboardEvaluationScenario;
  readonly fixtureNotice: "SYNTHETIC_EVALUATION_ARTEFACT_NOT_AUTHENTICATED_OPERATIONAL_EVIDENCE";
  readonly identicalInputEvidence: { readonly operationalState: OperationalState };
  readonly legacy: LegacyDashboardConstruction;
  readonly governed: DashboardPresentation;
  readonly comparison: readonly DashboardEvaluationRow[];
  readonly recommendation: "Ready for Promotion" | "Promotion Blocked";
}

const event = (id: string, title: string, start: string, day: string, time: string, status: "confirmed" | "cancelled" = "confirmed") => ({
  id, title, start, end: start, day, time, source: "google" as const, calendarId: "primary", calendarName: "Evaluation", status,
});

const base = (): OperationalState => ({
  priorities: [], projects: [], signals: [], blockers: [], calendar: [], calendarStatus: "unavailable",
  gmailThreads: [], gmailStatus: "unavailable", driveFiles: [], driveStatus: "unavailable",
  connectorStatuses: [
    { name: "calendar", source: "local", connected: false }, { name: "gmail", source: "local", connected: false },
    { name: "drive", source: "local", connected: false },
  ], updatedAt: DASHBOARD_EVALUATION_REFERENCE_TIME,
});

/** Credential-free fixtures. They are deliberately excluded from authenticated validation. */
export function dashboardEvaluationFixture(scenario: DashboardEvaluationScenario): OperationalState {
  const state = base();
  if (scenario === "single-commitment") state.calendar = [event("one", "Planning", "2026-08-01T00:00:00Z", "SAT", "10:00")];
  if (scenario === "multiple-commitments") state.calendar = [
    event("later", "Later", "2026-08-02T00:00:00Z", "SUN", "10:00"),
    event("b", "Second tie", "2026-08-01T00:00:00Z", "SAT", "10:00"),
    event("a", "First tie", "2026-08-01T00:00:00Z", "SAT", "10:00"),
  ];
  if (scenario === "cancelled-commitment") state.calendar = [
    event("cancelled", "Cancelled", "2026-08-01T00:00:00Z", "SAT", "10:00", "cancelled"),
    event("active", "Active", "2026-08-02T00:00:00Z", "SUN", "10:00"),
  ];
  if (scenario === "bare-date-commitment") state.calendar = [event("all-day", "All day", "2026-08-03", "MON", "All day")];
  if (scenario === "timed-commitment") state.calendar = [event("timed", "Melbourne meeting", "2026-08-01T00:30:00Z", "SAT", "10:30")];
  if (scenario === "mixed-connectors") {
    state.calendarStatus = "online";
    state.connectorStatuses = [
      { name: "calendar", source: "google", connected: true }, { name: "gmail", source: "local", connected: false },
      { name: "drive", source: "google", connected: true },
    ];
  }
  if (scenario === "relative-duration") state.gmailThreads = [{
    id: "message", subject: "Evidence", from: "Operator", snippet: "", receivedAt: "2026-07-31T10:00:00Z",
    unread: false, important: false, needsReply: false, source: "google", sourceLabel: "Evaluation",
  }];
  if (scenario === "operational-content") {
    state.priorities = [{ rank: 1, title: "Ship evidence", detail: "Evaluation only", due: "Today", urgent: true }];
    state.projects = [{ name: "Dashboard", tag: "Active", progress: 60, tagColor: "cyan" }];
    state.gmailThreads = [{ id: "content-message", subject: "Review", from: "Reviewer", snippet: "excluded", receivedAt: "2026-07-31T11:59:00Z", unread: true, important: true, needsReply: true, source: "google", sourceLabel: "Evaluation" }];
  }
  return state;
}

function legacyConstruction(state: OperationalState): LegacyDashboardConstruction {
  const active = state.projects.filter(project => project.progress > 0 && project.progress < 100).sort((a, b) => b.progress - a.progress);
  return {
    nextCommitment: state.calendar[0] ?? null, followingCommitments: state.calendar.slice(1, 3), topProject: active[0] ?? null,
    needsReply: state.gmailThreads.filter(message => message.needsReply), connectors: state.connectorStatuses,
  };
}

function canonicalSource(state: OperationalState): DashboardCanonicalSource {
  const commitments = state.calendar.map(item => ({
    id: item.id, title: item.title, startsAt: item.start, dueAt: item.end,
    status: item.status === "cancelled" ? "cancelled" : "scheduled",
  }));
  const communications = state.gmailThreads.map(item => ({ id: item.id, sender: item.from, subject: item.subject, sentAt: item.receivedAt, receivedAt: item.receivedAt }));
  const status = (connected: boolean) => connected ? "available" as const : "unavailable" as const;
  const sources = state.connectorStatuses.map(item => ({ id: item.name, kind: item.name === "gmail" ? "email" as const : item.name, status: status(item.connected) }));
  return {
    state: { priorities: state.priorities.map((item, index) => ({ id: `priority-${index}`, title: item.title })), projects: state.projects.map((item, index) => ({ id: `project-${index}`, name: item.name })), commitments, communications, sources },
    artifacts: [{ artifact: { entities: { commitments: commitments.map(({ id }) => ({ id })), communications: communications.map(({ id }) => ({ id })) }, provenance: { adapterId: "google-calendar" } } },
      { artifact: { entities: { communications: communications.map(({ id }) => ({ id })) }, provenance: { adapterId: "google.gmail.operational-communication" } } }],
  };
}

const row = (capability: string, observedBehaviour: string, governedBehaviour: string, classification: DashboardDifferenceClassification, supportingEvidence: string, governingArtefact?: string): DashboardEvaluationRow =>
  ({ capability, observedBehaviour, governedBehaviour, classification, supportingEvidence, ...(governingArtefact ? { governingArtefact } : {}) });

/** Behavioural classifications are evidence: they are never supplied by a scenario. */
const behaviouralRow = (capability: string, observedBehaviour: string, governedBehaviour: string, equivalent: boolean, supportingEvidence: string): DashboardEvaluationRow =>
  row(capability, observedBehaviour, governedBehaviour, equivalent ? "Equivalent" : "Defect", supportingEvidence);

const serialise = (value: unknown): string => JSON.stringify(value);

/**
 * Compare independently supplied runtime results. Exported so evaluator tests can introduce a
 * divergent observation without changing either Dashboard implementation.
 */
export function compareDashboardRuntime(
  scenario: DashboardEvaluationScenario,
  operationalState: OperationalState,
  legacy: LegacyDashboardConstruction,
  governed: DashboardPresentation,
): readonly DashboardEvaluationRow[] {
  const comparison: DashboardEvaluationRow[] = [];
  const legacyEligible = operationalState.calendar.filter(item => item.status !== "cancelled")
    .map(item => ({ id: item.id, title: item.title, startsAt: item.start })).sort((a, b) => a.id.localeCompare(b.id));
  const governedEligible = governed.calendar.filter(item => item.status !== "cancelled")
    .map(item => ({ id: item.id, title: item.title, startsAt: item.startsAt })).sort((a, b) => a.id.localeCompare(b.id));
  comparison.push(behaviouralRow("Canonical commitment content", serialise(legacyEligible), serialise(governedEligible),
    serialise(legacyEligible) === serialise(governedEligible), "Runtime comparison of eligible commitment identity, title, and start."));

  if (scenario === "multiple-commitments") {
    const expectedOrder = [...legacyEligible].sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id)).map(item => item.id);
    const governedOrder = governed.calendar.map(item => item.id);
    comparison.push(behaviouralRow("Governed commitment ordering", expectedOrder.join(","), governedOrder.join(","),
      serialise(expectedOrder) === serialise(governedOrder), "Runtime output must implement startsAt ASC, id ASC."));
    comparison.push(row("Commitment ordering", "Connector array order", "startsAt ASC, id ASC", "Intentional Improvement", "Stable ordering is a governed decision.", "Dashboard Presentation Contract — Calendar commitments"));
  }
  if (scenario === "cancelled-commitment") {
    const expectedNext = [...legacyEligible].sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id))[0]?.id ?? "none";
    const governedNext = governed.nextCommitment?.id ?? "none";
    comparison.push(behaviouralRow("Governed next-event eligibility", expectedNext, governedNext, expectedNext === governedNext,
      "Runtime comparison verifies that cancellation exclusion selects the expected commitment."));
    comparison.push(row("Next-event eligibility", "Cancelled item selected at index zero", "Cancelled item retained but excluded", "Intentional Improvement", "Cancellation exclusion is a governed decision.", "Dashboard Presentation Contract — Calendar commitments"));
  }
  if (scenario === "bare-date-commitment" || scenario === "timed-commitment") {
    const observed = serialise({ day: legacy.nextCommitment?.day, time: legacy.nextCommitment?.time });
    const presented = serialise({ day: governed.nextCommitment?.day, time: governed.nextCommitment?.time });
    comparison.push(behaviouralRow("Calendar temporal rendering", observed, presented, observed === presented,
      "Runtime comparison uses the fixture-rendered legacy day and time."));
  }
  if (scenario === "mixed-connectors") {
    const observed = { live: legacy.connectors.filter(item => item.connected).length, total: legacy.connectors.length };
    const presented = { live: governed.connectorSummary.live, total: governed.connectorSummary.total };
    comparison.push(behaviouralRow("Connector availability summary", serialise(observed), serialise(presented),
      serialise(observed) === serialise(presented), "Runtime comparison maps connector availability over the explicit source scope."));
  }
  if (scenario === "relative-duration") {
    const observedAt = operationalState.gmailThreads[0]?.receivedAt;
    const elapsedHours = observedAt ? Math.floor((Date.parse(DASHBOARD_EVALUATION_REFERENCE_TIME) - Date.parse(observedAt)) / 3_600_000) : NaN;
    const expected = Number.isFinite(elapsedHours) ? `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago` : "omitted";
    const presented = governed.communications[0]?.relativeObservedAt ?? "omitted";
    comparison.push(behaviouralRow("Deterministic relative duration", expected, presented, expected === presented,
      "Runtime output is compared with the fixture observation and explicit reference instant."));
    comparison.push(row("Relative duration clock", "Hidden current clock", "Explicit replayable reference instant", "Intentional Improvement", "Explicit time is a governed decision.", "Dashboard Presentation Contract — Communications"));
  }
  if (scenario === "operational-content") {
    const expectedContent = { priorities: operationalState.priorities.map(item => item.title), projects: operationalState.projects.map(item => item.name) };
    const presentedContent = { priorities: governed.priorities.map(item => item.title), projects: governed.projects.map(item => item.name) };
    comparison.push(behaviouralRow("Priority and project content", serialise(expectedContent), serialise(presentedContent),
      serialise(expectedContent) === serialise(presentedContent), "Runtime comparison preserves canonical labels and ordering."));
    const message = operationalState.gmailThreads[0];
    const expectedCommunication = message && { subject: message.subject, sender: message.from, source: message.source };
    const actualCommunication = governed.communications[0] && { subject: governed.communications[0].subject, sender: governed.communications[0].sender, source: governed.communications[0].source };
    comparison.push(behaviouralRow("Communication metadata and provenance", serialise(expectedCommunication), serialise(actualCommunication),
      serialise(expectedCommunication) === serialise(actualCommunication), "Runtime comparison covers subject, sender, and governed provider provenance."));
    comparison.push(row("Dashboard View State separation", "View state coexists with operational data", "View state absent", "Intentional Improvement", "Separation is a governed architecture decision.", "Dashboard Presentation Contract — Dashboard compositions and editing state"));
  }
  comparison.push(row("Deferred and rejected fields", "Legacy shape contains presentation/deferred fields", "Governed output omits them", "Intentional Improvement", "Publication exclusions are governed decisions.", "Governed Dashboard Presentation Contract"));
  return comparison;
}

export function evaluateDashboardScenario(scenario: DashboardEvaluationScenario): DashboardParallelEvaluationResult {
  const operationalState = dashboardEvaluationFixture(scenario);
  const legacy = legacyConstruction(operationalState);
  const governed = buildDashboardPresentation(canonicalSource(operationalState), DASHBOARD_EVALUATION_CONFIGURATION);
  const comparison = [...compareDashboardRuntime(scenario, operationalState, legacy, governed)];
  return {
    evaluationVersion: "sprint-3.60.1-v1", scenario,
    fixtureNotice: "SYNTHETIC_EVALUATION_ARTEFACT_NOT_AUTHENTICATED_OPERATIONAL_EVIDENCE",
    identicalInputEvidence: { operationalState }, legacy, governed, comparison,
    recommendation: comparison.some(item => ["Defect", "Unsupported Boundary", "Undocumented Failure Mode"].includes(item.classification)) ? "Promotion Blocked" : "Ready for Promotion",
  };
}

export const DASHBOARD_EVALUATION_SCENARIOS: readonly DashboardEvaluationScenario[] = ["empty", "single-commitment", "multiple-commitments", "cancelled-commitment", "bare-date-commitment", "timed-commitment", "mixed-connectors", "relative-duration", "operational-content"];
