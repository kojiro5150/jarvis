import type { GmailConnector } from "../gmail";
import type { ConnectorSource } from "../types";
import type { EmailMessage } from "../email-message";
import { normalizeGmailMessage, sortAndPrioritizeEmails } from "../email-message";
import { getValidGoogleAccessToken } from "./access-token";
import { GoogleServiceAuthError } from "./auth-error";

/** Re-exported under this name to match the calendar connector's naming convention for callers that want a Gmail-specific alias. */
export { GoogleServiceAuthError as GoogleGmailAuthError };

const GMAIL_MESSAGES_LIST_URL = "https://www.googleapis.com/gmail/v1/users/me/messages";
const GMAIL_MESSAGE_GET_URL = (id: string) =>
  `https://www.googleapis.com/gmail/v1/users/me/messages/${id}`;

/**
 * See "Gmail source clarification" (Sprint 2.7 follow-up): this is a
 * separate mailbox/address already routed into the same Gmail account
 * and visible via label/recipient inside Gmail — not a second OAuth
 * account. Detected here by recipient address, which is reliable
 * regardless of how Sam's own Gmail filters/labels are named.
 */
const GOVERNANCE_ENGINEERING_ADDRESS = "info@governanceengineering.com.au";

/** Gmail search syntax — excludes the categories/locations that would just be noise in an operational snapshot. */
const MAIN_INBOX_QUERY = "in:inbox -category:promotions -category:social -in:spam -in:trash";
const GOVERNANCE_ENGINEERING_QUERY = `to:${GOVERNANCE_ENGINEERING_ADDRESS} -in:spam -in:trash`;

interface GmailListResponse {
  messages?: { id: string }[];
}

interface GoogleGmailPart {
  mimeType?: string;
  filename?: string;
  headers?: readonly { name: string; value: string }[];
  parts?: readonly GoogleGmailPart[];
}

export interface GoogleGmailMessageDetail {
  id: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: GoogleGmailPart;
  retrievedAt: string;
}

export interface GmailProductionAcquisition {
  readonly messages: EmailMessage[];
  readonly observations: readonly GoogleGmailMessageDetail[];
  readonly observedAt: string;
  readonly snapshotId: string;
}

interface QueryResult {
  ids: string[];
  /** True if Google rejected the request specifically for missing scope, not a bad/expired token. */
  insufficientScope: boolean;
}

/**
 * Real Gmail connector — implements the same GmailConnector interface the
 * local connector does. Reads the authenticated account's inbox (minus
 * promotions/social/spam/trash) and, separately, anything addressed to
 * the Governance Engineering mailbox that's routed into this same
 * account, merges and de-duplicates them, and returns one chronological,
 * priority-sorted list with source attribution preserved per message.
 * Still gmail.readonly only — no send, label, or modify access.
 */
export class GoogleGmailConnector implements GmailConnector {
  readonly source = "google" as const satisfies ConnectorSource;

  constructor(private readonly clock: () => Date = () => new Date()) {}

  /**
   * Message IDs matching a Gmail search query. A 401 means the whole
   * token is bad and propagates immediately (triggers a reconnect
   * prompt). A 403 usually means the token is valid but was granted
   * before Gmail was in scope — reported back via `insufficientScope`
   * rather than thrown, so both queries get a chance to run and the
   * caller can decide what "neither query could even ask" means.
   */
  private async listMessageIds(
    accessToken: string,
    query: string,
    limit: number
  ): Promise<QueryResult> {
    const params = new URLSearchParams({ q: query, maxResults: String(limit) });
    const res = await fetch(`${GMAIL_MESSAGES_LIST_URL}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new GoogleServiceAuthError(
          "refresh_failed",
          "Gmail API rejected the access token (messages.list)."
        );
      }
      if (res.status === 403) {
        console.warn(`[google/gmail] messages.list forbidden for query "${query}" — likely missing gmail.readonly scope.`);
        return { ids: [], insufficientScope: true };
      }
      console.warn(`[google/gmail] messages.list failed for query "${query}": ${res.status}`);
      return { ids: [], insufficientScope: false };
    }

    const json = (await res.json()) as GmailListResponse;
    return { ids: (json.messages ?? []).map((m) => m.id), insufficientScope: false };
  }

  /** Full detail for one message, metadata only (no body) — headers, snippet, labels, timestamp. */
  private async getMessageDetail(
    accessToken: string,
    id: string
  ): Promise<GoogleGmailMessageDetail | null> {
    const params = new URLSearchParams({ format: "metadata" });
    ["Message-ID", "From", "To", "Cc", "Bcc", "Date", "In-Reply-To", "References", "Subject"]
      .forEach((h) => params.append("metadataHeaders", h));

    const res = await fetch(`${GMAIL_MESSAGE_GET_URL(id)}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new GoogleServiceAuthError(
          "refresh_failed",
          "Gmail API rejected the access token (messages.get)."
        );
      }
      if (res.status === 403) {
        throw new GoogleServiceAuthError(
          "not_connected",
          `Gmail API did not authorise message detail retrieval for "${id}".`
        );
      }
      console.warn(`[google/gmail] messages.get failed for "${id}": ${res.status} — skipping this message.`);
      return null;
    }

