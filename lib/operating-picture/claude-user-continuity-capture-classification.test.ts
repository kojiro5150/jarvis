import { describe, expect, it } from "vitest";

describe("required Anthropic user continuity capture classification boundary", () => {
  it("forces exactly one named tool with a closed class-or-ambiguous schema", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/operating-picture/claude-user-continuity-capture-classification.ts", "utf8"));

    expect(source).toContain('const TOOL_NAME = "user_continuity_capture_classification"');
    expect(source).toContain("tool_choice:");
    expect(source).toContain('type: "tool"');
    expect(source).toContain("name: TOOL_NAME");
    expect(source).toContain('enum: ["classified", "ambiguous"]');
    expect(source).toContain("enum: [...USER_CONTINUITY_CAPTURE_CLASSES]");
    expect(source).toContain('type: "null"');
    expect(source).toContain("additionalProperties: false");
    expect(source).toContain("toolUses.length !== 1");
    expect(source).toContain("content.some(hasNonEmptyTextBlock)");

    for (const forbidden of [
      "statement:",
      "rationale:",
      "confidence:",
      "callClaude(",
      "PUBLIC_WEB_TOOLS",
      "persistUserContinuityCaptureCandidate",
      "createSupabaseOperatingPicturePersistence",
      "/api/lighter/chat",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
