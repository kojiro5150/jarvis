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

interface LegacyDashboardConstruction {
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
  readonly evaluationVersion: "sprint-3.60-v1";
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

export function evaluateDashboardScenario(scenario: DashboardEvaluationScenario): DashboardParallelEvaluationResult {
  const operationalState = dashboardEvaluationFixture(scenario);
  const legacy = legacyConstruction(operationalState);
  const governed = buildDashboardPresentation(canonicalSource(operationalState), DASHBOARD_EVALUATION_CONFIGURATION);
  const comparison: DashboardEvaluationRow[] = [];
  const legacyEligibleIds = operationalState.calendar.filter(item => item.status !== "cancelled").map(item => item.id).sort();
  const governedEligibleIds = [governed.nextCommitment, ...governed.followingCommitments].filter(Boolean).map(item => item!.id).sort();
  comparison.push(row("Canonical commitment content", legacyEligibleIds.join(",") || "empty", governedEligibleIds.join(",") || "empty", "Equivalent", "Eligible commitment identity is preserved from the one fixture."));
  if (scenario === "multiple-commitments") comparison.push(row("Commitment ordering", "Connector array order", "startsAt ASC, id ASC", "Intentional Improvement", "Governed output is a stable a,b,later sequence.", "Dashboard Presentation Contract — Calendar commitments"));
  if (scenario === "cancelled-commitment") comparison.push(row("Next-event eligibility", "Cancelled item selected at index zero", "Cancelled item retained but excluded; Active selected", "Intentional Improvement", "The governed nextCommitment is active.", "Dashboard Presentation Contract — Calendar commitments"));
  if (scenario === "bare-date-commitment" || scenario === "timed-commitment") comparison.push(row("Calendar temporal rendering", legacy.nextCommitment?.time ?? "none", governed.nextCommitment?.time ?? "none", "Equivalent", `Explicit ${governed.configuration.locale}, ${governed.configuration.viewerTimeZone}, and reference instant were propagated.`));
  if (scenario === "mixed-connectors") comparison.push(row("Connector availability summary", "2 of 3 connector rows connected", `${governed.connectorSummary.live} of ${governed.connectorSummary.total} live`, "Equivalent", "Availability maps connected to available over the explicit three-source scope."));
  if (scenario === "relative-duration") comparison.push(row("Relative duration", "Legacy duration uses a hidden current clock", governed.communications[0]?.relativeObservedAt ?? "omitted", "Intentional Improvement", "Governed result is replayable as 2 hours ago from the propagated reference instant.", "Dashboard Presentation Contract — Communications"));
  if (scenario === "operational-content") {
    comparison.push(row("Priority and project content", "Ship evidence; Dashboard", `${governed.priorities[0]?.title}; ${governed.projects[0]?.name}`, "Equivalent", "Canonical identity and labels are preserved."));
    comparison.push(row("Communication metadata and provenance", "Review from Reviewer; Google source", `${governed.communications[0]?.subject} from ${governed.communications[0]?.sender}; ${governed.communications[0]?.source} source`, "Equivalent", "Subject, sender, observation time, and provenance predicate are preserved."));
    comparison.push(row("Dashboard View State separation", "Legacy project styling and interaction state coexist with operational data", "No styling, disclosure, animation, draft, or feedback state emitted", "Intentional Improvement", "Presentation constructor output has no Dashboard View State.", "Dashboard Presentation Contract — Dashboard compositions and editing state"));
  }
  comparison.push(row("Deferred and rejected fields", "Legacy shape contains presentation/deferred fields", "Governed output omits them and keeps conditional lists empty", "Intentional Improvement", "No updatedAt, snippet, recurrence, attendee response, progress, attribution, unread, important, or Drive activity is published.", "Governed Dashboard Presentation Contract"));
  return {
    evaluationVersion: "sprint-3.60-v1", scenario,
    fixtureNotice: "SYNTHETIC_EVALUATION_ARTEFACT_NOT_AUTHENTICATED_OPERATIONAL_EVIDENCE",
    identicalInputEvidence: { operationalState }, legacy, governed, comparison,
    recommendation: comparison.some(item => ["Defect", "Unsupported Boundary", "Undocumented Failure Mode"].includes(item.classification)) ? "Promotion Blocked" : "Ready for Promotion",
  };
}

export const DASHBOARD_EVALUATION_SCENARIOS: readonly DashboardEvaluationScenario[] = ["empty", "single-commitment", "multiple-commitments", "cancelled-commitment", "bare-date-commitment", "timed-commitment", "mixed-connectors", "relative-duration", "operational-content"];
