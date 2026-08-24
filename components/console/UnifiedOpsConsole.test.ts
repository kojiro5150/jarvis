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
      source.indexOf("async function briefMe") + 600,
    );
    expect(briefMeSource).toContain("setPendingHandoff({");
    expect(briefMeSource).not.toContain("setSelectedId(target.id)");
  });

  it("a voice transcript that triggers a hand-off proposes it instead of discarding it", () => {
    const effectSource = source.slice(
      source.indexOf("voiceSession.transcript;"),
      source.indexOf("voiceSession.transcript;") + 1300,
    );
    expect(effectSource).toContain("setPendingHandoff({");
    expect(effectSource).not.toContain("void submitMessage(selected, transcript)");
  });

  it("a voice transcript confirms or declines a pending hand-off instead of re-proposing it", () => {
    const effectSource = source.slice(
      source.indexOf("voiceSession.transcript;"),
      source.indexOf("voiceSession.transcript;") + 1300,
    );
    expect(effectSource).toContain("if (pendingHandoff) {");
    expect(effectSource).toContain("handoffResponse(transcript)");
    expect(effectSource).toContain("void confirmHandoff()");
  });

  it("the head-composite status is display-only, not a toggle control", () => {
    const headSource = source.slice(
      source.indexOf("function HeadComposite"),
      source.indexOf("function HeadComposite") + 700,
    );
    expect(headSource).not.toContain("onToggleVoice");
    expect(headSource).not.toContain("<button");
    expect(headSource).toContain("<span aria-live=\"polite\">");
  });

  it("the toolbar mic next to Brief Me is the real, wired voice toggle", () => {
    const toolsSource = source.slice(
      source.indexOf("<div className=\"tools\">"),
      source.indexOf("<div className=\"tools\">") + 400,
    );
    expect(toolsSource).toContain("onClick={voiceSession.toggle}");
    expect(toolsSource).not.toContain("disabled>\n                      <button");
  });

  it("removes the decorative, non-functional mic icon from the composer bar", () => {
    expect(source).not.toContain("<span>🎙</span>");
  });
});
