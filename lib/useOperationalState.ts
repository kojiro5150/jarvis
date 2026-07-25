"use client";

import { useCallback, useEffect, useState } from "react";
import { SEED_MEMORY } from "./memory/seed";
import { normalizeLocalRecord } from "./connectors/calendar-event";
import { normalizeLocalEmailRecord } from "./connectors/email-message";
import type { OperationalState } from "./operational-state";

const FALLBACK: OperationalState = {
  priorities: SEED_MEMORY.priorities,
  projects: SEED_MEMORY.projects,
  signals: SEED_MEMORY.signals,
  blockers: SEED_MEMORY.signals.filter((s) => s.kind === "deadline" || s.kind === "note"),
  // Same normalizers the connectors use, so the instant-render fallback
  // carries the identical canonical shape as a real fetch would.
  calendar: SEED_MEMORY.calendar.map(normalizeLocalRecord),
  calendarStatus: "unavailable",
  gmailThreads: SEED_MEMORY.gmailThreads.map(normalizeLocalEmailRecord),
  gmailStatus: "unavailable",
  driveFiles: SEED_MEMORY.driveFiles,
  driveStatus: "unavailable",
  // Every connector defaults to local until the real fetch resolves and
  // reports what's actually configured server-side.
  connectorStatuses: [
    { name: "calendar", source: "local", connected: false },
    { name: "gmail", source: "local", connected: false },
    { name: "drive", source: "local", connected: false },
  ],
  updatedAt: SEED_MEMORY.updatedAt,
};

/**
 * Fetches /api/operational-state on mount (and again on demand via
 * `refresh()` — used after Sprint 2.5's memory editor saves a change, so
 * the dashboard reflects an edit without a manual page reload). Starts
 * from the same seed data the server falls back to, so the dashboard
 * renders immediately instead of showing an empty state while the
 * request is in flight — and stays on the last-good data if a refresh
 * fails, rather than surfacing an error for what's meant to be a quiet
 * background refresh.
 *
 * This is the ONE OperationalState the dashboard uses — the same object
 * the conversational agents receive via /api/chat's server-side
 * buildOperationalState() call (lib/operational-state.ts). See Sprint 2.4.
 */
export function useOperationalState() {
  const [data, setData] = useState<OperationalState>(FALLBACK);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/operational-state");
      if (!res.ok) return;
      const json = (await res.json()) as OperationalState;
      setData(json);
    } catch {
      // Keep whatever's currently displayed — this is a quiet refresh, not a user-facing action.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}
