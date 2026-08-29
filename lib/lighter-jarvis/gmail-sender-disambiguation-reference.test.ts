import { describe, expect, it } from "vitest";
import {
  createGmailSenderDisambiguationReference,
  resolveGmailSenderDisambiguationReference,
} from "./gmail-sender-disambiguation-reference";

describe("Gmail sender disambiguation reference", () => {
  const candidates = [
    { displayName: "Georgia McDonald", address: "georgia.mcdonald@example.com" },
    { displayName: "Georgia Radford", address: "georgia.radford@example.com" },
  ] as const;

  it("resolves a bare follow-up only against stored real candidates", () => {
    const reference = createGmailSenderDisambiguationReference({
      identities: candidates,
      maxResults: 5,
      now: new Date("2026-08-29T00:00:00Z"),
    });
    expect(reference).toEqual({ gmailSenderDisambiguationReferenceId: expect.any(String) });

    expect(resolveGmailSenderDisambiguationReference({
      reference,
      currentUserUtterance: "Georgia McDonald.",
      now: new Date("2026-08-29T00:01:00Z"),
    })).toEqual({
      status: "matched",
      identity: candidates[0],
      maxResults: 5,
      reference: null,
    });
  });

  it("does not fuzzy-match a misspelled sender refinement", () => {
    const reference = createGmailSenderDisambiguationReference({
      identities: candidates,
      maxResults: 5,
      now: new Date("2026-08-29T00:00:00Z"),
    });

    const result = resolveGmailSenderDisambiguationReference({
      reference,
      currentUserUtterance: "Georgia MacDonald.",
      now: new Date("2026-08-29T00:01:00Z"),
    });
    expect(result).toMatchObject({
      status: "not_found",
      identities: candidates,
      reference,
    });
  });

  it("fails closed after repeated unmatched refinements", () => {
    const reference = createGmailSenderDisambiguationReference({
      identities: candidates,
      maxResults: 5,
      now: new Date("2026-08-29T00:00:00Z"),
    });

    expect(resolveGmailSenderDisambiguationReference({
      reference,
      currentUserUtterance: "Georgia MacDonald",
      now: new Date("2026-08-29T00:01:00Z"),
    })).toMatchObject({ status: "not_found", reference });

    expect(resolveGmailSenderDisambiguationReference({
      reference,
      currentUserUtterance: "Something Else",
      now: new Date("2026-08-29T00:02:00Z"),
    })).toMatchObject({ status: "not_found", reference: null });
  });
});
