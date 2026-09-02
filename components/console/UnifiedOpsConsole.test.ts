import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("./UnifiedOpsConsole.tsx", import.meta.url),
  "utf8",
);

describe("UnifiedOpsConsole JARVIS Core surface", () => {
  it("exposes one JARVIS Core intelligence surface and no direct specialist roster", () => {
    expect(source).toContain("CORE INTELLIGENCE");
    expect(source).toContain("Single governed conversational surface");
    expect(source).not.toContain("DIRECT SPECIALIST ACCESS");
    expect(source).not.toContain("Direct specialist access");
    expect(source).not.toContain("directSpecialists.map");
  });

  it("keeps the governed connector controls visible", () => {
    expect(source).toContain('renderConnectorStatus("calendar")');
    expect(source).toContain('renderConnectorStatus("gmail")');
    expect(source).toContain('renderConnectorStatus("drive")');
    expect(source).toContain('fetch("/api/connector-status")');
    expect(source).not.toContain('fetch("/api/operational-state")');
  });

  it("keeps the JARVIS synthetic head and real voice control", () => {
    expect(source).toContain('src="/jarvis-head.png"');
    expect(source).toContain('alt="JARVIS synthetic head"');
    expect(source).toContain("onClick={voiceSession.toggle}");
    expect(source).toContain("aria-pressed={voiceSession.state === \"listening\"}");
  });

  it("renders real Voice state and microphone amplitude on the visible control", () => {
    expect(source).toContain("voiceControlLabel(voiceSession.state)");
    expect(source).toContain('className={`voice-control voice-${voiceSession.state}`}');
    expect(source).toContain('data-voice-state={voiceSession.state}');
    expect(source).toContain('voiceSession.state === "listening"');
    expect(source).toContain('Math.round(voiceSession.amplitude * 100)');
    expect(source).toContain("VOICE · {voiceSession.state.toUpperCase()}");
    expect(source).toContain(".tools .voice-control.voice-listening");
    expect(source).toContain(".tools .voice-control.voice-transcribing");
    expect(source).toContain(".tools .voice-control.voice-error");
    expect(source).toContain(".voice-meter-level");
    expect(source).not.toContain("<span>VOICE · STANDBY</span>");
  });

  it("retains the opaque Calendar authority references in the shared typed and voice transport", () => {
    const submission = source.slice(
      source.indexOf("async function submitMessage"),
      source.indexOf("async function send"),
    );
    expect(submission).toContain("pendingAuthorizationReference");
    expect(submission).toContain("authorityTurnStateRef.current.applyResponse");
    expect(submission).toContain("calendarAttentionObservationReference");
    expect(submission).toContain("calendarConflictReasoningReference");
    expect(submission).toContain("calendarAdviceReference");
    expect(submission).toContain("calendarMoveProposalReference");
    expect(submission).toContain("calendarMoveAuthorizationReference");
    expect(submission).not.toContain("proposedOperation");
  });

  it("retains only opaque Gmail sender-disambiguation state in client transport", () => {
    const submission = source.slice(
      source.indexOf("async function submitMessage"),
      source.indexOf("async function send"),
    );
    expect(submission).toContain("gmailSenderDisambiguationReference");
    expect(submission).toContain("gmailSenderDisambiguationRef.current");
    expect(submission).not.toContain("Georgia McDonald");
    expect(submission).not.toContain("georgia@example.com");
  });

  it("restores composer focus only after a typed response when focus remains unclaimed", () => {
    expect(source).toContain("const composerInputRef = useRef<HTMLInputElement>(null)");
    expect(source).toContain("restoreComposerFocusRef.current = document.activeElement === composerInputRef.current");
    expect(source).toContain('submitMessage(jarvis, originalMessage, "typed")');
    expect(source).toContain('submitMessage(jarvis, transcript, "voice")');
    expect(source).toContain('submitMessage(jarvis, "brief me on today", "action")');
    expect(source).toContain('source === "typed" && restoreComposerFocusRef.current');
    expect(source).toContain('voiceStateRef.current === "standby"');
    expect(source).toContain("!sidebarOpenRef.current");
    expect(source).toContain("composerInputRef.current?.focus()");
    expect(source).toContain("ref={composerInputRef}");
  });

  it("constructs shared typed and voice requests from synchronously accepted transport history", () => {
    const submission = source.slice(
      source.indexOf("async function submitMessage"),
      source.indexOf("async function send"),
    );
    expect(submission).toContain("conversationHistoryRef.current.acceptUser");
    expect(submission).not.toContain("const existingMessages = conversations[");
  });

  it("does not ship fabricated evidence or named-stage progress panels", () => {
    expect(source).not.toContain("SOURCES CONSULTED");
    expect(source).not.toContain("SYNTHESIS IN PROGRESS");
    expect(source).not.toContain("PROCESSING REQUEST");
  });

  it("labels the shipped surface honestly as a single intelligence surface, not a collapsed runtime", () => {
    expect(source).toContain("JARVIS CORE v3.0.0");
    expect(source).toContain("SINGLE INTELLIGENCE SURFACE");
    expect(source).not.toContain("SINGLE INTELLIGENCE RUNTIME");
  });
});
