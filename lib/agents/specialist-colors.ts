/**
 * v25 Sprint 7, Section 1: the single canonical colour token per
 * specialist — raw hex, for contexts that can't use Tailwind's static
 * class strings (SVG `stroke`/`fill` in CommandCore, inline styles in
 * AgentRail). `lib/agents/accent.ts` is the Tailwind-class counterpart
 * for text/border/bg utility classes; its hex literals are kept in sync
 * with this table by hand (Tailwind's JIT scanner needs literal static
 * strings in that file, so it can't import these constants directly —
 * see the comment at the top of accent.ts). If you change a colour here,
 * change the matching literal there too.
 *
 * Source: v16 spec Section A, reconciled with the pre-existing per-agent
 * hexes already in accent.ts and CommandCore.tsx's own CONFIG map (which
 * were already very close).
 *
 * v31 (Sprint 12, Section 1): HERALD and MARCUS corrected against the
 * Claude Design orb export's CONFIG, called out explicitly as the
 * authoritative source ("previous docs had HERALD and MARCUS wrong"):
 *   - HERALD: `#66F0FF` (JARVIS cyan tinted toward white) → `#FF4FA0`
 *     (a distinct pink/magenta — HERALD is its own hue after all, paired
 *     with the 'ripple' signature).
 *   - MARCUS: `#C9A24B` (gold) → `#FF5C33` (orange-red), paired with the
 *     'stilled' signature.
 */
export const SPECIALIST_HEX: Record<string, string> = {
  jarvis: "#00E6FF",
  dawnwatch: "#F59E0B",
  oracle: "#A85FF7",
  gecko: "#22CC5E",
  herald: "#FF4FA0",
  steve: "#2D7BFF",
  cowork: "#E6E9EF",
  marcus: "#FF5C33",
  phdss: "#FF4444",
};

export function specialistHex(agentId: string): string {
  return SPECIALIST_HEX[agentId] ?? SPECIALIST_HEX.jarvis;
}

/**
 * Small, deterministic rotation used anywhere multiple specialist colours
 * need to appear together at once (currently: CommandCore's foreground
 * orb nodes) — never `Math.random()`, always the same order every
 * render. This is explicitly stylized/ambient, not a claim that any
 * given node represents a specific specialist's live data; see the
 * comment at the node-rendering call site in CommandCore.tsx.
 */
export const NODE_COLOR_ROTATION: string[] = [
  SPECIALIST_HEX.jarvis,
  SPECIALIST_HEX.oracle,
  SPECIALIST_HEX.dawnwatch,
  SPECIALIST_HEX.gecko,
];
