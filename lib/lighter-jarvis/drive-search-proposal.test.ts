import { describe, expect, it } from "vitest";
import { proposeNaturalLanguageDriveSearch } from "./drive-search-proposal";

describe("drive.search natural-language proposal boundary", () => {
  it.each([
    "Search my Drive for Atlas",
    "Search Drive for Atlas",
    "find Atlas IN my DRIVE.",
    "LOOK in MY drive FOR Atlas!",
    "Search MY drive for Atlas?",
  ])("proposes each required narrow deterministic form: %s", utterance => {
    expect(proposeNaturalLanguageDriveSearch(utterance)).toEqual({
      capability: "drive.search", name: "Atlas", maxResults: 5,
    });
  });

  it.each([
    "Search my Drive to find Atlas", "Search through my Drive for Atlas",
    "Search my Drive for it", "Find it in my Drive", "Look in my Drive for that",
    "Look for Atlas in my Drive", "Read Atlas from my Drive", "Open Atlas in my Drive",
    "Semantically find files like Atlas in my Drive", "Search my Drive for Atlas\nplease",
    "Search my Drive for  Atlas", "Search my Drive for Atlas ",
  ])("rejects broadened, anaphoric, or malformed input: %s", utterance => {
    expect(proposeNaturalLanguageDriveSearch(utterance)).toBeNull();
  });
});
