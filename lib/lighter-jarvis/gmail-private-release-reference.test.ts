import { beforeEach, describe, expect, it } from "vitest";

import {
  createGmailPrivateReleaseReference,
  isGmailPrivateReleaseContentFollowUp,
  resetGmailPrivateReleaseReferencesForTests,
  resolveGmailPrivateReleaseReference,
} from "./gmail-private-release-reference";

describe("Gmail private release references", () => {
  beforeEach(resetGmailPrivateReleaseReferencesForTests);

  it("stores only bounded server-owned release metadata and expires after fifteen minutes", () => {
    const body = "private body ".repeat(1_000);
    const reference = createGmailPrivateReleaseReference({
      resourceId: "gmail-provider-id",
      requestedFields: ["subject", "plain_text_body"],
      presentation: body,
      now: 1_000,
    });
    expect(reference).toEqual({
      gmailPrivateReleaseReferenceId: expect.stringMatching(/^[0-9a-f-]{36}$/),
    });
    const record = resolveGmailPrivateReleaseReference(reference, 1_001);
    expect(record).toMatchObject({
      resourceId: "gmail-provider-id",
      requestedFields: ["subject", "plain_text_body"],
      status: "eligible",
      createdAt: 1_000,
      expiresAt: 901_000,
      presentationDigest: expect.stringMatching(/^[0-9a-f]{64}$/),
    });
    expect(JSON.stringify(record)).not.toContain(body);
    expect(resolveGmailPrivateReleaseReference(reference, 901_000)).toBeNull();
  });

  it("fails closed for fabricated and capability-shaped references", () => {
    expect(resolveGmailPrivateReleaseReference({
      gmailPrivateReleaseReferenceId: "00000000-0000-4000-8000-000000000000",
    })).toBeNull();
    expect(resolveGmailPrivateReleaseReference({
      drivePrivateReleaseReferenceId: "00000000-0000-4000-8000-000000000000",
    })).toBeNull();
  });

  it.each([
    "Summarise that email.",
    "Summarize that email.",
    "What did that email say?",
    "What are the main points of that email?",
    "Explain that email.",
    "Analyse that email.",
    "Analyze that email.",
    "Draft a reply to that email.",
    "Draft a reply to the sender.",
    "Compare that email with this.",
    "Does that email conflict with this?",
    "Draft a reply to Raman, saying thank you for the invite but politely decline.",
  ])("recognises the frozen closed grammar: %s", (utterance) => {
    expect(isGmailPrivateReleaseContentFollowUp(utterance)).toBe(true);
  });

  it("does not broaden containment to unrelated conversation", () => {
    expect(isGmailPrivateReleaseContentFollowUp("Draft a reply to Alex about tomorrow."))
      .toBe(false);
  });
});
