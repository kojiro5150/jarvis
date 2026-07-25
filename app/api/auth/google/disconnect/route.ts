import { NextResponse } from "next/server";
import { deleteGoogleTokens } from "@/lib/connectors/google/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * v43. "Disconnect" for Calendar/Gmail/Drive — all three share the one
 * Google OAuth grant (see oauth.ts), so there's one disconnect action,
 * not three: it deletes the stored token file. Every connector factory
 * (calendar.ts/gmail.ts/drive.ts) checks `hasStoredGoogleTokens()` on
 * every request, so the very next operational-state fetch after this
 * call reports all three back to "local"/"unavailable" — no separate
 * per-service bookkeeping needed.
 *
 * POST (not GET) specifically so this can never be triggered by a
 * prefetch, a shared link, or a browser's link-preview crawler the way a
 * GET route could be — disconnecting is a real state change, not an
 * idempotent read.
 */
export async function POST() {
  await deleteGoogleTokens();
  return NextResponse.json({ ok: true });
}
