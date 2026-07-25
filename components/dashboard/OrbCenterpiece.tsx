"use client";

import { Mic, Search, FileText, Crosshair, Hexagon } from "lucide-react";
import CommandCore, { type OrbState, type VoiceState } from "../CommandCore";
import { accentClasses } from "@/lib/agents/accent";
import { thinkingVerb } from "@/lib/agents/specialist-status";
import type { AgentDefinition } from "@/lib/agents/types";

interface OrbCenterpieceProps {
  agent: AgentDefinition;
  orbState: OrbState;
  voiceState: VoiceState;
  liveAmplitude?: number;
  micActive?: boolean;
  micError?: boolean;
  onToggleMic: () => void;
  onQuickCommand: (text: string) => void;
  onSelectJarvis: () => void;
}

interface QuickAction {
  label: string;
  icon: typeof Mic;
  onClick?: () => void;
  disabled?: boolean;
  disabledTitle?: string;
  active?: boolean;
}

/** Fixed editorial quote per specialist — unchanged since Sprint 7. */
const QUOTE: Record<string, string> = {
  jarvis: "Runs point across every domain and brings in a specialist when the work calls for one.",
  dawnwatch: "Holds situational awareness — ranked, current, and nothing buried.",
  oracle: "Depth over speed. Evidence before conclusion.",
  gecko: "Watches the world outside, so nothing external catches you by surprise.",
  herald: "Finds the words that move the room.",
  steve: "Builds the thing, then makes it hold.",
  cowork: "The colleague sitting beside you, not another assistant.",
  marcus: "The obstacle is the way.",
  phdss: "Reasoning before authority. Evidence before conclusion.",
};

/**
 * The dashboard's centerpiece — the visual anchor of the whole
 * workspace. The orb identity (J.A.R.V.I.S / "Just A Really Very
 * Intelligent System" / the active specialist's quote) stays constant in
 * meaning across every redesign; only the presentation has changed
 * sprint to sprint.
 *
 * v35 (Sprint 17): restructured around the holoDepth export's own
 * percentage-based zone proportions (Section 6) rather than the previous
 * flex-stacked "small square orb, then text, then buttons" layout —
 * `CommandCore` now fills this entire panel edge-to-edge (its own deep
 * vignette IS this panel's background, per Section 8), and the identity
 * text / action row are absolutely positioned at their own zone
 * percentages on top of it, rather than being separate flex children
 * pushed below a smaller orb graphic. This is a genuine structural
 * change to this file, not just CommandCore.tsx — Section 7 explicitly
 * scopes this sprint to "the orb panel", and this panel's own layout is
 * part of that.
 *
 * Borderless per Section 3/8: no `.panel` class, no `border` — the
 * vignette background comes entirely from CommandCore now. `rounded-xl
 * overflow-hidden` stays (shape/clipping, not a visible box outline).
 *
 * MARCUS keeps his established quieter treatment (quote-only, no
 * J.A.R.V.I.S title block, calmer action row) — unchanged in substance,
 * just re-homed into the new percentage zones.
 *
 * All five action handlers (Voice/Search/Brief Me/Focus/Ask JARVIS) are
 * unchanged from Sprint 15/16 — this sprint replaces presentation only,
 * per Section 4/7's explicit instruction.
 */
