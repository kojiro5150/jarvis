import type { GmailContentConnector, GmailRetrievedMessage } from "../../content-retrieval";
import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";

const endpoint = (id: string) => {
  const params = new URLSearchParams({ format: "metadata" });
  params.append("metadataHeaders", "From");
  params.append("metadataHeaders", "Subject");
  return `https://www.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}?${params}`;
};

type Message = { payload?: { headers?: readonly { name?: string; value?: string }[] } };

/**
 * Sender + subject metadata connector for deterministic factual listing.
 * It never requests snippets, bodies, attachments, or other message content.
 */
export class GoogleGmailSubjectMetadataConnector implements GmailContentConnector {
  async retrieveMessage(resourceId: string): Promise<GmailRetrievedMessage> {
    const response = await fetch(endpoint(resourceId), {
      headers: { Authorization: `Bearer ${await getValidGoogleAccessToken()}` },
    });
    if (response.status === 401) throw new GoogleServiceAuthError("refresh_failed", "Gmail API rejected the access token (messages.get metadata).");
    if (response.status === 403) throw new GoogleServiceAuthError("not_connected", "Gmail subject metadata requires gmail.readonly scope.");
    if (!response.ok) throw new Error(`Gmail messages.get metadata failed: ${response.status}`);
    const message = await response.json() as Message;
    const headers = message.payload?.headers ?? [];
    const sender = headers.find(header => header.name?.toLowerCase() === "from")?.value;
    const subject = headers.find(header => header.name?.toLowerCase() === "subject")?.value;
    return Object.freeze({
      ...(sender ? { sender } : {}),
      ...(subject ? { subject } : {}),
    });
  }
}
