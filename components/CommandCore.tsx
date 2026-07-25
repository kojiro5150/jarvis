"use client";

import type { CSSProperties } from "react";
import { SPECIALIST_HEX } from "@/lib/agents/specialist-colors";

export type OrbState =
  | "idle"
  | "thinking"
  | "listening"
  | "speaking"
  | "routing"
  | "synchronising"
  | "delegating"
  | "offline";

/**
 * v32 (Sprint 14, Section 4)/v33 (Sprint 15): the app's actual
 * voice-interaction state, grown to a 5-value model (standby/listening/
 * thinking/speaking/error). DashboardShell derives this once, from the
 * same real `OrbState` this component's `state` prop already reads, and
 * shares it with both the orb and TopBar — see DashboardShell's comment.
 */
export type VoiceState = "standby" | "listening" | "thinking" | "speaking" | "error";

interface CommandCoreAgentLike {
  id: string;
}

interface CommandCoreProps {
  agent: CommandCoreAgentLike;
  state: OrbState;
  /** Defaults to "standby" — every caller in this app passes a real value (see DashboardShell). */
  voiceState?: VoiceState;
  /** Real 0-1 loudness from lib/useMicCapture.ts — only meaningful while `voiceState === "listening"`. Boosts the bloom/glow layer (11). */
  liveAmplitude?: number;
  /**
   * v34 (Sprint 16)/v35 (Sprint 17): no longer controls a single square
   * canvas the way it did through Sprint 16 — this design fills 100% of
   * whatever container OrbCenterpiece gives it (see Section 6's
   * percentage-zone proportions, which need the container's own actual
   * aspect ratio, not a fixed square).
   *
   * v37 (Sprint 20, Section 2): stopped being an absolute px reference
   * frame — the small detail layers (core/bloom blur, LED dots, orbital
   * nodes) are now sized in `cqw` (percentage of the panel's own
   * rendered width via CSS container queries — see `cqwClamp()` below),
   * which is what actually holds correct proportions across different
   * screen widths without re-zooming. `size` is now just a small ratio
   * against `DEFAULT_SIZE` (290) — MARCUS's 230 still renders ~20%
   * smaller than the default, same as before, just as a multiplier on
   * top of the panel-relative base size instead of an absolute px scale.
   */
  size?: number;
}

/**
 * v31 (Sprint 12): per-agent geometric "signature". v35 (Sprint 17): this
 * design doesn't branch on `sig` at all — the holoDepth export's own
 * layer set is identical for every agent, colour-only differentiation
 * (confirmed by Section 5: "Core/glow/accent colours: substitute...
 * consistent with every prior sprint's colour behaviour" — geometry
 * variation isn't mentioned). `sig` stays in CONFIG anyway: it's real
 * data, costs nothing to keep, and Sprint 16's ring/wireframe design
 * (which DID use it) is still sitting in this project's history as a
 * design that could come back.
 */
type Signature = "balanced" | "radar" | "dense" | "ticks" | "ripple" | "hex" | "construction" | "stilled" | "symmetric";

interface SpecialistConfig {
  color: string;
  /** v35 (Sprint 17, Section 5): lighter tint per agent — the export's own CONFIG shape. Flagged honestly in this sprint's summary: Sprint 15's spec proposed these same values but they were never actually added to the codebase then (the plasma design never needed a tint); this is their first real use. Values are Sprint 15/17's own literal hex, unchanged. */
  light: string;
  sig: Signature;
}

const CONFIG: Record<string, SpecialistConfig> = {
  jarvis: { color: SPECIALIST_HEX.jarvis, light: "#B3F5FF", sig: "balanced" },
  dawnwatch: { color: SPECIALIST_HEX.dawnwatch, light: "#FDD98A", sig: "radar" },
  oracle: { color: SPECIALIST_HEX.oracle, light: "#DAC0FB", sig: "dense" },
  gecko: { color: SPECIALIST_HEX.gecko, light: "#A8E8C0", sig: "ticks" },
  herald: { color: SPECIALIST_HEX.herald, light: "#FFC1DF", sig: "ripple" },
  steve: { color: SPECIALIST_HEX.steve, light: "#B8D2FF", sig: "hex" },
  cowork: { color: SPECIALIST_HEX.cowork, light: "#F7F8FA", sig: "construction" },
  marcus: { color: SPECIALIST_HEX.marcus, light: "#FFC2AE", sig: "stilled" },
  phdss: { color: SPECIALIST_HEX.phdss, light: "#FFBFBF", sig: "symmetric" },
};

const OFFLINE_COLOR = "#6B7280";
const OFFLINE_LIGHT = "#9CA3AF";

/** v35 (Sprint 17, Section 5): the export's fixed deep-space background tokens — implemented as plain constants rather than literal CSS custom properties (simpler under React's CSSProperties typing; functionally identical). */
const PANEL_BG = "#020811";
const PANEL_BG_DEEP = "#01050b";

/** v35 (Sprint 17, Section 6): fixed amber HUD accent for alternating LED markers — DAWNWATCH's own canonical hex, reused as a neutral accent the same way the old swarm/token layers reused other agents' hexes as fixed accent colours, not a new ad hoc value. */
const AMBER_ACCENT = SPECIALIST_HEX.dawnwatch;

/**
 * v35 (Sprint 17, Section 2): per-voice-state `speedFactor`, the export's
 * own literal values. Deliberately >1 = faster (dividing a base duration
 * by this), the opposite convention from the old OrbState-driven
 * `speedMul` used by every earlier orb design (<1 = faster) — the two
 * are NOT combined for this design; see the component's header comment
 * for why.
 */
const VOICE_SPEED_FACTOR: Record<VoiceState, number> = {
  standby: 1,
  listening: 1.5,
  thinking: 1.9,
  speaking: 1.5,
  error: 2.6,
};

/** Per-voice-state core/bloom motion — same fields and values as Sprint 15/16's VOICE_MOTION, carried forward unchanged (per Section 2's "extend the table" instruction, not replace it). */
const BASE_MOTION: Record<VoiceState, { pulseDur: number; blobDur: number; glowOpacity: number; waveAmplitude: number }> = {
  standby: { pulseDur: 6, blobDur: 20, glowOpacity: 0.55, waveAmplitude: 0 },
  listening: { pulseDur: 2.4, blobDur: 12, glowOpacity: 0.75, waveAmplitude: 0.35 },
  thinking: { pulseDur: 1.6, blobDur: 8, glowOpacity: 0.7, waveAmplitude: 0 },
  speaking: { pulseDur: 0.9, blobDur: 5, glowOpacity: 0.9, waveAmplitude: 0 },
  error: { pulseDur: 1.1, blobDur: 20, glowOpacity: 0.65, waveAmplitude: 0 },
};

/** `Math.max(min, base / speedFactor)` — the exact "min X, base Y ÷ speedFactor" formula given for every new duration field in Section 2. */
function floored(base: number, min: number, speedFactor: number): number {
  return Math.max(min, base / speedFactor);
}

