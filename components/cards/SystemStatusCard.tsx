import { RefreshCw, Calendar, Mail, HardDrive, Database, BookOpen, Github } from "lucide-react";
import type {
  CalendarIntelligenceStatus,
  ConnectorStatus,
  GmailIntelligenceStatus,
} from "@/lib/connectors/types";

const CONNECTOR_LABEL: Record<ConnectorStatus["name"], string> = {
  calendar: "Calendar",
  gmail: "Gmail",
  drive: "Drive",
};

/**
 * v25 (Sprint 7, Section 4): a small service icon per row, tinted to
 * match that row's own live/offline state (not the specialist palette —
 * these are services, not specialists) so the panel reads as iconified
 * and colour-coded rather than plain text rows.
 */
function RowIcon({ icon: Icon, live }: { icon: typeof Calendar; live: boolean }) {
  return (
    <span
      className={`h-6 w-6 shrink-0 rounded-md border flex items-center justify-center ${
        live ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/[0.03] text-white/30"
      }`}
    >
      <Icon size={13} />
    </span>
  );
}

/** Exact required phrases — never substitute raw error text for these. Carried over verbatim from the old RightPanel. */
const CALENDAR_STATUS_COPY: Record<CalendarIntelligenceStatus, string> = {
  online: "Calendar intelligence online",
  unavailable: "Calendar intelligence unavailable",
  refresh_required: "Calendar refresh required",
};

const GMAIL_STATUS_COPY: Record<GmailIntelligenceStatus, string> = {
  online: "Gmail intelligence online",
  unavailable: "Gmail intelligence unavailable",
  refresh_required: "Gmail refresh required",
};

const STATUS_DOT: Record<"online" | "unavailable" | "refresh_required", string> = {
  online: "bg-emerald-400",
  unavailable: "bg-white/20",
  refresh_required: "bg-amber-400",
};

interface SystemStatusCardProps {
  connectorStatuses: ConnectorStatus[];
  calendarStatus: CalendarIntelligenceStatus;
  gmailStatus: GmailIntelligenceStatus;
  onRefreshCalendar: () => void;
  onRefreshGmail: () => void;
  /** Opens the memory editor when the Memory row is clicked — same trigger the old right-rail Memory card used, folded in here now that panel is gone (v17). */
  onOpenMemoryEditor?: () => void;
}

/**
 * Compact connector-status card for the right rail — extracted from the
 * old RightPanel.tsx's CONNECTORS section. Calendar and Gmail keep their
 * exact required 3-phrase status copy (never a raw OAuth/API error) and
 * their Connect/Reconnect/Refresh affordance; Drive and Memory (local,
 * always-on) render as simple always-connected rows. GitHub is shown
 * honestly offline — there's no GitHub connector wired up anywhere in
 * this app, so "not connected" is the truthful reading, not an invented
 * integration. Knowledge is the local memory store standing by (same
 * store Memory reads/writes), shown as "Ready" rather than claiming any
 * ongoing sync that doesn't exist.
 */
export default function SystemStatusCard({
  connectorStatuses,
  calendarStatus,
  gmailStatus,
  onRefreshCalendar,
  onRefreshGmail,
  onOpenMemoryEditor,
}: SystemStatusCardProps) {
  const drive = connectorStatuses.find((s) => s.name === "drive");

  return (
    <div className="panel rounded-xl border border-white/5 p-4">
      <h3 className="text-[14px] tracking-widest text-white/50 font-mono mb-3">SYSTEM STATUS</h3>
      <div className="space-y-2">
        <div className="rounded-lg border border-white/10 px-3 py-2 text-[14px]">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 flex items-center gap-2 shrink-0">
              <RowIcon icon={Calendar} live={calendarStatus === "online"} />
              <span className="text-white/70">Calendar</span>
            </span>
            <span className="min-w-0 flex items-center justify-end gap-1.5 text-white/40 text-[11px] text-right">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[calendarStatus]}`} />
              <span className="truncate">{CALENDAR_STATUS_COPY[calendarStatus]}</span>
            </span>
          </div>
          <div className="mt-1">
            {calendarStatus === "online" ? (
              <button
                onClick={onRefreshCalendar}
                className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/80 transition-colors"
              >
                <RefreshCw size={11} />
                Refresh
              </button>
            ) : (
              <a
                href="/api/auth/google/start"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20 text-[11px] py-1 transition-colors"
              >
                {calendarStatus === "refresh_required" ? "Reconnect" : "Connect"}
              </a>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 px-3 py-2 text-[14px]">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 flex items-center gap-2 shrink-0">
              <RowIcon icon={Mail} live={gmailStatus === "online"} />
              <span className="text-white/70">Gmail</span>
            </span>
            <span className="min-w-0 flex items-center justify-end gap-1.5 text-white/40 text-[11px] text-right">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[gmailStatus]}`} />
              <span className="truncate">{GMAIL_STATUS_COPY[gmailStatus]}</span>
            </span>
          </div>
          <div className="mt-1">
            {gmailStatus === "online" ? (
              <button
                onClick={onRefreshGmail}
                className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white/80 transition-colors"
              >
                <RefreshCw size={11} />
                Refresh
              </button>
            ) : (
              <a
                href="/api/auth/google/start"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20 text-[11px] py-1 transition-colors"
              >
                {gmailStatus === "refresh_required" ? "Reconnect" : "Connect"}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-[14px]">
          <span className="flex items-center gap-2">
            <RowIcon icon={HardDrive} live={!!drive?.connected} />
            <span className="text-white/70">{CONNECTOR_LABEL.drive}</span>
          </span>
          <span className="flex items-center gap-1.5 text-white/40 text-[11px]">
            <span className={`h-1.5 w-1.5 rounded-full ${drive?.connected ? "bg-emerald-400" : "bg-white/20"}`} />
            {drive?.source === "local" ? "Local" : "Connected"}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenMemoryEditor}
          disabled={!onOpenMemoryEditor}
          className="w-full flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-[14px] text-left hover:border-white/20 hover:bg-white/5 transition-colors disabled:cursor-default disabled:hover:border-white/10 disabled:hover:bg-transparent"
          title={onOpenMemoryEditor ? "Open memory editor" : undefined}
        >
          <span className="flex items-center gap-2">
            <RowIcon icon={Database} live />
            <span className="text-white/70">Memory</span>
          </span>
          <span className="flex items-center gap-1.5 text-white/40 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online
          </span>
        </button>

        <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-[14px]">
          <span className="flex items-center gap-2">
            <RowIcon icon={BookOpen} live />
            <span className="text-white/70">Knowledge</span>
          </span>
          <span className="flex items-center gap-1.5 text-white/40 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Ready
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-[14px]">
          <span className="flex items-center gap-2">
            <RowIcon icon={Github} live={false} />
            <span className="text-white/70">GitHub</span>
          </span>
          <span className="flex items-center gap-1.5 text-white/40 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            Not connected
          </span>
        </div>
      </div>
    </div>
  );
}
