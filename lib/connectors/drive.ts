import { readMemory } from "@/lib/memory/store";
import type { DriveFileRecord, ConnectorSource } from "./types";
import { GoogleDriveConnector } from "./google/drive";
import { hasStoredGoogleTokens } from "./google/tokens";

/** What JARVIS needs from "a document store": what's recently been touched. */
export interface DriveConnector {
  readonly source: ConnectorSource;
  listRecentActivity(limit?: number): Promise<DriveFileRecord[]>;
}

/** Reads from the local JSON memory store. Always available, no auth required. */
export class LocalDriveConnector implements DriveConnector {
  readonly source: ConnectorSource = "local";

  async listRecentActivity(limit = 5): Promise<DriveFileRecord[]> {
    const memory = await readMemory();
    return memory.driveFiles.slice(0, limit);
  }
}

/**
 * v43: same "auto" pattern calendar.ts/gmail.ts already use — Google once
 * connected via /api/auth/google/start, local until then. This is what
 * makes "connects on load" true with no button click needed on every
 * visit: the token file (data/google-tokens.json) persists across
 * requests, so once OAuth has been completed once, every subsequent
 * page load's operational-state fetch picks up GoogleDriveConnector
 * automatically. `DRIVE_CONNECTOR` env var still forces one or the
 * other if explicitly set (e.g. for local dev without touching real
 * Drive).
 */
export function getDriveConnector(): DriveConnector {
  const provider = process.env.DRIVE_CONNECTOR;
  if (provider === "local") return new LocalDriveConnector();
  if (provider === "google") return new GoogleDriveConnector();
  return hasStoredGoogleTokens() ? new GoogleDriveConnector() : new LocalDriveConnector();
}
