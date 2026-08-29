import { describe, expect, it } from "vitest";
import {
  proveExplicitDriveRead,
  proveExplicitDriveSearch,
  proveExplicitGmailRead,
  proveExplicitGmailSearch,
} from "./explicit-command-authority";
import { proposeDriveRead } from "@/lib/lighter-jarvis/drive-read-authority";
import { proposeDriveSearch } from "@/lib/lighter-jarvis/drive-search-authority";
import { proposeGmailRead } from "@/lib/lighter-jarvis/gmail-read-authority";
import { proposeGmailSearch } from "@/lib/lighter-jarvis/gmail-search-authority";

describe("exact current-utterance authority proof", () => {
  it("proves only the exact Gmail read command", () => {
    const operation = proposeGmailRead({
      resource: { resourceId: "msg-1", connectorType: "email" },
      requestedFields: ["subject"],
      requestingRuntime: "test",
    });
    expect(proveExplicitGmailRead(operation, "gmail.read msg-1 [subject]")).toEqual([
      { source: "current_user_utterance", utterance: "gmail.read msg-1 [subject]", basis: "explicit_gmail_read" },
    ]);
    expect(proveExplicitGmailRead(operation, "yes")).toEqual([]);
  });

  it("proves only the exact ID-only Gmail search command", () => {
    const operation = proposeGmailSearch("7d");
    expect(proveExplicitGmailSearch(operation, "gmail.search [newer_than:7d]")).toHaveLength(1);
    expect(proveExplicitGmailSearch(operation, "Search my Gmail")).toEqual([]);
  });

  it("proves exact Drive search and read commands", () => {
    expect(proveExplicitDriveSearch(proposeDriveSearch("Atlas"), "drive.search Atlas")).toHaveLength(1);
    expect(proveExplicitDriveSearch(proposeDriveSearch("Atlas"), "drive.search atlas")).toEqual([]);
    expect(proveExplicitDriveRead(proposeDriveRead("file_1"), "drive.read file_1 [text]")).toHaveLength(1);
    expect(proveExplicitDriveRead(proposeDriveRead("file_1"), "read file_1")).toEqual([]);
  });
});
