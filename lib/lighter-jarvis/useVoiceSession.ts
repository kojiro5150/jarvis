"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMicCapture } from "@/lib/useMicCapture";
import type { AudioCaptureArtifact, TranscriptionResult } from "./transcription/types";

export type VoiceState = "standby" | "listening" | "transcribing" | "error";

export interface VoiceSession {
  state: VoiceState;
  amplitude: number;
  transcript: string | null;
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
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const transcribe = useCallback(async (artifact: AudioCaptureArtifact) => {
    setTranscribing(true);
    setSessionError(null);
    try {
      const form = new FormData();
      form.append("audio", artifact.blob, "recording.webm");
      form.append("durationMs", String(artifact.durationMs));
      const response = await fetch("/api/lighter/transcribe", { method: "POST", body: form });
      const data = await response.json() as Partial<TranscriptionResult> & { error?: string };
      if (!response.ok) throw new Error(data.error || `Transcription request failed (${response.status}).`);
      if (typeof data.text !== "string" || !data.text.trim()) throw new Error("Transcription returned no text.");
      if (mountedRef.current) setTranscript(data.text.trim());
    } catch (error) {
      if (mountedRef.current) setSessionError(error instanceof Error ? error.message : "Unknown transcription error.");
    } finally {
      if (mountedRef.current) setTranscribing(false);
    }
  }, []);

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
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => setSessionError("Audio recording failed.");
      recorder.onstop = () => {
        recorderRef.current = null;
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
    } catch (error) {
      recorderRef.current = null;
      setSessionError(error instanceof Error ? error.message : "Unable to start audio recording.");
      mic.toggle();
    }
  }, [mic.stream, mic.toggle, transcribe]);

  useEffect(() => () => {
    mountedRef.current = false;
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") {
      recorder.onstop = null;
      recorder.stop();
    }
  }, []);

  const toggle = useCallback(() => {
    setSessionError(null);
    setTranscript(null);
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") recorder.stop();
    mic.toggle();
  }, [mic]);

  const error = mic.error || sessionError;
  const state: VoiceState = error ? "error" : transcribing ? "transcribing" : mic.active ? "listening" : "standby";
  return { state, amplitude: mic.amplitude, transcript, error, toggle };
}
