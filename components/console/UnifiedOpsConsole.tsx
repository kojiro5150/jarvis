"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  useVoiceSession,
  type VoiceState,
} from "@/lib/lighter-jarvis/useVoiceSession";
import { VoiceTurnQueue, type VoiceTurn } from "@/lib/lighter-jarvis/voice-turn-queue";
import { ClientAuthorityTurnState, type OpaquePendingAuthorization } from "@/lib/lighter-jarvis/client-authority-turn-state";
import { ConversationTransportHistory } from "@/lib/lighter-jarvis/conversation-transport-history";

type Specialist = {
  id: string;
  name: string;
  purpose: string;
  invokedOnly: boolean;
};
type Message = { role: "user" | "assistant"; content: string; error?: boolean };
type OpaqueGmailSenderDisambiguation = Readonly<{ gmailSenderDisambiguationReferenceId: string }>;
type OpaqueGmailMessageList = Readonly<{ gmailMessageListReferenceId: string }>;
type OpaqueCalendarAttentionObservation = Readonly<{ calendarAttentionObservationReferenceId: string }>;
type OpaqueCalendarConflictReasoning = Readonly<{ calendarConflictReasoningReferenceId: string }>;
type OpaqueCalendarAdvicePreference = Readonly<{ calendarAdvicePreferenceReferenceId: string }>;
type OpaqueCalendarAdvice = Readonly<{ calendarAdviceReferenceId: string }>;
type OpaqueCalendarMoveProposal = Readonly<{ calendarMoveProposalReferenceId: string }>;
type OpaqueCalendarMoveAuthorization = Readonly<{ calendarMoveAuthorizationReferenceId: string }>;
type ConnectorName = "calendar" | "gmail" | "drive";
type ConnectorServiceStatus =
  | "online"
  | "refresh_required"
  | "unavailable"
  | string;
type ConnectorStatusResponse = {
  calendarStatus?: ConnectorServiceStatus;
  gmailStatus?: ConnectorServiceStatus;
  driveStatus?: ConnectorServiceStatus;
  connectorStatuses?: { name: ConnectorName; connected: boolean }[];
  error?: string;
};

function requiredReply(reply: string | undefined): string {
  if (!reply?.trim())
    throw new Error("The specialist returned an empty reply.");
  return reply;
}

function HeadComposite({
  voiceState,
  amplitude,
}: {
  voiceState: VoiceState;
  amplitude: number;
}) {
  return (
    <div className="head-composite" data-voice-state={voiceState}>
      <div className="head-image-wrap">
        <Image
          className="jarvis-head"
          src="/jarvis-head.png"
          alt="JARVIS synthetic head"
          width={1268}
          height={1240}
          priority
        />
      </div>
      <small>JARVIS · NOMINAL · REF-640</small>
      <span aria-live="polite">
        VOICE · {voiceState.toUpperCase()} · {amplitude.toFixed(2)}
      </span>
    </div>
  );
}

