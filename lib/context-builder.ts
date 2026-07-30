import type { OperationalState } from "./operational-state";
import { describeCommitment, urgentCommunications } from "./briefing";

/**
 * Which slice of OperationalState a given agent's conversational context
 * gets built from. "full" = JARVIS and DAWNWATCH (Executive Operations —
 * they hold the whole picture). Every specialist gets a subset scoped to
 * its bounded role (DESIGN_CONSTITUTION.md Principle 8), not the whole
 * state — but every scope still includes the shared baseline (current
 * priority, next commitment, signal count), because Sprint 2.4's
 * acceptance scenario 3 requires that something like a new calendar
 * commitment propagates to every agent's awareness without prompt edits,
 * not just to JARVIS/DAWNWATCH.
 */
export type ContextScope =
  | "full"
  | "communications"
  | "research"
  | "project"
  | "engineering"
  | "governance"
  | "strategy";

function formatSignal(s: OperationalState["signals"][number]): string {
  return `${s.title} — ${s.detail}`;
}

function baseline(state: OperationalState): string {
  const lead = state.priorities[0];
  const next = state.calendar[0];
  return [
    "Current Priority:",
    lead ? lead.title : "None recorded.",
    "",
    "Next Commitment:",
    next ? describeCommitment(next) : "No scheduled commitment currently in view.",
    "",
    "Urgent Signals:",
    String(state.signals.length),
  ].join("\n");
}

function activeProjectsSection(state: OperationalState): string {
  if (state.projects.length === 0) return "Active Projects:\nNone recorded.";
  const lines = state.projects.map((p) => `${p.name} (${p.tag})`);
  return ["Active Projects:", ...lines].join("\n");
}

function blockersSection(state: OperationalState): string {
  if (state.blockers.length === 0) return "Current Blockers:\nNone recorded.";
  return ["Current Blockers:", ...state.blockers.map(formatSignal)].join("\n");
}

function communicationsSection(state: OperationalState): string {
  if (state.gmailThreads.length === 0) {
    return "Communications:\nNone recorded.";
  }
  const urgent = urgentCommunications(state);
  const lines = state.gmailThreads.map((m) => {
    const flags = [m.unread ? "unread" : null, m.sourceLabel !== "Main Gmail" ? m.sourceLabel : null]
      .filter(Boolean)
      .join(", ");
    return `${m.subject} (from ${m.from}${flags ? `, ${flags}` : ""}) — ${m.snippet}`;
  });
  return [
    `Communications (${urgent.length} requiring attention):`,
    ...lines,
  ].join("\n");
}

function researchSignalsSection(state: OperationalState): string {
  const research = state.signals.filter((s) => s.kind === "research");
  if (research.length === 0) return "Research Signals:\nNone recorded.";
  return ["Research Signals:", ...research.map(formatSignal)].join("\n");
}

function recentDocumentActivitySection(state: OperationalState): string {
  if (state.driveFiles.length === 0) return "Recent Document Activity:\nNone recorded.";
  const lines = state.driveFiles.map((f) => `${f.name} (${f.project}, ${f.modified})`);
  return ["Recent Document Activity:", ...lines].join("\n");
}

function portfolioSection(state: OperationalState): string {
  if (state.projects.length === 0) return "Portfolio:\nNone recorded.";
  const lines = state.projects.map((p) => `${p.name} — ${p.tag}`);
  return ["Portfolio:", ...lines].join("\n");
}

function utcDateDescription(date: Date): string {
  const isoDate = date.toISOString().slice(0, 10);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
  return `${isoDate} (${weekday})`;
}

/**
 * Makes the clock used for relative-date reasoning explicit. The legacy
 * context previously supplied a "Next Commitment" but no reference date,
 * leaving the model to infer what "today" and "tomorrow" meant from nearby
 * calendar content. UTC is deliberate so the same instant always produces
 * the same prompt on every server.
 */
export function buildRelativeDateContext(referenceTime: Date = new Date()): string {
  const today = new Date(referenceTime.getTime());
  const tomorrow = new Date(referenceTime.getTime());
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  return [
    "Relative Date Reference (UTC):",
    `Reference time: ${referenceTime.toISOString()}`,
    `Today: ${utcDateDescription(today)}`,
    `Tomorrow: ${utcDateDescription(tomorrow)}`,
    "Use this reference for relative-date questions; do not infer dates from calendar commitments.",
  ].join("\n");
}

/**
 * Converts OperationalState into the structured text block appended to
 * an agent's system prompt before every request. Claude reasons FROM
 * this — it never invents priorities, projects, signals, or schedule.
 */
export function buildContextBlock(
  state: OperationalState,
  scope: ContextScope,
  referenceTime: Date = new Date()
): string {
  const header =
    "CURRENT OPERATIONAL STATE — supplied by the application, authoritative for this conversation. " +
    "Reason from it; do not question its accuracy, ask where it came from, or claim this information " +
    "is unavailable to you.";

  const sections: string[] = [buildRelativeDateContext(referenceTime), baseline(state)];

  switch (scope) {
    case "full":
      // JARVIS/DAWNWATCH need enough to say things like "Two
      // communications require attention" without HERALD being the only
      // agent who ever sees the inbox (Sprint 2.7).
      sections.push(activeProjectsSection(state), blockersSection(state), communicationsSection(state));
      break;
    case "communications":
      sections.push(communicationsSection(state));
      break;
    case "research":
      sections.push(researchSignalsSection(state));
      break;
    case "project":
      sections.push(activeProjectsSection(state), recentDocumentActivitySection(state));
      break;
    case "engineering":
      sections.push(activeProjectsSection(state));
      break;
    case "governance":
      sections.push(blockersSection(state), activeProjectsSection(state));
      break;
    case "strategy":
      sections.push(portfolioSection(state));
      break;
  }

  return [header, "", ...sections].join("\n\n");
}
