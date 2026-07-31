"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AgentRail from "@/components/AgentRail";
import TopBar from "@/components/TopBar";
import MemoryEditor from "@/components/MemoryEditor";
import OrbCenterpiece from "@/components/dashboard/OrbCenterpiece";
import ConversationDock from "@/components/dashboard/ConversationDock";
import StatusStrip from "@/components/dashboard/StatusStrip";
import BootSequence from "@/components/dashboard/BootSequence";
import type { OrbState, VoiceState } from "@/components/CommandCore";
import { getAgent } from "@/lib/agents";
import { useOperationalState } from "@/lib/useOperationalState";
import { useAgentConversation } from "@/lib/useAgentConversation";
import { useMicCapture } from "@/lib/useMicCapture";
import { buildProductionDashboardPresentation, type DashboardPresentationMode } from "@/lib/dashboard-presentation-selection";

/**
 * v27 (Sprint 9): a genuine product-shape change, not a visual pass. The
 * page is now a two-region command console rather than a four-column
 * dashboard: AgentRail (left — nine constitutional specialists, then a
 * compact System Status readout, then the footer) | a single wide centre
 * area (Orb, StatusStrip, Mission Workspace). The RH column (RightRail)
 * is gone entirely — Suggested Actions and Ambient Intelligence were cut
 * outright (see the audit note above StatusStrip's import site / the v27
 * summary for what was confirmed recoverable elsewhere), System Status
 * moved into the rail, and Projects/Calendar/Communications collapsed
 * from three cards into StatusStrip's single line. Nothing replaces the
 * RH column's width — the centre area (Orb panel, StatusStrip, Mission
 * Workspace) simply reclaims it, since both are already fluid (`flex-1`)
 * rather than fixed-width.
 *
 * Interaction model unchanged across every redesign pass: the center
 * column is JARVIS's overall operational view and never changes based on
 * which agent is selected — only which agent the ConversationDock is
 * talking to changes. `useAgentConversation` is lifted here so the orb,
 * the dock, and the rail all share one source of truth for
 * loading/listening/error rather than each re-deriving it.
 *
 * A brief, real "routing" transition plays when Sam switches specialists
 * (setSelectedId actually changed, not a fabricated animation) — the orb
 * shows a ROUTING stance for ~700ms before settling into the newly
 * selected specialist's idle state.
 */
