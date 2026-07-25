import { readMemory } from "@/lib/memory/store";
import type { ConnectorSource } from "./types";
import type { EmailMessage } from "./email-message";
import { normalizeLocalEmailRecord } from "./email-message";
import { GoogleGmailConnector } from "./google/gmail";
import { hasStoredGoogleTokens } from "./google/tokens";

/**
 * What JARVIS needs from "an inbox" — a merged, prioritized view of
 * recent communications, normalized to the canonical EmailMessage shape
 * (lib/connectors/email-message.ts) regardless of which mailbox or
 * account they came from. Mirrors CalendarConnector's role exactly.
 */
export interface GmailConnector {
  readonly source: ConnectorSource;
  listRecent(limit?: number): Promise<EmailMessage[]>;
}

/** Reads from the local JSON memory store. Always available, no auth required. */
export class LocalGmailConnector implements GmailConnector {
  readonly source: ConnectorSource = "local";

  async listRecent(limit = 5): Promise<EmailMessage[]> {
    const memory = await readMemory();
    return memory.gmailThreads.slice(0, limit).map(normalizeLocalEmailRecord);
  }
}

/**
 * Factory — swap providers with the GMAIL_CONNECTOR env var:
 *   - "local"  — always the local JSON memory store.
 *   - "google" — always GoogleGmailConnector (will surface an auth error
 *     from listRecent() if not actually connected/scoped yet).
 *   - unset (default, "auto") — Google once connected via
 *     /api/auth/google/start (same combined Calendar+Gmail consent as
 *     the Calendar connector), local until then.
 */
export function getGmailConnector(): GmailConnector {
  const provider = process.env.GMAIL_CONNECTOR;
  if (provider === "local") return new LocalGmailConnector();
  if (provider === "google") return new GoogleGmailConnector();
  return hasStoredGoogleTokens() ? new GoogleGmailConnector() : new LocalGmailConnector();
}
