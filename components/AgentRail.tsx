"use client";

import { Calendar, Mail, HardDrive, Database, BookOpen, Github } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { accentClasses } from "@/lib/agents/accent";
import { specialistStatus, specialistBadge, statusDotClass } from "@/lib/agents/specialist-status";
import type { AgentDefinition } from "@/lib/agents/types";
import type { ConnectorStatus } from "@/lib/connectors/types";
import type { OperationalState } from "@/lib/operational-state";

interface AgentRailProps {
  selectedId: string;
  onSelect: (id: string) => void;
  operationalState: OperationalState;
  /** True only while the currently-selected specialist has a real /api/chat request in flight. */
  activeLoading: boolean;
  /** Real connector states — footer shows how many are actually live, never a fabricated "100%" readout. */
  connectorStatuses: ConnectorStatus[];
  /**
   * v43: fires after a real connect/disconnect action so the caller can
   * re-fetch operational state (same `refresh()` DashboardShell already
   * passes to the memory editor's `onSaved`) — Connect itself is a full
   * page navigation (see CompactSystemStatus), so it doesn't need this;
   * only Disconnect (an in-place POST) does.
   */
  onConnectorsChanged?: () => void;
}

// JARVIS is a normal rail entry — the top row under "Executive Operations,"
// same as every other specialist, per the v16 spec (Section 3): there is no
// separate "DASHBOARD" card above the rail. Selecting JARVIS still shows the
// primary orb stance and points the conversation dock at JARVIS; the
// dashboard's *content* never changes based on selection — only who the
// dock is talking to. See lib/useAgentConversation.ts / DashboardShell.
const EXECUTIVE_AGENTS = AGENTS.filter((a) => a.tier === "executive");
const SPECIALIST_AGENTS = AGENTS.filter((a) => a.tier === "specialist");

/**
 * Each row IS the specialist's status indicator — the standalone Agent
 * Status card was removed (Phase 2.5) because it just duplicated this
 * information a second time. Every row shows a real status (only the
 * selected specialist can ever be "busy," and only while a real request
 * is in flight — see lib/agents/specialist-status.ts) and a real backlog
 * badge where one exists.
 *
 * v21 resize (Sprint 3): brought back down to the v16 spec's actual row
 * density — 36px icon, 10px vertical / 12px horizontal row padding, 12px
 * icon-text gap, 13px/20px name, 12px/18px subtitle, an 18px badge
 * pinned to the icon's own top-right corner (not floated in a separate
 * column), and an 11px/14px mono status label right-aligned in the row
 * instead of stacked on its own line.
 *
 * v28 (Sprint 10): rail narrowed 360px→300px, so name/subtitle dropped a
 * size each (13px→12px name, 12px→11px subtitle) to keep both fitting on
 * one line without wrapping at the new width. Kept a whole px apart
 * (rather than converging on one size) so the name still reads as the
 * primary line — CO-WORK's longer subtitle ("Long-Form Collaboration &
 * Execution") just truncates a character or two earlier than before,
 * which is expected at this width, not a bug.
 *
 * v25 (Sprint 7, Section 2): the icon badge now always carries its
 * specialist's colour (background wash + border), regardless of
 * selection — previously that only happened for the active row, which
 * meant every other row rendered as flat grey line art. The glyph itself
 * stays a fixed near-white regardless of specialist (matching the
 * reference's "colourful badge, light glyph on top" look); the active
 * row still gets an extra glow so selection stays visually distinct.
 */
