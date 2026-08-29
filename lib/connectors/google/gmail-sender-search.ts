import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";
import { parseGmailFromHeader, type GmailSenderIdentity } from "../../lighter-jarvis/gmail-sender-identity";

const LIST_URL = "https://www.googleapis.com/gmail/v1/users/me/messages";
const MESSAGE_URL = (id: string) => `https://www.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}`;

export type GmailSenderCandidateScan = Readonly<{
  complete: boolean;
  identities: readonly GmailSenderIdentity[];
}>;

export interface GmailSenderSearchConnector {
  discoverSenderIdentities(terms: readonly string[], scanLimit: number): Promise<GmailSenderCandidateScan>;
  searchByAddress(address: string, maxResults: 5): Promise<readonly string[]>;
}

type ListResponse = Readonly<{
  messages?: readonly Readonly<{ id?: unknown }>[];
  nextPageToken?: unknown;
}>;

type MetadataResponse = Readonly<{
  payload?: Readonly<{ headers?: readonly Readonly<{ name?: unknown; value?: unknown }>[] }>;
}>;

async function authenticatedFetch(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${await getValidGoogleAccessToken()}` },
  });
  if (response.status === 401) {
    throw new GoogleServiceAuthError("refresh_failed", "Gmail API rejected the access token.");
  }
  if (response.status === 403) {
    throw new GoogleServiceAuthError("not_connected", "Gmail sender search requires gmail.readonly scope.");
  }
  return response;
}

function providerSenderQuery(terms: readonly string[]): string {
  return terms.map(term => `from:${term}`).join(" ");
}

async function readSenderIdentity(id: string): Promise<GmailSenderIdentity | null> {
  const params = new URLSearchParams({ format: "metadata", metadataHeaders: "From" });
  const response = await authenticatedFetch(`${MESSAGE_URL(id)}?${params}`);
  if (!response.ok) throw new Error(`Gmail messages.get sender metadata failed: ${response.status}`);
  const body = await response.json() as MetadataResponse;
  const from = body.payload?.headers?.find(header =>
    typeof header.name === "string" && header.name.toLowerCase() === "from"
  )?.value;
  return typeof from === "string" ? parseGmailFromHeader(from) : null;
}

export class GoogleGmailSenderSearchConnector implements GmailSenderSearchConnector {
  async discoverSenderIdentities(terms: readonly string[], scanLimit: number): Promise<GmailSenderCandidateScan> {
    const ids: string[] = [];
    let pageToken: string | undefined;

    do {
      const remaining = scanLimit - ids.length;
      if (remaining <= 0) break;
      const params = new URLSearchParams({
        q: providerSenderQuery(terms),
        maxResults: String(Math.min(100, remaining)),
      });
      if (pageToken) params.set("pageToken", pageToken);
      const response = await authenticatedFetch(`${LIST_URL}?${params}`);
      if (!response.ok) throw new Error(`Gmail messages.list sender discovery failed: ${response.status}`);
      const body = await response.json() as ListResponse;
      for (const item of body.messages ?? []) {
        if (typeof item.id === "string") ids.push(item.id);
        if (ids.length >= scanLimit) break;
      }
      pageToken = typeof body.nextPageToken === "string" && body.nextPageToken.length > 0
        ? body.nextPageToken
        : undefined;
    } while (pageToken && ids.length < scanLimit);

    const complete = !pageToken;
    const identities = (await Promise.all(ids.map(readSenderIdentity)))
      .filter((identity): identity is GmailSenderIdentity => identity !== null);

    return Object.freeze({
      complete,
      identities: Object.freeze(identities),
    });
  }

  async searchByAddress(address: string, maxResults: 5): Promise<readonly string[]> {
    const params = new URLSearchParams({
      q: `from:${address}`,
      maxResults: String(Math.min(maxResults, 5)),
    });
    const response = await authenticatedFetch(`${LIST_URL}?${params}`);
    if (!response.ok) throw new Error(`Gmail messages.list sender search failed: ${response.status}`);
    const body = await response.json() as ListResponse;
    return Object.freeze((body.messages ?? [])
      .map(message => message.id)
      .filter((id): id is string => typeof id === "string")
      .slice(0, 5));
  }
}
