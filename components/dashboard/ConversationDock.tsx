"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Mic, Paperclip, X } from "lucide-react";
import { accentClasses } from "@/lib/agents/accent";
import { getOpeningBrief } from "@/lib/briefing";
import MarkdownMessage from "../markdown/MarkdownMessage";
import type { AgentDefinition, ChatMessage } from "@/lib/agents/types";
import type { OperationalState } from "@/lib/operational-state";

interface ConversationDockProps {
  agent: AgentDefinition;
  operationalState: OperationalState;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onClear: () => void;
  /** Reports real input-focus state up so the orb can honestly show "listening" — not a fabricated voice signal. */
  onListeningChange?: (listening: boolean) => void;
  presetText?: string;
  presetNonce?: number;
}

const DISABLED_TABS = [
  { label: "ARTIFACTS", title: "Not built yet" },
  { label: "FILES", title: "Not built yet" },
  { label: "MEMORY", title: "Open via the Memory row in System Status (right rail)" },
  { label: "REASONING", title: "No reasoning trace is captured yet" },
];

/** Report-header label per agent (v17 spec section 11) — same static-copy category as agent.name/subtitle, not a claim about content that isn't there. MARCUS has none (his block drops the header entirely, see AgentDocument). */
const REPORT_HEADER: Record<string, string> = {
  jarvis: "JARVIS REPORT",
  dawnwatch: "DAWNWATCH REPORT",
  oracle: "ORACLE BRIEF",
  gecko: "GECKO SIGNAL",
  herald: "HERALD DRAFT",
  steve: "STEVE NOTES",
  cowork: "CO-WORK PLAN",
  phdss: "PHDSS — GOVERNANCE REASONING RECORD",
};

/** Per-agent input placeholder (v17 spec section 10) — falls back to the generic "Ask {name} anything..." for agents without a more specific phrasing. */
const PLACEHOLDER: Record<string, string> = {
  herald: "Ask HERALD to draft...",
  marcus: "Ask MARCUS anything...",
  phdss: "Ask PHDSS to assess a decision...",
};

/** Wall-clock label for a document header — computed at render time since individual messages don't carry a persisted timestamp yet (in-memory conversation only). */
function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Document-style rendering for JARVIS/specialist output (Phase 2.6) —
 * replaces the old flat chat bubble for assistant turns with something
 * that reads as a working document: full width, a labeled header, a
 * left accent border instead of an all-around bubble outline. User
 * turns (below, in the main return) keep the compact right-aligned
 * chat-bubble treatment — only the assistant side needed to stop
 * feeling like chat.
 *
 * MARCUS drops the header entirely and gets a plain, quiet, generously
 * padded block — per his brief, less chrome, more room to think, no
 * competing with a report-style label. PHDSS gets a deliberately formal
 * "GOVERNANCE REASONING RECORD" framing in deep red. Both are chrome
 * only — neither changes what the agent actually says.
 */
function AgentDocument({ agent, content }: { agent: AgentDefinition; content: string }) {
  const c = accentClasses(agent.accent);
  const isMarcus = agent.id === "marcus";
  const isPhdss = agent.id === "phdss";

  if (isMarcus) {
    return (
      <div className="w-full rounded-lg bg-white/[0.02] px-7 py-6">
        <MarkdownMessage content={content} />
      </div>
    );
  }

  const headerLabel = REPORT_HEADER[agent.id] ?? `${agent.name} REPORT`;
  const containerClass = isPhdss
    ? "w-full rounded-lg border-l-2 border-red-400/50 bg-black/20 px-5 py-4"
    : `w-full rounded-lg border-l-2 ${c.border} bg-white/[0.03] px-5 py-4`;

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-2 mb-2 text-[10px] tracking-widest text-white/30 font-mono uppercase">
        <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
        {headerLabel}
        <span className="ml-auto text-white/20 normal-case tracking-normal">{nowLabel()}</span>
      </div>
      <MarkdownMessage content={content} />
    </div>
  );
}

