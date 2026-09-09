import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";

const URL = "https://www.googleapis.com/gmail/v1/users/me/messages";

export interface GmailTopicSearchConnector {
  searchByTopic(topic: string, maxResults: 5): Promise<readonly string[]>;
}

/** Provider-side topic discovery. Returns IDs only and never reads message content. */
export class GoogleGmailTopicSearchConnector implements GmailTopicSearchConnector {
  async searchByTopic(topic: string, maxResults: 5): Promise<readonly string[]> {
    const escaped = topic.replace(/(["\\])/g, "\\$1");
    const params = new URLSearchParams({ q: `"${escaped}"`, maxResults: String(Math.min(maxResults, 5)) });
    const response = await fetch(`${URL}?${params}`, {
      headers: { Authorization: `Bearer ${await getValidGoogleAccessToken()}` },
    });
    if (response.status === 401) throw new GoogleServiceAuthError("refresh_failed", "Gmail API rejected the access token (messages.list).");
    if (response.status === 403) throw new GoogleServiceAuthError("not_connected", "Gmail topic search requires gmail.readonly scope.");
    if (!response.ok) throw new Error(`Gmail messages.list topic search failed: ${response.status}`);
    const body = await response.json() as { messages?: readonly { id?: unknown }[] };
    return Object.freeze((body.messages ?? []).map(message => message.id)
      .filter((id): id is string => typeof id === "string").slice(0, 5));
  }
}