export default function DashboardShell({ presentationMode }: { presentationMode: DashboardPresentationMode }) {
  const [selectedId, setSelectedId] = useState("jarvis");
  const [presetText, setPresetText] = useState("");
  const [presetNonce, setPresetNonce] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  // v33 (Sprint 15): renamed from `listening` — this is specifically the
  // "conversation input is focused" signal (unchanged from every prior
  // sprint). The real mic (`mic.active`, below) is a second, independent
  // way to actually be listening; `listening` (further down) ORs the two
  // together for anything that just needs "is the user talking to it
  // right now" without caring which channel.
  const [inputListening, setInputListening] = useState(false);
  const [transition, setTransition] = useState<"routing" | "delegating" | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const { data: operationalState, loading: syncing, refresh } = useOperationalState();
  const governedPresentation = useMemo(
    () => presentationMode === "GOVERNED" ? buildProductionDashboardPresentation(operationalState) : undefined,
    [operationalState, presentationMode],
  );
  // v33 (Sprint 15, Section 3): the app's one real mic-capture pipeline —
  // see lib/useMicCapture.ts for why this is the sole place audio
  // permission/capture lives (no other voice/STT pipeline exists
  // elsewhere in the app). Wired to OrbCenterpiece's Voice quick action.
  const mic = useMicCapture();

  const agent = getAgent(selectedId);
  const { messages, loading, error, send, reset } = useAgentConversation(agent);

  const routingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  const prevAgentId = useRef(selectedId);
  const prevLoading = useRef(false);

  useEffect(() => {
    // Skip the very first render — routing is a real transition between
    // two specialists, not something to play on initial page load.
    if (!mounted.current) {
      mounted.current = true;
      prevAgentId.current = selectedId;
      return;
    }
    // A real, derivable distinction: JARVIS handing work off to a
    // specialist reads as "delegating"; any other switch (specialist to
    // specialist, or back to JARVIS) reads as "routing" — both come from
    // which two agents were actually involved, nothing fabricated.
    const kind = prevAgentId.current === "jarvis" && selectedId !== "jarvis" ? "delegating" : "routing";
    prevAgentId.current = selectedId;
    setTransition(kind);
    if (routingTimer.current) clearTimeout(routingTimer.current);
    routingTimer.current = setTimeout(() => setTransition(null), 700);
    return () => {
      if (routingTimer.current) clearTimeout(routingTimer.current);
    };
  }, [selectedId]);

  useEffect(() => {
    // "Speaking" is a brief, real flash for the moment a reply actually
    // arrives — loading just ended and there's no error, meaning the
    // assistant's message genuinely just landed. Never fires on its own;
    // always tied to a real request finishing successfully.
    const wasLoading = prevLoading.current;
    prevLoading.current = loading;
    if (wasLoading && !loading && !error) {
      setSpeaking(true);
      if (speakingTimer.current) clearTimeout(speakingTimer.current);
      speakingTimer.current = setTimeout(() => setSpeaking(false), 1400);
    }
    return () => {
      if (speakingTimer.current) clearTimeout(speakingTimer.current);
    };
  }, [loading, error]);

  function handleQuickCommand(text: string) {
    setPresetText(text);
    setPresetNonce((n) => n + 1);
  }

  // v33 (Sprint 15): real mic capture is a second, independent way to
  // actually be "listening" alongside plain input focus — see the
  // `inputListening` comment above for why the two are ORed together
  // rather than the mic replacing the input-focus signal.
  const listening = inputListening || mic.active;

  const synchronising = !transition && !loading && syncing;

  /**
   * v32 (Sprint 14, Section 4) / v33 (Sprint 15): the single OrbState
   * source of truth. Previously computed inside OrbCenterpiece from six
   * separate booleans passed down to it; now computed once, here, from
   * the exact same six real signals this component already owns, and
   * passed straight into OrbCenterpiece as a single prop instead —
   * closing the last gap Sprint 14's own comment on this called out
   * ("since both the orb and potentially the 'VOICE: STANDBY' text ...
   * should read from the same state rather than tracking it
   * independently") but hadn't fully finished: `orbState` itself was
   * still being independently re-derived in two places (nowhere else
   * needed it before this sprint's TOKEN ring / VOICE_MOTION additions
   * made a single, shared computation clearly worth doing).
   */
  const orbState: OrbState = transition === "routing"
    ? "routing"
    : transition === "delegating"
      ? "delegating"
      : loading
        ? "thinking"
        : error
          ? "offline"
          : synchronising
            ? "synchronising"
            : speaking
              ? "speaking"
              : listening
                ? "listening"
                : "idle";

  /**
   * v33 (Sprint 15, Section 3): the app's 5-state voice model, derived
   * from `orbState` above (not re-derived from the raw booleans a second
   * time) so it can never drift from "what OrbState actually is". Mic
   * permission failures are folded in here specifically (not into
   * `orbState`/the SVG overlay) because Section 1's decision was that
   * voice state governs motion/glow only — a mic error shouldn't dim the
   * whole orb into the pre-existing "offline" visual language (that's
   * reserved for real chat/connector failures), it should just make the
   * existing agent-coloured glow flicker. See CommandCore's
   * VOICE_MOTION/orb-error-flicker for where that plays out.
   */
  const voiceState: VoiceState = mic.error
    ? "error"
    : orbState === "offline"
      ? "error"
      : orbState === "listening"
        ? "listening"
        : orbState === "thinking" || orbState === "routing" || orbState === "delegating" || orbState === "synchronising"
          ? "thinking"
          : orbState === "speaking"
            ? "speaking"
            : "standby";

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {booting && (
        <BootSequence operationalState={operationalState} onComplete={() => setBooting(false)} />
      )}

      <AgentRail
        selectedId={selectedId}
        onSelect={setSelectedId}
        operationalState={operationalState}
        activeLoading={loading}
        connectorStatuses={operationalState.connectorStatuses}
        onOpenMemoryEditor={() => setEditorOpen(true)}
        // v43: Disconnect is a real state change (deletes the stored
        // Google token file server-side) — this re-runs the same
        // `refresh()` the memory editor already uses after a save, so
        // Calendar/Gmail/Drive's rows update immediately instead of
        // waiting for whatever triggers the next natural refresh.
        onConnectorsChanged={refresh}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar operationalState={operationalState} voiceState={voiceState} />

        {/*
          Orb scroll region — its own scroll container, sized elastically
          between TopBar and the StatusStrip/dock below. Never moved by
          the conversation dock, no matter how much chat history grows
          in there.

          v29 (Sprint 11, Section 2): `flex-[1.7]` against
          ConversationDock's `flex-1` (below) is what makes the Orb panel
          "the dominant element" — of the height left over after TopBar
          and StatusStrip's fixed chrome, the orb region gets 1.7/2.7
          (~63%) and the dock gets 1/2.7 (~37%), landing in the spec's
          ~55-60% / ~30-35% target band once TopBar/StatusStrip's own
          share of the total is accounted for. OrbCenterpiece itself is
          `h-full` now (see its own v29 comment) so it actually fills
          this, rather than being a fixed pixel value that happened to
          look right at one viewport size.
        */}
        <div className="flex-[1.7] min-h-0 overflow-y-auto px-5 pt-4">
          {/*
            v26 (Sprint 8): Operational Brief and Live Intelligence Feed
            are gone — both duplicated content Mission Workspace's JARVIS
            Report already narrates. Confirmed neither was a unique data
            source: Operational Brief's "next commitment" read directly
            from operationalState.calendar[0] (same source Calendar
            Snapshot uses independently) and its "recommendation" line
            came from the same getRecommendation() helper jarvisBrief()
            already uses for the report. The one real gap: Live
            Intelligence Feed's lead signal (signals[0]'s own title/
            detail, not just the count) isn't narrated verbatim anywhere
            else — only its count survives, inside jarvisBrief(). The orb
            now takes the full width of what used to be a three-way split
            row, serving the standing "orb as visual centre of gravity"
            goal directly.

            v27 (Sprint 9): the memory editor's only other trigger
            (SystemStatusCard's Memory row, in the now-removed RightRail)
            went with it. It was briefly re-homed onto this panel's own
            MEMORY STATUS readout, but v29 (Sprint 11, Section 3) removed
            that readout entirely as a duplicate of TopBar/AgentRail — see
            AgentRail's compact Memory row for where the trigger lives now.
          */}
          <OrbCenterpiece
            agent={agent}
            orbState={orbState}
            voiceState={voiceState}
            liveAmplitude={mic.amplitude}
            micActive={mic.active}
            micError={!!mic.error}
            onToggleMic={mic.toggle}
            onQuickCommand={handleQuickCommand}
            onSelectJarvis={() => setSelectedId("jarvis")}
          />
        </div>

        {/*
          v27 (Sprint 9, Section 3): Projects Overview / Calendar Snapshot /
          Communications Snapshot — three full cards — are gone, replaced
          by this single full-width status line: next calendar item,
          most-active project, comms needing reply.

          v28 (Sprint 10, Section 3): deliberately its own `shrink-0` flex
          item, OUTSIDE the orb's scroll container above and directly
          above ConversationDock in the same outer flex column — not
          nested inside the scrolling div. That placement is what makes
          "Mission Workspace moves down when a segment's detail opens"
          come out of ordinary flex layout for free: this block's real
          rendered height changes when a detail row opens/closes, which
          both shrinks how much space the orb region above gets and
          pushes ConversationDock (the next sibling) down by exactly
          that amount — no manual repositioning of the dock anywhere.
        */}
        <div className="shrink-0 px-5 pb-3 pt-3">
          {governedPresentation
            ? <StatusStrip mode="GOVERNED" presentation={governedPresentation} />
            : <StatusStrip mode="LEGACY" operationalState={operationalState} />}
        </div>

        <ConversationDock
          agent={agent}
          operationalState={operationalState}
          messages={messages}
          loading={loading}
          error={error}
          onSend={send}
          onClear={reset}
          onListeningChange={setInputListening}
          presetText={presetText}
          presetNonce={presetNonce}
        />
      </div>

      <MemoryEditor
        open={editorOpen}
        operationalState={operationalState}
        onClose={() => setEditorOpen(false)}
        onSaved={refresh}
      />
    </div>
  );
}
