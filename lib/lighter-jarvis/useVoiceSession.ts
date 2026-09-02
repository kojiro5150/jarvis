"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMicCapture } from "@/lib/useMicCapture";
import type { AudioCaptureArtifact, TranscriptionResult } from "./transcription/types";
import type { VoiceTurn } from "./voice-turn-queue";

export type VoiceState = "standby" | "listening" | "transcribing" | "error";

const VOICE_SPEECH_AMPLITUDE_THRESHOLD = 0.08;
const VOICE_POST_SPEECH_SILENCE_MS = 1100;
const VOICE_MAX_RECORDING_MS = 30_000;

export interface VoiceSession {
  state: VoiceState;
  amplitude: number;
  transcript: string | null;
  turn: VoiceTurn | null;
  error: string | null;
  toggle: () => void;
}

/** Owns bounded recording/transcription policy; microphone acquisition stays in useMicCapture. */
export function useVoiceSession(): VoiceSession {
  const mic = useMicCapture();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const mountedRef = useRef(true);
  const speechDetectedRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRecordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelCaptureRef = useRef(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [turn, setTurn] = useState<VoiceTurn | null>(null);
  const nextTurnIdRef = useRef(0);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const transcribe = useCallback(async (artifact: AudioCaptureArtifact) => {
    setTranscribing(true);
    setSessionError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const form = new FormData();
      form.append("audio", artifact.blob, "recording.webm");
      form.append("durationMs", String(artifact.durationMs));
      const response = await fetch("/api/lighter/transcribe", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      const data = await response.json() as Partial<TranscriptionResult> & { error?: string };
      if (!response.ok) throw new Error(data.error || `Transcription request failed (${response.status}).`);
      if (typeof data.text !== "string" || !data.text.trim()) throw new Error("Transcription returned no text.");
      if (mountedRef.current) {
        const text = data.text.trim();
        setTranscript(text);
        setTurn({ id: ++nextTurnIdRef.current, transcript: text });
      }
    } catch (error) {
      const message = error instanceof DOMException && error.name === "AbortError"
        ? "Transcription timed out after 20 seconds."
        : error instanceof Error ? error.message : "Unknown transcription error.";
      if (mountedRef.current) setSessionError(message);
    } finally {
      clearTimeout(timeout);
      if (mountedRef.current) setTranscribing(false);
    }
  }, []);

  const clearEndpointTimers = useCallback(() => {
    if (silenceTimerRef.current !== null) clearTimeout(silenceTimerRef.current);
    if (maxRecordingTimerRef.current !== null) clearTimeout(maxRecordingTimerRef.current);
    silenceTimerRef.current = null;
    maxRecordingTimerRef.current = null;
  }, []);

  const finishRecording = useCallback((mode: "submit" | "cancel") => {
    const recorder = recorderRef.current;
    if (recorder?.state !== "recording") return;
    cancelCaptureRef.current = mode === "cancel";
    clearEndpointTimers();
    recorder.stop();
    mic.toggle();
  }, [clearEndpointTimers, mic.toggle]);

  useEffect(() => {
    if (!mic.stream || recorderRef.current) return;
    if (typeof MediaRecorder === "undefined") {
      setSessionError("Audio recording is not supported by this browser.");
      mic.toggle();
      return;
    }
    try {
      const recorder = new MediaRecorder(mic.stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      speechDetectedRef.current = false;
      cancelCaptureRef.current = false;
      clearEndpointTimers();
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => setSessionError("Audio recording failed.");
      recorder.onstop = () => {
        recorderRef.current = null;
        clearEndpointTimers();
        if (cancelCaptureRef.current) {
          chunksRef.current = [];
          cancelCaptureRef.current = false;
          return;
        }
        const mimeType = recorder.mimeType || chunksRef.current[0]?.type || "audio/webm";
        const artifact: AudioCaptureArtifact = {
          blob: new Blob(chunksRef.current, { type: mimeType }),
          mimeType,
          capturedAt: new Date().toISOString(),
          durationMs: Math.max(0, Date.now() - startedAtRef.current),
          source: "microphone",
        };
        chunksRef.current = [];
        if (artifact.blob.size === 0) {
          setSessionError("The recording contained no audio data.");
          return;
        }
        void transcribe(artifact);
      };
      recorder.start();
      maxRecordingTimerRef.current = setTimeout(() => {
        finishRecording(speechDetectedRef.current ? "submit" : "cancel");
      }, VOICE_MAX_RECORDING_MS);
    } catch (error) {
      recorderRef.current = null;
      setSessionError(error instanceof Error ? error.message : "Unable to start audio recording.");
      mic.toggle();
    }
    // Only mic.stream and mic.toggle are read here; mic itself is a new
    // object every render, so depending on it would re-run this every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearEndpointTimers, finishRecording, mic.stream, mic.toggle, transcribe]);

  useEffect(() => {
    if (!mic.active || recorderRef.current?.state !== "recording") return;
    if (mic.amplitude >= VOICE_SPEECH_AMPLITUDE_THRESHOLD) {
      speechDetectedRef.current = true;
      if (silenceTimerRef.current !== null) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      return;
    }
    if (speechDetectedRef.current && silenceTimerRef.current === null) {
      silenceTimerRef.current = setTimeout(() => {
        silenceTimerRef.current = null;
        finishRecording("submit");
      }, VOICE_POST_SPEECH_SILENCE_MS);
    }
  }, [finishRecording, mic.active, mic.amplitude]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearEndpointTimers();
      const recorder = recorderRef.current;
      if (recorder?.state === "recording") {
        cancelCaptureRef.current = true;
        recorder.onstop = null;
        recorder.stop();
      }
    };
  }, [clearEndpointTimers]);

  const toggle = useCallback(() => {
    if (transcribing) return;
    setSessionError(null);
    setTranscript(null);
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") {
      finishRecording("cancel");
      return;
    }
    mic.toggle();
  }, [finishRecording, mic, transcribing]);

  const error = mic.error || sessionError;
  const state: VoiceState = error ? "error" : transcribing ? "transcribing" : mic.active ? "listening" : "standby";
  return { state, amplitude: mic.amplitude, transcript, turn, error, toggle };
}
