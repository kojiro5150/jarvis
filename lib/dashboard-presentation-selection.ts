import {
  DEFAULT_DASHBOARD_PRESENTATION_CONFIGURATION,
  buildDashboardPresentation,
  type DashboardCanonicalSource,
  type DashboardPresentation,
} from "./dashboard-presentation";
import type { OperationalState } from "./operational-state";

export type DashboardPresentationMode = "LEGACY" | "GOVERNED";

/** Server-side runtime selection. An absent value intentionally preserves production behaviour. */
export function selectDashboardPresentationMode(value: string | undefined): DashboardPresentationMode {
  if (value === undefined || value.trim() === "") return "LEGACY";
  if (value === "LEGACY" || value === "GOVERNED") return value;
  throw new Error("DASHBOARD_PRESENTATION_MODE must be LEGACY or GOVERNED");
}

/**
 * Presentation-boundary bridge for the current production publication.
 * It creates no canonical publication and adds no facts: the ephemeral port is used only as the
 * input to the governed Dashboard contract. Once production publishes ExecutiveStateSnapshot,
 * that snapshot can replace this bridge without changing a consumer.
 */
export function buildProductionDashboardPresentation(state: OperationalState): DashboardPresentation {
  const commitments = state.calendar.map(item => ({
    id: item.id,
    title: item.title,
    startsAt: item.start,
    dueAt: item.end,
    status: item.status === "cancelled" ? "cancelled" : "scheduled",
  }));
  const communications = state.gmailThreads.map(item => ({
    id: item.id,
    sender: item.from,
    subject: item.subject,
    sentAt: item.receivedAt,
    receivedAt: item.receivedAt,
  }));
  const status = (connected: boolean) => connected ? "available" as const : "unavailable" as const;
  const sourceKind = (name: string) => name === "gmail" ? "email" as const
    : name === "calendar" || name === "drive" ? name
      : "other" as const;
  const snapshot: DashboardCanonicalSource = {
    state: {
      priorities: state.priorities.map((item, index) => ({ id: `priority-${index}`, title: item.title })),
      projects: state.projects.map((item, index) => ({ id: `project-${index}`, name: item.name })),
      commitments,
      communications,
      sources: state.connectorStatuses.map(item => ({ id: item.name, kind: sourceKind(item.name), status: status(item.connected) })),
    },
    artifacts: [
      { artifact: { entities: { commitments: state.calendar.filter(item => item.source === "google").map(({ id }) => ({ id })) }, provenance: { adapterId: "google-calendar" } } },
      { artifact: { entities: { communications: state.gmailThreads.filter(item => item.source === "google").map(({ id }) => ({ id })) }, provenance: { adapterId: "google.gmail.operational-communication" } } },
    ],
  };

  return buildDashboardPresentation(snapshot, {
    ...DEFAULT_DASHBOARD_PRESENTATION_CONFIGURATION,
    referenceTime: state.updatedAt,
  });
}
