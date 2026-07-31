"use client";

import { useState } from "react";
import { Calendar, TrendingUp, Mail } from "lucide-react";
import { relativeTime } from "@/lib/connectors/email-message";
import type { OperationalState } from "@/lib/operational-state";
import type { DashboardPresentation } from "@/lib/dashboard-presentation";

type StatusStripProps =
  | { mode: "LEGACY"; operationalState: OperationalState }
  | { mode: "GOVERNED"; presentation: DashboardPresentation };

type CalendarItem = { readonly id: string; readonly title: string; readonly day?: string; readonly time?: string };
type ProjectItem = { readonly id: string; readonly name: string; readonly progress?: number };
type CommunicationItem = { readonly id: string; readonly sender: string; readonly subject?: string; readonly relativeObservedAt?: string };

type SegmentId = "calendar" | "project" | "comms";

const DETAIL_HEIGHT = 56; // px — spec: "fixed at roughly 48-60px"

/**
 * v27 (Sprint 9, Section 3): replaces the old Projects Overview / Calendar
 * Snapshot / Communications Snapshot three-card row with a single
 * full-width status line — one most-relevant item per category (next
 * calendar item, most-active project, comms needing reply count), not an
 * attempt to summarise everything those cards used to show. No progress
 * bars, no card borders on the strip itself — it's a status line, not a
 * panel.
 *
 * v28 (Sprint 10, Section 3): the per-segment floating popover is gone,
 * replaced with one shared detail row living directly beneath the
 * segment line, inside this same panel. Only one segment's detail can be
 * open at a time (`open` is a single SegmentId, not a set) — clicking the
 * open segment again collapses it; clicking a *different* segment swaps
 * the content directly, which falls out naturally from a single piece of
 * state rather than needing an explicit close-then-reopen step. The
 * detail row is a real sibling in normal flow (not absolute/fixed), so
 * Mission Workspace below StatusStrip in DashboardShell moves down/up on
 * its own as this row's height animates open/closed — nothing repositions
 * it manually. Height is a fixed target (not "auto"), so a plain
 * `max-height` transition animates cleanly; content that runs longer
 * than that (e.g. several comms needing reply) scrolls internally rather
 * than being clipped or growing the row past its budget.
 */
export default function StatusStrip(props: StatusStripProps) {
  const [open, setOpen] = useState<SegmentId | null>(null);

  const governed = props.mode === "GOVERNED" ? props.presentation : undefined;
  const legacy = props.mode === "LEGACY" ? props.operationalState : undefined;
  const next: CalendarItem | undefined = governed?.nextCommitment ?? legacy?.calendar[0];
  const thenEvents: readonly CalendarItem[] = governed?.followingCommitments ?? legacy?.calendar.slice(1, 3) ?? [];
  const activeProjects: readonly ProjectItem[] = governed?.projects ?? legacy?.projects
    .filter(project => project.progress > 0 && project.progress < 100)
    .map((project, index) => ({ id: `legacy-project-${index}`, ...project })) ?? [];
  const allActiveSorted = governed ? activeProjects : [...activeProjects].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
  const topProject = allActiveSorted[0];
  const communications: readonly CommunicationItem[] = governed?.communications ?? legacy?.gmailThreads
    .filter(message => message.needsReply)
    .map(message => ({ id: message.id, sender: message.from, subject: message.subject, relativeObservedAt: relativeTime(message.receivedAt) })) ?? [];

  function toggle(id: SegmentId) {
    setOpen((cur) => (cur === id ? null : id));
  }

  return (
    <div className="panel rounded-xl border border-white/5 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center gap-3 text-[13px]">
        <StripSegment
          icon={Calendar}
          active={open === "calendar"}
          onClick={() => toggle("calendar")}
          label={
            next ? (
              <>
                <span className="text-white/40">Next: </span>
                <span className="text-white/85">{next.title}</span>
                <span className="text-white/40">
                  , {next.day} {next.time}
                </span>
              </>
            ) : (
              <span className="text-white/40">No upcoming commitments</span>
            )
          }
        />

        <Divider />

        <StripSegment
          icon={TrendingUp}
          active={open === "project"}
          onClick={() => toggle("project")}
          label={
            topProject ? (
              <>
                <span className="text-white/85">{topProject.name}</span>
                {topProject.progress !== undefined && <span className="text-white/40"> {topProject.progress}%</span>}
              </>
            ) : (
              <span className="text-white/40">No active projects</span>
            )
          }
        />

        <Divider />

        <StripSegment
          icon={Mail}
          active={open === "comms"}
          onClick={() => toggle("comms")}
          label={
            communications.length > 0 ? (
              <>
                <span className="text-white/85">{communications.length}</span>
                <span className="text-white/40"> {governed ? `recent comm${communications.length === 1 ? "" : "s"}` : `comm${communications.length === 1 ? "" : "s"} need reply`}</span>
              </>
            ) : (
              <span className="text-white/40">Inbox clear</span>
            )
          }
        />
      </div>

      {/*
        max-height (not "auto"/grid-trick) is the right tool here
        specifically because the target is a known fixed pixel value —
        DETAIL_HEIGHT — not content-driven auto-growth, so there's no
        jump/snap at the end of the transition the way there can be when
        animating to "auto". Overflow-y-auto on the inner content wrapper
        means longer lists (several comms needing reply) scroll within
        the fixed budget instead of clipping silently or blowing past it.
      */}
      <div
        className="px-4 border-white/5 overflow-hidden"
        style={{
          maxHeight: open ? DETAIL_HEIGHT : 0,
          borderTopWidth: open ? 1 : 0,
          transition: "max-height 220ms ease-in-out, border-top-width 220ms ease-in-out",
        }}
      >
        <div className="py-2.5 h-[56px] overflow-y-auto">
          {open === "calendar" && <CalendarDetail next={next} thenEvents={thenEvents} />}
          {open === "project" && <ProjectDetail projects={allActiveSorted} />}
          {open === "comms" && <CommsDetail messages={communications} />}
        </div>
      </div>
    </div>
  );
}

