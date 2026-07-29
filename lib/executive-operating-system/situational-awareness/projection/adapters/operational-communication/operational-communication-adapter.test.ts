import { describe, expect, it } from "vitest";
import { projectArtifacts } from "../../engine";
import { OperationalCommunicationProjectionAdapter } from "./adapter";

const identity = { userId: "executive-1", displayName: "Executive" } as const;
const projectedAt = "2026-07-29T10:00:00Z";

describe("OperationalCommunicationProjectionAdapter", () => {
  it("deterministically publishes intrinsic observations and exact protocol relationships", () => {
    const options = {
      identity,
      sourceId: "mail-source",
      projectedAt,
      observations: [{
        messageId: "message-2",
        sender: "sender@example.test",
        recipients: ["recipient@example.test"],
        subject: "Protocol observation",
        sentAt: "2026-07-29T09:00:00Z",
        receivedAt: "2026-07-29T09:00:05Z",
        inReplyTo: "<message-1@example.test>",
        references: ["<message-0@example.test>", "<message-1@example.test>"],
      }],
    } as const;
    const first = new OperationalCommunicationProjectionAdapter(options).project();
    const replay = new OperationalCommunicationProjectionAdapter(options).project();

    expect(first).toEqual(replay);
    expect(projectArtifacts([first]).communications).toEqual([{
      id: "mail-source:message-2",
      sender: "sender@example.test",
      recipients: ["recipient@example.test"],
      subject: "Protocol observation",
      sentAt: "2026-07-29T09:00:00Z",
      receivedAt: "2026-07-29T09:00:05Z",
      inReplyTo: "<message-1@example.test>",
      references: ["<message-0@example.test>", "<message-1@example.test>"],
    }]);
  });

  it("preserves missing and sparse protocol relationships without reconstruction", () => {
    const observation = {
      messageId: "message-3",
      sender: "sender@example.test",
      recipients: ["recipient@example.test"],
      sentAt: "2026-07-29T09:30:00Z",
      references: ["<only-observed-reference@example.test>"],
      // These connector organisational values are deliberately outside the adapter contract.
      threadId: "connector-thread",
      conversationId: "connector-conversation",
    };
    const artifact = new OperationalCommunicationProjectionAdapter({
      identity, sourceId: "mail-source", projectedAt, observations: [observation],
    }).project();
    const communication = projectArtifacts([artifact]).communications[0];

    expect(communication.references).toEqual(["<only-observed-reference@example.test>"]);
    expect(communication).not.toHaveProperty("inReplyTo");
    expect(communication).not.toHaveProperty("threadId");
    expect(communication).not.toHaveProperty("conversationId");
    expect(artifact.metadata).toEqual({});
  });

  it("does not create commitments or cross-publication relationships", () => {
    const artifact = new OperationalCommunicationProjectionAdapter({
      identity,
      sourceId: "mail-source",
      projectedAt,
      observations: [{
        messageId: "message-4", sender: "sender@example.test", recipients: [],
        sentAt: "2026-07-29T09:45:00Z", subject: "Urgent project task due tomorrow",
      }],
    }).project();
    const state = projectArtifacts([artifact]);

    expect(state.communications).toHaveLength(1);
    expect(state.commitments).toEqual([]);
    expect(state.waitingItems).toEqual([]);
    expect(state.priorities).toEqual([]);
    expect(state.projects).toEqual([]);
  });
});
