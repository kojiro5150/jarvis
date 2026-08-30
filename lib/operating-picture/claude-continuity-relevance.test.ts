import { describe, expect, it } from "vitest";

describe("required Anthropic continuity relevance boundary", () => {
  it("forces one named tool with a closed schema and dynamic allowed IDs", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/operating-picture/claude-continuity-relevance.ts", "utf8"));

    expect(source).toContain('const TOOL_NAME = "continuity_relevance"');
    expect(source).toContain('tool_choice:');
    expect(source).toContain('type: "tool"');
    expect(source).toContain('name: TOOL_NAME');
    expect(source).toContain('additionalProperties: false');
    expect(source).toContain('enum: [...allowedIds]');
    expect(source).toContain('toolUses.length !== 1');
    expect(source).toContain('content.some(hasNonEmptyTextBlock)');
    expect(source).not.toContain("callClaude(");
    expect(source).not.toContain("PUBLIC_WEB_TOOLS");
  });
});