    const detail = (await res.json()) as Omit<GoogleGmailMessageDetail, "retrievedAt">;
    // The connector has now received the authoritative detail response and its metadata headers.
    return { ...detail, retrievedAt: this.clock().toISOString() };
  }

  async listRecent(limit = 5): Promise<EmailMessage[]> {
    return (await this.acquireRecent(limit)).messages;
  }

  /** One production acquisition, projected separately for legacy and canonical consumers. */
  async acquireRecent(limit = 5): Promise<GmailProductionAcquisition> {
    const accessToken = await getValidGoogleAccessToken();

    const [mainResult, governanceResult] = await Promise.all([
      this.listMessageIds(accessToken, MAIN_INBOX_QUERY, limit),
      this.listMessageIds(accessToken, GOVERNANCE_ENGINEERING_QUERY, limit),
    ]);

    // Both queries came back forbidden — the stored token predates the
    // gmail.readonly scope (e.g. it was granted back when only Calendar
    // was requested). That's not a bad/expired token, just a missing
    // grant — surfaces as "unavailable" with a Connect prompt, not
    // "refresh required".
    if (mainResult.insufficientScope && governanceResult.insufficientScope) {
      throw new GoogleServiceAuthError(
        "not_connected",
        "Gmail scope not granted yet — reconnect to include Gmail access."
      );
    }

    const governanceIds = new Set(governanceResult.ids);
    // Governance Engineering attribution wins on overlap — more specific
    // and more useful than "Main Gmail" for a message that's both.
    const orderedIds = [
      ...governanceResult.ids,
      ...mainResult.ids.filter((id) => !governanceIds.has(id)),
    ];

    // Small headroom before the final priority sort + trim, so a
    // borderline-relevant message from one query doesn't get dropped
    // before it's had a chance to be ranked against the rest.
    const idsToFetch = orderedIds.slice(0, limit * 2);

    const details = await Promise.all(idsToFetch.map((id) => this.getMessageDetail(accessToken, id)));

    const messages = details
      .filter((d): d is GoogleGmailMessageDetail => d !== null)
      .map((detail) => normalizeGmailMessage(detail, governanceIds.has(detail.id)));

    const selectedMessages = sortAndPrioritizeEmails(messages).slice(0, limit);
    const selectedIds = new Set(selectedMessages.map(({ id }) => id));
    const observations = Object.freeze(details.filter((detail): detail is GoogleGmailMessageDetail =>
      detail !== null && selectedIds.has(detail.id)).map((detail) => Object.freeze({ ...detail })));
    const observedAt = observations.reduce((latest, observation) =>
      observation.retrievedAt > latest ? observation.retrievedAt : latest, observations[0]?.retrievedAt ?? this.clock().toISOString());
    const snapshotId = `google-gmail:${observations.map(({ id, retrievedAt }) => `${id}@${retrievedAt}`).join("|") || `empty@${observedAt}`}`;
    return Object.freeze({ messages: selectedMessages, observations, observedAt, snapshotId });
  }

  /** Metadata-only production observation path used by the constitutional projection adapter. */
  async listOperationalObservations(limit = 50): Promise<readonly GoogleGmailMessageDetail[]> {
    return (await this.acquireRecent(limit)).observations;
  }
}
