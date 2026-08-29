import type { GmailContentConnector, GmailRetrievedMessage } from "../content-retrieval";
import { getValidGoogleAccessToken } from "../connectors/google/access-token";

const endpoint = (id: string) => `https://www.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}?format=full`;

type Part = { mimeType?: string; filename?: string; body?: { data?: string }; parts?: Part[] };
type Message = { snippet?: string; payload?: Part & { headers?: { name?: string; value?: string }[] } };
const decode = (data: string) => Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");

function collect(part: Part | undefined, bodies: string[], attachments: { filename: string; mimeType: string }[]): void {
  if (!part) return;
  if (part.mimeType === "text/plain" && part.body?.data) bodies.push(decode(part.body.data));
  if (part.filename) attachments.push({ filename: part.filename, mimeType: part.mimeType ?? "application/octet-stream" });
  part.parts?.forEach((child) => collect(child, bodies, attachments));
}

/** Identified-message-only connector: deliberately contains no list or search operation. */
export class GoogleGmailContentConnector implements GmailContentConnector {
  async retrieveMessage(resourceId: string): Promise<GmailRetrievedMessage> {
    const token = await getValidGoogleAccessToken();
    const response = await fetch(endpoint(resourceId), { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error(`Gmail message retrieval failed (${response.status})`);
    const message = await response.json() as Message;
    const bodies: string[] = []; const attachments: { filename: string; mimeType: string }[] = [];
    collect(message.payload, bodies, attachments);
    const headers = message.payload?.headers ?? [];
    const sender = headers.find((header) => header.name?.toLowerCase() === "from")?.value;
    const subject = headers.find((header) => header.name?.toLowerCase() === "subject")?.value;
    return { ...(sender ? { sender } : {}), ...(subject ? { subject } : {}), ...(message.snippet ? { snippet: message.snippet } : {}), ...(bodies.length ? { plainTextBody: bodies.join("\n") } : {}), attachments };
  }
}
