import { readGoogleTokens, writeGoogleTokens } from "./tokens";
import { refreshAccessToken } from "./oauth";
import { GoogleServiceAuthError } from "./auth-error";

const REFRESH_BUFFER_MS = 60_000;

/**
 * One Google OAuth grant covers both Calendar and Gmail (combined scope
 * requested in one consent screen — see oauth.ts's buildAuthUrl), so
 * both connectors share this same token-validity/refresh logic instead
 * of each keeping its own copy.
 */
export async function getValidGoogleAccessToken(): Promise<string> {
  const tokens = await readGoogleTokens();
  if (!tokens) {
    throw new GoogleServiceAuthError("not_connected", "No Google tokens stored.");
  }

  if (tokens.expiry_date - REFRESH_BUFFER_MS > Date.now()) {
    return tokens.access_token;
  }

  if (!tokens.refresh_token) {
    throw new GoogleServiceAuthError("refresh_failed", "No refresh token available.");
  }

  try {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    await writeGoogleTokens(refreshed);
    return refreshed.access_token;
  } catch (err) {
    throw new GoogleServiceAuthError(
      "refresh_failed",
      `Token refresh failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
