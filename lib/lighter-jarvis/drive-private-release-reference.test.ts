import { beforeEach, describe, expect, it } from "vitest";

import {
  createDrivePrivateReleaseReference,
  isDrivePrivateReleaseContentFollowUp,
  resetDrivePrivateReleaseReferencesForTests,
  resolveDrivePrivateReleaseReference,
} from "./drive-private-release-reference";

describe("Drive private release references", () => {
  beforeEach(resetDrivePrivateReleaseReferencesForTests);

  it("stores bounded metadata without document content and expires after fifteen minutes", () => {
    const content = "synthetic private content ".repeat(500);
    const reference = createDrivePrivateReleaseReference({
      fileId: "synthetic-provider-id",
      presentation: content,
      now: 1_000,
    });
    const record = resolveDrivePrivateReleaseReference(reference, 1_001);
    expect(record).toMatchObject({
      fileId: "synthetic-provider-id",
      contentMode: "text",
      presentationDigest: expect.stringMatching(/^[0-9a-f]{64}$/),
      createdAt: 1_000,
      expiresAt: 901_000,
      status: "eligible",
    });
    expect(JSON.stringify(record)).not.toContain(content);
    expect(resolveDrivePrivateReleaseReference(reference, 901_000)).toBeNull();
  });

  it("fails closed for fabricated and Gmail capability references", () => {
    expect(resolveDrivePrivateReleaseReference({
      drivePrivateReleaseReferenceId: "00000000-0000-4000-8000-000000000000",
    })).toBeNull();
    expect(resolveDrivePrivateReleaseReference({
      gmailPrivateReleaseReferenceId: "00000000-0000-4000-8000-000000000000",
    })).toBeNull();
  });

  it.each([
    "Summarize that document.",
    "Summarise that document.",
    "What does that document say?",
    "What are the main points of that document?",
    "Explain that document.",
    "Analyze that document.",
    "Analyse that document.",
    "Summarize that file.",
    "Compare that document with this.",
    "Does that document conflict with this?",
  ])("recognises the frozen closed grammar: %s", (utterance) => {
    expect(isDrivePrivateReleaseContentFollowUp(utterance)).toBe(true);
  });
});
