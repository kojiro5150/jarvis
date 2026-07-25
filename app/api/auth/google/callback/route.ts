import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/connectors/google/oauth";
import { writeGoogleTokens } from "@/lib/connectors/google/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "google_oauth_state";

/**
 * Google redirects here with ?code=...&state=.... Exchanges the code for
 * tokens, stores them server-side, then sends the person back to the
 * dashboard. No OAuth error — missing code, state mismatch, a failed
 * token exchange — is ever rendered here; every failure path redirects
 * home the same way a success does, and the dashboard reflects the real
 * outcome via calendarStatus on its next fetch ("Calendar intelligence
 * unavailable" if it didn't actually connect). See DESIGN_CONSTITUTION.md
 * Principle 3 — never expose implementation/error detail in the UI.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get(STATE_COOKIE)?.value;

  const home = new URL("/", req.url);
  const res = NextResponse.redirect(home);
  res.cookies.delete(STATE_COOKIE);

  if (!code || !state || !cookieState || state !== cookieState) {
    console.warn("[auth/google/callback] missing/mismatched state — rejecting callback.");
    return res;
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await writeGoogleTokens(tokens);
  } catch (err) {
    console.error("[auth/google/callback] token exchange failed:", err);
  }

  return res;
}