interface VoiceMotion {
  pulseDur: number;
  blobDur: number;
  glowOpacity: number;
  waveAmplitude: number;
  ringOuterDuration: number;
  ringInnerDuration: number;
  sweepDuration: number;
  hudAccentDuration: number;
  holoTrailDuration: number;
  holoTrailDuration2: number;
}

const VOICE_STATE_KEYS: VoiceState[] = ["standby", "listening", "thinking", "speaking", "error"];

/**
 * v35 (Sprint 17, Section 2): extends Sprint 15/16's 4-field VOICE_MOTION
 * with the 6 duration fields this export actually computes. Built via
 * `floored()` against each state's own `speedFactor` rather than
 * hand-computed decimals, so the formula from the spec ("base ÷
 * speedFactor, floored at min") is legible directly in code and can't
 * silently drift from it via a transcription slip.
 */
const VOICE_MOTION: Record<VoiceState, VoiceMotion> = VOICE_STATE_KEYS.reduce((acc, key) => {
  const sf = VOICE_SPEED_FACTOR[key];
  acc[key] = {
    ...BASE_MOTION[key],
    ringOuterDuration: floored(34, 10, sf),
    ringInnerDuration: floored(24, 8, sf),
    sweepDuration: floored(9, 3, sf),
    hudAccentDuration: floored(16, 6, sf),
    holoTrailDuration: floored(50, 18, sf),
    holoTrailDuration2: floored(42, 16, sf),
  };
  return acc;
}, {} as Record<VoiceState, VoiceMotion>);

/**
 * v35 (Sprint 17, Section 1): the reference frame the export's own ring
 * table is expressed in — ring 0 (640×640) is the outermost ring, and
 * every other ring's w/h is a fraction of that same 640 unit. Rather than
 * guess at the export's literal canvas size (unknown — no file was
 * actually uploaded, same as every prior sprint's "Source: X.html"), this
 * maps ring 0 directly onto Section 6's own target envelope (~57.5% of
 * panel width, ~70.5% of panel height — the midpoints of the given
 * 54-61%/67-74% ranges) and scales every other ring/spoke/tick/node
 * proportionally from there. Because the X and Y scale factors differ
 * (57.5% of width vs 70.5% of height, and width ≠ height on this panel),
 * a plain circle stretched by these two factors renders as an ellipse —
 * which is exactly the pre-computed elliptical foreshortening technique
 * armillary-sphere HUD graphics use to fake a tilted ring in 2D, so the
 * export's own non-square ring dimensions (640×560, 640×460, etc.) and
 * "rotation" column combine with this scaling to produce the intended
 * layered-sphere read without needing true CSS 3D.
 */
const REF_UNIT = 640;
/**
 * v40 (Sprint 20 follow-up #3): shrunk from the original Sprint 17 values
 * (57.5 / 70.5 — of the FULL panel, not just the HUD zone above the
 * identity text). At 70.5%, ring 0's own bottom edge sat at
 * `ORB_CENTER_Y_PCT + 70.5/2` = 78.25% down the panel — well past where
 * OrbCenterpiece's identity zone starts (72%), which is exactly why an
 * orbital node was rendering on top of the "I" in the title in the
 * reported screenshot. Every percentage-based element in this file
 * (rings, spokes, ticks, LEDs, orbital nodes, particles, core, bloom)
 * derives its size/position from these two constants via `refPctX`/
 * `refPctY`, so shrinking them here shrinks the whole assembly
 * proportionally in one place, rather than needing per-element
 * adjustments. New bottom edge: 43 + 50/2 = 68% — 4 points of clearance
 * above the identity zone. New right/left edges: 50 ± 42/2 = 29%/71% —
 * well inside the panel on both sides, not touching the panel edge. This
 * intentionally falls short of Sprint 17 Section 6's original 67-74%-of-
 * panel-height target; that target is what caused the overlap, and
 * "fits without overlapping" is the more fundamental, currently explicit
 * requirement.
 */
/**
 * v42: grown again — the identity title/subtitle block that used to sit
 * at 78-84% of the panel (OrbCenterpiece.tsx) was removed entirely on
 * request, and that freed vertical space was handed to the orb, which is
 * exactly what these two constants control (every percentage-based
 * element in this file scales off them). Bottom edge: 43 + 60/2 = 73% —
 * still comfortably short of the action row (84%) and of MARCUS's quote/
 * the routing-delegating transition text, which still render in that
 * same 78-84% band on the rare states that use it (that copy is real
 * state, not decoration, so it wasn't removed — see OrbCenterpiece.tsx).
 * Top edge: 43 - 30 = 13% — clear of the top-left telemetry readout
 * (~3-6%). Left/right edges: 50 ± 25 = 25%/75% — comfortably inside the
 * panel, same ~0.83 width:height ratio as the prior fit-fix sizing.
 */
const RING0_WIDTH_PCT = 50;
const RING0_HEIGHT_PCT = 60;
const ORB_CENTER_X_PCT = 50;
const ORB_CENTER_Y_PCT = 43;

function refPctX(units: number): number {
  return (units / REF_UNIT) * RING0_WIDTH_PCT;
}
function refPctY(units: number): number {
  return (units / REF_UNIT) * RING0_HEIGHT_PCT;
}

/** A point on the orb's own ellipse envelope at a given reference radius/angle, in 0-100 (percentage-equivalent) coordinates — used for spokes/ticks/LEDs/nodes, all of which need to sit correctly on a non-circular (ellipse-foreshortened) boundary. */
function ellipsePoint(radiusUnits: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: ORB_CENTER_X_PCT + refPctX(radiusUnits) * Math.cos(rad),
    y: ORB_CENTER_Y_PCT + refPctY(radiusUnits) * Math.sin(rad),
  };
}

/** Percentage-based positioning+sizing, centred via `translate(-50%,-50%)` on this wrapper only — the actual rotating/pulsing content goes in a 100%×100% child so its own `transform` (rotate/scale) never fights this wrapper's centring transform. Necessary here (unlike the older px-based `centered()` helper) because CSS `margin` percentages always resolve against the container's *width*, which would mis-centre a percentage-*height* element on this non-square panel. */
function slot(widthPct: number, heightPct: number, centerXPct = ORB_CENTER_X_PCT, centerYPct = ORB_CENTER_Y_PCT): CSSProperties {
  return {
    position: "absolute",
    left: `${centerXPct}%`,
    top: `${centerYPct}%`,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    transform: "translate(-50%, -50%)",
  };
}

/**
 * v35 (Sprint 17, Section 1): the 9 `holoRings`, exact w/h/rotation/
 * thickness from the export's table. `w`/`h` are reference units (see
 * REF_UNIT above); `rotation` is the ring's own static 2D tilt (see the
 * comment on REF_UNIT for why a static `rotate()` on a pre-foreshortened
 * ellipse reads as a tilted armillary-sphere ring); `thick` is true only
 * for ring 0, matching "2px, opacity 0.55" vs every other ring's uniform
 * "1px, opacity 0.32".
 */
