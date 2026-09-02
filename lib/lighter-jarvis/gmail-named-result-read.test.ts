import { describe, expect, it } from "vitest";
import { createGmailMessageListReference } from "./gmail-message-list-reference";
import { resolveGmailNamedResultReadProposal } from "./gmail-named-result-read";
import { resolvePendingAuthorization } from "./pending-authorization";

describe("Gmail named result read proposal", () => {
  it("turns a unique sender name in the bounded list into exact read authority", () => {
    const listReference = createGmailMessageListReference({
      messageIds: ["id-1", "id-2"],
      senderIdentities: [
        { displayName: "Raman Bhola", address: "raman@example.com" },
        { displayName: "Alex Smith", address: "alex@example.com" },
      ],
    })!;

    const proposal = resolveGmailNamedResultReadProposal({
      currentUserUtterance: "Read the email from Raman Bhola.",
      gmailMessageListReference: listReference,
    });

    expect(proposal).toMatchObject({
      handled: true,
      gmailMessageListReference: listReference,
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(proposal.reply).toContain("position 1");

    const resolution = resolvePendingAuthorization({
      currentUserUtterance: "Yes.",
      pendingAuthorizationReference: proposal.pendingAuthorizationReference,
      expectedCapability: "gmail.read",
    });

    expect(resolution).toMatchObject({
      decision: "ALLOW",
      proposedOperation: {
        capability: "gmail.read",
        resourceId: "id-1",
        requestedFields: ["sender", "subject", "plain_text_body"],
      },
    });
    expect(JSON.stringify(proposal)).not.toContain("id-1");
    expect(JSON.stringify(proposal)).not.toContain("raman@example.com");
  });

  it("fails closed for ambiguous or absent sender matches without creating authority", () => {
    const listReference = createGmailMessageListReference({
      messageIds: ["id-1", "id-2"],
      senderIdentities: [
        { displayName: "Raman Bhola", address: "raman@example.com" },
        { displayName: "Raman Bhola", address: "raman@example.com" },
      ],
    })!;

    const ambiguous = resolveGmailNamedResultReadProposal({
      currentUserUtterance: "Read the email from Raman Bhola.",
      gmailMessageListReference: listReference,
    });
    expect(ambiguous).toMatchObject({ handled: true, gmailMessageListReference: listReference });
    expect(ambiguous.pendingAuthorizationReference).toBeUndefined();
    expect(ambiguous.reply).toContain("More than one message");

    const absent = resolveGmailNamedResultReadProposal({
      currentUserUtterance: "Read the email from Georgia.",
      gmailMessageListReference: listReference,
    });
    expect(absent).toMatchObject({ handled: true, gmailMessageListReference: listReference });
    expect(absent.pendingAuthorizationReference).toBeUndefined();
    expect(absent.reply).toContain("does not match");
  });
});