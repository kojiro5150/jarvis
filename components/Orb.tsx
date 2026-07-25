"use client";

import { accentClasses } from "@/lib/agents/accent";
import type { AgentAccent } from "@/lib/agents/types";

export type OrbState =
  | "idle"
  | "thinking"
  | "listening"
  | "speaking"
  | "routing"
  | "delegating"
  | "synchronising"
  | "offline";

interface OrbProps {
  accent: AgentAccent;
  /**
   * Real cognitive state, not decoration — every value here is backed by
   * something actually happening in the app, never fabricated:
   *   idle          nothing in flight
   *   thinking      a /api/chat request is in flight
   *   listening     the conversation input is focused
   *   speaking      an assistant reply just arrived (loading just ended without an error) — a brief, real "delivering" flash, not a fabricated voice signal
   *   routing       the user just switched which specialist the dock is talking to
   *   delegating    same as routing, specifically when JARVIS handed off to a specialist (the previous agent was JARVIS, the next one isn't) — a real distinction derived from which two agents were actually involved, not a separate fabricated signal
   *   synchronising an OperationalState refresh (GET /api/operational-state) is in flight
   *   offline       the last /api/chat request errored
   */
  state?: OrbState;
  size?: number;
}

const OFFLINE_RING = "border-red-400/50";

/**
 * Futuristic holographic orb — pure CSS/SVG, no assets, no external deps.
 * Every state this renders is backed by something real happening in the
 * app (see OrbState above). Phase 2.6 adds "speaking" and "delegating" —
 * both were deliberately left out in Phase 2.5 because nothing in the app
 * produced an honest signal for them; they're included now only because
 * real signals exist (a reply arriving, JARVIS handing off vs. a lateral
 * specialist switch), not because the reference mockup asked for them.
 */
export default function Orb({ accent, state = "idle", size = 220 }: OrbProps) {
  const c = accentClasses(accent);
  const offline = state === "offline";
  const active = state !== "idle" && !offline;
  const thinking = state === "thinking" || state === "routing" || state === "delegating";
  const listening = state === "listening";
  const speaking = state === "speaking";
  const synchronising = state === "synchronising";
  const delegating = state === "delegating";
  const ringClass = offline ? OFFLINE_RING : c.border;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* listening — an expanding ping ring, distinct from the rotating idle/thinking treatment */}
      {listening && (
        <div className={`absolute inset-0 rounded-full border ${c.border} animate-ping opacity-40`} />
      )}

      {/* synchronising — a second, counter-phase ping ring reads as "data moving," distinct from listening's single ring */}
      {synchronising && (
        <div className={`absolute inset-2 rounded-full border ${c.border} animate-ping opacity-30`} style={{ animationDuration: "1.6s" }} />
      )}

      {/* speaking — two staggered pulses reading as sound moving outward, distinct from listening's single inward-facing ring */}
      {speaking && (
        <>
          <div className={`absolute inset-0 rounded-full border ${c.border} animate-ping opacity-30`} style={{ animationDuration: "1.2s" }} />
          <div className={`absolute inset-3 rounded-full border ${c.border} animate-ping opacity-40`} style={{ animationDuration: "1.2s", animationDelay: "0.3s" }} />
        </>
      )}

      {/* delegating — a second particle orbiting opposite the first, reading as work travelling to another node */}
      {delegating && (
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "1.1s", animationDirection: "reverse" }}>
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${c.dot} ${c.glow}`} />
        </div>
      )}

      {/* outer rotating ring — faster while thinking/routing, static-tinted red while offline */}
      <div
        className={`absolute inset-0 rounded-full border ${ringClass} ${thinking ? "animate-spin" : "animate-spin-slow"}`}
        style={{ borderStyle: "dashed" }}
      />
      {/* inner counter-rotating ring */}
      <div
        className={`absolute inset-4 rounded-full border ${ringClass} opacity-60 animate-spin-reverse-slow`}
      />
      {/* soft outer glow */}
      <div
        className={`absolute inset-6 rounded-full ${offline ? "bg-red-400/10" : c.bgSoft} blur-2xl ${
          active ? "animate-pulse-slow" : ""
        }`}
      />
      {/* core */}
      <div
        className={`relative rounded-full ${offline ? "bg-red-400/10" : c.bg} ${offline ? "" : c.glow} border ${ringClass} flex items-center justify-center animate-drift`}
        style={{ width: size * 0.55, height: size * 0.55 }}
      >
        <div
          className={`rounded-full ${offline ? "bg-red-400/20" : c.bg} ${
            active ? "animate-pulse-slow" : ""
          }`}
          style={{ width: "60%", height: "60%" }}
        />
      </div>
      {/* orbiting dot */}
      <div className={thinking ? "absolute inset-0 animate-spin" : "absolute inset-0 animate-spin-slow"}>
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full ${offline ? "bg-red-400" : c.dot} ${offline ? "" : c.glow}`}
        />
      </div>
    </div>
  );
}