const HOLO_RINGS: { w: number; h: number; rotation: number; thick?: boolean }[] = [
  { w: 640, h: 640, rotation: 0, thick: true },
  { w: 640, h: 560, rotation: 15 },
  { w: 640, h: 560, rotation: -15 },
  { w: 640, h: 460, rotation: 45 },
  { w: 640, h: 460, rotation: -45 },
  { w: 600, h: 600, rotation: 8 },
  { w: 560, h: 560, rotation: -8 },
  { w: 400, h: 400, rotation: 0 },
  { w: 320, h: 300, rotation: 25 },
];

/** v35 (Sprint 17, Section 1): 16 radial spokes, evenly spaced every 22.5° — static (a fixed-instrument reticle read), reaching from near the core out to just inside ring 0's edge. */
const SPOKE_COUNT = 16;
const SPOKE_ANGLES = Array.from({ length: SPOKE_COUNT }, (_, i) => (360 / SPOKE_COUNT) * i);
const SPOKE_INNER_RADIUS = 40;
const SPOKE_OUTER_RADIUS = 300;

/** v35 (Sprint 17, Section 1): 48 tick marks, every 7.5°, short radial dashes right at ring 0's edge. */
const TICK_COUNT = 48;
const TICK_ANGLES = Array.from({ length: TICK_COUNT }, (_, i) => (360 / TICK_COUNT) * i);
const TICK_INNER_RADIUS = 288;
const TICK_OUTER_RADIUS = 308;

/** v35 (Sprint 17, Section 1): 6 LED markers at 60° intervals, offset +20°, alternating agent colour / amber accent. */
const LED_ANGLES = [20, 80, 140, 200, 260, 320];
const LED_RADIUS = 300;

/** v35 (Sprint 17, Section 1): 7 orbital nodes at the export's own literal {angle, distance, size}. */
const ORBITAL_NODES = [
  { angle: 15, distance: 300, size: 6 },
  { angle: 70, distance: 230, size: 5 },
  { angle: 130, distance: 270, size: 4 },
  { angle: 190, distance: 250, size: 6 },
  { angle: 240, distance: 300, size: 5 },
  { angle: 300, distance: 220, size: 4 },
  { angle: 340, distance: 260, size: 5 },
];

/**
 * v36 (Sprint 18+19, Section 1): the core + bloom's own reference sizes,
 * in the same REF_UNIT/refPct system as the rings. Previously fixed-px
 * (`46 * scale` for the core, ~`180 * scale` for the bloom), which at
 * this panel's real size rendered the core at roughly 5-8% of panel
 * width — nowhere near Sprint 17 Section 6's ~54-61%/~67-74% target for
 * the orb assembly as a whole. `CORE_REF_UNITS` (200) sits comfortably
 * inside the innermost holoRing (320 units) so the solid sphere reads as
 * "the dominant object the rings surround," not a stray dot; `BLOOM_REF_
 * UNITS` (340) extends just past that same innermost ring so the glow
 * itself is visibly larger than the rings closest to it.
 */
const CORE_REF_UNITS = 200;
const BLOOM_REF_UNITS = 340;

/** v35 (Sprint 17, Section 1): the two extra "orbital ellipse arcs" crossing through the shell (layer 8) — distinct from the 9 static-tilt holoRings, these are the ones actually described as having their own named trail-speed fields (`holoTrailDuration`/`2`). Sizes/tilts chosen to visibly cross the sphere at different angles, deterministic like everything else in this file. */
const HOLO_TRAILS: { w: number; h: number; rotation: number }[] = [
  { w: 560, h: 620, rotation: 35 },
  { w: 620, h: 480, rotation: -55 },
];

/** v35 (Sprint 17, Section 1, layer 2): the back-most, sparse, slow-drifting star field — deliberately NOT agent-tinted (distant space, not the orb itself), unlike every other coloured layer in this file. Deterministic, like every particle table in this project. */
const STAR_COUNT = 26;
const DEEP_STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  angle: (360 / STAR_COUNT) * i + ((i * 47) % 17),
  radius: 340 + ((i * 53) % 260),
  size: 1 + (i % 3),
  opacity: 0.15 + ((i * 11) % 25) / 100,
  duration: 90 + ((i * 19) % 60),
  delay: (i * 3.1) % 30,
}));

/**
 * v37 (Sprint 20, Section 3): a second, further-back star layer — same
 * deterministic generation technique as `DEEP_STARS`, but sparser,
 * uniformly small, dimmer, and noticeably slower, so the two layers
 * drifting at different speeds read as parallax depth rather than one
 * flat field. Same agent-independent treatment as `DEEP_STARS` (distant
 * space, not the orb itself).
 */
const FAR_STAR_COUNT = 18;
const FAR_STARS = Array.from({ length: FAR_STAR_COUNT }, (_, i) => ({
  angle: (360 / FAR_STAR_COUNT) * i + ((i * 29) % 13),
  radius: 460 + ((i * 41) % 340),
  size: 1,
  opacity: 0.06 + ((i * 7) % 14) / 100,
  duration: 160 + ((i * 23) % 90),
  delay: (i * 4.3) % 40,
}));

const PARTICLE_COUNT = 24;
/** v31 (Sprint 12, Section 3): unchanged across every redesign since — reused here as the FOREGROUND particle layer (13), on top rather than underneath, per this design's own layer order. */
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  angle: (360 / PARTICLE_COUNT) * i,
  jitter: ((i * 37) % 40) - 20,
  altA: i % 2 === 0,
  duration: 60 + ((i * 13) % 51),
  delay: (i * 2.7) % 20,
}));

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, startDeg + sweepDeg);
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** left/top/margin centring for small FIXED-pixel elements only (core, LED dots, orbital nodes) — the old technique, still correct for px-sized things since px margins don't have the percentage-resolves-against-width issue `slot()` above exists to avoid. */
function centered(w: number, h: number): CSSProperties {
  return { position: "absolute", left: "50%", top: "50%", width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2 };
}

