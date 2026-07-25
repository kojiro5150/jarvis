import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

/**
 * Server-only. Google OAuth tokens for the Calendar connector, stored on
 * disk the same way lib/memory/store.ts stores project memory — a local
 * JSON file for development, gitignored (see /data/*.json in .gitignore).
 *
 * This file must NEVER be imported by a "use client" component, and
 * nothing here is ever returned from an API route response body — tokens
 * are secrets, not project state. Only the Google connector (server-side)
 * and the OAuth callback route touch this module.
 *
 * Same production caveat as memory/store.ts: Vercel's filesystem is
 * read-only outside /tmp, so this is a genuine local-dev store, not a
 * production-durable one. A later phase would move this to a real
 * database (Supabase) alongside project memory.
 */

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  /** Epoch milliseconds. */
  expiry_date: number;
  scope: string;
  token_type: string;
}

const TOKEN_FILE = path.join(process.cwd(), "data", "google-tokens.json");

export async function readGoogleTokens(): Promise<GoogleTokens | null> {
  try {
    const raw = await fs.readFile(TOKEN_FILE, "utf-8");
    return JSON.parse(raw) as GoogleTokens;
  } catch {
    return null;
  }
}

export async function writeGoogleTokens(tokens: GoogleTokens): Promise<void> {
  try {
    await fs.mkdir(path.dirname(TOKEN_FILE), { recursive: true });
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2), "utf-8");
  } catch (err) {
    console.warn("[google/tokens] write failed (read-only filesystem?) — not persisted:", err);
  }
}

/**
 * Synchronous existence check, used by the calendar connector factory to
 * decide whether Google or local should be handed out for a given
 * request. A cheap presence check, not a validity check — the connector
 * itself handles expiry/refresh when it actually fetches events.
 */
export function hasStoredGoogleTokens(): boolean {
  return fsSync.existsSync(TOKEN_FILE);
}

/**
 * v43: backs the "Disconnect" button — removes the stored token file
 * entirely (not just marking it invalid), so `hasStoredGoogleTokens()`
 * immediately goes back to false and every connector factory (calendar,
 * gmail, drive) falls back to local on the very next request, same as
 * before this account was ever connected. Deleting a file that's already
 * gone is a no-op, not an error — disconnect should always succeed from
 * the UI's point of view.
 */
export async function deleteGoogleTokens(): Promise<void> {
  try {
    await fs.unlink(TOKEN_FILE);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("[google/tokens] delete failed:", err);
    }
  }
}
