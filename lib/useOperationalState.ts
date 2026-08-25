"use client";

import { useCallback, useEffect, useState } from "react";
import type { ConnectorStatusSnapshot } from "./connectors/status";
import type { ConnectorStatus } from "./connectors/types";
import type { OperationalState } from "./operational-state";

/**
 * Non-private compatibility state for the legacy Dashboard component contract.
 *
 * The Dashboard still expects an OperationalState-shaped value, but mounting it
 * must not imply authority to acquire Memory, Calendar, Gmail or Drive content.
 * Keep every content collection explicitly empty. Only connector service
 * statuses are overlaid from the metadata-only connector-status endpoint.
 */
export const EMPTY_DASHBOARD_COMPATIBILITY_STATE: OperationalState = {
  priorities: [],
  projects: [],
  signals: [],
  blockers: [],
  calendar: [],
  calendarStatus: "unavailable",
  gmailThreads: [],
  gmailStatus: "unavailable",
  driveFiles: [],
  driveStatus: "unavailable",
  connectorStatuses: [
    { name: "calendar", source: "local", connected: false },
    { name: "gmail", source: "local", connected: false },
    { name: "drive", source: "local", connected: false },
  ],
  updatedAt: "1970-01-01T00:00:00.000Z",
};

function connectorStatuses(snapshot: ConnectorStatusSnapshot): ConnectorStatus[] {
  return (["calendar", "gmail", "drive"] as const).map((name) => {
    const status = snapshot[`${name}Status`];
    return {
      name,
      source: status === "unavailable" ? "local" : "google",
      connected: status === "online",
    };
  });
}

/**
 * Preserves the Dashboard's legacy hook contract without acquiring operational
 * content. Refreshes read only connector configuration/token metadata through
 * `/api/connector-status`; private content arrays always remain empty.
 */
export function useOperationalState() {
  const [data, setData] = useState<OperationalState>(EMPTY_DASHBOARD_COMPATIBILITY_STATE);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/connector-status");
      if (!response.ok) return;
      const snapshot = (await response.json()) as ConnectorStatusSnapshot;
      setData({
        ...EMPTY_DASHBOARD_COMPATIBILITY_STATE,
        ...snapshot,
        connectorStatuses: connectorStatuses(snapshot),
      });
    } catch {
      // Metadata status is quiet UI chrome; retain the explicit empty fallback.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, refresh };
}
