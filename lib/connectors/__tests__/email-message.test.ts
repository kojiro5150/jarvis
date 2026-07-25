import { describe, it, expect } from "vitest";
import {
  normalizeGmailMessage,
  normalizeLocalEmailRecord,
  sortAndPrioritizeEmails,
  relativeTime,
} from "../email-message";
import { getOpeningBrief, urgentCommunications } from "../../briefing";
import type { OperationalState } from "../../operational-state";

/**
 * Sprint 2.7 (Native Gmail Connector) regression coverage: the canonical
 * EmailMessage shape, Main Gmail vs Governance Engineering attribution
 * (same account, detected by recipient address per the "Gmail source
 * clarification" follow-up), merge/priority ordering, and the same
 * empty/populated defensiveness discipline established for Calendar.
 */

function baseState(overrides: Partial<OperationalState> = {}): OperationalState {
  return {
    priorities: [
      { rank: 1, title: "Governance reasoning review", detail: "Final pass.", due: "Today", urgent: true },
    ],
    projects: [{ name: "Governance Reasoning Framework", tag: "In review", progress: 78, tagColor: "cyan" }],
    signals: [],
    blockers: [],
    calendar: [],
    calendarStatus: "unavailable",
    gmailThreads: [],
    gmailStatus: "unavailable",
    driveFiles: [],
    connectorStatuses: [
      { name: "calendar", source: "local", connected: false },
      { name: "gmail", source: "local", connected: false },
      { name: "drive", source: "local", connected: false },
    ],
    updatedAt: new Date(0).toISOString(),
    ...overrides,
  };
}

function gmailFixture(overrides: Partial<Parameters<typeof normalizeGmailMessage>[0]> = {}) {
  return {
    id: "msg-1",
    labelIds: ["INBOX", "UNREAD"],
    snippet: "Following up on the board pack figures...",
    internalDate: String(new Date("2026-07-08T14:00:00Z").getTime()),
    payload: {
      headers: [
        { name: "Subject", value: "Re: Board pack — final figures" },
        { name: "From", value: "Finance <finance@example.com>" },
        { name: "Date", value: "Wed, 8 Jul 2026 14:00:00 +0000" },
      ],
    },
    ...overrides,
  };
}

describe("normalizeGmailMessage", () => {
  it("maps a realistic Gmail metadata response onto the canonical shape", () => {
    const message = normalizeGmailMessage(gmailFixture(), false);

    expect(message.id).toBe("msg-1");
    expect(message.subject).toBe("Re: Board pack — final figures");
    expect(message.from).toBe("Finance <finance@example.com>");
    expect(message.snippet).toContain("board pack figures");
    expect(message.unread).toBe(true);
    expect(message.needsReply).toBe(true);
    expect(message.source).toBe("google");
    expect(message.sourceLabel).toBe("Main Gmail");
    expect(new Date(message.receivedAt).toISOString()).toBe(message.receivedAt);
  });

  it("labels a message Governance Engineering when the caller says it matched that query, even though it's the same Gmail account", () => {
    const message = normalizeGmailMessage(
      gmailFixture({
        id: "msg-2",
        payload: {
          headers: [
            { name: "Subject", value: "Quarterly governance review" },
            { name: "From", value: "board@governanceengineering.com.au" },
            { name: "To", value: "info@governanceengineering.com.au" },
          ],
        },
      }),
      true
    );
    expect(message.sourceLabel).toBe("Governance Engineering");
    expect(message.source).toBe("google");
  });

  it("falls back to placeholders for a missing subject/from", () => {
    const message = normalizeGmailMessage({ id: "msg-3", labelIds: [] }, false);
    expect(message.subject).toBe("(No subject)");
    expect(message.from).toBe("Unknown sender");
    expect(message.unread).toBe(false);
  });

  it("reads Gmail's IMPORTANT label as the importance signal", () => {
    const message = normalizeGmailMessage(
      gmailFixture({ id: "msg-4", labelIds: ["INBOX", "IMPORTANT"] }),
      false
    );
    expect(message.important).toBe(true);
    expect(message.unread).toBe(false);
  });
});

describe("normalizeLocalEmailRecord", () => {
  it("maps a local seed thread onto the canonical shape", () => {
    const message = normalizeLocalEmailRecord(
      { title: "Re: Board pack — final figures", from: "Finance", detail: "Waiting on confirmation.", waitingSince: "2 days" },
      0
    );
    expect(message.id).toBe("local-0");
    expect(message.subject).toBe("Re: Board pack — final figures");
    expect(message.source).toBe("local");
    expect(message.sourceLabel).toBe("Local");
    expect(message.needsReply).toBe(true);
  });
});

describe("sortAndPrioritizeEmails", () => {
  it("ranks unread + Governance Engineering + board keyword above a routine read message", () => {
    const routine = normalizeGmailMessage(
      gmailFixture({ id: "routine", labelIds: ["INBOX"], payload: { headers: [{ name: "Subject", value: "Lunch next week?" }] } }),
      false
    );
    const urgent = normalizeGmailMessage(
      gmailFixture({
        id: "urgent",
        labelIds: ["INBOX", "UNREAD"],
        payload: { headers: [{ name: "Subject", value: "Governance board decision needed" }] },
      }),
      true
    );

    const sorted = sortAndPrioritizeEmails([routine, urgent]);
    expect(sorted[0].id).toBe("urgent");
  });

  it("breaks ties by recency", () => {
    const older = normalizeGmailMessage(
      gmailFixture({ id: "older", internalDate: String(new Date("2026-07-01T00:00:00Z").getTime()) }),
      false
    );
    const newer = normalizeGmailMessage(
      gmailFixture({ id: "newer", internalDate: String(new Date("2026-07-08T00:00:00Z").getTime()) }),
      false
    );
    const sorted = sortAndPrioritizeEmails([older, newer]);
    expect(sorted[0].id).toBe("newer");
  });
});

describe("relativeTime", () => {
  it("formats a recent timestamp as a short relative string", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(relativeTime(oneHourAgo)).toMatch(/^\d+h ago$/);
  });
});

describe("briefing.ts defensiveness for communications (mirrors the Calendar crash fix)", () => {
  it("does not throw with an empty communications list", () => {
    const state = baseState({ gmailThreads: [] });
    expect(() => getOpeningBrief("herald", state)).not.toThrow();
    expect(getOpeningBrief("herald", state)).toBe("Inbox is clear — nothing waiting on a reply.");
    expect(() => getOpeningBrief("dawnwatch", state)).not.toThrow();
    expect(getOpeningBrief("dawnwatch", state)).toContain("Communications clear.");
  });

  it("does not throw with a populated, mixed-source communications list, and DAWNWATCH surfaces urgency", () => {
    const local = normalizeLocalEmailRecord(
      { title: "Partnership follow-up", from: "External counsel", detail: "Needs a reply.", waitingSince: "3 days" },
      0
    );
    const governance = normalizeGmailMessage(
      gmailFixture({ id: "gov-1", labelIds: ["INBOX", "UNREAD"] }),
      true
    );
    const state = baseState({ gmailThreads: [local, governance] });

    expect(() => getOpeningBrief("herald", state)).not.toThrow();
    expect(getOpeningBrief("herald", state)).toContain("Governance Engineering");
    expect(() => getOpeningBrief("dawnwatch", state)).not.toThrow();
    expect(getOpeningBrief("dawnwatch", state)).toContain("communication");
    expect(urgentCommunications(state).length).toBeGreaterThan(0);
  });
});
