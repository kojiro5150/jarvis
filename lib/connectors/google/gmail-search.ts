import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";
import type { GmailSearchWindow } from "../../lighter-jarvis/gmail-search-authority";

const URL = "https://www.googleapis.com/gmail/v1/users/me/messages";
export interface GmailSearchConnector { search(newerThan: GmailSearchWindow, maxResults: 5): Promise<readonly string[]> }

/** ID-only discovery connector. It never calls messages.get or requests message content. */
export class GoogleGmailSearchConnector implements GmailSearchConnector {
  async search(newerThan: GmailSearchWindow, maxResults: 5): Promise<readonly string[]> {
    const query = `newer_than:${newerThan}`;
    const params = new URLSearchParams({ q: query, maxResults: String(Math.min(maxResults, 5)) });
    const response = await fetch(`${URL}?${params}`, { headers: { Authorization: `Bearer ${await getValidGoogleAccessToken()}` } });
    if (response.status === 401) throw new GoogleServiceAuthError("refresh_failed", "Gmail API rejected the access token (messages.list).");
    if (response.status === 403) throw new GoogleServiceAuthError("not_connected", "Gmail search requires gmail.readonly scope.");
    if (!response.ok) throw new Error(`Gmail messages.list failed: ${response.status}`);
    const body = await response.json() as { messages?: readonly { id?: unknown }[] };
    return Object.freeze((body.messages ?? []).map(message => message.id).filter((id): id is string => typeof id === "string").slice(0, 5));
  }
}