export default function UnifiedOpsConsole() {
  const voiceSession = useVoiceSession();
  const voiceQueueRef = useRef<VoiceTurnQueue | null>(null);
  const voiceTurnHandlerRef = useRef<(turn: VoiceTurn) => Promise<void>>(async () => undefined);
  const jarvis: Specialist = { id: "jarvis", name: "JARVIS", purpose: "Single governed conversational intelligence", invokedOnly: false };
  const selectedId = "jarvis";
  const [conversations, setConversations] = useState<Record<string, Message[]>>(
    {},
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const authorityTurnStateRef = useRef(new ClientAuthorityTurnState());
  const gmailSenderDisambiguationRef = useRef<OpaqueGmailSenderDisambiguation | null>(null);
  const gmailMessageListRef = useRef<OpaqueGmailMessageList | null>(null);
  const calendarAttentionObservationRef = useRef<OpaqueCalendarAttentionObservation | null>(null);
  const calendarConflictReasoningRef = useRef<OpaqueCalendarConflictReasoning | null>(null);
  const calendarAdvicePreferenceRef = useRef<OpaqueCalendarAdvicePreference | null>(null);
  const calendarAdviceRef = useRef<OpaqueCalendarAdvice | null>(null);
  const calendarMoveProposalRef = useRef<OpaqueCalendarMoveProposal | null>(null);
  const calendarMoveAuthorizationRef = useRef<OpaqueCalendarMoveAuthorization | null>(null);
  const conversationHistoryRef = useRef(new ConversationTransportHistory());
  const [connectorStatuses, setConnectorStatuses] = useState<Record<
    ConnectorName,
    ConnectorServiceStatus
  > | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConnectorStatus = async (live = true) => {
    try {
      const response = await fetch("/api/connector-status");
      const data = (await response.json()) as ConnectorStatusResponse;
      if (!response.ok)
        throw new Error(
          data.error || `Unable to load connector status (${response.status}).`,
        );
      if (live) {
        setConnectorStatuses({
          calendar: data.calendarStatus ?? "unavailable",
          gmail: data.gmailStatus ?? "unavailable",
          drive: data.driveStatus ?? "unavailable",
        });
      }
    } catch {
      if (live)
        setConnectorStatuses({
          calendar: "unavailable",
          gmail: "unavailable",
          drive: "unavailable",
        });
    }
  };

  useEffect(() => {
    let live = true;
    void fetchConnectorStatus(live);
    return () => {
      live = false;
    };
  }, []);

  const totalConnectors = 3;
  const connectedCount = connectorStatuses
    ? Object.values(connectorStatuses).filter((status) => status === "online")
        .length
    : 0;
  const connectorCountLabel =
    connectorStatuses === null
      ? "CONNECTORS: CHECKING…"
      : `CONNECTORS: ${connectedCount}/${totalConnectors} LIVE`;
  const compactConnectorCountLabel =
    connectorStatuses === null
      ? "CONNECTORS · CHECKING…"
      : `CONNECTORS · ${connectedCount}/${totalConnectors} LIVE`;

  const googleConnectAction = (
    status: ConnectorServiceStatus,
  ): { label: string; title: string; navigate: boolean } => {
    if (status === "online") {
      return {
        label: "DISCONNECT",
        title:
          "Disconnect Google — this also disconnects Calendar, Gmail, and Drive, since all three share one account grant.",
        navigate: false,
      };
    }
    return {
      label: status === "refresh_required" ? "RECONNECT" : "CONNECT",
      title:
        status === "refresh_required"
          ? "Reconnect Google — the stored token no longer works for this service."
          : "Connect Google — grants Calendar, Gmail, and Drive together in one consent screen.",
      navigate: true,
    };
  };

  async function handleGoogleAction(status: ConnectorServiceStatus) {
    const action = googleConnectAction(status);
    if (action.navigate) {
      window.location.href = "/api/auth/google/start";
      return;
    }
    await fetch("/api/auth/google/disconnect", { method: "POST" });
    await fetchConnectorStatus();
  }

  const renderConnectorStatus = (name: ConnectorName) => {
    if (connectorStatuses === null) return <span>○ CHECKING…</span>;
    const action = googleConnectAction(connectorStatuses[name]);
    return (
      <button
        className="connector-action"
        type="button"
        title={action.title}
        onClick={() => void handleGoogleAction(connectorStatuses[name])}
      >
        {action.label}
      </button>
    );
  };

  useEffect(() => {
    const updateJarvisMelbClock = () => {
      const el = document.getElementById("jarvis-melb-clock");
      if (!el) return;
      const now = new Date();
      const datePart = new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Melbourne",
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
        .format(now)
        .toUpperCase()
        .replace(",", "");
      const timePart = new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Melbourne",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
        .format(now)
        .toUpperCase();
      el.textContent = `${datePart} · ${timePart}`;
    };
    updateJarvisMelbClock();
    const timer = window.setInterval(updateJarvisMelbClock, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const selected = jarvis;
  const messages = useMemo(
    () => (selectedId ? (conversations[selectedId] ?? []) : []),
    [conversations, selectedId],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [sidebarOpen]);

  async function submitMessage(
    specialist: Specialist,
    content: string,
  ): Promise<void> {
    if (!content) return;
    const authorityRequest = specialist.id === "jarvis"
      ? authorityTurnStateRef.current.beginRequest()
      : null;
    const nextMessages = conversationHistoryRef.current.acceptUser(specialist.id, content);
    setConversations((current) => ({
      ...current,
      [specialist.id]: nextMessages,
    }));
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/lighter/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          specialistId: specialist.id,
          messages: nextMessages.map(({ role, content: text }) => ({
            role,
            content: text,
          })),
          ...(authorityRequest?.pendingAuthorizationReference
            ? { pendingAuthorizationReference: authorityRequest.pendingAuthorizationReference }
            : {}),
          ...(specialist.id === "jarvis" && gmailSenderDisambiguationRef.current
            ? { gmailSenderDisambiguationReference: gmailSenderDisambiguationRef.current }
            : {}),
          ...(specialist.id === "jarvis" && gmailMessageListRef.current
            ? { gmailMessageListReference: gmailMessageListRef.current }
            : {}),
          ...(specialist.id === "jarvis" && calendarAttentionObservationRef.current
            ? { calendarAttentionObservationReference: calendarAttentionObservationRef.current }
            : {}),
          ...(specialist.id === "jarvis" && calendarConflictReasoningRef.current
            ? { calendarConflictReasoningReference: calendarConflictReasoningRef.current }
            : {}),
          ...(specialist.id === "jarvis" && calendarAdvicePreferenceRef.current
            ? { calendarAdvicePreferenceReference: calendarAdvicePreferenceRef.current }
            : {}),
          ...(specialist.id === "jarvis" && calendarAdviceRef.current
            ? { calendarAdviceReference: calendarAdviceRef.current }
            : {}),
          ...(specialist.id === "jarvis" && calendarMoveProposalRef.current
            ? { calendarMoveProposalReference: calendarMoveProposalRef.current }
            : {}),
          ...(specialist.id === "jarvis" && calendarMoveAuthorizationRef.current
            ? { calendarMoveAuthorizationReference: calendarMoveAuthorizationRef.current }
            : {}),
        }),
      });
      const data = (await response.json()) as {
        reply?: string;
        pendingAuthorizationReference?: OpaquePendingAuthorization | null;
        gmailSenderDisambiguationReference?: OpaqueGmailSenderDisambiguation | null;
        gmailMessageListReference?: OpaqueGmailMessageList | null;
        calendarAttentionObservationReference?: OpaqueCalendarAttentionObservation;
        calendarConflictReasoningReference?: OpaqueCalendarConflictReasoning | null;
        calendarAdvicePreferenceReference?: OpaqueCalendarAdvicePreference | null;
        calendarAdviceReference?: OpaqueCalendarAdvice | null;
        calendarMoveProposalReference?: OpaqueCalendarMoveProposal | null;
        calendarMoveAuthorizationReference?: OpaqueCalendarMoveAuthorization | null;
        error?: string;
      };
      if (!response.ok)
        throw new Error(
          data.error || `${response.status} ${response.statusText}`,
        );
      const reply = requiredReply(data.reply);
      if (authorityRequest) {
        authorityTurnStateRef.current.applyResponse(
          authorityRequest.requestId,
          data.pendingAuthorizationReference ?? null,
        );
      }
      if (data.gmailSenderDisambiguationReference !== undefined) {
        gmailSenderDisambiguationRef.current = data.gmailSenderDisambiguationReference;
      }
      if (data.gmailMessageListReference !== undefined) {
        gmailMessageListRef.current = data.gmailMessageListReference;
      }
      if (data.calendarAttentionObservationReference !== undefined) {
        calendarAttentionObservationRef.current = data.calendarAttentionObservationReference;
      }
      if (data.calendarConflictReasoningReference !== undefined) {
        calendarConflictReasoningRef.current = data.calendarConflictReasoningReference;
      }
      if (data.calendarAdvicePreferenceReference !== undefined) {
        calendarAdvicePreferenceRef.current = data.calendarAdvicePreferenceReference;
      }
      if (data.calendarAdviceReference !== undefined) {
        calendarAdviceRef.current = data.calendarAdviceReference;
      }
      if (data.calendarMoveProposalReference !== undefined) {
        calendarMoveProposalRef.current = data.calendarMoveProposalReference;
      }
      if (data.calendarMoveAuthorizationReference !== undefined) {
        calendarMoveAuthorizationRef.current = data.calendarMoveAuthorizationReference;
      }
      const acceptedMessages = conversationHistoryRef.current.acceptAssistant(specialist.id, reply);
      setConversations((current) => ({ ...current, [specialist.id]: acceptedMessages }));
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Unknown request error.";
      const acceptedMessages = conversationHistoryRef.current.acceptAssistant(specialist.id, detail, true);
      setConversations((current) => ({ ...current, [specialist.id]: acceptedMessages }));
    } finally {
      setLoading(false);
    }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    const originalMessage = input.trim();
    await submitMessage(jarvis, originalMessage);
  }

  voiceTurnHandlerRef.current = async ({ transcript }) => {
    await submitMessage(jarvis, transcript);
  };

  if (!voiceQueueRef.current) {
    voiceQueueRef.current = new VoiceTurnQueue((turn) => voiceTurnHandlerRef.current(turn));
  }

  useEffect(() => {
    if (!voiceSession.turn) return;
    void voiceQueueRef.current!.enqueue(voiceSession.turn);
    // Capture identity, rather than transcript text or confidence metadata,
    // defines one canonical voice turn. The queue applies its full response
    // before beginning the next capture event.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceSession.turn]);

  async function briefMe() {
    if (loading) return;
    setSidebarOpen(false);
    await submitMessage(jarvis, "brief me on today");
  }

  return (
    <main className="console-page">
      <section className="console-frame">
        <button
          className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
          type="button"
          aria-label="Close JARVIS status and connectors"
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`sidebar ${sidebarOpen ? "open" : ""}`}
          aria-label="JARVIS status and connectors"
        >
          <button
            className="sidebar-close"
            type="button"
            aria-label="Close JARVIS status and connectors"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
          <div className="label">CORE INTELLIGENCE</div>
          <div className="specialist-list" aria-label="JARVIS Core intelligence">
            <div className="specialist selected" aria-current="true">
              <span className="specialist-icon" style={{ color: "#34d399" }}>◈</span>
              <span className="specialist-copy">
                <b>JARVIS</b>
                <small>Single governed conversational surface</small>
              </span>
              <span className="ready">● {loading ? "THINKING" : "READY"}</span>
            </div>
          </div>
          <div className="sidebar-spacer" />
          <div className="label connector-label">CONNECTORS</div>
          <div className="connectors">
            <p>
              <span>CALENDAR</span>
              {renderConnectorStatus("calendar")}
            </p>
            <p>
              <span>GMAIL</span>
              {renderConnectorStatus("gmail")}
            </p>
            <p>
              <span>DRIVE</span>
              {renderConnectorStatus("drive")}
            </p>
            <p>
              <span>MEMORY</span>
              <em>● ONLINE</em>
            </p>
            <p>
              <span>PROJECTS</span>
              <span>● READY</span>
            </p>
            <p>
              <span>GITHUB</span>
              <i>NOT CONNECTED</i>
            </p>
          </div>
          <div className="core">
            JARVIS CORE v3.0.0
            <br />
            SINGLE INTELLIGENCE SURFACE
            <br />
            GOVERNED CONNECTORS
          </div>
          <div className="online">● JARVIS STATUS — ONLINE</div>
          <div className="connector-count">
            {connectorStatuses === null
              ? "CONNECTORS CHECKING…"
              : `${connectedCount}/${totalConnectors} CONNECTORS LIVE`}
          </div>
        </aside>

        <div className="command-area">
          <div className="mobile-header">
            <button
              type="button"
              aria-label="Open JARVIS status and connectors"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <span className="brand-mark">J</span>
            <b>J.A.R.V.I.S</b>
            <small>{selected?.name ?? "JARVIS"}</small>
          </div>
          <div className="statusbar">
            <span className="picture">
              ● &nbsp; OPERATIONAL PICTURE ·{" "}
              <span id="jarvis-melb-clock">AUG 03, 2026 · 11:51 AM</span>
            </span>
            <span className="status-items">
              <span>
                ♬ VOICE: {voiceSession.state.toUpperCase()}
                {voiceSession.error ? ` · ${voiceSession.error}` : ""}
              </span>
              <span>● SYSTEM: NOMINAL</span>
              <span>◎ {connectorCountLabel}</span>
              <span>⌂ SESSION SECURE</span>
              <button
                className="drawer-open"
                type="button"
                aria-label="Open JARVIS status and connectors"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
              >
                ⚙
              </button>
            </span>
          </div>
          <div className="workspace">
            <div className="grid" />
            <div className="amber-glow" />
            <div className="cyan-glow" />
            <div className="scanline" />
            <div className="stars">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <b />
              <b />
              <b />
            </div>
            <div className="head-chat-layout">
              <section className="head-zone" aria-label="JARVIS head area">
                <HeadComposite
                  voiceState={voiceSession.state}
                  amplitude={voiceSession.amplitude}
                />
              </section>
              <section className="chat-zone" aria-label="Conversation">
                <div className="jarvis-panel-header" aria-label="JARVIS Core intelligence">
                  <span className="jarvis-panel-title">
                    <b>J.A.R.V.I.S.</b>
                    <small>Just A Very Intelligent System</small>
                  </span>
                  <small>CORE INTELLIGENCE</small>
                </div>
                <div className="shimmer" />
                <div className="conversation-frame">
                  <div className="spin-border" />
                  <div className="conversation">
                    <i className="corner tl" />
                    <i className="corner tr" />
                    <i className="corner bl" />
                    <i className="corner br" />
                    <div className="messages" ref={scrollRef}>
                      {!selected && specialists.length === 0 && !listError && (
                        <div className="home-state">
                          <h2>JARVIS</h2>
                          <p>Loading governed conversation…</p>
                        </div>
                      )}
                      {!selected && (specialists.length > 0 || listError) && (
                        <div className="home-state">
                          <h2>JARVIS</h2>
                          <p>Governed conversation is unavailable.</p>
                        </div>
                      )}
                      {selected && messages.length === 0 && (
                        <div className="home-state">
                          <h2>{selected.name}</h2>
                          <p>{selected.purpose}</p>
                          <small>READY FOR INVOCATION</small>
                        </div>
                      )}
                      {messages.map((message, index) => (
                        <div
                          key={`${message.role}-${index}`}
                          className={`message ${message.role} ${message.error ? "error" : ""}`}
                        >
                          <b>
                            {message.role === "user" ? "YOU" : selected?.name}
                          </b>
                          <p>{message.content}</p>
                        </div>
                      ))}
                      {loading && (
                        <div
                          className="loading-indicator"
                          role="status"
                          aria-label="Loading"
                        >
                          <i />
                          <i />
                          <i />
                        </div>
                      )}
                    </div>
                    <div className="marquee">
                      <div>
                        <span>ORBITAL GRID · NOMINAL</span>
                        <span>MEMORY SYNC · OK</span>
                        <span>{compactConnectorCountLabel}</span>
                        <span>VOICE · STANDBY</span>
                        <span>SESSION · SECURE</span>
                        <span>ORBITAL GRID · NOMINAL</span>
                        <span>MEMORY SYNC · OK</span>
                      </div>
                    </div>
                    <div className="tools">
                      <button
                        type="button"
                        onClick={voiceSession.toggle}
                        aria-pressed={voiceSession.state === "listening"}
                        aria-label={`Voice — ${voiceSession.state}`}
                      >
                        🎙<small>Voice</small>
                      </button>
                      {/* Product decision pending: retain Brief Me until its composer-area value is decided. */}
                      <button
                        className="brief"
                        type="button"
                        disabled={!jarvis || loading}
                        onClick={() => void briefMe()}
                      >
                        ▤<small>Brief Me</small>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <form className="composer" onSubmit={send}>
            <span>📎</span>
            <input
              aria-label={
                selected
                  ? `Ask ${selected.name} anything`
                  : "Ask JARVIS anything"
              }
              disabled={!selected || loading}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                selected
                  ? `Ask ${selected.name} anything...`
                  : "JARVIS is loading..."
              }
            />
            <button
              type="submit"
              disabled={!selected || loading || !input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      </section>
      <style jsx global>{`
        @keyframes orbPulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.06);
          }
        }
        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(900%);
          }
        }
        @keyframes ringSpin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes orbitDot {
          to {
            transform: rotate(360deg) translateX(26px) rotate(-360deg);
          }
        }
        @keyframes glowPulse {
          0%,
          100% {
            box-shadow:
              0 0 0 1px rgba(94, 231, 255, 0.05),
              0 20px 50px #0006,
              inset 0 1px #fff1,
              0 0 26px rgba(94, 231, 255, 0.05);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(94, 231, 255, 0.18),
              0 20px 60px #0008,
              inset 0 1px #fff1,
              0 0 54px rgba(94, 231, 255, 0.18);
          }
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.12;
            transform: scale(0.7);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.3);
          }
        }
        @keyframes shimmer {
          to {
            background-position: 260px 0;
          }
        }
        @keyframes pulseRing {
          0% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes beamFade {
          0%,
          100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.22;
          }
        }
        @keyframes textShimmer {
          to {
            background-position: 200% 0;
          }
        }
        @keyframes framePulse {
          0%,
          100% {
            box-shadow:
              0 30px 90px #000b,
              0 0 0 1px rgba(94, 231, 255, 0.06),
              0 0 40px rgba(94, 231, 255, 0.05);
          }
          50% {
            box-shadow:
              0 30px 90px #000b,
              0 0 0 1px rgba(94, 231, 255, 0.16),
              0 0 70px rgba(94, 231, 255, 0.14);
          }
        }
        @keyframes marquee {
          to {
            transform: translateX(-50%);
          }
        }
        .console-page * {
          box-sizing: border-box;
        }
        .console-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100dvh;
          padding: 40px;
          background: #05070b;
          color: #a8b3c5;
          font-family: "Space Grotesk", sans-serif;
        }
        .console-frame {
          display: flex;
          width: 100%;
          max-width: 1800px;
          height: min(1130px, calc(100dvh - 80px));
          min-height: 680px;
          background: #0b0f16;
          border: 1px solid rgba(94, 231, 255, 0.18);
          border-radius: 6px;
          overflow: hidden;
          animation: framePulse 6s ease-in-out infinite;
          position: relative;
        }
        .sidebar {
          width: clamp(260px, 22vw, 340px);
          flex-shrink: 0;
          background: #0d121c;
          border-right: 1px solid #1a2233;
          display: flex;
          flex-direction: column;
          padding: clamp(18px, 1.6vw, 24px) clamp(14px, 1.25vw, 20px);
          z-index: 20;
        }
        .sidebar-close,
        .sidebar-backdrop,
        .mobile-header {
          display: none;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }
        .brand-mark {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          background: #123043;
          border: 1px solid #2a5b73;
          display: grid;
          place-items: center;
          color: #5ee7ff;
          font: 700 18px "IBM Plex Mono";
        }
        .brand b {
          display: block;
          color: #e8edf5;
          font: 700 17px "IBM Plex Mono";
          letter-spacing: 1px;
        }
        .brand small,
        .specialist-copy small {
          display: block;
          color: #5c6b82;
          font-size: 11px;
          margin-top: 2px;
        }
        .label {
          color: #4a5872;
          font: 10px "IBM Plex Mono";
          letter-spacing: 1.5px;
          margin: 10px 0 8px;
        }
        .intelligence-label {
          margin-top: 8px;
        }
        .executive,
        .specialist,
        .dawnwatch {
          border: 0;
          width: 100%;
          display: flex;
          align-items: center;
          gap: clamp(8px, 0.8vw, 12px);
          text-align: left;
          font-family: inherit;
          cursor: pointer;
        }
        .executive {
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 6px;
          background: transparent;
        }
        .selected {
          box-shadow: inset 0 0 0 1px rgba(94, 231, 255, 0.3) !important;
          background: #111b29 !important;
        }
        .jarvis-icon,
        .specialist-icon,
        .dawn-icon {
          width: 34px;
          height: 34px;
          flex: none;
          border-radius: 6px;
          display: grid;
          place-items: center;
        }
        .jarvis-icon {
          background: #123043;
          border: 1px solid #2a5b73;
          color: #5ee7ff;
          font-size: 16px;
        }
        .specialist-copy {
          flex: 1;
          min-width: 0;
        }
        .specialist-copy b {
          color: #dbe3ef;
          font-size: 13px;
        }
        .active {
          color: #3ddc97;
          font: 10px "IBM Plex Mono";
        }
        .dawnwatch {
          padding: 12px 10px;
          border-radius: 6px;
          margin-bottom: 16px;
          background: transparent;
        }
        .dawn-icon {
          background: #3a2a0d;
          border: 1px solid #8a6a1f;
          color: #f0a83c;
        }
        .dawnwatch .specialist-copy b {
          color: #f0a83c;
        }
        .specialist {
          padding: 9px 10px;
          border-radius: 6px;
          margin-bottom: 4px;
          background: transparent;
        }
        .specialist-icon {
          background: #161d2b;
          border: 1px solid #262f42;
        }
        .ready {
          color: #5c6b82;
          font: 10px "IBM Plex Mono";
          white-space: nowrap;
        }
        .loading-tile {
          color: #8a7a5c;
          font-size: 11px;
        }
        .sidebar-error {
          color: #f87171;
          font-size: 11px;
          padding: 8px;
        }
        .sidebar-spacer {
          flex: 1;
        }
        .connectors {
          border-top: 1px solid #1a2233;
          padding-top: 10px;
        }
        .connectors p {
          display: flex;
          justify-content: space-between;
          margin: 0 0 9px;
          font-size: 11px;
          color: #5c6b82;
        }
        .connectors u {
          color: #5ee7ff;
        }
        .connectors em {
          color: #3ddc97;
          font-style: normal;
        }
        .connectors i {
          color: #3a4458;
          font-style: normal;
        }
        .connector-action {
          border: 0;
          background: transparent;
          color: #5ee7ff;
          font: 10px "IBM Plex Mono";
          cursor: pointer;
          text-decoration: underline;
          text-decoration-style: dotted;
          text-underline-offset: 2px;
        }
        .connector-action:hover {
          color: #9af3ff;
        }
        .core {
          margin-top: 7px;
          font: 10px/1.6 "IBM Plex Mono";
          color: #3a4458;
        }
        .online {
          margin-top: 10px;
          color: #3ddc97;
          font: 11px "IBM Plex Mono";
        }
        .connector-count {
          color: #5c6b82;
          font: 10px "IBM Plex Mono";
        }
        .command-area {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: #0b0f16;
        }
        .statusbar {
          height: 47px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border-bottom: 1px solid #1a2233;
          font: 12px "IBM Plex Mono";
          white-space: nowrap;
        }
        .picture {
          color: #5ee7ff;
        }
        .status-items {
          display: flex;
          gap: 24px;
          color: #8a97ad;
        }
        .workspace {
          flex: 1;
          padding: clamp(16px, 1.55vw, 22px) clamp(16px, 1.7vw, 24px);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .grid,
        .amber-glow,
        .cyan-glow,
        .scanline,
        .stars {
          position: absolute;
          pointer-events: none;
        }
        .grid {
          inset: 0;
          background-image:
            linear-gradient(rgba(94, 231, 255, 0.035) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(94, 231, 255, 0.035) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
        }
        .amber-glow {
          top: -120px;
          right: -100px;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(240, 168, 60, 0.13),
            transparent 65%
          );
        }
        .cyan-glow {
          bottom: -160px;
          left: 15%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(94, 231, 255, 0.07),
            transparent 65%
          );
        }
        .scanline {
          left: 0;
          right: 0;
          height: 140px;
          background: linear-gradient(
            transparent,
            rgba(94, 231, 255, 0.05),
            transparent
          );
          animation: scanline 9s linear infinite;
        }
        .stars {
          inset: 0;
        }
        .stars i {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #5ee7ff;
          animation: twinkle 4s infinite;
        }
        .stars i:nth-child(1) {
          top: 80px;
          left: 8%;
        }
        .stars i:nth-child(2) {
          top: 220px;
          left: 22%;
          background: #f0a83c;
        }
        .stars i:nth-child(3) {
          top: 140px;
          left: 46%;
        }
        .stars i:nth-child(4) {
          top: 340px;
          left: 64%;
        }
        .stars i:nth-child(5) {
          top: 60px;
          left: 78%;
          background: #f0a83c;
        }
        .stars i:nth-child(6) {
          top: 400px;
          left: 12%;
        }
        .stars b {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(transparent, #5ee7ff, transparent);
          animation: beamFade 6s infinite;
        }
        .stars b:nth-of-type(1) {
          left: 30%;
        }
        .stars b:nth-of-type(2) {
          left: 58%;
          background: linear-gradient(transparent, #f0a83c, transparent);
        }
        .stars b:nth-of-type(3) {
          left: 85%;
        }
        .shimmer,
        .conversation-frame {
          position: relative;
          z-index: 1;
        }
        .orb {
          position: relative;
          width: 52px;
          height: 52px;
        }
        .orb i {
          position: absolute;
          inset: -14px;
          border-radius: 50%;
          border: 1px solid rgba(94, 231, 255, 0.4);
          animation: pulseRing 3s infinite;
        }
        .orb i:nth-child(2) {
          animation-delay: 1.5s;
        }
        .orb b {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid #f0a83c;
          opacity: 0.4;
          animation: ringSpin 6s linear infinite;
        }
        .orb b:nth-of-type(2) {
          inset: 4px;
          border: 1px solid #5ee7ff;
          animation-direction: reverse;
        }
        .orb em {
          position: absolute;
          inset: 12px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 40% 35%,
            #ffd27a,
            #f0a83c 60%,
            #7a4c0d
          );
          animation: orbPulse 4s infinite;
          box-shadow: 0 0 18px #f0a83c80;
        }
        .shimmer {
          height: 1px;
          margin-bottom: 14px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(94, 231, 255, 0.35) 20%,
            rgba(94, 231, 255, 0.35) 40%,
            transparent 60%
          );
          background-size: 260px;
          animation: shimmer 3.5s linear infinite;
        }
        .conversation-frame {
          flex: 1;
          border-radius: 10px;
          padding: 1.5px;
          overflow: hidden;
        }
        .spin-border {
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            rgba(94, 231, 255, 0.05),
            rgba(94, 231, 255, 0.7),
            rgba(240, 168, 60, 0.5),
            rgba(94, 231, 255, 0.05)
          );
          animation: ringSpin 8s linear infinite;
        }
        .conversation {
          position: relative;
          height: 100%;
          background: #0d1420;
          border-radius: 8px;
          overflow: hidden;
          animation: glowPulse 5s infinite;
        }
        .conversation:before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 60px;
          background: linear-gradient(rgba(94, 231, 255, 0.06), transparent);
        }
        .corner {
          position: absolute;
          width: 18px;
          height: 18px;
          z-index: 3;
          opacity: 0.6;
        }
        .tl {
          top: 14px;
          left: 14px;
          border-top: 1.5px solid #5ee7ff;
          border-left: 1.5px solid #5ee7ff;
        }
        .tr {
          top: 14px;
          right: 14px;
          border-top: 1.5px solid #5ee7ff;
          border-right: 1.5px solid #5ee7ff;
        }
        .bl {
          bottom: 14px;
          left: 14px;
          border-bottom: 1.5px solid #5ee7ff;
          border-left: 1.5px solid #5ee7ff;
        }
        .br {
          bottom: 14px;
          right: 14px;
          border-bottom: 1.5px solid #5ee7ff;
          border-right: 1.5px solid #5ee7ff;
        }
        .messages {
          position: absolute;
          inset: 0 0 80px;
          padding: 30px 28px 80px;
          overflow-y: auto;
        }
        .home-state {
          text-align: center;
          margin-top: 160px;
        }
        .home-state h2 {
          color: #dbe3ef;
          letter-spacing: 2px;
          font: 700 18px "IBM Plex Mono";
        }
        .home-state p {
          color: #7c899d;
          font-size: 13px;
        }
        .home-state small {
          color: #3ddc97;
          font: 10px "IBM Plex Mono";
        }
        .message {
          max-width: 78%;
          margin: 0 0 18px;
        }
        .message b {
          color: #5ee7ff;
          font: 10px "IBM Plex Mono";
        }
        .message p {
          white-space: pre-wrap;
          margin: 5px 0 0;
          padding: 12px 14px;
          border: 1px solid #1e293b;
          border-radius: 6px;
          background: #101828;
          color: #c2ccda;
          font-size: 13px;
          line-height: 1.55;
        }
        .message.user {
          margin-left: auto;
        }
        .message.user b {
          display: block;
          text-align: right;
          color: #f0a83c;
        }
        .message.user p {
          border-color: #4a3a12;
        }
        .message.error p {
          border-color: #7f1d1d;
          color: #fca5a5;
        }
        .message.loading p {
          color: #5c6b82;
        }
        .handoff-proposal {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 7px;
          padding: 9px 10px;
          border: 1px solid rgba(94, 231, 255, 0.3);
          border-radius: 5px;
          background: #0c1723;
          color: #8a97ad;
          font: 10px "IBM Plex Mono";
        }
        .handoff-proposal > div {
          display: flex;
          gap: 6px;
        }
        .handoff-proposal button {
          padding: 5px 8px;
          border: 1px solid #31556a;
          border-radius: 3px;
          background: #122334;
          color: #5ee7ff;
          font: 9px "IBM Plex Mono";
          cursor: pointer;
        }
        .handoff-proposal button:last-child {
          border-color: #303b4d;
          background: #111827;
          color: #8a97ad;
        }
        .handoff-proposal button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .marquee {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 26px;
          overflow: hidden;
          border-top: 1px solid #1a2233;
          background: #0a0f18;
        }
        .marquee div {
          display: flex;
          width: max-content;
          gap: 48px;
          white-space: nowrap;
          font: 10px "IBM Plex Mono";
          color: #3a4a5e;
          padding: 6px 0 0 28px;
          animation: marquee 18s linear infinite;
        }
        .tools {
          position: absolute;
          bottom: 34px;
          right: 28px;
          display: flex;
          gap: 10px;
          background: rgba(16, 24, 40, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(94, 231, 255, 0.25);
          border-radius: 30px;
          padding: 8px 10px;
          box-shadow: 0 10px 30px #0008;
        }
        .tools button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 12px;
          border: 0;
          border-radius: 20px;
          background: transparent;
          color: #8a97ad;
          font-size: 14px;
        }
        .tools small {
          font: 10px "IBM Plex Mono";
          white-space: nowrap;
        }
        .tools .brief {
          background: #182234;
          color: #5ee7ff;
        }
        .tools .brief:disabled {
          color: #31556a;
          background: #111827;
        }
        .tools button {
          cursor: pointer;
        }
        .tools button:disabled {
          cursor: not-allowed;
          color: #414b5b;
          background: #0c121c;
          opacity: 0.65;
        }
        .composer {
          height: 63px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          border-top: 1px solid #1a2233;
        }
        .composer > span {
          color: #5c6b82;
        }
        .composer input {
          flex: 1;
          background: #101828;
          border: 1px solid #1e293b;
          border-radius: 20px;
          padding: 10px 18px;
          color: #dbe3ef;
          font-size: 13px;
          outline: none;
        }
        .composer input:focus {
          border-color: #5ee7ff;
        }
        .composer input:disabled {
          color: #5c6b82;
        }
        .composer button {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 50%;
          background: #f0a83c;
          color: #1a1409;
          cursor: pointer;
        }
        .composer button:disabled {
          background: #3a4458;
          color: #202733;
          cursor: not-allowed;
        }
        /* The specialists/connectors drawer is off-canvas at every width. */
        .sidebar {
          position: absolute;
          inset: 0 auto 0 0;
          width: min(340px, calc(100vw - 48px));
          transform: translateX(-105%);
          transition: transform 0.25s ease;
          box-shadow: 20px 0 50px #000c;
          overflow-y: auto;
          z-index: 20;
        }
        .sidebar.open {
          transform: translateX(0);
        }
        .sidebar-close {
          display: grid;
          position: absolute;
          right: 12px;
          top: 12px;
          width: 30px;
          height: 30px;
          place-items: center;
          border: 1px solid #263348;
          border-radius: 50%;
          background: #101828;
          color: #8a97ad;
          font-size: 20px;
          cursor: pointer;
        }
        .sidebar-backdrop {
          display: none;
          position: absolute;
          z-index: 19;
          inset: 0;
          border: 0;
          background: #020409b3;
          backdrop-filter: blur(2px);
        }
        .sidebar-backdrop.open {
          display: block;
        }
        .specialist-list {
          display: flex;
          flex-direction: column;
        }
        .connector-label {
          margin-top: 12px;
        }
        .command-area {
          width: 100%;
        }
        .drawer-open {
          border: 0;
          background: transparent;
          color: #8a97ad;
          font: 16px "IBM Plex Mono";
          cursor: pointer;
          padding: 2px 4px;
        }
        .drawer-open:hover,
        .drawer-open:focus-visible {
          color: #5ee7ff;
        }
        .head-chat-layout {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 3fr) minmax(360px, 2fr);
          gap: clamp(18px, 2vw, 32px);
          flex: 1;
          min-height: 0;
        }
        .head-zone {
          display: grid;
          place-items: center;
          min-width: 0;
        }
        .head-composite {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          gap: 12px;
          color: #5c6b82;
          font: 11px "IBM Plex Mono";
        }
        .head-image-wrap {
          position: relative;
          display: grid;
          place-items: center;
          width: min(100%, 680px);
          max-height: calc(100% - 34px);
          isolation: isolate;
        }
        .head-composite > button {
          border: 1px solid #26364d;
          background: #07101c;
          padding: 5px 9px;
          color: #7f91ab;
          font: 10px "IBM Plex Mono";
          letter-spacing: 0.5px;
          cursor: pointer;
        }
        .head-composite[data-voice-state="listening"] > button {
          border-color: #34d399;
          color: #34d399;
        }
        .head-composite[data-voice-state="error"] > button {
          border-color: #f87171;
          color: #f87171;
        }
        .head-image-wrap::before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 10% 17% 4%;
          border-radius: 48%;
          background: radial-gradient(circle, rgba(255, 42, 51, 0.3), transparent 68%);
          filter: blur(22px);
        }
        .jarvis-head {
          display: block;
          width: 100%;
          height: auto;
          max-height: 72vh;
          object-fit: contain;
          filter: drop-shadow(0 0 18px rgba(255, 35, 46, 0.24))
            drop-shadow(0 0 34px rgba(94, 231, 255, 0.1));
          mask-image: linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%);
        }
        .chat-zone {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
        }
        .jarvis-panel-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          border: 0;
          background: transparent;
          padding: 4px 2px 12px;
          text-align: left;
          cursor: pointer;
        }
        .jarvis-panel-title {
          display: flex;
          flex-direction: column;
        }
        .jarvis-panel-title b {
          color: #e8edf5;
          font: 700 17px "IBM Plex Mono";
          letter-spacing: 2px;
        }
        .jarvis-panel-header .jarvis-panel-title small {
          color: #5c6b82;
          font-size: 8px;
          letter-spacing: 0.5px;
        }
        .jarvis-panel-header small {
          color: #5ee7ff;
          font: 9px "IBM Plex Mono";
          letter-spacing: 1px;
        }
        .jarvis-panel-header:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
        .chat-zone .shimmer {
          flex: none;
        }
        .chat-zone .conversation-frame {
          min-height: 0;
        }
        .loading-indicator {
          display: flex;
          gap: 6px;
          align-items: center;
          padding: 12px 14px;
        }
        .loading-indicator i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #5ee7ff;
          animation: twinkle 1.2s ease-in-out infinite;
        }
        .loading-indicator i:nth-child(2) {
          animation-delay: 0.2s;
        }
        .loading-indicator i:nth-child(3) {
          animation-delay: 0.4s;
        }
        @media (max-width: 1400px) {
          .console-page {
            padding: 20px;
          }
          .console-frame {
            height: calc(100dvh - 40px);
          }
          .status-items {
            gap: 12px;
          }
          .status-items span:nth-of-type(2),
          .status-items span:nth-of-type(3) {
            display: none;
          }
        }
        @media (max-width: 1024px) {
          .head-chat-layout {
            grid-template-columns: minmax(0, 1fr) minmax(330px, 1fr);
            gap: 14px;
          }
          .head-image-wrap {
            width: min(100%, 440px);
          }
          .console-page {
            padding: 0;
          }
          .console-frame {
            height: 100dvh;
            min-height: 600px;
            border-radius: 0;
            border: 0;
          }
          .mobile-header {
            height: 54px;
            flex: none;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 7px 16px;
            border-bottom: 1px solid #1a2233;
            background: #0d121c;
          }
          .mobile-header button {
            border: 1px solid #263348;
            border-radius: 5px;
            background: #101828;
            color: #5ee7ff;
            width: 36px;
            height: 36px;
            font-size: 18px;
          }
          .mobile-header .brand-mark {
            width: 34px;
            height: 34px;
          }
          .mobile-header b {
            color: #e8edf5;
            font: 700 13px "IBM Plex Mono";
            letter-spacing: 1px;
          }
          .mobile-header small {
            margin-left: auto;
            color: #5c6b82;
            font: 10px "IBM Plex Mono";
            max-width: 35%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .statusbar {
            height: 40px;
            padding: 10px 16px;
            font-size: 10px;
          }
          .status-items span {
            display: none;
          }
          .workspace {
            padding: 16px;
          }
          .conversation-frame {
            min-height: 0;
          }
          .home-state {
            margin-top: clamp(50px, 18vh, 140px);
          }
        }
        @media (max-width: 600px) {
          .head-chat-layout {
            grid-template-columns: 1fr;
            grid-template-rows: 110px minmax(0, 1fr);
            gap: 8px;
          }
          .head-composite {
            gap: 4px;
          }
          .head-image-wrap {
            width: 118px;
            max-height: 100px;
          }
          .jarvis-head {
            max-height: 100px;
          }
          .head-composite small {
            display: none;
          }
          .jarvis-panel-header {
            padding-bottom: 7px;
          }
          .console-frame {
            min-height: 480px;
          }
          .statusbar .status-items {
            display: none;
          }
          .workspace {
            padding: 12px;
          }
          .orb {
            width: 42px;
            height: 42px;
          }
          .messages {
            inset: 0 0 72px;
            padding: 22px 14px 78px;
          }
          .message {
            max-width: 92%;
          }
          .message p {
            overflow-wrap: anywhere;
            font-size: 12px;
            padding: 10px 11px;
          }
          .home-state {
            margin-top: 45px;
            padding: 0 10px;
          }
          .home-state h2 {
            font-size: 15px;
            overflow-wrap: anywhere;
          }
          .tools {
            left: 50%;
            right: auto;
            bottom: 32px;
            transform: translateX(-50%);
            gap: 2px;
            padding: 6px;
          }
          .tools button {
            padding: 5px 8px;
          }
          .tools small {
            font-size: 8px;
          }
          .composer {
            height: 58px;
            padding: 10px 12px;
            gap: 8px;
          }
          .composer input {
            min-width: 0;
            padding: 9px 12px;
          }
          .composer > span:first-child {
            display: none;
          }
        }
        @media (max-width: 390px) {
          .mobile-header {
            padding-inline: 10px;
          }
          .picture {
            font-size: 9px;
          }
          .workspace {
            padding: 9px;
          }
          .tools button {
            padding-inline: 6px;
          }
          .tools small {
            font-size: 7px;
          }
        }
      `}</style>
    </main>
  );
}
