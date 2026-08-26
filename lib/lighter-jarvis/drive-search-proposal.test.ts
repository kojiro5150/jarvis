import { describe, expect, it } from "vitest";
import { proposeNaturalLanguageDriveSearch } from "./drive-search-proposal";

describe("drive.search natural-language proposal boundary", () => {
  it("proposes only the narrow deterministic form", () => {
    expect(proposeNaturalLanguageDriveSearch("Search my Drive for Atlas")).toEqual({
      capability: "drive.search", name: "Atlas", maxResults: 5,
    });
  });

  it.each([
    "Search Drive for Atlas", "search my Drive for Atlas", "Search my drive for Atlas",
    "Search my Drive for it", "Find Atlas in my Drive", "Search my Drive for Atlas\nplease",
    "Search my Drive for  Atlas", "Search my Drive for Atlas ",
  ])("rejects broadened, anaphoric, or malformed input: %s", utterance => {
    expect(proposeNaturalLanguageDriveSearch(utterance)).toBeNull();
  });
});
