import type { GoogleTokens } from "./tokens";

/**
 * Server-only. Plain-fetch OAuth 2.0 Authorization Code flow against
 * Google's endpoints — no googleapis SDK dependency, to keep the app
 * lean (consistent with "no paid services beyond the Claude API" and a
 * minimal footprint on Vercel's free tier).
 *
 * Scope is deliberately narrow and read-only: calendar.readonly, (as of
 * Sprint 2.7) gmail.readonly, and (as of Sprint 3.148) drive.readonly.
 * Drive's minimum general read-only scope supports the deliberately narrow
 * identified-Google-Doc export path as well as metadata search. All
 * three are requested together in one consent screen — one Google grant
 * backs all three connectors, since they share the same token store (see
 * access-token.ts).
 *
 * SCOPE MIGRATION NOTE: anyone who connected before this scope was added has
 * a token grant that predates drive.readonly. Google doesn't
 * retroactively add scope to an existing grant — they'll see Drive stay
 * "unavailable" until they Disconnect and Connect again, which re-runs
 * this consent screen with all three scopes at once (the callback route
 * always overwrites the whole token file, so there's no partial-scope
 * merge to get wrong).
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_READONLY_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const REQUESTED_SCOPES = [CALENDAR_READONLY_SCOPE, GMAIL_READONLY_SCOPE, DRIVE_READONLY_SCOPE].join(" ");

function getOAuthEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth is not configured — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI."
    );
  }
  return { clientId, clientSecret, redirectUri };
}

/** Builds the URL to send the browser to for Google's consent screen. */
export function buildAuthUrl(state: string): string {
  const { clientId, redirectUri } = getOAuthEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: REQUESTED_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

/** Exchanges an authorization code (from the callback's ?code=) for tokens. */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const { clientId, clientSecret, redirectUri } = getOAuthEnv();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status}`);
  }

  const json = (await res.json()) as GoogleTokenResponse;
  if (!json.refresh_token) {
    // Can happen if the person had already granted consent and Google
    // didn't re-issue a refresh token — prompt=consent above is meant to
    // prevent this, but guard anyway since a Google connector with no
    // refresh token can't self-renew.
    console.warn("[google/oauth] token exchange returned no refresh_token.");
  }

  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expiry_date: Date.now() + json.expires_in * 1000,
    scope: json.scope,
    token_type: json.token_type,
  };
}

/** Refreshes an expired access token. Google does not re-issue a refresh_token here. */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const { clientId, clientSecret } = getOAuthEnv();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status}`);
  }

  const json = (await res.json()) as GoogleTokenResponse;
  return {
    access_token: json.access_token,
    refresh_token: refreshToken,
    expiry_date: Date.now() + json.expires_in * 1000,
    scope: json.scope,
    token_type: json.token_type,
  };
}
