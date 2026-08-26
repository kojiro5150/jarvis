import { describe, expect, it } from "vitest";
import { proposeNaturalLanguageDriveSearch } from "./drive-search-proposal";

describe("drive.search natural-language proposal boundary", () => {
  it.each([
    "Search my Drive for Atlas",
    "Find Atlas in my Drive",
    "Look in my Drive for Atlas",
  ])("proposes each required narrow deterministic form: %s", utterance => {
    expect(proposeNaturalLanguageDriveSearch(utterance)).toEqual({
      capability: "drive.search", name: "Atlas", maxResults: 5,
    });
  });

  it.each([
    "Search Drive for Atlas", "search my Drive for Atlas", "Search my drive for Atlas",
    "Search my Drive for it", "Find it in my Drive", "Look in my Drive for that",
    "Look for Atlas in my Drive", "Search my Drive for Atlas\nplease",
    "Search my Drive for  Atlas", "Search my Drive for Atlas ",
  ])("rejects broadened, anaphoric, or malformed input: %s", utterance => {
    expect(proposeNaturalLanguageDriveSearch(utterance)).toBeNull();
  });
});
