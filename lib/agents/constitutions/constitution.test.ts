import { describe, expect, it } from "vitest";

import { jarvisConstitution } from "./jarvis";
import { validateBehaviouralConstitution } from "./constitution";

describe("behavioural constitution validation", () => {
  it("accepts a complete versioned constitution", () => {
    expect(validateBehaviouralConstitution(jarvisConstitution)).toEqual([]);
  });

  it("rejects invalid metadata and empty required sections", () => {
    const invalid = {
      ...jarvisConstitution,
      metadata: {
        ...jarvisConstitution.metadata,
        specialistId: "",
        version: "v1",
      },
      reasoningPosture: [],
      authorityBoundaries: {
        ...jarvisConstitution.authorityBoundaries,
        rules: [""],
      },
      outputContract: "",
    };

    expect(validateBehaviouralConstitution(invalid)).toEqual(
      expect.arrayContaining([
        "metadata.specialistId is required",
        "metadata.version must use major.minor.patch format",
        "reasoningPosture must contain at least one entry",
        "authorityBoundaries.rules must not contain blank entries",
        "outputContract is required",
      ])
    );
  });
});
