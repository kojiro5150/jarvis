import { describe, expect, it } from "vitest";
import { createGmailMessageListReference } from "./gmail-message-list-reference";
import { resolveGmailOrdinalReadProposal } from "./gmail-ordinal-read";
import { resolvePendingAuthorization } from "./pending-authorization";

describe("Gmail ordinal read proposal", () => {
  it("turns 'Read the first one' into exact read authority for list item 1", () => {
    const listReference = createGmailMessageListReference({
      messageIds: ["id-1", "id-2"],
    })!;

    const proposal = resolveGmailOrdinalReadProposal({
      currentUserUtterance: "Read the first one.",
      gmailMessageListReference: listReference,
    });

    expect(proposal).toMatchObject({
      handled: true,
      gmailMessageListReference: listReference,
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(proposal.reply).toContain("message 1");

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
    expect(JSON.stringify(proposal)).not.toContain("id-2");
  });
});