function AgentButton({
  agent,
  isActive,
  activeLoading,
  operationalState,
  onSelect,
}: {
  agent: AgentDefinition;
  isActive: boolean;
  activeLoading: boolean;
  operationalState: OperationalState;
  onSelect: (id: string) => void;
}) {
  const c = accentClasses(agent.accent);
  const Icon = agent.icon;
  const status = specialistStatus(agent.id, isActive, activeLoading);
  const badge = specialistBadge(agent.id, operationalState);

  return (
    <button
      onClick={() => onSelect(agent.id)}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all border ${
        isActive
          ? `${c.bg} ${c.border} shadow-[0_0_0_1px_rgba(255,255,255,0.02)]`
          : `border-transparent text-white/50 hover:bg-white/5 ${c.hoverBorder}`
      }`}
    >
      <div
        className={`relative h-9 w-9 shrink-0 rounded-full border flex items-center justify-center ${c.border} ${c.bg} ${
          isActive ? c.glow : ""
        }`}
      >
        <Icon size={17} strokeWidth={1.75} className="text-white/90" />
        {badge > 0 && (
          <span
            className={`absolute -top-1 -right-1 h-[18px] min-w-[18px] flex items-center justify-center text-[10px] font-mono rounded-full px-1 border border-[#0D1119] ${c.bg} ${c.text}`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-[12px] leading-5 font-medium truncate ${isActive ? c.text : "text-white/85"}`}>
          {agent.name}
        </div>
        <div className="text-[11px] leading-[16px] text-white/40 truncate">{agent.subtitle}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(status.color)}`} />
        <span className="text-[11px] leading-[14px] font-mono tracking-wide text-white/30">
          {status.label.toUpperCase()}
        </span>
      </div>
    </button>
  );
}

type DotState = "live" | "syncing" | "offline";

/** Filled emerald = live, filled amber = syncing/needs attention, hollow ring = offline — matches AgentButton's own status-dot vocabulary, just without the animate-pulse (these are point-in-time reads, not "something is actively happening" states). */
function StatusDot({ state }: { state: DotState }) {
  if (state === "offline") {
    return <span className="h-1.5 w-1.5 rounded-full shrink-0 border border-white/25" />;
  }
  return (
    <span
      className={`h-1.5 w-1.5 rounded-full shrink-0 ${state === "live" ? "bg-emerald-400" : "bg-amber-400"}`}
    />
  );
}

/**
 * v27 (Sprint 9, Section 1): System Status moves from the RH column (now
 * removed entirely) into the LH rail, directly under the specialist list.
 * One line per service — icon, name, single status dot + word — no
 * Refresh sub-link, no description text; those only made sense with a
 * full 360px panel to fill. Real math at 1470x956 (see Sprint 6): the
 * rail's existing content (brand header + 9 specialist rows + footer)
 * leaves comfortable room for six ~20px rows without shrinking the
 * specialist list below Sprint 3 density — so this renders unconditionally
 * rather than behind a collapsible toggle. (v28, Sprint 10: rail is now
 * 300px wide, not 360 — the row's own content, icon + short label + short
 * status word, was never close to that width anyway, so the narrower rail
 * doesn't change anything about this block.)
 */
/**
 * v29 (Sprint 11, Section 3): rows are plain (non-interactive) by
 * default — this is a status readout, not a nav. Memory is the one
 * exception: when `onClick` is supplied it renders as a real button
 * (the memory editor's trigger), same "only interactive when there's
 * something real behind it" rule used everywhere else in this app.
 *
 * v43: Calendar/Gmail/Drive join Memory as real actions, but with a
 * visibly different treatment — `actionable` swaps the trailing word's
 * styling from a plain status readout (white/35, matching Memory's
 * "ONLINE") to a dotted-underline cyan link (matching this app's other
 * clickable inline text, e.g. MarkdownMessage's `<a>` styling), since
 * for these three the word itself IS the button (CONNECT/RECONNECT/
 * DISCONNECT), not just a click-anywhere row with a static label next
 * to it.
 */
function CompactStatusRow({
  icon: Icon,
  label,
  state,
  statusLabel,
  onClick,
  title,
  actionable,
}: {
  icon: typeof Calendar;
  label: string;
  state: DotState;
  statusLabel: string;
  onClick?: () => void;
  title?: string;
  actionable?: boolean;
}) {
  const content = (
    <>
      <Icon size={12} className="text-white/35 shrink-0" />
      <span className="flex-1 min-w-0 truncate text-[10px] tracking-[0.12em] text-white/45 font-mono uppercase">
        {label}
      </span>
      <span className="flex items-center gap-1.5 shrink-0">
        <StatusDot state={state} />
        <span
          className={`text-[10px] font-mono tracking-wide ${
            actionable ? "text-cyan-300/80 underline decoration-dotted underline-offset-2" : "text-white/35"
          }`}
        >
          {statusLabel}
        </span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title ?? "Open memory editor"}
        className="w-full flex items-center gap-2 h-5 px-3 rounded transition-colors hover:bg-white/5"
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-2 h-5 px-3">{content}</div>;
}

/**
 * v43: Calendar, Gmail, and Drive all live behind ONE Google OAuth grant
 * (see lib/connectors/google/oauth.ts) — there's no way to connect or
 * disconnect just one of the three independently, so every row's action
 * points at the same two endpoints. Per-row STATE still stays real and
 * independent, though: it's possible for tokens to exist (so Calendar
 * reads "live") while Drive's own scope predates when it was added and
 * still needs a reconnect — see GoogleServiceAuthError's "not_connected"
 * case in google/drive.ts — so this computes each row's action off ITS
 * OWN status, not one shared flag.
 */
function googleConnectAction(state: DotState): { label: string; title: string; navigate: boolean } {
  if (state === "live") {
    return {
      label: "DISCONNECT",
      title: "Disconnect Google — this also disconnects Gmail and Drive, since all three share one account grant.",
      navigate: false,
    };
  }
  return {
    label: state === "syncing" ? "RECONNECT" : "CONNECT",
    title:
      state === "syncing"
        ? "Reconnect Google — the stored token no longer works for this service."
        : "Connect Google — grants Calendar, Gmail, and Drive together in one consent screen.",
    navigate: true,
  };
}

function CompactSystemStatus({
  operationalState,
  onConnectorsChanged,
}: {
  operationalState: OperationalState;
  onConnectorsChanged?: () => void;
}) {
  const { calendarStatus, gmailStatus, driveStatus } = operationalState;

  const calendarState: DotState =
    calendarStatus === "online" ? "live" : calendarStatus === "refresh_required" ? "syncing" : "offline";
  const gmailState: DotState =
    gmailStatus === "online" ? "live" : gmailStatus === "refresh_required" ? "syncing" : "offline";
  const driveState: DotState =
    driveStatus === "online" ? "live" : driveStatus === "refresh_required" ? "syncing" : "offline";

  async function handleGoogleAction(state: DotState) {
    const action = googleConnectAction(state);
    if (action.navigate) {
      window.location.href = "/api/auth/google/start";
      return;
    }
    await fetch("/api/auth/google/disconnect", { method: "POST" });
    onConnectorsChanged?.();
  }

  const calendarAction = googleConnectAction(calendarState);
  const gmailAction = googleConnectAction(gmailState);
  const driveAction = googleConnectAction(driveState);

  return (
    <div className="px-3.5 pt-2.5 border-t border-white/5 space-y-0.5">
      <CompactStatusRow
        icon={Calendar}
        label="Calendar"
        state={calendarState}
        statusLabel={calendarAction.label}
        title={calendarAction.title}
        actionable
        onClick={() => handleGoogleAction(calendarState)}
      />
      <CompactStatusRow
        icon={Mail}
        label="Gmail"
        state={gmailState}
        statusLabel={gmailAction.label}
        title={gmailAction.title}
        actionable
        onClick={() => handleGoogleAction(gmailState)}
      />
      <CompactStatusRow
        icon={HardDrive}
        label="Drive"
        state={driveState}
        statusLabel={driveAction.label}
        title={driveAction.title}
        actionable
        onClick={() => handleGoogleAction(driveState)}
      />
      <CompactStatusRow
        icon={Database}
        label="Memory"
        state="offline"
        statusLabel="UNAVAILABLE"
      />
      <CompactStatusRow icon={BookOpen} label="Knowledge" state="live" statusLabel="READY" />
      <CompactStatusRow icon={Github} label="GitHub" state="offline" statusLabel="NOT CONNECTED" />
    </div>
  );
}

export default function AgentRail({
  selectedId,
  onSelect,
  operationalState,
  activeLoading,
  connectorStatuses,
  onConnectorsChanged,
}: AgentRailProps) {
  const liveCount = connectorStatuses.filter((s) => s.connected).length;

  return (
    <aside className="w-[300px] shrink-0 h-full panel border-r border-white/5 flex flex-col overflow-x-hidden">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="h-11 w-11 shrink-0 rounded-[10px] border border-[#00E6FF]/45 bg-[#00E6FF]/10 flex items-center justify-center text-[#00E6FF] text-sm font-bold tracking-tight font-mono">
          J
        </div>
        {/* v28 (Sprint 10): min-w-0 + truncate defensively guard against the
            narrower 300px rail — at 360px this text never got close to
            overflowing, so it's untested at the new width without this. */}
        <div className="min-w-0">
          <div className="text-[19px] font-semibold tracking-[0.22em] text-white/95 leading-none font-mono truncate">
            J.A.R.V.I.S
          </div>
          {/* v43: swapped "EXECUTIVE OPERATING SYSTEM" for the JARVIS
              backronym itself, shortened to "Just A Very Intelligent
              System" (dropping "Really") specifically so it fits on one
              line at this rail's 300px width without wrapping or
              truncating — the `truncate` class stays as a defensive
              guard, same reasoning as the v28 comment above this block. */}
          <div className="text-[11px] text-white/30 tracking-wide mt-1.5 truncate">Just A Very Intelligent System</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 space-y-3">
        <div>
          <div className="px-3 pb-1.5 text-[11px] tracking-[0.18em] text-white/30 font-mono uppercase">
            Executive Operations
          </div>
          <div className="space-y-1">
            {EXECUTIVE_AGENTS.map((agent) => (
              <AgentButton
                key={agent.id}
                agent={agent}
                isActive={agent.id === selectedId}
                activeLoading={activeLoading}
                operationalState={operationalState}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="px-3 pb-1.5 text-[11px] tracking-[0.18em] text-white/30 font-mono uppercase">
            Specialist Intelligence
          </div>
          <div className="space-y-1">
            {SPECIALIST_AGENTS.map((agent) => (
              <AgentButton
                key={agent.id}
                agent={agent}
                isActive={agent.id === selectedId}
                activeLoading={activeLoading}
                operationalState={operationalState}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </nav>

      <CompactSystemStatus
        operationalState={operationalState}
        onConnectorsChanged={onConnectorsChanged}
      />

      <div className="px-5 py-4 border-t border-white/5 font-mono">
        <div className="text-[10px] text-white/25 tracking-widest">
          JARVIS CORE v2.0.0
          <br />
          BUILT FOR SAM HAYWARD
          <br />
          GOVERNANCE ENGINEERING
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/40 tracking-widest mt-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
          JARVIS STATUS — ONLINE
        </div>
        <div className="text-[10px] text-white/25 mt-1 pl-3.5">
          {liveCount}/{connectorStatuses.length} CONNECTORS LIVE
        </div>
      </div>
    </aside>
  );
}
