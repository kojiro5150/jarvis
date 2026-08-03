import { describe, expect, it } from "vitest";
import { ENTITY_IDENTIFICATION_RULESET } from "./entity-identification-ruleset";

describe("Entity Identification ruleset publication", () => {
  it("publishes the closed immutable rules and deterministic identity", async () => {
    expect(ENTITY_IDENTIFICATION_RULESET.matchingPrecedence).toEqual(["exact_governed_display_name_match", "governed_first_token_display_name_alias_match"]);
    expect(ENTITY_IDENTIFICATION_RULESET.cardinalityRules).toEqual({ zero: "unresolved_no_match", one: "resolved", multiple: "ambiguous_multiple_matches" });
    expect(ENTITY_IDENTIFICATION_RULESET.sourceAvailabilityRules).toEqual({ unavailable: "entity_source_unavailable", failed: "entity_source_unavailable" });
    expect(Object.isFrozen(ENTITY_IDENTIFICATION_RULESET)).toBe(true);
    const replay = (await import("./entity-identification-ruleset")).ENTITY_IDENTIFICATION_RULESET;
    expect(replay).toEqual(ENTITY_IDENTIFICATION_RULESET);
  });
});
