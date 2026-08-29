"use client";

import { Calendar, Mail, HardDrive, Database, BookOpen, Github, Hexagon } from "lucide-react";
import type { ConnectorStatus } from "@/lib/connectors/types";
import type { OperationalState } from "@/lib/operational-state";

interface AgentRailProps {
  operationalState: OperationalState;
  activeLoading: boolean;
  connectorStatuses: ConnectorStatus[];
  onConnectorsChanged?: () => void;
}

type DotState = "live" | "syncing" | "offline";

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
        title={title}
        className="w-full flex items-center gap-2 h-5 px-3 rounded transition-colors hover:bg-white/5"
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-2 h-5 px-3">{content}</div>;
}

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
      <CompactStatusRow icon={Database} label="Memory" state="offline" statusLabel="UNAVAILABLE" />
      <CompactStatusRow icon={BookOpen} label="Knowledge" state="live" statusLabel="READY" />
      <CompactStatusRow icon={Github} label="GitHub" state="offline" statusLabel="NOT CONNECTED" />
    </div>
  );
}

export default function AgentRail({
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
        <div className="min-w-0">
          <div className="text-[19px] font-semibold tracking-[0.22em] text-white/95 leading-none font-mono truncate">
            J.A.R.V.I.S
          </div>
          <div className="text-[11px] text-white/30 tracking-wide mt-1.5 truncate">Just A Very Intelligent System</div>
        </div>
      </div>

      <div className="flex-1 px-3.5">
        <div className="px-3 pb-1.5 text-[11px] tracking-[0.18em] text-white/30 font-mono uppercase">
          Core Intelligence
        </div>
        <div className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 border border-cyan-300/25 bg-cyan-300/5">
          <div className="relative h-9 w-9 shrink-0 rounded-full border border-cyan-300/25 bg-cyan-300/10 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.08)]">
            <Hexagon size={17} strokeWidth={1.75} className="text-white/90" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] leading-5 font-medium truncate text-cyan-200">JARVIS</div>
            <div className="text-[11px] leading-[16px] text-white/40 truncate">LLM + governed connectors</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`h-1.5 w-1.5 rounded-full ${activeLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            <span className="text-[11px] leading-[14px] font-mono tracking-wide text-white/30">
              {activeLoading ? "THINKING" : "READY"}
            </span>
          </div>
        </div>
      </div>

      <CompactSystemStatus operationalState={operationalState} onConnectorsChanged={onConnectorsChanged} />

      <div className="px-5 py-4 border-t border-white/5 font-mono">
        <div className="text-[10px] text-white/25 tracking-widest">
          JARVIS CORE v3.0.0
          <br />
          SINGLE INTELLIGENCE RUNTIME
          <br />
          GOVERNED CONNECTORS
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
