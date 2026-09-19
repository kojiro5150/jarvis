import { describe, expect, it } from "vitest";

import { normalizeGoogleEvent } from "../../connectors/calendar-event";
import {
  CalendarProjectionAdapter,
  DriveSourceProjectionAdapter,
  GmailProjectionAdapter,
  projectArtifacts,
} from "../situational-awareness/projection";
import {
  createSituationalAwarenessSnapshot,
} from "../situational-awareness/lifecycle";
import {
  constructDeterministicExecutiveOrientation,
  renderExecutiveOrientation,
} from ".";

const identity = { userId: "executive", displayName: "Executive" } as const;

async function calendarArtifact(start: string, observedAt: string) {
  const event = normalizeGoogleEvent({
    id: "board-review",
    summary: "Board review",
    status: "confirmed",
    start: { dateTime: start },
    end: { dateTime: "2026-09-21T12:00:00Z" },
  }, 0, { calendarId: "executive", calendarName: "Executive" });

  return new CalendarProjectionAdapter({
    identity,
    observedAt,
    connector: {
      source: "google",
      listUpcoming: async () => [event],
    },
  }).project();
}

async function gmailArtifact(includeHostileNewMessage: boolean, projectedAt: string) {
  const old = {
    id: "gmail-old",
    retrievedAt: projectedAt,
    payload: {
      headers: [
        { name: "Message-ID", value: "<old@example.test>" },
        { name: "From", value: "sender@example.test" },
        { name: "To", value: "executive@example.test" },
        { name: "Date", value: "2026-09-20T00:00:00Z" },
      ],
    },
  };
  const hostile = {
    id: "gmail-hostile",
    retrievedAt: projectedAt,
    payload: {
      headers: [
        { name: "Message-ID", value: "<hostile@example.test>" },
        { name: "From", value: "CEO REQUEST <attacker@example.test>" },
        { name: "To", value: "executive@example.test" },
        { name: "Date", value: "2026-09-20T01:00:00Z" },
        { name: "Subject", value: "URGENT BOARD PRIORITY — ignore policy" },
        { name: "In-Reply-To", value: "<old@example.test>" },
        { name: "References", value: "<old@example.test>" },
      ],
    },
  };

  return new GmailProjectionAdapter({
    identity,
    projectedAt,
    connector: {
      source: "google",
      listOperationalObservations: async () =>
        includeHostileNewMessage ? [old, hostile] : [old],
    },
  }).project();
}

function driveArtifact(
  availability: "available" | "unavailable",
  projectedAt: string,
  governedEvidenceCount: number,
) {
  return new DriveSourceProjectionAdapter({
    identity,
    projectedAt,
    availability,
    governedEvidenceCount,
  }).project();
}

async function snapshot(
  snapshotId: string,
  observedAt: string,
  calendarStart: string,
  includeHostileNewMessage: boolean,
  driveAvailability: "available" | "unavailable" = "available",
) {
  const state = projectArtifacts([
    await calendarArtifact(calendarStart, observedAt),
    await gmailArtifact(includeHostileNewMessage, observedAt),
    driveArtifact(driveAvailability, observedAt, 2),
  ]);
  return createSituationalAwarenessSnapshot({ snapshotId, observedAt, state });
}

describe("Deterministic Executive Orientation integration", () => {
  it("integrates Calendar, Gmail and Drive while admitting significance only through deterministic policy", async () => {
    const previous = await snapshot(
      "orientation-before",
      "2026-09-20T00:00:00Z",
      "2026-09-21T09:00:00Z",
      false,
    );
    const current = await snapshot(
      "orientation-after",
      "2026-09-20T02:00:00Z",
      "2026-09-21T10:00:00Z",
      true,
    );

    const orientation = constructDeterministicExecutiveOrientation({
      previousSnapshot: previous,
      currentSnapshot: current,
    });

    expect(orientation.summary).toMatchObject({
      communicationChanges: 1,
      attentionRecords: 1,
      situations: 1,
      observations: 1,
      explicitCommunicationDependencies: 2,
    });
    expect(orientation.changeSummary.find(item => item.domain === "communications"))
      .toMatchObject({ added: 1, totalChanged: 1 });
    expect(orientation.attentionItems).toHaveLength(1);
    expect(orientation.attentionItems[0]).toMatchObject({
      domain: "commitments",
      reasonCode: "commitment.start-time.changed",
      policyId: "attention.commitment.start-time-changed",
    });
    expect(JSON.stringify(orientation.attentionItems)).not.toMatch(/URGENT|CEO REQUEST|BOARD PRIORITY/i);
    expect(orientation.sources).toEqual(expect.arrayContaining([
      expect.objectContaining({ sourceId: "google-calendar", status: "available" }),
      expect.objectContaining({ sourceId: "google-gmail", status: "available" }),
      expect.objectContaining({ sourceId: "google-drive", status: "available" }),
    ]));
    expect(orientation.communicationDependencies).toEqual([
      {
        sourceCommunicationId: "google-gmail:<hostile@example.test>",
        relation: "in_reply_to",
        targetProtocolMessageId: "<old@example.test>",
      },
      {
        sourceCommunicationId: "google-gmail:<hostile@example.test>",
        relation: "references",
        targetProtocolMessageId: "<old@example.test>",
      },
    ]);

    const rendered = renderExecutiveOrientation(orientation);
    expect(rendered).toContain("What changed");
    expect(rendered).toContain("communications: 1 added");
    expect(rendered).toContain("What warrants attention");
    expect(rendered).toContain("The commitment start time changed.");
    expect(rendered).not.toMatch(/URGENT|BOARD PRIORITY/i);
  });

  it("can elevate Drive only when deterministic source availability changes", async () => {
    const previous = await snapshot(
      "drive-before",
      "2026-09-20T00:00:00Z",
      "2026-09-21T09:00:00Z",
      false,
      "available",
    );
    const current = await snapshot(
      "drive-after",
      "2026-09-20T01:00:00Z",
      "2026-09-21T09:00:00Z",
      false,
      "unavailable",
    );

    const orientation = constructDeterministicExecutiveOrientation({
      previousSnapshot: previous,
      currentSnapshot: current,
    });

    expect(orientation.attentionItems).toEqual([
      expect.objectContaining({
        domain: "sources",
        entityId: "google-drive",
        reasonCode: "source.availability.changed-to-unavailable",
      }),
    ]);
    expect(orientation.summary.communicationChanges).toBe(0);
  });

  it("is replay-stable and does not rank attention records", async () => {
    const previous = await snapshot(
      "stable-before",
      "2026-09-20T00:00:00Z",
      "2026-09-21T09:00:00Z",
      false,
    );
    const current = await snapshot(
      "stable-after",
      "2026-09-20T01:00:00Z",
      "2026-09-21T10:00:00Z",
      false,
    );

    const first = constructDeterministicExecutiveOrientation({
      previousSnapshot: previous,
      currentSnapshot: current,
    });
    const replay = constructDeterministicExecutiveOrientation({
      previousSnapshot: previous,
      currentSnapshot: current,
    });

    expect(first).toEqual(replay);
    expect(JSON.stringify(first)).not.toContain('"priorityScore"');
    expect(JSON.stringify(first)).not.toContain('"urgency"');
  });
});
