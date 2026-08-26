import { describe, expect, it } from "vitest";
import {
  guardOrdinaryModelReply,
  NEUTRALIZED_ORDINARY_AUTHORITY_REPLY,
  UNSUPPORTED_CALENDAR_PATH_REPLY,
  UNSUPPORTED_GMAIL_PATH_REPLY,
  EXCLUDED_DRIVE_PROVENANCE_REPLY,
  UNSUPPORTED_DRIVE_PATH_REPLY,
} from "./ordinary-model-reply-guard";

describe("ordinary-model reply guard", () => {
  it.each([
    "Please explicitly confirm that I may read your Calendar.",
    "Can I access your calendar? Reply yes to confirm.",
    "I need your permission to search Gmail. Say yes to continue.",
    "Please authorize me to check your inbox.",
  ])("neutralizes private-source confirmation UX: %s", (reply) => {
    expect(guardOrdinaryModelReply(reply)).toBe(NEUTRALIZED_ORDINARY_AUTHORITY_REPLY);
  });

  it.each([
    "[Governed private result omitted from ordinary model context.]",
    "[Prior governed Gmail read request omitted from ordinary model context.]",
  ])("never presents an internal history marker: %s", (marker) => {
    expect(guardOrdinaryModelReply(`Answer. ${marker}`)).toBe("Answer.");
    expect(guardOrdinaryModelReply(marker)).toBe(NEUTRALIZED_ORDINARY_AUTHORITY_REPLY);
  });

  it("preserves ordinary replies and non-authority Calendar discussion", () => {
    expect(guardOrdinaryModelReply("Monday is a weekday.")).toBe("Monday is a weekday.");
    expect(guardOrdinaryModelReply("Calendar access requires deterministic authority machinery."))
      .toBe("Calendar access requires deterministic authority machinery.");
  });

  it.each([
    "I don't have access to your Calendar.",
    "Calendar is not connected.",
    "This capability does not exist.",
  ])("corrects false global Calendar capability claims without representing authority: %s", (reply) => {
    expect(guardOrdinaryModelReply(reply, "Show my calendar Monday"))
      .toBe(UNSUPPORTED_CALENDAR_PATH_REPLY);
  });

  it.each([
    "I cannot access Gmail.",
    "I don't have the capability to check your inbox.",
    "Gmail isn't available.",
  ])("corrects false global Gmail capability claims without representing authority: %s", (reply) => {
    expect(guardOrdinaryModelReply(reply, "Show me my emails"))
      .toBe(UNSUPPORTED_GMAIL_PATH_REPLY);
  });

  it("does not rewrite unrelated ordinary conversation or truthful path-scoped limitations", () => {
    expect(guardOrdinaryModelReply("I don't have access to the Moon.", "Tell me about the Moon"))
      .toBe("I don't have access to the Moon.");
    expect(guardOrdinaryModelReply("That inbox request is not supported on this path.", "Get my inbox"))
      .toBe("That inbox request is not supported on this path.");
  });

  it.each([
    "I'm showing you the result I already provided.",
    "I found this document earlier.",
    "The document ID was provider-secret.",
    "Your Drive search returned Atlas.",
  ])("neutralizes reconstructed Drive provenance only when governed history was excluded: %s", reply => {
    expect(guardOrdinaryModelReply(reply, "show it", true)).toBe(EXCLUDED_DRIVE_PROVENANCE_REPLY);
    expect(guardOrdinaryModelReply(reply, "ordinary question", false)).toBe(reply);
  });

  it.each(["read it", "open it", "show it", "summarize it"])(
    "corrects a false Drive-wide denial after excluded governed history: %s",
    utterance => {
      const reply = "I don't have the capability to read or retrieve the contents of files from Google Drive. My access is limited to orchestration and routing within this system.";
      expect(guardOrdinaryModelReply(reply, utterance, true)).toBe(UNSUPPORTED_DRIVE_PATH_REPLY);
      expect(guardOrdinaryModelReply(reply, utterance, false)).toBe(reply);
    },
  );

  it.each([
    "The document ID I found earlier was synthetic-id.",
    "The file ID I found before was synthetic-id.",
    "I previously found document ID synthetic-id.",
    "Earlier, your Drive search returned Atlas.",
    "The Drive file I found was Atlas.",
    "I found provider ID synthetic-id earlier.",
    "The document was Atlas and its ID was synthetic-id.",
    "I found that file earlier and its ID is synthetic-id.",
    "The ID from the earlier Drive result was synthetic-id.",
    "The document ID from the earlier search was `synthetic-id`.",
    "The only document ID we've discussed is `synthetic-id`, which was the result of your search.",
  ])("contains the prior/remembered Drive-result provenance family: %s", reply => {
    expect(guardOrdinaryModelReply(reply, "What was the document ID you found earlier?", true)).toBe(EXCLUDED_DRIVE_PROVENANCE_REPLY);
    expect(guardOrdinaryModelReply(reply, "What was the document ID you found earlier?", false)).toBe(reply);
  });

  it("does not globally rewrite unrelated capability or ordinary memory statements", () => {
    expect(guardOrdinaryModelReply("I don't have access to the Moon.", "open it", true))
      .toBe("I don't have access to the Moon.");
    expect(guardOrdinaryModelReply("I found that restaurant earlier.", "What was it?", true))
      .toBe("I found that restaurant earlier.");
  });

  it.each([
    ["What was the contract document ID we discussed?", "The document ID I found earlier was contract-123."],
    ["Remind me of the project document we discussed.", "The document was Project Charter and its ID was DOC-42."],
    ["Which local record was that?", "The file ID I found before was local-record-7."],
  ])("preserves non-Drive document memory despite earlier governed Drive history", (utterance, reply) => {
    expect(guardOrdinaryModelReply(reply, utterance, true)).toBe(reply);
  });

  it.each([
    "Earlier, your Drive search returned Atlas.",
    "The Drive file I found was Atlas.",
    "The ID from the earlier Drive result was synthetic-id.",
  ])("always contains explicitly Drive-marked provenance after excluded Drive history: %s", reply => {
    expect(guardOrdinaryModelReply(reply, "Tell me about contracts.", true)).toBe(EXCLUDED_DRIVE_PROVENANCE_REPLY);
  });
});
