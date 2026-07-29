import { describe, expect, it } from "vitest";
import { projectArtifacts } from "../../engine";
import { GmailProjectionAdapter } from "./adapter";
import { normalizeGmailObservation } from "./normalizer";
import type { GmailMessageObservation } from "./types";

const identity = { userId: "executive", displayName: "Executive" } as const;
const projectedAt = "2026-07-29T12:00:00Z";
const complete: GmailMessageObservation = {
  id: "gmail-123", threadId: "thread-connector-only", internalDate: "1785322800000", labelIds: ["UNREAD"],
  payload: {
    mimeType: "multipart/mixed",
    headers: [
      { name: "Message-ID", value: "<message-123@example.test>" },
      { name: "From", value: "Sender <sender@example.test>" },
      { name: "To", value: "one@example.test, Two <two@example.test>" },
      { name: "Cc", value: "copy@example.test" },
      { name: "Date", value: "Wed, 29 Jul 2026 11:00:00 +0000" },
      { name: "In-Reply-To", value: "<parent@example.test>" },
      { name: "References", value: "<root@example.test> <parent@example.test>" },
      { name: "Subject", value: "must never be projected" },
    ],
    parts: [{ mimeType: "text/html" }, { mimeType: "application/pdf", filename: "must-not-leak.pdf" }],
  },
};

const connector = (observations: readonly GmailMessageObservation[]) => ({
  source: "google" as const,
  listOperationalObservations: async () => observations,
});
const adapter = (observations: readonly GmailMessageObservation[]) => new GmailProjectionAdapter({ identity, projectedAt, connector: connector(observations) });

describe("GmailProjectionAdapter", () => {
  it("projects complete protocol metadata, keeps Gmail facts in provenance, and excludes content", async () => {
    const artifact = await adapter([complete]).project();
    expect(artifact.entities.communications).toEqual([{
      id: "google-gmail:<message-123@example.test>", sender: "Sender <sender@example.test>",
      recipients: ["one@example.test", "Two <two@example.test>", "copy@example.test"],
      sentAt: "2026-07-29T11:00:00.000Z", inReplyTo: "<parent@example.test>",
      references: ["<root@example.test>", "<parent@example.test>"],
    }]);
    expect(JSON.parse(artifact.metadata.connectorProvenance)).toEqual([expect.objectContaining({
      gmailMessageId: "gmail-123", gmailThreadId: "thread-connector-only", unread: true, hasAttachment: true,
    })]);
    expect(JSON.stringify(artifact.entities)).not.toContain("must never be projected");
    expect(JSON.stringify(artifact)).not.toContain("must-not-leak.pdf");
    expect(Object.isFrozen(artifact)).toBe(true);
    expect(Object.isFrozen(artifact.entities.communications?.[0].references)).toBe(true);
  });

  it("preserves absent In-Reply-To and References despite Gmail thread grouping", async () => {
    const sparse = { ...complete, payload: { ...complete.payload, headers: complete.payload?.headers?.filter(({ name }) => !["In-Reply-To", "References"].includes(name)) } };
    const communication = (await adapter([sparse]).project()).entities.communications?.[0];
    expect(communication).not.toHaveProperty("inReplyTo");
    expect(communication?.references).toEqual([]);
    expect(communication).not.toHaveProperty("threadId");
  });

  it("preserves protocol linkage when Gmail thread grouping is absent", () => {
    const normalized = normalizeGmailObservation({ ...complete, threadId: undefined });
    expect(normalized.inReplyTo).toBe("<parent@example.test>");
    expect(normalized.references).toEqual(["<root@example.test>", "<parent@example.test>"]);
    expect(normalized.provenance).not.toHaveProperty("gmailThreadId");
  });

  it.each([
    ["missing Message-ID", complete.payload?.headers?.filter(({ name }) => name !== "Message-ID"), "missing Message-ID"],
    ["malformed Message-ID", complete.payload?.headers?.map((header) => header.name === "Message-ID" ? { ...header, value: "not-an-id" } : header), "malformed Message-ID"],
    ["duplicate Message-ID", [...(complete.payload?.headers ?? []), { name: "message-id", value: "<duplicate@example.test>" }], "duplicate Message-ID"],
    ["duplicate relationship", [...(complete.payload?.headers ?? []), { name: "references", value: "<other@example.test>" }], "duplicate References"],
  ])("rejects %s rather than inventing or selecting identity", async (_label, headers, expected) => {
    await expect(adapter([{ ...complete, payload: { ...complete.payload, headers } }]).project()).rejects.toThrow(expected);
  });

  it("is deterministic on replay and remains isolated from other publications", async () => {
    const first = await adapter([complete]).project();
    const replay = await adapter([complete]).project();
    expect(first).toEqual(replay);
    const state = projectArtifacts([first]);
    expect(state.communications).toHaveLength(1);
    expect(state.commitments).toEqual([]); expect(state.priorities).toEqual([]); expect(state.waitingItems).toEqual([]);
    expect(Object.isFrozen(state)).toBe(true);
  });

});

describe.runIf(process.env.GMAIL_LIVE_PROBE === "1")("live Gmail projection probe", () => {
  it("projects metadata without persisting observations", async () => {
    const { GoogleGmailConnector } = await import("../../../../../connectors/google/gmail");
    const artifact = await new GmailProjectionAdapter({ identity, projectedAt, connector: new GoogleGmailConnector(), limit: 10 }).project();
    expect(projectArtifacts([artifact]).communications.length).toBeGreaterThanOrEqual(0);
  });
});
