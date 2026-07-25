import type { CalendarEventRecord, EmailThreadRecord, DriveFileRecord } from "@/lib/connectors/types";

/**
 * Shape of JARVIS's local project memory — the one JSON file
 * (lib/memory/store.ts) everything in Phase 1 reads from.
 *
 * `priorities` / `projects` / `signals` are JARVIS's own tracked state —
 * nothing external owns these. `calendar` / `gmailThreads` / `driveFiles`
 * are what the LOCAL implementations of the Calendar/Gmail/Drive
 * connectors (lib/connectors/*.ts) read — they live in the same file for
 * now because there's nowhere else for local data to live, but they're
 * addressed through the connector interfaces, not read directly, so
 * swapping in a real Google-backed connector later doesn't touch anyone
 * upstream (cards, briefing, agent prompts).
 */

export interface Priority {
  rank: number;
  title: string;
  detail: string;
  due: string;
  urgent?: boolean;
}

export interface ProjectStatus {
  name: string;
  tag: string;
  progress: number;
  tagColor: "cyan" | "amber" | "emerald" | "violet";
}

export interface Signal {
  kind: "deadline" | "action" | "research" | "note";
  title: string;
  detail: string;
  cta: string;
}

export interface MemoryStore {
  priorities: Priority[];
  projects: ProjectStatus[];
  signals: Signal[];
  /** Backs LocalCalendarConnector. */
  calendar: CalendarEventRecord[];
  /** Backs LocalGmailConnector. */
  gmailThreads: EmailThreadRecord[];
  /** Backs LocalDriveConnector. */
  driveFiles: DriveFileRecord[];
  /** ISO timestamp of the last write. */
  updatedAt: string;
}
