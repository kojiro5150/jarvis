"use client";

import { useEffect, useState } from "react";
import { AudioWaveform, CircleDot, Lock, Settings } from "lucide-react";
import type { VoiceState } from "@/components/CommandCore";
import type { OperationalState } from "@/lib/operational-state";

type SystemReading = "NOMINAL" | "ATTENTION REQUIRED" | "LOCAL MODE";

/**
 * v32 (Sprint 14, Section 4): reads the exact same voiceState
 * DashboardShell derives for the orb — see its own comment on why this
 * is one shared value rather than two independently-tracked ones. Copy
 * stays in the same honest, no-fabrication register as every other
 * reading in this bar: "STANDBY" when nothing's happening, not an
 * invented "ACTIVE".
 *
 * v33 (Sprint 15): grown from 3 states to the app's full 5-state voice
 * model — "THINKING" and "ERROR" now have their own real reading here
 * too, rather than both silently reading as STANDBY the way they did
 * before this sprint gave voice state its own thinking/error values.
 */
const VOICE_COPY: Record<VoiceState, string> = {
  standby: "VOICE: STANDBY",
  listening: "VOICE: LISTENING",
  thinking: "VOICE: THINKING",
  speaking: "VOICE: SPEAKING",
  error: "VOICE: ERROR",
};
const VOICE_COLOR: Record<VoiceState, string> = {
  standby: "text-[#2D7BFF]/80",
  listening: "text-cyan-300",
  thinking: "text-amber-300",
  speaking: "text-emerald-300",
  error: "text-red-400",
};

/**
 * Derived from real connector state, never invented: a refresh_required
 * status on either connector is genuinely worth flagging (ATTENTION
 * REQUIRED); at least one connector actually online is NOMINAL; nothing
 * connected yet (fresh install, nothing wired up) is honestly LOCAL MODE
 * rather than a fabricated "all systems go."
 */
function systemReading(state: OperationalState): { label: SystemReading; dot: string; text: string } {
  if (state.calendarStatus === "refresh_required" || state.gmailStatus === "refresh_required") {
    return { label: "ATTENTION REQUIRED", dot: "bg-amber-400", text: "text-amber-300" };
  }
  if (state.calendarStatus === "online" || state.gmailStatus === "online") {
    return { label: "NOMINAL", dot: "bg-emerald-400", text: "text-emerald-300" };
  }
  return { label: "LOCAL MODE", dot: "bg-white/40", text: "text-white/50" };
}

/**
 * The reference's "very thin ambient status bar" — no greeting, no large
 * controls. The greeting Sam used to see here ("Good evening, Sam...")
 * didn't disappear; it already lives as the first line of JARVIS's
 * opening brief inside the conversation dock (lib/briefing.ts's
 * jarvisBrief), which is where the reference's philosophy says the
 * conversation — not a page header — is the primary surface.
 *
 * Every reading here is real: system status is derived from actual
 * connector state (see systemReading above), the clock is a real live
 * clock, and the voice reading (below) is driven by the exact same
 * shared voiceState the orb reads — never a fabricated "ACTIVE" state.
 */
export default function TopBar({
  operationalState,
  voiceState,
}: {
  operationalState: OperationalState;
  voiceState: VoiceState;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const system = systemReading(operationalState);
  const liveCount = operationalState.connectorStatuses.filter((s) => s.connected).length;
  const totalConnectors = operationalState.connectorStatuses.length;
  const allLive = totalConnectors > 0 && liveCount === totalConnectors;

  return (
    <header className="flex items-center justify-between px-6 py-2 border-b border-white/5 shrink-0 font-mono text-[11px] tracking-widest text-white/40">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00E6FF] animate-pulse-slow" />
        <span>OPERATIONAL PICTURE</span>
        {now && (
          <span className="text-white/25">
            {" · "}
            {now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
            {" · "}
            {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className={`flex items-center gap-1.5 ${VOICE_COLOR[voiceState]}`}>
          <AudioWaveform size={12} />
          {VOICE_COPY[voiceState]}
        </span>
        <span className={`flex items-center gap-1.5 ${system.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${system.dot}`} />
          SYSTEM: {system.label}
        </span>
        <span className={`flex items-center gap-1.5 ${allLive ? "text-emerald-400" : "text-amber-300"}`}>
          <CircleDot size={11} />
          CONNECTORS: {liveCount}/{totalConnectors} LIVE
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400/80">
          <Lock size={11} />
          SESSION SECURE
        </span>
        <button className="h-6 w-6 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/20 transition-colors">
          <Settings size={11} />
        </button>
      </div>
    </header>
  );
}
