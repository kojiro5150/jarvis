import { getGreeting } from "./greeting";
import type { OperationalState } from "./operational-state";
import type { Signal } from "./memory/schema";
import type { CalendarEvent } from "./connectors/calendar-event";
import { relativeTime } from "./connectors/email-message";

/**
 * Every dashboard session opens with a stance, not a blank chat box.
 * These functions are pure — given an OperationalState (see
 * lib/operational-state.ts — the same object every conversational agent
 * receives via /api/chat) they compute the opening line for each agent.
 * No model call, no network round trip inside these functions
 * themselves, so the console renders instantly and never says "I don't
 * have access to...".
 *
 * JARVIS's opening stance (jarvisBrief) follows a fixed executive-briefing
 * template — see the format comment above that function. Don't loosen
 * that structure without checking with Sam; the other agents' opening
 * lines are freer-form by design (bounded-role status, not a full
 * briefing).
 */

function topProject(state: OperationalState) {
  return [...state.projects].sort((a, b) => b.progress - a.progress)[0];
}

function nextEvent(state: OperationalState) {
  return state.calendar[0];
}

function urgentPriorities(state: OperationalState) {
  return state.priorities.filter((p) => p.urgent);
}

function signalsOfKind(state: OperationalState, kind: Signal["kind"]) {
  return state.signals.filter((s) => s.kind === kind);
}

/**
 * Same spirit as deriveBlockers() for signals: not every message in the
 * Communications Snapshot needs calling out, just the ones actually
 * pressing — unread, flagged important by Gmail, or from Governance
 * Engineering. Shared by dawnwatchBrief and the "full" context scope so
 * JARVIS/DAWNWATCH agree on what counts as urgent.
 */
export function urgentCommunications(state: OperationalState) {
  return state.gmailThreads.filter(
    (m) => m.unread || m.important || m.sourceLabel === "Governance Engineering"
  );
}

/**
 * "jarvis test, Governance Engineering calendar, 16:15" when the event
 * came from a real, named Google calendar — plain "jarvis test, WED at
 * 16:15" for local mock data, where a calendar name wouldn't mean
 * anything to Sam. Shared by jarvisBrief, dawnwatchBrief, and
 * context-builder.ts's baseline() so the three surfaces that mention a
 * next commitment stay in sync.
 */
export function describeCommitment(next: CalendarEvent): string {
  const calendarLabel =
    next.source === "google" && next.calendarName ? `, ${next.calendarName} calendar` : "";
  return `${next.title}${calendarLabel}, ${next.day} at ${next.time}`;
}

/**
 * JARVIS's default opening stance. Fixed shape, every line required:
 *
 *   Good {time}, Sam.
 *   Operational picture:
 *   {leading priority — 1-2 sentences}
 *   {programme status — 1 sentence, qualitative, no invented percentages}
 *   {next scheduled commitment — 1 sentence}
 *   {intelligence signals awaiting review — 1 sentence}
 *   Recommendation: {specific next action}
 *   Where would you like to begin?
 *
 * No implementation talk, no mention that this is drawn from local/
 * connector-backed state — it reads as JARVIS's current operational read.
 */
/**
 * The one line of "what to do next" — shared by jarvisBrief (as its
 * closing Recommendation line) and the Operational Brief card (v18),
 * so both surfaces say exactly the same thing rather than two
 * independently-worded guesses at the same underlying priority data.
 * Returns null when there's no leading priority to recommend anything
 * about — callers decide how to render that honestly instead of this
 * function inventing a placeholder.
 */
export function getRecommendation(state: OperationalState): string | null {
  const lead = state.priorities[0];
  if (!lead) return null;
  const urgent = urgentPriorities(state);
  return urgent.length > 0
    ? `Clear ${lead.title.toLowerCase()} first — it's blocking downstream work this week.`
    : `Start with ${lead.title.toLowerCase()} — it sets up the rest of the week.`;
}

function jarvisBrief(state: OperationalState, now: Date = new Date()): string {
  const urgent = urgentPriorities(state);
  const lead = state.priorities[0];
  const proj = topProject(state);
  const next = nextEvent(state);
  const signalCount = state.signals.length;

  const leadingPriority =
    urgent.length > 0
      ? `${lead.title} is the priority today. ${lead.detail}`
      : `${lead.title} leads the list. ${lead.detail}`;

  const programmeStatus = `Across the active programme, ${proj.name} is furthest along and closest to sign-off, with the rest of the portfolio sequenced behind it.`;

  // Never assume a next event exists — an empty calendar (a real
  // possibility once Google Calendar is connected and the next 7 days
  // are genuinely clear) must not crash the briefing.
  const nextCommitment = next
    ? `Next scheduled commitment is ${describeCommitment(next)}.`
    : "No scheduled commitment currently in view.";

  const signals = `${signalCount} intelligence signal${
    signalCount === 1 ? "" : "s"
  } ${signalCount === 1 ? "is" : "are"} awaiting review, spanning research, communications, and sequencing.`;

  const recommendation = getRecommendation(state) ?? "Bring me a priority and I'll help you sequence it.";

  return [
    `${getGreeting(now)}, Sam.`,
    `Operational picture:`,
    leadingPriority,
    programmeStatus,
    nextCommitment,
    signals,
    `Recommendation: ${recommendation}`,
    `Where would you like to begin?`,
  ].join("\n");
}

