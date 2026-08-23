import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DIRECT_SPECIALIST_IDS } from "./head-mode-contract";

const source = readFileSync(
  new URL("./UnifiedOpsConsole.tsx", import.meta.url),
  "utf8",
);

describe("UnifiedOpsConsole head-mode contract", () => {
  it("offers exactly the six direct-access specialists, never JARVIS", () => {
    expect(DIRECT_SPECIALIST_IDS).toEqual([
      "dawnwatch",
      "oracle",
      "herald",
      "steve",
      "marcus",
      "gecko",
    ]);
    expect(DIRECT_SPECIALIST_IDS).not.toContain("jarvis");
  });

  it("keeps confirmed hand-off synthesis in the JARVIS-headed thread", () => {
    expect(source).toContain("setSelectedId(jarvis.id);");
    expect(source).toContain(
      'message.role === "user" ? "YOU" : selected?.name',
    );
    expect(source).toContain("[jarvis.id]:");
  });

  it("does not ship fabricated evidence or named-stage progress panels", () => {
    expect(source).not.toContain("SOURCES CONSULTED");
    expect(source).not.toContain("SYNTHESIS IN PROGRESS");
    expect(source).not.toContain("PROCESSING REQUEST");
  });

  it("has no JARVIS drawer tile or Ask JARVIS tool", () => {
    expect(source).not.toContain('className="executive"');
    expect(source).not.toContain("Ask JARVIS");
  });

  it("composites the supplied JARVIS head into the head zone", () => {
    expect(source).toContain('src="/jarvis-head.png"');
    expect(source).toContain('alt="JARVIS synthetic head"');
    expect(source).not.toContain("head-placeholder");
  });

  it("Brief Me proposes a hand-off instead of auto-continuing", () => {
    const briefMeSource = source.slice(
      source.indexOf("async function briefMe"),
      source.indexOf("async function briefMe") + 400,
    );
    expect(briefMeSource).toContain("setPendingHandoff({");
    expect(briefMeSource).not.toContain("setSelectedId(target.id)");
  });
});