/**
 * The conversation is a first-class, command-console-style dock — not a
 * shrinking afterthought bolted under the dashboard. Its own independent
 * scroll region and a persistent input bar that never scrolls away. The
 * dashboard above it (DashboardShell's main column) is a fully separate
 * scroll container — nothing in here can move it.
 *
 * v26 (Sprint 8): Mission Workspace is now the priority surface —
 * Operational Brief, Priority Vector, and Live Intelligence Feed were
 * all cut as duplicates of what this panel's JARVIS Report already
 * narrates, and the freed vertical space (rather than going to padding
 * elsewhere) was passed down here, so the report renders taller by
 * default with noticeably less scrolling for a typical brief.
 *
 * v29 (Sprint 11, Section 2): height is no longer a standalone clamp —
 * it's `flex-1` against the Orb wrapper's `flex-[1.7]` in the same
 * DashboardShell column, deliberately ceding the majority share so the
 * Orb reads as the dominant element. min-h/max-h keep it usable at
 * extreme viewport heights without pinning it to a specific pixel value
 * the way the old clamp() did. It can still scroll internally for a
 * longer report — it doesn't need to show the whole thing without
 * scrolling, per the spec.
 *
 * The tab row mirrors the reference's mission-control framing (a
 * conversation surface with room to grow into Artifacts/Files) but only
 * CONVERSATION is real today — the rest are honestly disabled with a
 * tooltip, the same pattern already used for Voice/Search elsewhere,
 * rather than pretending those surfaces exist.
 */
export default function ConversationDock({
  agent,
  operationalState,
  messages,
  loading,
  error,
  onSend,
  onClear,
  onListeningChange,
  presetText,
  presetNonce,
}: ConversationDockProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const c = accentClasses(agent.accent);

  useEffect(() => {
    if (presetText) setInput(presetText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetNonce]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [messages, loading]);

  const brief = getOpeningBrief(agent.id, operationalState);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input);
    setInput("");
  }

  return (
    <div
      className="flex-1 min-h-[220px] max-h-[520px] panel border-t border-white/10 rounded-t-2xl mx-3 flex flex-col shadow-[0_-8px_24px_rgba(0,0,0,0.25)]"
    >
      <div className="flex items-center justify-between px-5 py-2 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
            <span className="text-[12px] tracking-widest text-white/60 font-mono">MISSION WORKSPACE</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/10">
            <span className={`text-[10px] tracking-widest font-mono ${c.text}`}>ACTIVE</span>
            {DISABLED_TABS.map((tab) => (
              <span
                key={tab.label}
                title={tab.title}
                className="text-[10px] tracking-widest text-white/20 font-mono cursor-not-allowed"
              >
                {tab.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <span className="flex items-center gap-1.5 text-[12px] text-white/40">
              <Loader2 size={11} className="animate-spin" />
              {agent.name} is thinking...
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 transition-colors"
              title="Clear this conversation"
            >
              <X size={11} />
              CLEAR
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-3 space-y-3">
        <AgentDocument agent={agent} content={brief} />

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div
              key={i}
              className="rounded-xl px-4 py-3 max-w-[75%] ml-auto bg-white/10 border border-white/10 text-[15px] leading-relaxed text-white/90"
            >
              {m.content}
            </div>
          ) : (
            <AgentDocument key={i} agent={agent} content={m.content} />
          )
        )}

        {error && (
          <div className="rounded-xl px-4 py-2.5 text-sm bg-rose-500/10 border border-rose-400/30 text-rose-300 max-w-[75%]">
            {error}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 flex items-center gap-2 px-5 py-3 border-t border-white/5">
        <button
          type="button"
          disabled
          className="h-9 w-9 shrink-0 rounded-full border border-white/10 flex items-center justify-center text-white/25 cursor-not-allowed"
          title="Attachments — not wired up yet"
        >
          <Paperclip size={15} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => onListeningChange?.(true)}
          onBlur={() => onListeningChange?.(false)}
          placeholder={PLACEHOLDER[agent.id] ?? `Ask ${agent.name} anything...`}
          className={`flex-1 rounded-full bg-white/5 border ${c.border} px-4 py-2.5 text-[15px] text-white/90 placeholder-white/30 outline-none focus:ring-2 ${c.ring}`}
        />
        <button
          type="button"
          disabled
          className="h-9 w-9 shrink-0 rounded-full border border-white/10 flex items-center justify-center text-white/25 cursor-not-allowed"
          title="Voice — standing by"
        >
          <Mic size={15} />
        </button>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`h-9 w-9 shrink-0 rounded-full ${c.bg} border ${c.border} flex items-center justify-center ${c.text} disabled:opacity-40 transition-opacity`}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  );
}