function dawnwatchBrief(state: OperationalState): string {
  const urgent = urgentPriorities(state);
  const ranked = state.priorities.map((p) => `${p.rank}. ${p.title} (${p.due})`).join(" · ");
  const next = nextEvent(state);
  const nextLine = next
    ? `First on the calendar: ${describeCommitment(next)}.`
    : "No scheduled commitment currently in view.";
  const urgentComms = urgentCommunications(state);
  const commsLine =
    urgentComms.length > 0
      ? `${urgentComms.length} communication${urgentComms.length === 1 ? "" : "s"} need${
          urgentComms.length === 1 ? "s" : ""
        } attention.`
      : "Communications clear.";
  return [
    urgent.length > 0 ? `${urgent.length} urgent.` : "Nothing urgent.",
    ranked,
    nextLine,
    commsLine,
  ].join(" ");
}

function oracleBrief(state: OperationalState): string {
  const research = signalsOfKind(state, "research");
  if (research.length === 0) return "No open research threads right now. Bring a topic and I'll go deep on it.";
  return research.map((s) => `${s.title} — ${s.detail}`).join(" ");
}

function geckoBrief(state: OperationalState): string {
  const research = signalsOfKind(state, "research");
  if (research.length === 0) return "No open market intelligence threads right now. Bring a sector or a signal and I'll scan the external landscape.";
  return research.map((s) => `${s.title} — ${s.detail}`).join(" ");
}

function heraldBrief(state: OperationalState): string {
  const { gmailThreads } = state;
  if (gmailThreads.length === 0) return "Inbox is clear — nothing waiting on a reply.";
  const summary = gmailThreads
    .map((m) => {
      const sourceNote = m.source === "google" && m.sourceLabel !== "Main Gmail" ? `, ${m.sourceLabel}` : "";
      return `${m.subject} (${m.from}${sourceNote}, ${relativeTime(m.receivedAt)})`;
    })
    .join(" · ");
  return `${gmailThreads.length} thread${gmailThreads.length === 1 ? "" : "s"} waiting on a reply: ${summary}.`;
}

function steveBrief(state: OperationalState): string {
  const proj = topProject(state);
  const active = state.projects.filter((p) => p.progress > 0 && p.progress < 100);
  return `${active.length} projects in active build. ${proj.name} is closest to done. Bring the specific piece you want worked on.`;
}

function coworkBrief(state: OperationalState): string {
  const { driveFiles } = state;
  if (driveFiles.length === 0) return "Nothing recently touched. Bring the document or artifact you want to work on.";
  const summary = driveFiles.map((f) => `${f.name} (${f.project}, ${f.modified})`).join(" · ");
  return `Recently touched: ${summary}.`;
}

function phdssBrief(state: OperationalState): string {
  const flagged = state.blockers;
  if (flagged.length === 0) return "No open risk or sequencing questions on the board. Bring a decision and I'll pressure-test it.";
  return flagged.map((s) => `${s.title} — ${s.detail}`).join(" ");
}

function marcusBrief(state: OperationalState): string {
  const sorted = [...state.projects].sort((a, b) => b.progress - a.progress);
  const summary = sorted.map((p) => `${p.name} (${p.tag})`).join(" · ");
  return `Portfolio: ${summary}. Say the word if something needs to move or drop.`;
}

export function getOpeningBrief(agentId: string, state: OperationalState): string {
  switch (agentId) {
    case "jarvis":
      return jarvisBrief(state);
    case "dawnwatch":
      return dawnwatchBrief(state);
    case "oracle":
      return oracleBrief(state);
    case "gecko":
      return geckoBrief(state);
    case "herald":
      return heraldBrief(state);
    case "steve":
      return steveBrief(state);
    case "cowork":
      return coworkBrief(state);
    case "phdss":
      return phdssBrief(state);
    case "marcus":
      return marcusBrief(state);
    default:
      return jarvisBrief(state);
  }
}
