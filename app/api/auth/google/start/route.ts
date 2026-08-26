import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { buildAuthUrl } from "@/lib/connectors/google/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "google_oauth_state";

/**
 * Every "Connect" button in the LH rail (Calendar/Gmail/Drive) lands
 * here — one shared Google grant backs all three (see oauth.ts), so
 * there's one Connect action, not three. Redirects to Google's consent
 * screen requesting calendar.readonly, gmail.readonly, and (v43)
 * drive.readonly together. A random state value is set as a
 * short-lived httpOnly cookie and echoed back by Google so the callback
 * can reject anything that isn't a request this server actually started
 * (basic CSRF protection for the OAuth flow).
 */
export async function GET(req: NextRequest) {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    const authUrl = buildAuthUrl(state);

    const res = NextResponse.redirect(authUrl);
    res.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });
    return res;
  } catch (err) {
    // Missing/misconfigured Google env vars — send the person back to the
    // dashboard rather than showing them a raw config error.
    console.error("[auth/google/start] failed:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
