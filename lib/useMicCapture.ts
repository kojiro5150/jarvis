"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface MicCapture {
  /** True while a real getUserMedia stream is open. */
  active: boolean;
  /** Live, smoothed 0-1 loudness reading from the analyser — real audio data, never fabricated/random. */
  amplitude: number;
  /** Set when getUserMedia/AudioContext setup actually failed (permission denied, no device, insecure context, etc). */
  error: string | null;
  /** The same live stream used by the analyser, exposed for separate recording concerns. */
  stream: MediaStream | null;
  toggle: () => void;
};

/**
 * v33 (Sprint 15, Section 3): real microphone capture — checked the rest
 * of the app first (ConversationDock, useAgentConversation, everything
 * under lib/) and found no existing voice/STT pipeline anywhere; the only
 * prior "listening" signal was ConversationDock's input-focus boolean,
 * which isn't audio capture at all. So this hook is genuinely the one
 * place mic permission/capture lives, per the export's second integration
 * path ("no other pipeline exists yet") — there's nothing else to
 * duplicate or conflict with.
 *
 * Wired to the Voice quick-action button in OrbCenterpiece (previously
 * disabled — "Voice channel standing by") rather than to clicking the orb
 * itself, per the spec's explicit example of a real app trigger.
 *
 * `amplitude` is throttled to ~12 updates/sec before it hits React state
 * (the analyser itself is still read every animation frame) — smooth
 * enough for a glow/pulse reaction, without re-rendering the whole orb
 * tree at 60fps for the entire time the mic is open.
 */
export function useMicCapture(): MicCapture {
  const [active, setActive] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastCommitRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
    }
    ctxRef.current = null;
    analyserRef.current = null;
    dataRef.current = null;
    setActive(false);
    setAmplitude(0);
  }, []);

  const tick = useCallback((time: number) => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return;
    // Cast needed for TS lib.dom.d.ts versions that parameterize
    // Uint8Array over its backing buffer type (ArrayBuffer vs the wider
    // ArrayBufferLike) — the buffer here is always a plain ArrayBuffer
    // since `data` is only ever constructed via `new Uint8Array(n)` below.
    analyser.getByteTimeDomainData(data as Uint8Array<ArrayBuffer>);
    let sumSquares = 0;
    for (let i = 0; i < data.length; i++) {
      const centered = (data[i] - 128) / 128;
      sumSquares += centered * centered;
    }
    const rms = Math.sqrt(sumSquares / data.length);
    // Real audio data, boosted for visibility (typical speech RMS is quiet
    // relative to the 0-1 scale) and clamped, never randomised.
    const normalized = Math.min(1, rms * 4);
    if (time - lastCommitRef.current > 80) {
      lastCommitRef.current = time;
      setAmplitude(normalized);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setStream(stream);
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      setActive(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone access denied");
      setActive(false);
    }
  }, [tick]);

  const toggle = useCallback(() => {
    if (active) {
      stop();
    } else {
      void start();
    }
  }, [active, start, stop]);

  // Real cleanup on unmount — never leave a live mic stream open.
  useEffect(() => stop, [stop]);

  return { active, amplitude, error, stream, toggle };
}