/**
 * v37 (Sprint 20, Section 2): percentage-of-panel sizing for small
 * "detail" elements (LEDs, orbital nodes, core/bloom glow blur) that
 * previously used a flat `size/520` px scale — that scale was fed by a
 * hardcoded `size` prop (230/290) tuned by eye at one window size, so it
 * never actually changed with the panel's real rendered width; that's
 * this sprint's exact "candidate for drifting wrong on a different
 * screen size" description. `cqw` ties these to the *panel's own*
 * rendered width via CSS container query units — not the viewport —
 * which requires the nearest ancestor to have `container-type:
 * inline-size` set (done on the orb panel wrapper in
 * OrbCenterpiece.tsx, not here — see that file's comment on why it
 * lives there).
 *
 * `PANEL_REF_PX` (520) is the same reference width this file has quoted
 * for these exact detail layers since Sprint 17 (see the old `size`
 * prop doc comment above `CommandCoreProps`) — reused as the
 * denominator so today's already-tuned pixel values convert to `cqw` at
 * the same relative size they've always rendered at, rather than
 * guessing a new baseline. `clamp()` keeps the result from shrinking to
 * an illegible dot on a narrow panel or growing into an oversized blob
 * on a very wide one — these stay ambient detail per Section 3's own
 * "clearly secondary" instruction, not elements that should grow
 * without bound.
 *
 * HONESTY NOTE: Section 2 Step 1 asked for literal on-screen
 * measurements (panel/core/ring/text pixel sizes at 90% zoom) multiplied
 * by 1÷0.9 to get a "true native" 100%-zoom value. This sandbox has no
 * screenshot or rendering tool, so those measurements can't actually be
 * taken — flagged in this sprint's summary rather than presented as
 * done. Percentage/`cqw`-based sizing is used here instead because it's
 * inherently zoom- and width-invariant (a ratio, not a measured
 * constant) — it satisfies Section 4's real pass condition ("no zoom
 * adjustment needed on either" width) without depending on a number
 * this sandbox has no way to measure.
 */
const PANEL_REF_PX = 520;
function cqwClamp(px: number, mult: number): string {
  const scaled = px * mult;
  const pct = (scaled / PANEL_REF_PX) * 100;
  return `clamp(${(scaled * 0.6).toFixed(2)}px, ${pct.toFixed(3)}cqw, ${(scaled * 1.8).toFixed(2)}px)`;
}

/**
 * v37 (Sprint 20, Section 1): true-circle sizing for the core/bloom.
 * Unlike `slot()` (which deliberately produces ellipses for the
 * foreshortened HUD rings — see `REF_UNIT`'s comment on why that's
 * intentional there), this forces `width` and `height` to be exactly
 * equal so the element is always circular no matter what shape the
 * panel itself is.
 *
 * v38 (Sprint 20 follow-up): the first version of this helper set only
 * `width` and let `height` derive from `aspect-ratio: 1 / 1`. That
 * produced a true circle, but the reported "still off-center, shifted
 * down-right by about half the core's own size" turned out to be a real
 * consequence of that choice: `transform: translate(-50%, -50%)`
 * percentages resolve against the element's own border-box, and with
 * `height` only implied via `aspect-ratio` (never an explicit value),
 * the translate didn't reliably resolve against the aspect-ratio-
 * derived box — the element's *top-left corner* ended up sitting at
 * (centerXPct, centerYPct) instead of its centre, which is exactly a
 * half-width/half-height, down-right offset. Fixed by giving `width`
 * and `height` the exact same explicit CSS expression —
 * `min(Ncqw, Ncqh)` (the smaller of N% of the panel's width or N% of
 * its height, in real container-query units) — so both are genuinely
 * equal, definite values before the transform ever runs, the same
 * "explicit width AND height" shape `slot()` already uses successfully
 * for the (correctly-centered, per this same screenshot) rings.
 */
function circleSlot(widthPct: number, centerXPct = ORB_CENTER_X_PCT, centerYPct = ORB_CENTER_Y_PCT): CSSProperties {
  const size = `min(${widthPct}cqw, ${widthPct}cqh)`;
  return {
    position: "absolute",
    left: `${centerXPct}%`,
    top: `${centerYPct}%`,
    width: size,
    height: size,
    transform: "translate(-50%, -50%)",
  };
}

// Overlay coordinate space — kept exactly as the pre-v31 SVG frame it
// always was, since the state-reactive effects below (listening/
// speaking/routing/delegating/thinking/synchronising) are unaffected by
// this sprint's scope, same as every redesign before it.
const CX = 260;
const CY = 260;
const R_SPHERE = 110;
const R_MID_A = 130;
const R_ARC = 95;

/**
 * The cognitive heart of JARVIS — a command-core instrument built as one
 * configurable renderer (see CONFIG above), not nine forked components.
 *
 * v35 (Sprint 17): replaces Sprint 16's ring/wireframe design with the
 * export's "holoDepth" holographic instrument — a deep-space vignette,
 * a distant star field, a perspective grid, 9 armillary-style HUD rings,
 * 16 radial spokes, 48 tick marks, 6 LED markers, a translucent shell
 * with 2 crossing orbital ellipse trails, 7 orbital nodes, a breathing/
 * morphing core, a bloom overlay, a holographic base/platform glow, and
 * a foreground particle + scan-sweep layer — 13 layers back to front,
 * matching the export's own numbered list exactly (see the inline layer
 * comments below for the 1-13 mapping).
 *
 * HONESTY NOTE, same as every prior orb-redesign sprint: no export file
 * was actually uploaded (checked the uploads directory — nothing there,
 * consistent with every "Source: X.html" reference so far in this
 * project). This was built from the fully-transcribed spec in the sprint
 * message, which was unusually exact (literal ring w/h/rotation table,
 * literal node angle/distance/size table, literal duration formulas) —
 * followed as given wherever a literal number existed; genuinely
 * undetermined details (star field layout, exact spoke/tick stroke
 * widths, ellipse-trail tilts, scan-sweep visual treatment) are
 * deterministic, documented judgment calls, flagged as such in this
 * sprint's summary rather than presented as certain.
 *
 * Colour, unchanged principle since Sprint 14: `CONFIG`/`SPECIALIST_HEX`
 * (agent hue) drives every coloured layer here except the deliberately
 * agent-independent star field and amber LED alternation. Voice state
 * (`VOICE_MOTION`) drives motion/glow intensity only, never hue — this
 * export's own `PALETTES[colorTheme][voiceState]` system (including its
 * teal standby/speaking special case) is intentionally not ported, per
 * this sprint's own explicit instruction.
 *
 * Per Section 2's explicit brief ("motion must stay slow, controlled,
 * and premium at every voice state"): every duration in this design is
 * driven ONLY by the new `VOICE_SPEED_FACTOR`/`VOICE_MOTION` system, not
 * compounded with the older `OrbState`-driven `speedMul` every earlier
 * orb design used for its own decorative layers (that multiplier could
 * reach 0.35× — nearly 3× faster — which would directly contradict "no
 * arcade-style animation" if carried into this design). `OrbState`
 * itself still matters — the state-reactive `<svg>` overlay at the
 * bottom (listening sonar/speaking waveform/routing/delegating/offline
 * dimming/thinking amber tint) is unchanged from every prior sprint, for
 * the same reason each time: no orb redesign spec yet has covered these
 * nine `OrbState` values, and dropping that behaviour would be a real
 * regression against this app's "never fabricate" principle.
 *
 * v35 (Sprint 17, Section 3): borderless, full-bleed, same as Sprint 16
 * — no border, no padding, no separate "boxed card" background. The
 * difference from Sprint 16: this design's own deep vignette (`PANEL_BG`/
 * `PANEL_BG_DEEP`) genuinely IS the container's background now (Section
 * 8: "the deep vignette background IS the panel background"), rather
 * than leaving the background fully transparent for the parent panel's
 * generic gradient to show through — still borderless, just with this
 * design's own specific full-bleed background instead of none at all.
 *
 * No specialist token ring (Sprint 15's addition, dropped in Sprint 16
 * and confirmed still dropped here per this sprint's own instruction) —
 * this component is stateless.
 */
