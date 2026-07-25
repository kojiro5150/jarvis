import type { OperationalState } from "../operational-state";
import { urgentCommunications } from "../briefing";

/**
 * Shared by AgentRail (the rail's per-specialist status row) and the Orb
 * (its "thinking" label) so both surfaces use the exact same honest
 * vocabulary and the exact same real numbers — nothing here is invented
 * per component.
 *
 * Two rules this file enforces:
 *
 * 1. Only the specialist the conversation dock is currently talking to
 *    can ever show a "busy" state (thinking/drafting/analysing/etc), and
 *    only while a real /api/chat request is in flight. Every other
 *    specialist is honestly "Ready" — this app has one conversation dock,
 *    not nine concurrently-working agents, and pretending otherwise would
 *    be exactly the fabricated status the design brief rules out.
 * 2. Notification badges are real backlog counts already sitting in
 *    OperationalState (urgent communications, open research signals,
 *    blockers, etc.) — they can be non-zero for an unselected specialist
 *    because a real backlog doesn't depend on who's currently selected.
 */

export type StatusColor = "idle" | "thinking" | "research" | "ready";

const STATUS_DOT: Record<StatusColor, string> = {
  idle: "bg-white/25",
  thinking: "bg-blue-400 animate-pulse-slow",
  research: "bg-violet-400 animate-pulse-slow",
  ready: "bg-emerald-400",
};

export function statusDotClass(color: StatusColor): string {
  return STATUS_DOT[color];
}

/** The verb shown while this specialist is actually processing a request — real loading state, agent-appropriate wording. */
export function thinkingVerb(agentId: string): string {
  switch (agentId) {
    case "dawnwatch":
      return "Briefing";
    case "oracle":
    case "gecko":
      return "Analysing";
    case "herald":
      return "Drafting";
    case "steve":
      return "Compiling";
    case "cowork":
      return "Planning";
    case "marcus":
      return "Reflecting";
    case "phdss":
      return "Reasoning";
    case "jarvis":
    default:
      return "Thinking";
  }
}

/** Research-flavored agents pulse violet ("Research" in the status legend); everyone else pulses blue ("Thinking"). */
export function thinkingColor(agentId: string): StatusColor {
  return agentId === "oracle" || agentId === "gecko" ? "research" : "thinking";
}

export function specialistStatus(
  agentId: string,
  isActive: boolean,
  activeLoading: boolean
): { label: string; color: StatusColor } {
  // JARVIS's row is a special case, not an exception to the "only the
  // selected specialist can be busy" rule: the main dashboard (Priorities/
  // Orb/Live Feed/Projects/Calendar/Communications) is JARVIS's own
  // operational view and is always rendering, regardless of which
  // specialist the conversation dock is currently talking to — so JARVIS
  // is honestly "Active" all the time, not something invented for this row.
  if (agentId === "jarvis") return { label: "Active", color: "ready" };
  if (!isActive) return { label: "Ready", color: "idle" };
  if (activeLoading) return { label: thinkingVerb(agentId), color: thinkingColor(agentId) };
  return { label: "Active", color: "ready" };
}

/** Real backlog counts per specialist — 0/undefined renders no badge at all. */
export function specialistBadge(agentId: string, state: OperationalState): number {
  switch (agentId) {
    case "dawnwatch":
      return state.priorities.filter((p) => p.urgent).length;
    case "oracle":
    case "gecko":
      return state.signals.filter((s) => s.kind === "research").length;
    case "herald":
      return urgentCommunications(state).length;
    case "steve":
      return state.projects.filter((p) => p.progress > 0 && p.progress < 100).length;
    case "cowork":
      return state.driveFiles.length;
    case "phdss":
      return state.blockers.length;
    case "marcus":
    case "jarvis":
    default:
      // Deliberately quiet — MARCUS especially shouldn't compete for
      // attention with a badge count (see the "quieter workspace" note
      // in his brief), and JARVIS's own view is the dashboard itself.
      return 0;
  }
}
