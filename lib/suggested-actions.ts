import type { OperationalState } from "./operational-state";

export interface SuggestedAction {
  id: string;
  /** Short label shown on the button. */
  label: string;
  /** Natural-language command pre-filled into the conversation input when clicked — reuses the existing quick-command flow (DashboardShell's handleQuickCommand), never a fabricated action with nothing behind it. */
  query: string;
}

/**
 * Phase 2.6 replaces the old static "Quick Commands" list with actions
 * generated fresh from the same OperationalState every card reads.
 * Nothing here is hard-coded copy — an action only appears because a
 * real priority/blocker/communication/commitment/project/signal exists
 * to back it, and the list is simply empty (not padded with invented
 * busywork) when the operational picture is genuinely clear.
 *
 * Ordering follows real urgency, not a fixed template: urgent
 * priorities and blockers first, then the next real calendar commitment,
 * the furthest-along active project, and finally one open research
 * signal — capped at 6.
 *
 * v26 (Sprint 8): "Reply: [subject]" items were removed — they exactly
 * duplicated Communications Snapshot's Needs Reply list, so this panel
 * now only surfaces action types that don't already appear elsewhere on
 * the page (Finish/Resolve/Prepare/Continue/Review).
 */
export function getSuggestedActions(state: OperationalState): SuggestedAction[] {
  const actions: SuggestedAction[] = [];

  state.priorities
    .filter((p) => p.urgent)
    .forEach((p) => {
      actions.push({
        id: `priority-${p.rank}`,
        label: `Finish: ${p.title}`,
        query: `Help me finish "${p.title}" — ${p.detail}`,
      });
    });

  state.blockers.forEach((b) => {
    actions.push({
      id: `blocker-${b.title}`,
      label: `Resolve: ${b.title}`,
      query: `Walk me through resolving "${b.title}" — ${b.detail}`,
    });
  });

  const next = state.calendar[0];
  if (next) {
    actions.push({
      id: `calendar-${next.id}`,
      label: `Prepare for: ${next.title}`,
      query: `Help me prepare for "${next.title}" on ${next.day} at ${next.time}`,
    });
  }

  const activeProjects = state.projects.filter((p) => p.progress > 0 && p.progress < 100);
  const topProject = [...activeProjects].sort((a, b) => b.progress - a.progress)[0];
  if (topProject) {
    actions.push({
      id: `project-${topProject.name}`,
      label: `Continue: ${topProject.name} (${topProject.progress}%)`,
      query: `What's left to finish "${topProject.name}"?`,
    });
  }

  const research = state.signals.find((s) => s.kind === "research");
  if (research) {
    actions.push({
      id: `research-${research.title}`,
      label: `Review: ${research.title}`,
      query: `Brief me on "${research.title}" — ${research.detail}`,
    });
  }

  return actions.slice(0, 6);
}
