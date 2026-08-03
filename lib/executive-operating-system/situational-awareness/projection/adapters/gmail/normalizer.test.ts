import { describe, expect, it } from "vitest";
import { normalizeGmailObservation } from "./normalizer";
import type { GmailMessageObservation } from "./types";

const observation = (from: string): GmailMessageObservation => ({
  id: "provider-1",
  retrievedAt: "2026-08-03T10:00:00.000Z",
  payload: { headers: [
    { name: "Message-ID", value: "<message@example.com>" },
    { name: "From", value: from },
    { name: "To", value: '"Recipient, One" <one@example.com>, two@example.com' },
    { name: "Date", value: "Mon, 3 Aug 2026 10:00:00 +0000" },
  ] },
});

describe("normalizeGmailObservation sender display name", () => {
  it.each([
    ["Cassie Kozyrkov <decision@substack.com>", "Cassie Kozyrkov"],
    ['"Cassie Kozyrkov" <decision@substack.com>', "Cassie Kozyrkov"],
    ['"Cassie \\"CK\\" Kozyrkov" <decision@substack.com>', 'Cassie "CK" Kozyrkov'],
    ["Cassie Kozyrkov (Newsletter) <decision@substack.com>", "Cassie Kozyrkov"],
  ])("preserves %s and extracts its structural display name", (from, expected) => {
    const normalized = normalizeGmailObservation(observation(from));
    expect(normalized.sender).toBe(from);
    expect(normalized.senderDisplayName).toBe(expected);
    expect(normalized.recipients).toEqual(['"Recipient, One" <one@example.com>', "two@example.com"]);
    expect(normalized.recipientEvidence).toBe("available");
    expect(normalized.provenance.retrievedAt).toBe("2026-08-03T10:00:00.000Z");
  });

  it("does not infer a display name from a bare mailbox or malformed source", () => {
    expect(normalizeGmailObservation(observation("decision@substack.com"))).not.toHaveProperty("senderDisplayName");
    expect(normalizeGmailObservation(observation("Cassie <decision@substack.com"))).not.toHaveProperty("senderDisplayName");
  });
});
