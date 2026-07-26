import { describe, expect, it } from "vitest";

import { AGENTS_BY_ID } from "../index";
import { validateConstitutionCompliance } from "./compliance";
import { jarvisConstitution } from "./jarvis";
import {
  BEHAVIOURAL_CONSTITUTIONS,
  CONSTITUTION_SPECIALIST_IDS,
  validateConstitutionRegistryCompliance,
} from "./registry";
import { SHARED_CONSTITUTION } from "./shared";

import type { BehaviouralConstitution } from "./constitution";
import type { ConstitutionComplianceContext } from "./compliance";

function buildConstitution(
  overrides: Partial<BehaviouralConstitution> = {}
): BehaviouralConstitution {
  return {
    ...jarvisConstitution,
    ...overrides,
    metadata: { ...jarvisConstitution.metadata, ...overrides.metadata },
    authorityBoundaries: {
      ...jarvisConstitution.authorityBoundaries,
      ...overrides.authorityBoundaries,
    },
  };
}

const context: ConstitutionComplianceContext = {
  registryKey: "jarvis",
  coreSpecialistIdentities: CONSTITUTION_SPECIALIST_IDS.flatMap(
    (specialistId) => [specialistId, AGENTS_BY_ID[specialistId].name]
  ),
  registeredSpecialistIdentities: Object.values(AGENTS_BY_ID).flatMap(
    (agent) => [agent.id, agent.name]
  ),
  existingAuthorityCeiling:
    AGENTS_BY_ID.jarvis.behaviouralContract?.authority ?? [],
  sharedPrinciples: SHARED_CONSTITUTION.principles,
};

function codesFor(constitution: BehaviouralConstitution): string[] {
  return validateConstitutionCompliance(constitution, context).map(
    ({ field, code }) => `${field}:${code}`
  );
}

describe("constitutional compliance validation", () => {
  it("accepts all current constitutions", () => {
    expect(validateConstitutionRegistryCompliance()).toEqual([]);
  });

  it("rejects a blank mission", () => {
    expect(codesFor(buildConstitution({ mission: "  " }))).toContain("mission:blank");
  });

  it("rejects blank and normalised duplicate responsibilities", () => {
    expect(codesFor(buildConstitution({ behaviouralObligations: ["", "Act clearly", " act CLEARLY "] }))).toEqual(
      expect.arrayContaining([
        "behaviouralObligations[0]:blank",
        "behaviouralObligations[2]:duplicate",
      ])
    );
  });

  it("rejects blank and normalised duplicate authority rules", () => {
    expect(codesFor(buildConstitution({
      authorityBoundaries: {
        allowed: jarvisConstitution.authorityBoundaries.allowed,
        rules: ["", "Preserve control", " preserve CONTROL "],
      },
    }))).toEqual(
      expect.arrayContaining([
        "authorityBoundaries.rules[0]:blank",
        "authorityBoundaries.rules[2]:duplicate",
      ])
    );
  });

  it("rejects blank and normalised duplicate collaboration expectations", () => {
    expect(codesFor(buildConstitution({ collaborationRules: ["", "Consult ORACLE", " consult oracle "] }))).toEqual(
      expect.arrayContaining([
        "collaborationRules[0]:blank",
        "collaborationRules[2]:duplicate",
      ])
    );
  });

  it("does not interpret ordinary uppercase acronyms as specialist references", () => {
    expect(codesFor(buildConstitution({
      collaborationRules: [
        "Use the API and HTTP JSON endpoint; brief the CEO on AI and UI implications.",
      ],
    }))).not.toContain("collaborationRules[0]:unresolved-specialist");
  });

  it("rejects an explicitly identified unknown specialist", () => {
    expect(codesFor(buildConstitution({
      collaborationRules: ["Hand analysis to [[specialist:atlas]]."],
    }))).toContain(
      "collaborationRules[0]:unresolved-specialist"
    );
  });

  it("accepts a bounded reference to a registered core specialist", () => {
    expect(codesFor(buildConstitution({
      collaborationRules: ["Hand evidence review to ORACLE."],
    }))).not.toContain("collaborationRules[0]:unresolved-specialist");
  });

  it("rejects authority beyond the existing specialist ceiling", () => {
    const restrictedContext: ConstitutionComplianceContext = {
      ...context,
      existingAuthorityCeiling: ["advise"],
    };
    const issues = validateConstitutionCompliance(
      buildConstitution({
        authorityBoundaries: {
          allowed: ["advise", "draft"],
          rules: jarvisConstitution.authorityBoundaries.rules,
        },
      }),
      restrictedContext
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "authorityBoundaries.allowed",
          code: "authority-expansion",
        }),
      ])
    );
  });

  it("rejects an incomplete current output contract", () => {
    expect(codesFor(buildConstitution({ outputContract: " " }))).toContain("outputContract:blank");
  });

  it("rejects missing shared constitutional principle coverage", () => {
    const { humanAuthority: omitted, ...incompletePrinciples } = SHARED_CONSTITUTION.principles;
    expect(omitted).not.toHaveLength(0);

    const issues = validateConstitutionCompliance(jarvisConstitution, {
      ...context,
      sharedPrinciples: incompletePrinciples,
    });
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "shared.principles.humanAuthority",
          code: "missing",
        }),
      ])
    );
  });

  it("returns multiple registry errors in deterministic order", () => {
    const invalidConstitutions = {
      ...BEHAVIOURAL_CONSTITUTIONS,
      jarvis: buildConstitution({ mission: "", outputContract: "" }),
      oracle: {
        ...BEHAVIOURAL_CONSTITUTIONS.oracle,
        behaviouralObligations: ["", "Review evidence", " review EVIDENCE "],
      },
    };
    const input = {
      constitutions: invalidConstitutions,
      sharedPrinciples: SHARED_CONSTITUTION.principles,
    };

    const first = validateConstitutionRegistryCompliance(input);
    const second = validateConstitutionRegistryCompliance(input);

    expect(first).toEqual(second);
    expect(first).toHaveLength(4);
    expect(first.map(({ specialistId, category, field }) => [specialistId, category, field])).toEqual([
      ["jarvis", "mission-responsibility", "mission"],
      ["jarvis", "output-contract", "outputContract"],
      ["oracle", "mission-responsibility", "behaviouralObligations[0]"],
      ["oracle", "mission-responsibility", "behaviouralObligations[2]"],
    ]);
  });
});
