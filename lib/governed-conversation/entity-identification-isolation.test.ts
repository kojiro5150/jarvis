import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const modules = ["types", "ruleset", "engine", "publications", "fixtures"].map(name => `lib/governed-conversation/entity-identification-${name}.ts`);

describe("Entity Identification structural isolation", () => {
  it("has no model, embedding, classifier, network, protected-engine, or upstream-engine dependency", () => {
    const production = modules.filter(path => !path.endsWith("fixtures.ts")).map(path => readFileSync(path, "utf8")).join("\n");
    expect(production).not.toMatch(/callClaude|model-invocation|anthropic|openai|embedding|classifier|ranker|agent/i);
    expect(production).not.toMatch(/from ["'].+(claim-enrichment-engine|gmail-evidence-publisher|gmail-evidence-acquisition-adapter)["']/);
    expect(production).not.toMatch(/Math\.random|randomUUID|Date\.now|fetch\s*\(/);
  });
});
