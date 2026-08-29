import { describe, expect, it } from "vitest";
import {
  createGmailMessageListReference,
  resolveGmailMessageListReference,
} from "./gmail-message-list-reference";

describe("Gmail message-list reference", () => {
  it("binds ordinal language to the server-owned ordered IDs", () => {
    const reference = createGmailMessageListReference({
      messageIds: ["id-1", "id-2", "id-3"],
      now: new Date("2026-08-29T13:00:00.000Z"),
    })!;

    expect(resolveGmailMessageListReference({
      reference,
      currentUserUtterance: "Read the first one.",
      now: new Date("2026-08-29T13:01:00.000Z"),
    })).toMatchObject({ status: "matched", resourceId: "id-1", ordinal: 1 });

    expect(resolveGmailMessageListReference({
      reference,
      currentUserUtterance: "Open the second one.",
      now: new Date("2026-08-29T13:01:00.000Z"),
    })).toMatchObject({ status: "matched", resourceId: "id-2", ordinal: 2 });

    expect(resolveGmailMessageListReference({
      reference,
      currentUserUtterance: "Read the most recent one.",
      now: new Date("2026-08-29T13:01:00.000Z"),
    })).toMatchObject({ status: "matched", resourceId: "id-1", ordinal: 1 });
  });

  it("does not accept a fabricated opaque reference", () => {
    expect(resolveGmailMessageListReference({
      reference: { gmailMessageListReferenceId: "fabricated" },
      currentUserUtterance: "Read the first one.",
    })).toEqual({ status: "invalid", reference: null });
  });

  it("fails closed when the ordinal is outside the bounded list", () => {
    const reference = createGmailMessageListReference({ messageIds: ["id-1"] })!;
    expect(resolveGmailMessageListReference({
      reference,
      currentUserUtterance: "Read the fifth one.",
    })).toMatchObject({ status: "out_of_range", reference });
  });
});
