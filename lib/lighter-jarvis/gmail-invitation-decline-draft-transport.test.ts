import { describe, expect, it } from "vitest";

import { OMITTED_GMAIL_INVITATION_DECLINE_DRAFT } from "./gmail-invitation-decline-draft-contract";
import { isGmailInvitationDeclineDraftReuse, projectGmailInvitationDeclineDraftsForTransport } from "./gmail-invitation-decline-draft-transport";

describe("Gmail invitation-decline draft replay boundary", () => {
  const release = "Proposed reply to Raman Bhola\nSubject: Invitation\n\nHi Raman, thank you for the invitation, but I must decline.\n\nDrafted from the freshly authorised exact Gmail message. This message has not been sent.";

  it("omits the complete derived private draft from model-bound replay without mutating visible history", () => {
    const visible = [{ role: "assistant" as const, content: release }];
    expect(projectGmailInvitationDeclineDraftsForTransport(visible, true)).toEqual([
      { role: "assistant", content: OMITTED_GMAIL_INVITATION_DECLINE_DRAFT },
    ]);
    expect(visible[0].content).toBe(release);
    expect(projectGmailInvitationDeclineDraftsForTransport(visible, false)[0].content).toBe(release);
  });

  it.each(["Edit that draft.", "Shorten that reply.", "Make that draft warmer.", "Send it."])(
    "recognises bounded unsupported reuse: %s",
    (utterance) => expect(isGmailInvitationDeclineDraftReuse(utterance)).toBe(true),
  );
});