/** v37 (Sprint 20, Section 2): the non-MARCUS default `size` value — see the `size` prop's doc comment for why this is now a ratio denominator, not a px reference frame. */
const DEFAULT_SIZE = 290;

export default function CommandCore({ agent, state, voiceState = "standby", liveAmplitude = 0, size = DEFAULT_SIZE }: CommandCoreProps) {
  const config = CONFIG[agent.id] ?? CONFIG.jarvis;
  const offline = state === "offline";
  const color = offline ? OFFLINE_COLOR : config.color;
  const light = offline ? OFFLINE_LIGHT : config.light;
  // v37 (Sprint 20, Section 2): a small ratio against DEFAULT_SIZE (≈1 for
  // the default orb, ≈0.79 for MARCUS), not an absolute px scale — see the
  // `size` prop's doc comment. Feeds `cqwClamp()` below.
  const scale = size / DEFAULT_SIZE;

  const voice = VOICE_MOTION[voiceState];
  const anim = (cls: string) => (offline ? undefined : cls);
  const ampBoost = liveAmplitude * voice.waveAmplitude;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at ${ORB_CENTER_X_PCT}% ${ORB_CENTER_Y_PCT}%, ${PANEL_BG} 0%, ${PANEL_BG_DEEP} 70%, #000000 100%)`,
      }}
      role="img"
      aria-label={`JARVIS command core — ${agent.id} — ${state} — voice ${voiceState}`}
    >
      {/* 2. distant particle/star field — furthest-back layer, agent-independent, sparse and slow */}
      {DEEP_STARS.map((s, i) => {
        const p = ellipsePoint(s.radius, s.angle);
        return (
          <div
            key={i}
            aria-hidden
            className={anim(i % 2 === 0 ? "orb-drift-a" : "orb-drift-b")}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: s.size,
              height: s.size,
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
              borderRadius: "9999px",
              background: "#CFE8FF",
              opacity: s.opacity,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        );
      })}

      {/* v37 (Sprint 20, Section 3): second, further-back particle layer —
           slower drift, smaller, dimmer than DEEP_STARS above, giving a
           parallax depth cue rather than one flat star field. */}
      {FAR_STARS.map((s, i) => {
        const p = ellipsePoint(s.radius, s.angle);
        return (
          <div
            key={`far-${i}`}
            aria-hidden
            className={anim(i % 2 === 0 ? "orb-drift-b" : "orb-drift-a")}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: s.size,
              height: s.size,
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
              borderRadius: "9999px",
              background: "#9FB8D6",
              opacity: s.opacity,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        );
      })}

      {/* v37 (Sprint 20, Section 3): a very faint outermost boundary ring
           near the panel's own edge — reinforces an "instrument housing"
           read without reintroducing a border/box (still borderless,
           full-bleed per the Sprint 13/16/17 carryover rule — this is a
           background-layer element, not a panel border). Uses `slot()`
           (not `circleSlot()`) so it follows the panel's own aspect
           ratio, like the HUD rings do, rather than being a true circle.
           Deliberately static — no animation — and extremely low
           opacity, per Section 3's "barely visible" instruction. */}
      <div
        aria-hidden
        style={{
          ...slot(96, 96),
          borderRadius: "9999px",
          border: `1px solid ${offline ? OFFLINE_COLOR : color}14`,
        }}
      />

      {/* v42: constellation lines — thin, near-invisible connectors between
           a sparse subset of DEEP_STARS (every 3rd star to the one 3
           positions ahead), giving the distant star field a "star-chart"
           read instead of scattered unrelated points. Deterministic (same
           technique as every other particle/line table in this file),
           agent-independent like the stars themselves, and extremely low
           opacity — this is atmosphere, not a new HUD instrument. */}
      {!offline && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 pointer-events-none">
          {DEEP_STARS.map((s, i) => {
            if (i % 3 !== 0) return null;
            const next = DEEP_STARS[(i + 3) % DEEP_STARS.length];
            const a = ellipsePoint(s.radius, s.angle);
            const b = ellipsePoint(next.radius, next.angle);
            return (
              <line
                key={`const-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#9FB8D6"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                opacity="0.05"
              />
            );
          })}
        </svg>
      )}

      {/* v42: corner reticle brackets — small viewfinder-style "L" marks in
           each of the panel's four corners, a common sci-fi HUD idiom for
           "this is an instrument viewport" that's distinct from a boxed
           panel border (two short open-ended strokes per corner, not a
           closed rectangle — still borderless/full-bleed per the Sprint
           13/16 carryover rule). Agent-hued, thin, low opacity, static.
           Positioned well clear of the action-button row (which is
           horizontally centred, not edge-to-edge) so there's no collision
           at the bottom corners. */}
      {!offline && (
        <>
          {([
            ["2%", "1.5%", undefined, undefined, "borderTop", "borderLeft"],
            ["2%", undefined, undefined, "1.5%", "borderTop", "borderRight"],
            [undefined, "1.5%", "2%", undefined, "borderBottom", "borderLeft"],
            [undefined, undefined, "2%", "1.5%", "borderBottom", "borderRight"],
          ] as const).map(([top, left, bottom, right, edgeA, edgeB], i) => (
            <div
              key={i}
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                top,
                left,
                bottom,
                right,
                width: "clamp(14px, 2.2cqw, 22px)",
                height: "clamp(14px, 2.2cqw, 22px)",
                [edgeA]: `1px solid ${color}45`,
                [edgeB]: `1px solid ${color}45`,
              }}
            />
          ))}
        </>
      )}

      {/* v42: a thin vertical scale/ruler along the panel's left edge —
           small tick marks at regular intervals, echoing an instrument
           bezel's measurement scale. Distinct from the orb's own radial
           spokes/ticks (this one's linear, not circular), and confined to
           the orb/HUD field's own vertical band (roughly 10-73%) so it
           doesn't run down into the action-button row. */}
      {!offline && (
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: "1%",
            top: "10%",
            bottom: "30%",
            width: "1px",
            background: `linear-gradient(to bottom, transparent, ${color}30, transparent)`,
          }}
        >
          {Array.from({ length: 9 }, (_, i) => i).map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: `${(i / 8) * 100}%`,
                width: i % 2 === 0 ? "7px" : "4px",
                height: "1px",
                background: `${color}40`,
              }}
            />
          ))}
        </div>
      )}

      {/* 3. perspective grid — converging floor lines toward the orb's own
           centre, static. v36 (Sprint 18+19, Section 2): switched to
           `vectorEffect="non-scaling-stroke"` with a real 1px stroke —
           the viewBox-unit strokeWidth this used before (0.1-0.15 in a
           0-100 space) rendered sub-pixel at the panel's actual size
           regardless of opacity; non-scaling-stroke makes the line
           thickness a real screen pixel value, independent of the
           viewBox-to-panel scale factor, matching how the state-reactive
           overlay's own circles already do this lower in the file.
           Opacity raised into the 0.12-0.22 band — middle of the three
           HUD line layers' visibility hierarchy (spokes faintest, ticks
           most visible). */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          // horizontal "floor" lines, progressively closer together toward the vanishing point (the orb centre) — simple perspective approximation
          const t = i / 5;
          const y = ORB_CENTER_Y_PCT + 30 * t * t + 8;
          const halfW = 46 * (1 - t * 0.55);
          return (
            <line
              key={`h${i}`}
              x1={ORB_CENTER_X_PCT - halfW}
              y1={y}
              x2={ORB_CENTER_X_PCT + halfW}
              y2={y}
              stroke={offline ? OFFLINE_COLOR : color}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              opacity={offline ? 0.06 : 0.22 - i * 0.02}
            />
          );
        })}
        {Array.from({ length: 8 }, (_, i) => (360 / 8) * i).map((deg) => {
          const far = ellipsePoint(420, deg);
          return (
            <line
              key={`r${deg}`}
              x1={ORB_CENTER_X_PCT}
              y1={ORB_CENTER_Y_PCT}
              x2={far.x}
              y2={far.y}
              stroke={offline ? OFFLINE_COLOR : color}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              opacity={offline ? 0.04 : 0.13}
            />
          );
        })}
      </svg>

      {/* 4. outer concentric HUD rings — 9, exact w/h/rotation/thickness, staggered duration (base 46s ÷ speedFactor, +3s per index), alternating direction */}
      {HOLO_RINGS.map((ring, i) => {
        const widthPct = refPctX(ring.w);
        const heightPct = refPctY(ring.h);
        const duration = 46 / VOICE_SPEED_FACTOR[voiceState] + 3 * i;
        const alpha = ring.thick ? "8c" : "52"; // 0.55 / 0.32 opacity, as hex alpha
        const thickness = ring.thick ? 2 : 1;
        return (
          <div key={i} style={slot(widthPct, heightPct)}>
            <div style={{ width: "100%", height: "100%", transform: `rotate(${ring.rotation}deg)` }}>
              <div
                className={anim(i % 2 === 0 ? "orb-spin-cw" : "orb-spin-ccw")}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "9999px",
                  border: `${thickness}px solid ${color}${alpha}`,
                  animationDuration: `${duration}s`,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* 5. radial spokes — 16, static, every 22.5°. v36 (Sprint 18+19,
           Section 2): same non-scaling-stroke fix as the grid — 0.75px
           real stroke, opacity 0.25. Deliberately stays the FAINTEST of
           the three HUD line layers per the sprint's explicit visibility
           hierarchy (spokes < grid < ticks). */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 pointer-events-none">
        {SPOKE_ANGLES.map((deg) => {
          const inner = ellipsePoint(SPOKE_INNER_RADIUS, deg);
          const outer = ellipsePoint(SPOKE_OUTER_RADIUS, deg);
          return (
            <line
              key={deg}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={offline ? OFFLINE_COLOR : color}
              strokeWidth="0.75"
              vectorEffect="non-scaling-stroke"
              opacity={offline ? 0.08 : 0.25}
            />
          );
        })}

        {/* 6. tick markers — 48, every 7.5°, short dashes at the ring's
             edge. v36 (Sprint 18+19, Section 2): 1px real stroke, opacity
             0.35 — the MOST visible of the three HUD line layers, per
             spec ("matching how they read clearly at the ring's edge in
             the reference"). */}
        {TICK_ANGLES.map((deg) => {
          const inner = ellipsePoint(TICK_INNER_RADIUS, deg);
          const outer = ellipsePoint(TICK_OUTER_RADIUS, deg);
          return (
            <line
              key={deg}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={offline ? OFFLINE_COLOR : color}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              opacity={offline ? 0.12 : 0.35}
            />
          );
        })}
      </svg>

      {/* 7. LED markers — 6, at 60° intervals (offset +20°), alternating
           agent colour / amber accent, blinking on hudAccentDuration.
           v36 (Sprint 18+19, Section 2): size 5*scale → 8*scale
           (~4-5px real diameter instead of ~2-3px) and a wider box-shadow
           blur, so the glow itself carries more of the visibility rather
           than relying on the tiny solid dot alone. Pulse range and
           colour alternation unchanged. */}
      {LED_ANGLES.map((deg, i) => {
        const p = ellipsePoint(LED_RADIUS, deg);
        const ledColor = offline ? OFFLINE_COLOR : i % 2 === 0 ? color : AMBER_ACCENT;
        const d = cqwClamp(8, scale);
        return (
          <div key={deg} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}>
            <div
              aria-hidden
              className={anim("orb-pulse-node")}
              style={{
                width: d,
                height: d,
                borderRadius: "9999px",
                background: ledColor,
                boxShadow: offline ? undefined : `0 0 ${cqwClamp(10, scale)} ${ledColor}`,
                animationDuration: `${voice.hudAccentDuration}s`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          </div>
        );
      })}

      {/* 8. translucent spherical shell (soft volumetric fill behind the rings' crossing point) + 2 orbital ellipse trails, on holoTrailDuration/2 */}
      <div
        aria-hidden
        style={{
          ...slot(RING0_WIDTH_PCT * 0.94, RING0_HEIGHT_PCT * 0.94),
          borderRadius: "9999px",
          background: `radial-gradient(ellipse, ${color}14 0%, ${color}06 55%, transparent 80%)`,
        }}
      />
      {HOLO_TRAILS.map((trail, i) => (
        <div key={i} style={slot(refPctX(trail.w), refPctY(trail.h))}>
          <div style={{ width: "100%", height: "100%", transform: `rotate(${trail.rotation}deg)` }}>
            <div
              className={anim(i % 2 === 0 ? "orb-spin-ccw" : "orb-spin-cw")}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "9999px",
                border: `1px solid ${light}40`,
                animationDuration: `${i === 0 ? voice.holoTrailDuration : voice.holoTrailDuration2}s`,
              }}
            />
          </div>
        </div>
      ))}

      {/* 9. orbital nodes — 7, fixed angle/distance/size, pulsing subtly (reuses orbitMul's old role: a peripheral-motion multiplier, now applied to these nodes' pulse pacing rather than a swarm's orbit speed) */}
      {ORBITAL_NODES.map((n, i) => {
        const p = ellipsePoint(n.distance, n.angle);
        const d = cqwClamp(n.size, scale);
        return (
          <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}>
            <div
              aria-hidden
              className={anim("orb-pulse-node")}
              style={{
                width: d,
                height: d,
                borderRadius: "9999px",
                background: offline ? OFFLINE_COLOR : light,
                boxShadow: offline ? undefined : `0 0 ${cqwClamp(6, scale)} ${color}`,
                animationDuration: `${voice.hudAccentDuration}s`,
                animationDelay: `${(i * 0.35) % 2}s`,
              }}
            />
          </div>
        );
      })}

      {/* 12. holographic base/platform — projected ellipse glow beneath the sphere, giving the "hovering above a surface" read. Positioned below the orb's own centre, near the bottom of the HUD field. Pulses on the same pulseDur as the core for one coherent "breathing" read. */}
      {!offline && (
        <div
          aria-hidden
          className="orb-core-breathe"
          style={{
            ...slot(RING0_WIDTH_PCT * 0.62, RING0_HEIGHT_PCT * 0.1, ORB_CENTER_X_PCT, ORB_CENTER_Y_PCT + RING0_HEIGHT_PCT * 0.42),
            borderRadius: "9999px",
            background: `radial-gradient(ellipse, ${color}33 0%, transparent 75%)`,
            animationDuration: `${voice.pulseDur * 1.4}s`,
          }}
        />
      )}

      {/* 11. bloom/glow overlay — soft outer glow behind the core, opacity
           responsive to voice state + real liveAmplitude while actually
           listening. v36 (Sprint 18+19, Section 1): switched from fixed
           px (`centered()`) to percentage sizing so the glow scales with
           the panel the way the rings already do, and the gradient's own
           embedded alpha raised from `30` (~19%) to `55` (~33%) —
           `glowOpacity`'s 0.55-0.9 multiplier was compounding with that
           low base alpha to land as low as ~10% effective opacity at the
           brightest point. v37 (Sprint 20, Section 1): switched from
           `slot(refPctX(N), refPctY(N))` (two DIFFERENT width/height
           percentage bases — correct for the foreshortened rings, but on
           a non-square panel that stretches a "circle" into an ellipse)
           to `circleSlot()`, which locks height to width via
           `aspect-ratio: 1/1` so this is always a true circle regardless
           of the panel's own aspect ratio. `ampBoost` still scales the
           envelope size directly (percentage growth) rather than adding
           flat px. */}
      {!offline && (
        <div
          aria-hidden
          className={`pointer-events-none${voiceState === "error" ? " orb-error-flicker" : ""}`}
          style={{
            ...circleSlot(refPctX(BLOOM_REF_UNITS) * (1 + ampBoost * 0.25)),
            borderRadius: "9999px",
            background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
            opacity: voice.glowOpacity + ampBoost * 0.3,
          }}
        />
      )}

      {/* 10. central core — breathing pulse (pulseDur), agent-coloured,
           double bloom via box-shadow. v36 (Sprint 18+19, Section 1):
           switched from fixed px to percentage sizing (`CORE_REF_UNITS`)
           — this was the single biggest gap against the reference: a
           tiny dot instead of the dominant glowing sphere the rings
           surround. Box-shadow blur radii increased substantially so the
           bloom carried by the core's own glow is actually visible
           against the rings.
           v37 (Sprint 20, Section 1): TWO compounding bugs fixed here.
           (1) Same ellipse bug as the bloom above — `slot(refPctX(N),
           refPctY(N))` used different width-% and height-% bases, so on
           this panel's real (non-square) aspect ratio the core rendered
           as a wide ellipse, not a circle. Now uses `circleSlot()`.
           (2) The inner div still carried the `orb-blob-morph` class —
           a leftover from the Sprint 14 plasma-core-and-swarm design,
           whose keyframes animate `border-radius` through asymmetric
           per-corner percentages (e.g. `42% 58% 63% 37% / 41% 44% 56%
           59%`) to fake an organic, lava-lamp-like blob. That's the
           right effect for a plasma blob; it's the wrong effect for
           holoDepth's "breathing sphere" core, and a running CSS
           animation overrides a static inline `border-radius` for as
           long as it's playing — so the core was never actually a
           circle at any point in its cycle, which reads as "egg-shaped
           and drifting off to one side" exactly as reported. Removed;
           the outer wrapper's existing `orb-talk-pulse` (a uniform
           `scale()`, which preserves circularity) still gives the core
           its breathing motion. `voice.blobDur` is no longer consumed
           here — left in `VOICE_MOTION` since it costs nothing to keep
           and a future design could still use it, same as `sig`. */}
      <div aria-hidden style={circleSlot(refPctX(CORE_REF_UNITS))}>
        {/* v39 (Sprint 20 follow-up #2): the actual, previously-undiagnosed
             cause of "still off-center by about half the core's own size."
             A running CSS animation on `transform` REPLACES that
             property's value outright for as long as it plays — it does
             NOT compose with a separate static `transform` declared on
             the same element. The outer div above centers itself via
             `circleSlot()`'s `transform: translate(-50%, -50%)`; if
             `orb-talk-pulse` (which animates `transform: scale(...)`) had
             been on that SAME div — which it was, in every version before
             this one — the animation silently discarded the centering
             translate for the entire time it ran (always, since it's
             `infinite`), leaving the box's top-left corner sitting at the
             target point instead of its centre. Neither the earlier
             aspect-ratio fix nor the min(cqw,cqh) fix touched this at
             all — they fixed the core's SHAPE (confirmed: it renders as a
             true circle in both follow-up screenshots), but this
             transform collision is what was actually causing the
             POSITION bug the whole time. Every other animated+positioned
             element in this file (LEDs, orbital nodes, HUD rings) already
             avoids this by splitting static positioning and animated
             transform across two different elements — this brings the
             core in line with that same already-proven pattern. */}
        <div
          className={anim("orb-talk-pulse")}
          style={{ position: "absolute", inset: 0, animationDuration: offline ? undefined : `${voice.pulseDur}s` }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "9999px",
              background: offline ? color : `radial-gradient(circle at 35% 35%, ${light}, ${color} 70%)`,
              boxShadow: offline
                ? undefined
                : `0 0 ${cqwClamp(34, scale)} ${color}, 0 0 ${cqwClamp(72, scale)} ${color}77`,
            }}
          />
        </div>
      </div>

      {/* 13. foreground particles (reused unchanged particle table, now rendered on top per this design's own layer order) + a faint scan sweep crossing the sphere periodically */}
      {PARTICLES.map((p, i) => {
        const pos = polar(0, 0, refPctX(170) + p.jitter * 0.06, p.angle);
        return (
          <div
            key={i}
            aria-hidden
            className={anim(p.altA ? "orb-drift-a" : "orb-drift-b")}
            style={{
              position: "absolute",
              left: `${ORB_CENTER_X_PCT + pos.x}%`,
              top: `${ORB_CENTER_Y_PCT + pos.y * (RING0_HEIGHT_PCT / RING0_WIDTH_PCT)}%`,
              width: 2 * scale,
              height: 2 * scale,
              marginLeft: -scale,
              marginTop: -scale,
              borderRadius: "9999px",
              background: color,
              opacity: offline ? 0.06 : 0.24,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        );
      })}
      {!offline && (
        <div aria-hidden className="overflow-hidden pointer-events-none" style={slot(RING0_WIDTH_PCT * 0.9, RING0_HEIGHT_PCT * 0.96)}>
          <div
            className="orb-scan-sweep"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "4%",
              background: `linear-gradient(90deg, transparent, ${light}55, transparent)`,
              animationDuration: `${voice.sweepDuration}s`,
            }}
          />
        </div>
      )}

      {/* v37 (Sprint 20, Section 3): a second, much fainter scan sweep
           spanning the FULL panel — not just the sphere's own zone like
           the one directly above — for an ambient "active sensor" read
           across the whole instrument. Reuses the existing `orb-scan-
           sweep` keyframe (already generic: animates `top`/`opacity`)
           rather than adding a near-duplicate one. Runs on a slow, fixed
           12-18s cycle (15s) independent of voice state, since Section 3
           doesn't ask for voice-reactivity here the way the sphere-scoped
           sweep has; opacity is deliberately much lower than that sweep
           so this one stays secondary. */}
      {!offline && (
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="orb-scan-sweep"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "6%",
              background: `linear-gradient(90deg, transparent, ${color}12, transparent)`,
              animationDuration: "15s",
            }}
          />
        </div>
      )}

      {/* v37 (Sprint 20, Section 3): small corner telemetry readouts —
           purely decorative "instrument bezel" chrome, matching the thin
           mono-font HUD aesthetic used everywhere else in this design.
           Content is deliberately real, existing internal state (agent
           id, `config.sig`, `state`, `voiceState`, the reference-frame
           constants) reformatted as HUD text — not an invented sensor
           reading. This app has a standing "never fabricate data" rule;
           showing a fake live telemetry number here would violate it, so
           this only ever displays values the app already actually has,
           the same way TopBar's "VOICE: ..." readout does. Kept small,
           low-contrast, and clearly secondary to the orb itself.
           v38 (Sprint 20 follow-up): the bottom-right readout moved from
           `bottom-[3%]` to `top-[64%]` — CommandCore fills the FULL orb
           panel (0-100%), but OrbCenterpiece's action-button row sits at
           84-99% of that same panel, so a literal bottom-edge position
           was rendering underneath/behind the buttons, visible as
           overlapping text in the reported screenshot. `top-[64%]` sits
           just above the identity zone (which starts at 72%), clear of
           both it and the buttons below. */}
      {!offline && (
        <>
          <div
            aria-hidden
            className="absolute top-[3%] left-[3%] font-mono uppercase pointer-events-none leading-tight"
            style={{ fontSize: "clamp(7px, 1cqw, 10px)", color: `${color}55`, letterSpacing: "0.08em" }}
          >
            J.A.R.V.I.S // {agent.id.toUpperCase()}
            <br />
            SIG&nbsp;{config.sig.toUpperCase()}&nbsp;·&nbsp;{state.toUpperCase()}
          </div>
          <div
            aria-hidden
            className="absolute top-[64%] right-[3%] overflow-hidden font-mono uppercase pointer-events-none"
            style={{ fontSize: "clamp(7px, 1cqw, 10px)", color: `${color}40`, letterSpacing: "0.08em", maxWidth: "34%" }}
          >
            <span className="inline-block whitespace-nowrap orb-telemetry-scroll">
              {`REF·${REF_UNIT} · ORB·${ORB_CENTER_X_PCT}.${ORB_CENTER_Y_PCT} · VOICE·${voiceState.toUpperCase()} · REF·${REF_UNIT} · ORB·${ORB_CENTER_X_PCT}.${ORB_CENTER_Y_PCT} · VOICE·${voiceState.toUpperCase()} · `}
            </span>
          </div>
        </>
      )}

      {/*
        State-reactive overlay — unchanged from Sprint 12 through every
        redesign since, including this one (see the big comment above the
        component for why). Its own coordinate space (CX/CY=260 in a 520
        viewBox) is independent of every percentage-based layer above.
      */}
      <svg viewBox="0 0 520 520" width="100%" height="100%" className="absolute inset-0 pointer-events-none">
        {state === "synchronising" && !offline && (
          <circle
            cx={CX}
            cy={CY}
            r={R_MID_A + 60}
            fill="none"
            stroke="#22C55E"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="3 12"
            opacity="0.4"
            className="orb-rotate"
            style={{ animationDuration: "18s" }}
          />
        )}

        {state === "listening" && (
          <>
            <circle cx={CX} cy={CY} r={R_SPHERE} fill="none" stroke="#2DD4BF" strokeWidth="2" vectorEffect="non-scaling-stroke" className="animate-ping motion-reduce:animate-none" opacity="0.45" />
            <circle cx={CX} cy={CY} r={R_SPHERE} fill="none" stroke="#22D3EE" strokeWidth="2" vectorEffect="non-scaling-stroke" className="animate-ping motion-reduce:animate-none" style={{ animationDelay: "0.6s" }} opacity="0.3" />
          </>
        )}

        {state === "speaking" &&
          [0, 0.12, 0.24, 0.12, 0].map((delay, i) => (
            <rect key={i} x={CX - 24 + i * 12} y={CY - 14} width="4" height="28" rx="2" fill={color} className="orb-wave" style={{ animationDuration: "0.9s", animationDelay: `${delay}s` }} />
          ))}

        {state === "routing" && (
          <>
            <circle cx={CX} cy={CY} r={R_MID_A} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" className="orb-ripple" style={{ animationDuration: "1.1s" }} />
            <path d={arcPath(CX, CY, R_ARC, 190, 40)} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" className="orb-travel-route" style={{ animationDuration: "0.8s" }} />
          </>
        )}

        {state === "delegating" && (
          <>
            <circle cx={CX} cy={CY} r={230} fill={color} className="orb-flash" style={{ animationDuration: "0.15s" }} />
            <circle cx={CX} cy={CY} r="7" fill="#00E6FF" className="orb-travel-delegate" style={{ animationDuration: "0.7s" }} />
            <circle cx={CX} cy={CY} r="7" fill={color} className="orb-travel-delegate" style={{ animationDuration: "0.7s", animationDelay: "0.15s" }} />
          </>
        )}

        {config.sig === "symmetric" && state === "routing" && (
          <path d={arcPath(CX, CY, R_ARC, 190, 40)} fill="none" stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.5" />
        )}
      </svg>
    </div>
  );
}
