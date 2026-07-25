import type { EmailThreadRecord, ConnectorSource } from "./types";

/**
 * The one email/communication shape every consumer above the connector
 * layer (OperationalState, the Communications Snapshot card, briefing.ts,
 * context-builder.ts) is allowed to depend on — same role
 * calendar-event.ts's CalendarEvent plays for the calendar connectors.
 * Both LocalGmailConnector and GoogleGmailConnector normalize into this
 * before returning anything from listRecent().
 */
export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  /** ISO 8601 datetime. */
  receivedAt: string;
  unread: boolean;
  /** Best-effort heuristic (Phase 1: unread inbox mail) — Gmail has no clean "needs my reply" signal via metadata alone. */
  needsReply: boolean;
  /** Gmail's own IMPORTANT marker, when available — the literal "importance signal" the API exposes. False for local mock data and providers that don't expose one. */
  important: boolean;
  source: ConnectorSource;
  /**
   * Human-readable mailbox/address this came from — "Main Gmail" or
   * "Governance Engineering" for the Google connector, "Local" for mock
   * data. Safe to show in the UI (see Communications Snapshot).
   */
  sourceLabel: string;
}

interface GoogleGmailMessageLike {
  id: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: { headers?: { name: string; value: string }[] };
}

function header(message: GoogleGmailMessageLike, name: string): string | undefined {
  return message.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;
}

/**
 * Maps a raw Gmail API message (fetched with format=metadata) onto the
 * canonical EmailMessage shape. `isGovernanceEngineering` is supplied by
 * the caller — it's determined by which query/recipient matched, not
 * something derivable from the message body alone.
 */
export function normalizeGmailMessage(
  message: GoogleGmailMessageLike,
  isGovernanceEngineering: boolean
): EmailMessage {
  const labelIds = message.labelIds ?? [];
  const subjectHeader = header(message, "Subject");
  const fromHeader = header(message, "From");
  const dateHeader = header(message, "Date");

  const receivedAt = message.internalDate
    ? new Date(Number(message.internalDate)).toISOString()
    : dateHeader
      ? new Date(dateHeader).toISOString()
      : new Date().toISOString();

  const unread = labelIds.includes("UNREAD");

  return {
    id: message.id,
    subject: subjectHeader && subjectHeader.trim().length > 0 ? subjectHeader : "(No subject)",
    from: fromHeader ?? "Unknown sender",
    snippet: message.snippet ?? "",
    receivedAt,
    unread,
    // Phase 1 heuristic — see the field's doc comment above.
    needsReply: unread,
    important: labelIds.includes("IMPORTANT"),
    source: "google",
    sourceLabel: isGovernanceEngineering ? "Governance Engineering" : "Main Gmail",
  };
}

/**
 * Local project memory's EmailThreadRecord only ever carried enough to
 * render a "threads needing reply" list (title/from/detail/waitingSince)
 * — it's seed/mock data representing threads already known to be
 * outstanding, not a real inbox. Synthesizes the rest of the canonical
 * shape from that.
 */
export function normalizeLocalEmailRecord(record: EmailThreadRecord, index: number): EmailMessage {
  return {
    id: `local-${index}`,
    subject: record.title,
    from: record.from,
    snippet: record.detail,
    receivedAt: approximateReceivedAt(record.waitingSince),
    unread: true,
    needsReply: true,
    important: false,
    source: "local",
    sourceLabel: "Local",
  };
}

/** Parses "2 days" / "3 days" style local mock timestamps into an approximate ISO datetime. */
function approximateReceivedAt(waitingSince: string): string {
  const match = /(\d+)\s*day/i.exec(waitingSince);
  const daysAgo = match ? Number(match[1]) : 0;
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
}

/** "2h ago" / "3d ago" style relative time for display — shared so cards and briefing don't reimplement this. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/**
 * Priority requirements (Sprint 2.7): unread direct emails, calendar
 * invitations, board/governance-related emails, Governance Engineering
 * emails, and emails needing reply should all rank higher. Calendar
 * invites aren't reliably detectable from metadata-only headers, so this
 * scores what's actually available: unread, a board/governance keyword
 * match, Governance Engineering attribution, Gmail's own IMPORTANT
 * marker, and the needsReply heuristic — ties broken by recency.
 */
function priorityScore(message: EmailMessage): number {
  let score = 0;
  if (message.unread) score += 3;
  if (/\b(board|governance)\b/i.test(`${message.subject} ${message.snippet}`)) score += 2;
  if (message.sourceLabel === "Governance Engineering") score += 2;
  if (message.important) score += 1;
  if (message.needsReply) score += 1;
  return score;
}

export function sortAndPrioritizeEmails(messages: EmailMessage[]): EmailMessage[] {
  return [...messages].sort((a, b) => {
    const scoreDiff = priorityScore(b) - priorityScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
  });
}
