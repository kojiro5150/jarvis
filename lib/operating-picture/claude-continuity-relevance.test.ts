import { describe, expect, it } from "vitest";

describe("required Anthropic continuity relevance boundary", () => {
  it("requires exactly one of two provider-compatible closed relevance tools", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/operating-picture/claude-continuity-relevance.ts", "utf8"));

    expect(source).toContain('const RELEVANT_TOOL_NAME = "continuity_relevance_relevant"');
    expect(source).toContain('const NOT_RELEVANT_TOOL_NAME = "continuity_relevance_not_relevant"');
    expect(source).toContain('tool_choice:');
    expect(source).toContain('type: "any"');
    expect(source).toContain('minItems: 1');
    expect(source).toContain('uniqueItems: true');
    expect(source).toContain('enum: [...allowedIds]');
    expect(source).toContain('additionalProperties: false');
    expect(source).toContain('canonicalAssessmentFromToolUse');
    expect(source).toContain('relevance: "relevant"');
    expect(source).toContain('relevance: "not_relevant"');
    expect(source).toContain('toolUses.length !== 1');
    expect(source).toContain('content.some(hasNonEmptyTextBlock)');
    expect(source).not.toContain('oneOf:');
    expect(source).not.toContain("callClaude(");
    expect(source).not.toContain("PUBLIC_WEB_TOOLS");
  });
});