function CalendarDetail({
  next,
  thenEvents,
}: {
  next: CalendarItem | undefined;
  thenEvents: readonly CalendarItem[];
}) {
  if (!next) {
    return <p className="text-[12px] text-white/40">No scheduled commitments in view.</p>;
  }
  return (
    <div className="space-y-1">
      <div className="text-[12px] text-white/85 truncate">
        <span className="text-white/40">Next: </span>
        {next.title}
        <span className="text-white/40">
          {" "}
          — {next.day} {next.time}
        </span>
      </div>
      {thenEvents.length > 0 && (
        <div className="text-[11px] text-white/40 truncate">
          Then: {thenEvents.map((ev) => `${ev.title} (${ev.day} ${ev.time})`).join(", ")}
        </div>
      )}
    </div>
  );
}

function ProjectDetail({ projects }: { projects: readonly ProjectItem[] }) {
  if (projects.length === 0) {
    return <p className="text-[12px] text-white/40">No active projects in progress.</p>;
  }
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {projects.map((p) => (
        <div key={p.id} className="flex items-center gap-1.5 text-[12px]">
          <span className="text-white/80 truncate max-w-[180px]">{p.name}</span>
          {p.progress !== undefined && <span className="text-white/40">{p.progress}%</span>}
        </div>
      ))}
    </div>
  );
}

function CommsDetail({ messages }: { messages: readonly CommunicationItem[] }) {
  if (messages.length === 0) {
    return <p className="text-[12px] text-white/40">Nothing waiting on a reply.</p>;
  }
  return (
    <div className="space-y-1.5">
      {messages.map((m) => (
        <div key={m.id} className="flex items-baseline gap-2 min-w-0">
          {m.relativeObservedAt && <span className="shrink-0 text-[11px] text-white/40">{m.relativeObservedAt}</span>}
          <span className="min-w-0 truncate text-[12px] text-white/85">
            {m.sender} <span className="text-white/40">— {m.subject}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function Divider() {
  return <span className="h-3.5 w-px bg-white/10 shrink-0" />;
}

function StripSegment({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Calendar;
  label: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 flex-1 flex items-center gap-2 rounded-md px-1.5 py-0.5 -mx-1.5 transition-colors ${
        active ? "bg-white/5" : "hover:bg-white/5"
      }`}
    >
      <Icon size={13} className="shrink-0 text-white/35" />
      <span className="min-w-0 flex-1 truncate text-left font-mono tracking-tight">{label}</span>
    </button>
  );
}