export default function OrbCenterpiece({
  agent,
  orbState,
  voiceState,
  liveAmplitude = 0,
  micActive = false,
  micError = false,
  onToggleMic,
  onQuickCommand,
  onSelectJarvis,
}: OrbCenterpieceProps) {
  const c = accentClasses(agent.accent);
  const isMarcus = agent.id === "marcus";

  const routing = orbState === "routing";
  const delegating = orbState === "delegating";
  const loading = orbState === "thinking";
  const hasError = orbState === "offline";
  const synchronising = orbState === "synchronising";
  const speaking = orbState === "speaking";
  const listening = orbState === "listening";
  const inTransition = routing || delegating;

  const actions: QuickAction[] = [
    {
      label: "Voice",
      icon: Mic,
      onClick: onToggleMic,
      disabled: false,
      disabledTitle: micError ? "Microphone unavailable" : micActive ? "Listening — click to stop" : "Click to start voice input",
      active: micActive,
    },
    { label: "Search", icon: Search, disabled: true, disabledTitle: "Not wired up yet" },
    { label: "Brief Me", icon: FileText, onClick: () => onQuickCommand("Brief me on today") },
    { label: "Focus", icon: Crosshair, onClick: () => onQuickCommand("Summarize what needs my attention") },
    { label: "Ask JARVIS", icon: Hexagon, onClick: onSelectJarvis },
  ];

  const liveStateLine = loading
    ? `${agent.name} is ${thinkingVerb(agent.id).toLowerCase()}...`
    : hasError
      ? "Intelligence link interrupted."
      : micError
        ? "Microphone unavailable."
        : synchronising
          ? "Synchronising operational state..."
          : speaking
            ? `${agent.name} just replied.`
            : listening
              ? micActive
                ? "Listening..."
                : `${agent.name} is listening...`
              : null;

  return (
    // v37 (Sprint 20, Section 2): `container-type: inline-size` makes this
    // div a CSS containment context, so any descendant (in this file AND
    // in CommandCore.tsx, which renders inside it) can size itself in
    // `cqw` — a percentage of THIS element's own rendered width — rather
    // than a fixed px value tuned at one window size, or a viewport unit
    // that ignores how much of the actual screen this panel occupies.
    // This is what makes "percentage of the orb panel's own rendered
    // width, not the viewport" (Section 2's own wording) literally true
    // rather than approximate.
    <div className="relative h-full min-h-[420px] rounded-xl overflow-hidden" style={{ containerType: "inline-size" }}>
      {/* Orb + HUD field (Section 6: ~10-72% of panel height) — CommandCore
          fills the whole panel edge-to-edge; its own internal ORB_CENTER_Y_PCT
          (43%) keeps the actual sphere centred within that zone rather than
          the panel's literal geometric middle. */}
      <CommandCore
        key={orbState}
        agent={agent}
        state={orbState}
        voiceState={voiceState}
        liveAmplitude={liveAmplitude}
        size={isMarcus ? 230 : 290}
      />

      {/* Identity zone — v41: nudged down closer to the action row on
          request ("about half the distance again"). Previously top:72%/
          height:12% (visual centre ~78%, action row starts at 84% — a
          6-point gap). Bottom edge kept anchored at the same 84% the
          action row already starts at (so this isn't overlapping any
          more than before), but the box is now shorter (78-84% instead
          of 72-84%), which puts its visual centre at 81% — exactly half
          of that original 6-point gap closer to the buttons. Safe to sit
          this much lower now: the orb's own ring geometry was shrunk in
          the prior fix to end at 68%, so there's clear room between it
          and 78%. */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center justify-center text-center px-4"
        style={{ top: "78%", height: "6%" }}
      >
        {inTransition ? (
          <div>
            <div className="text-[10px] tracking-widest text-white/30 font-mono">{delegating ? "DELEGATING" : "ROUTING"}</div>
            <div className={`text-sm font-semibold ${c.text}`}>{agent.name}</div>
            <div className="text-[11px] text-white/30 italic mt-0.5">{delegating ? "Handing off the work..." : "Preparing workspace..."}</div>
          </div>
        ) : isMarcus ? (
          <p className="leading-snug text-sm max-w-[26ch] italic text-[#FF5C33]/80 font-mono">{liveStateLine ?? `"${QUOTE.marcus}"`}</p>
        ) : (
          // v42: the "J.A.R.V.I.S / Just A Really Very Intelligent System"
          // title block is gone entirely, on request, with the freed
          // vertical space handed to the orb itself (grown proportionately
          // — see RING0_WIDTH_PCT/RING0_HEIGHT_PCT in CommandCore.tsx).
          // This was always decorative branding, never this app's only
          // copy of real state: the LH rail header already reads
          // "J.A.R.V.I.S / EXECUTIVE OPERATING SYSTEM" and TopBar carries
          // "OPERATIONAL PICTURE" — so removing it here doesn't drop any
          // actual signal. MARCUS's quote and the routing/delegating
          // transition copy above ARE real state and are untouched.
          null
        )}
      </div>

      {/* Action controls (Section 6: 84-99%) — 5 equal thin-line controls,
          dark translucent surface, subtle cyan border at rest (a
          consistent HUD-chrome colour, not agent-tinted — the active
          agent's own accent shows on hover instead, as the interactive
          state), low-intensity hover glow, never a large filled button.
          v37 (Sprint 20, Section 2): label font-size and padding switched
          from fixed Tailwind spacing (`text-[10px]`, `px-2 py-1.5`) to
          clamp()+cqw values, same panel-relative reasoning as the
          identity text above — "button row size" was one of the
          dimensions this sprint explicitly named as needing to hold
          across screen widths. Icon glyph size (13px) is left as a fixed
          value deliberately: at this scale a couple of px either way
          isn't a visible "drift" the way text/padding is, and lucide's
          `size` prop only takes a plain number, not a CSS length. */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center gap-1.5 px-3"
        style={{ top: "84%", height: "15%" }}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              disabled={action.disabled}
              title={action.disabledTitle}
              onClick={action.onClick}
              className={`flex-1 max-w-[92px] flex flex-col items-center justify-center gap-1 rounded-lg border font-mono transition-colors bg-black/20 backdrop-blur-sm ${
                action.disabled
                  ? "border-white/5 text-white/25 cursor-not-allowed"
                  : action.active
                    ? `${c.hoverBorder} ${c.text} bg-white/5`
                    : `border-cyan-500/20 text-white/60 hover:text-white/90 hover:border-cyan-400/40 hover:bg-white/5`
              }`}
              style={{
                fontSize: "clamp(8px, 1.8cqw, 11px)",
                padding: "clamp(4px, 1.2cqw, 8px) clamp(6px, 1.6cqw, 10px)",
              }}
            >
              <Icon size={13} />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
