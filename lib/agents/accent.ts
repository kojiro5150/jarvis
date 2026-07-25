import type { AgentAccent } from "./types";

/**
 * Tailwind needs full, static class strings to pick them up at build time —
 * so instead of building class names dynamically (`text-${accent}-400`),
 * every accent maps to a fixed bundle of classes here.
 *
 * Phase 2.7 (v17 spec) switched the nine active tokens (cyan/amber/
 * violet/emerald/teal/blue/white/gold/red) from Tailwind's named
 * palette to the spec's exact hex values, via Tailwind's arbitrary-value
 * syntax (`text-[#00E0FF]`) — still fully static strings, so JIT picks
 * them up the same way. rose/fuchsia/slate are legacy tokens from an
 * earlier accent set, kept only so AgentAccent's type doesn't need a
 * breaking change; nothing currently uses them.
 */
export interface AccentClasses {
  text: string;
  textDim: string;
  border: string;
  /** Static hover-state variant of `border` — see the note above about why this can't be built dynamically. */
  hoverBorder: string;
  bg: string;
  bgSoft: string;
  ring: string;
  glow: string;
  dot: string;
}

const ACCENT_MAP: Record<AgentAccent, AccentClasses> = {
  // JARVIS — #00E6FF (v25: aligned to lib/agents/specialist-colors.ts's canonical table)
  cyan: {
    text: "text-[#00E6FF]",
    textDim: "text-[#00E6FF]/70",
    border: "border-[#00E6FF]/40",
    hoverBorder: "hover:border-[#00E6FF]/40",
    bg: "bg-[#00E6FF]/10",
    bgSoft: "bg-[#00E6FF]/5",
    ring: "ring-[#00E6FF]/40",
    glow: "shadow-[0_0_20px_rgba(0,230,255,0.35)]",
    dot: "bg-[#00E6FF]",
  },
  // ORACLE — #A85FF7 (v25: aligned to specialist-colors.ts)
  violet: {
    text: "text-[#A85FF7]",
    textDim: "text-[#A85FF7]/70",
    border: "border-[#A85FF7]/40",
    hoverBorder: "hover:border-[#A85FF7]/40",
    bg: "bg-[#A85FF7]/10",
    bgSoft: "bg-[#A85FF7]/5",
    ring: "ring-[#A85FF7]/40",
    glow: "shadow-[0_0_20px_rgba(168,95,247,0.35)]",
    dot: "bg-[#A85FF7]",
  },
  // DAWNWATCH — #F59E0B
  amber: {
    text: "text-[#F59E0B]",
    textDim: "text-[#F59E0B]/70",
    border: "border-[#F59E0B]/40",
    hoverBorder: "hover:border-[#F59E0B]/40",
    bg: "bg-[#F59E0B]/10",
    bgSoft: "bg-[#F59E0B]/5",
    ring: "ring-[#F59E0B]/40",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
    dot: "bg-[#F59E0B]",
  },
  // GECKO — #22CC5E (v25: aligned to specialist-colors.ts)
  emerald: {
    text: "text-[#22CC5E]",
    textDim: "text-[#22CC5E]/70",
    border: "border-[#22CC5E]/40",
    hoverBorder: "hover:border-[#22CC5E]/40",
    bg: "bg-[#22CC5E]/10",
    bgSoft: "bg-[#22CC5E]/5",
    ring: "ring-[#22CC5E]/40",
    glow: "shadow-[0_0_20px_rgba(34,204,94,0.35)]",
    dot: "bg-[#22CC5E]",
  },
  // legacy, unused
  rose: {
    text: "text-rose-300",
    textDim: "text-rose-400/70",
    border: "border-rose-400/40",
    hoverBorder: "hover:border-rose-400/40",
    bg: "bg-rose-400/10",
    bgSoft: "bg-rose-400/5",
    ring: "ring-rose-400/40",
    glow: "shadow-[0_0_20px_rgba(251,113,133,0.35)]",
    dot: "bg-rose-400",
  },
  // STEVE — #2D7BFF (v25: aligned to specialist-colors.ts)
  blue: {
    text: "text-[#2D7BFF]",
    textDim: "text-[#2D7BFF]/70",
    border: "border-[#2D7BFF]/40",
    hoverBorder: "hover:border-[#2D7BFF]/40",
    bg: "bg-[#2D7BFF]/10",
    bgSoft: "bg-[#2D7BFF]/5",
    ring: "ring-[#2D7BFF]/40",
    glow: "shadow-[0_0_20px_rgba(45,123,255,0.35)]",
    dot: "bg-[#2D7BFF]",
  },
  // legacy, unused
  fuchsia: {
    text: "text-fuchsia-300",
    textDim: "text-fuchsia-400/70",
    border: "border-fuchsia-400/40",
    hoverBorder: "hover:border-fuchsia-400/40",
    bg: "bg-fuchsia-400/10",
    bgSoft: "bg-fuchsia-400/5",
    ring: "ring-fuchsia-400/40",
    glow: "shadow-[0_0_20px_rgba(232,121,249,0.35)]",
    dot: "bg-fuchsia-400",
  },
  // legacy, unused
  slate: {
    text: "text-slate-300",
    textDim: "text-slate-400/70",
    border: "border-slate-400/40",
    hoverBorder: "hover:border-slate-400/40",
    bg: "bg-slate-400/10",
    bgSoft: "bg-slate-400/5",
    ring: "ring-slate-400/40",
    glow: "shadow-[0_0_20px_rgba(148,163,184,0.35)]",
    dot: "bg-slate-400",
  },
  // HERALD — #FF4FA0 (v31 Sprint 12: corrected against the Claude Design orb export — a distinct pink/magenta, not a cyan tint. Identifier key stays "teal" to avoid an unrelated type-level rename; only the hex values changed.)
  teal: {
    text: "text-[#FF4FA0]",
    textDim: "text-[#FF4FA0]/70",
    border: "border-[#FF4FA0]/40",
    hoverBorder: "hover:border-[#FF4FA0]/40",
    bg: "bg-[#FF4FA0]/10",
    bgSoft: "bg-[#FF4FA0]/5",
    ring: "ring-[#FF4FA0]/40",
    glow: "shadow-[0_0_20px_rgba(255,79,160,0.35)]",
    dot: "bg-[#FF4FA0]",
  },
  // MARCUS — #FF5C33 (v31 Sprint 12: corrected against the Claude Design orb export — orange-red, not gold. Identifier key stays "gold" for the same reason as HERALD's "teal" above.)
  gold: {
    text: "text-[#FF5C33]",
    textDim: "text-[#FF5C33]/70",
    border: "border-[#FF5C33]/40",
    hoverBorder: "hover:border-[#FF5C33]/40",
    bg: "bg-[#FF5C33]/10",
    bgSoft: "bg-[#FF5C33]/5",
    ring: "ring-[#FF5C33]/40",
    glow: "shadow-[0_0_20px_rgba(255,92,51,0.35)]",
    dot: "bg-[#FF5C33]",
  },
  // PHDSS — #FF4444 (v25: aligned to specialist-colors.ts)
  red: {
    text: "text-[#FF4444]",
    textDim: "text-[#FF4444]/70",
    border: "border-[#FF4444]/40",
    hoverBorder: "hover:border-[#FF4444]/40",
    bg: "bg-[#FF4444]/10",
    bgSoft: "bg-[#FF4444]/5",
    ring: "ring-[#FF4444]/40",
    glow: "shadow-[0_0_20px_rgba(255,68,68,0.35)]",
    dot: "bg-[#FF4444]",
  },
  // CO-WORK — #E6E9EF (v25: aligned to specialist-colors.ts)
  white: {
    text: "text-[#E6E9EF]",
    textDim: "text-[#E6E9EF]/60",
    border: "border-[#E6E9EF]/30",
    hoverBorder: "hover:border-[#E6E9EF]/30",
    bg: "bg-[#E6E9EF]/10",
    bgSoft: "bg-[#E6E9EF]/5",
    ring: "ring-[#E6E9EF]/30",
    glow: "shadow-[0_0_20px_rgba(230,233,239,0.2)]",
    dot: "bg-[#E6E9EF]",
  },
};

export function accentClasses(accent: AgentAccent): AccentClasses {
  return ACCENT_MAP[accent];
}
